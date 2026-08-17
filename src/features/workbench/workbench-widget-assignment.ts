import {
  appendNewTemplateItems,
  cloneWorkbenchItem,
} from "@/features/workbench/workbench-layout";
import {
  defaultWorkbenchWidgetSettings,
  getWorkbenchTemplate,
  workbenchTemplates,
} from "@/features/workbench/workbench-templates";
import {
  isWorkbenchWidgetCompatible,
  workbenchWidgetCatalog,
  workbenchWidgetRegistry,
} from "@/features/workbench/workbench-widget-catalog";
import type {
  WorkbenchProfile,
  WorkbenchTemplate,
  WorkbenchWidgetAssignment,
  WorkbenchWidgetAvailability,
  WorkbenchWidgetDefinition,
  WorkbenchWidgetItem,
} from "@/features/workbench/types";
import { WORKBENCH_WIDGET_ASSIGNMENT_VERSION } from "@/features/workbench/types";
import type { TenantType } from "@/types/user";

export function cloneWorkbenchWidgetAssignment(
  assignment: WorkbenchWidgetAssignment,
): WorkbenchWidgetAssignment {
  return {
    version: WORKBENCH_WIDGET_ASSIGNMENT_VERSION,
    revision: assignment.revision,
    widgets: Object.fromEntries(
      Object.entries(assignment.widgets).map(([key, availability]) => [
        key,
        {
          tenantTypes: [...availability.tenantTypes],
          profiles: [...availability.profiles],
        },
      ]),
    ),
  };
}

function uniqueSorted<T extends string>(values: readonly T[]): T[] {
  return [...new Set(values)].sort((first, second) => first.localeCompare(second));
}

function availabilityFromTemplates(widgetKey: string): WorkbenchWidgetAvailability {
  const tenantTypes: TenantType[] = [];
  const profiles: WorkbenchProfile[] = [];
  for (const template of workbenchTemplates) {
    if (!template.widgets.some((item) => item.widgetKey === widgetKey)) continue;
    tenantTypes.push(template.tenantType);
    profiles.push(template.profile);
  }
  return {
    tenantTypes: uniqueSorted(tenantTypes),
    profiles: uniqueSorted(profiles),
  };
}

export function createDefaultWorkbenchWidgetAssignment(): WorkbenchWidgetAssignment {
  return {
    version: WORKBENCH_WIDGET_ASSIGNMENT_VERSION,
    revision: 0,
    widgets: Object.fromEntries(
      workbenchWidgetCatalog.map((definition) => [
        definition.key,
        availabilityFromTemplates(definition.key),
      ]),
    ),
  };
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function sanitizeAvailability(
  definition: WorkbenchWidgetDefinition,
  value: unknown,
): WorkbenchWidgetAvailability | null {
  if (!value || typeof value !== "object") return null;
  const availability = value as Record<string, unknown>;
  if (!isStringArray(availability.tenantTypes) || !isStringArray(availability.profiles)) {
    return null;
  }
  return {
    tenantTypes: uniqueSorted(
      availability.tenantTypes.filter((type): type is TenantType =>
        definition.compatibleTenantTypes.includes(type as TenantType),
      ),
    ),
    profiles: uniqueSorted(
      availability.profiles.filter((profile): profile is WorkbenchProfile =>
        definition.compatibleProfiles.includes(profile as WorkbenchProfile),
      ),
    ),
  };
}

export function reconcileWorkbenchWidgetAssignment(
  value: unknown,
): WorkbenchWidgetAssignment | null {
  if (!value || typeof value !== "object") return null;
  const stored = value as Record<string, unknown>;
  if (
    stored.version !== WORKBENCH_WIDGET_ASSIGNMENT_VERSION ||
    typeof stored.revision !== "number" ||
    !Number.isInteger(stored.revision) ||
    stored.revision < 0 ||
    !stored.widgets ||
    typeof stored.widgets !== "object"
  ) {
    return null;
  }
  const storedWidgets = stored.widgets as Record<string, unknown>;
  const widgets: Record<string, WorkbenchWidgetAvailability> = {};
  for (const definition of workbenchWidgetCatalog) {
    widgets[definition.key] = sanitizeAvailability(definition, storedWidgets[definition.key])
      ?? availabilityFromTemplates(definition.key);
  }
  return {
    version: WORKBENCH_WIDGET_ASSIGNMENT_VERSION,
    revision: stored.revision,
    widgets,
  };
}

export function assignmentsEqual(
  first: WorkbenchWidgetAssignment,
  second: WorkbenchWidgetAssignment,
) {
  return JSON.stringify(first) === JSON.stringify(second);
}

export function isWorkbenchWidgetAssigned(
  assignment: WorkbenchWidgetAssignment,
  widgetKey: string,
  tenantType: TenantType,
  profile?: WorkbenchProfile,
) {
  const availability = assignment.widgets[widgetKey];
  if (!availability?.tenantTypes.includes(tenantType)) return false;
  if (!profile) return true;
  return availability.profiles.includes(profile);
}

export function setWorkbenchWidgetTenantEnabled(
  assignment: WorkbenchWidgetAssignment,
  widgetKey: string,
  tenantType: TenantType,
  enabled: boolean,
) {
  const definition = workbenchWidgetRegistry.get(widgetKey);
  if (!definition) throw new Error("工作台组件不存在");
  if (!definition.compatibleTenantTypes.includes(tenantType)) {
    throw new Error("该组件不兼容所选组织类型");
  }
  const next = cloneWorkbenchWidgetAssignment(assignment);
  const current = next.widgets[widgetKey] ?? {
    tenantTypes: [],
    profiles: [...definition.compatibleProfiles],
  };
  const tenantTypes = enabled
    ? uniqueSorted([...current.tenantTypes, tenantType])
    : current.tenantTypes.filter((type) => type !== tenantType);
  next.widgets[widgetKey] = {
    tenantTypes,
    profiles: current.profiles.length
      ? [...current.profiles]
      : [...definition.compatibleProfiles],
  };
  return next;
}

function enabledKeysForTemplate(
  template: WorkbenchTemplate,
  assignment: WorkbenchWidgetAssignment,
) {
  return workbenchWidgetCatalog
    .filter((definition) =>
      isWorkbenchWidgetCompatible(definition, template.tenantType, template.profile) &&
      isWorkbenchWidgetAssigned(
        assignment,
        definition.key,
        template.tenantType,
        template.profile,
      ),
    )
    .map((definition) => definition.key);
}

function itemFromCatalog(widgetKey: string): WorkbenchWidgetItem & {
  x: number;
  y: number;
  w: number;
  h: number;
} {
  const definition = workbenchWidgetRegistry.get(widgetKey);
  if (!definition) throw new Error(`未注册的工作台组件：${widgetKey}`);
  const size = definition.sizePresets.medium;
  return {
    widgetKey,
    visible: true,
    x: 0,
    y: 0,
    w: size.w,
    h: size.h,
    settings: defaultWorkbenchWidgetSettings(definition.kind),
  };
}

export function resolveWorkbenchTemplate(
  tenantType: TenantType,
  profile: WorkbenchProfile,
  assignment: WorkbenchWidgetAssignment,
): WorkbenchTemplate {
  const template = getWorkbenchTemplate(tenantType, profile);
  const enabledKeys = enabledKeysForTemplate(template, assignment);
  const kept = template.widgets
    .filter((item) => enabledKeys.includes(item.widgetKey))
    .map(cloneWorkbenchItem);
  const missing = enabledKeys
    .filter((key) => !kept.some((item) => item.widgetKey === key))
    .map(itemFromCatalog);
  return {
    ...template,
    widgets: appendNewTemplateItems(kept, missing),
  };
}
