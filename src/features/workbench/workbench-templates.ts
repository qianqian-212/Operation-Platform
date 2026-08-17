import type {
  WorkbenchLayoutItem,
  WorkbenchProfile,
  WorkbenchTemplate,
  WorkbenchWidgetKind,
  WorkbenchWidgetSettings,
} from "@/features/workbench/types";
import {
  isWorkbenchWidgetCompatible,
  workbenchWidgetRegistry,
} from "@/features/workbench/workbench-widget-catalog";
import type { TenantType } from "@/types/user";

export {
  workbenchWidgetCatalog,
  workbenchWidgetRegistry,
  isWorkbenchWidgetCompatible,
  listCompatibleWorkbenchWidgets,
  migrateLegacyWorkbenchWidgetKey,
} from "@/features/workbench/workbench-widget-catalog";

interface Placement {
  widgetKey: string;
  x: number;
  y: number;
  w: number;
  h: number;
  settings?: WorkbenchWidgetSettings;
}

export function defaultWorkbenchWidgetSettings(kind: WorkbenchWidgetKind): WorkbenchWidgetSettings {
  if (kind === "trend") return { kind: "trend", range: "7d" };
  if (kind === "list" || kind === "schedule" || kind === "inbox") return { kind: "list", limit: 5 };
  if (kind === "quick-links") return { kind: "quick-links", menuIds: null };
  return { kind: "none" };
}

function place(
  widgetKey: string,
  x: number,
  y: number,
  w: number,
  h: number,
  settings?: WorkbenchWidgetSettings,
): Placement {
  return { widgetKey, x, y, w, h, settings };
}

function statsRow(): Placement {
  return place("stats-overview", 0, 0, 12, 2);
}

function adminPanels(
  trend: string,
  list: string,
  distribution: string,
): Placement[] {
  return [
    place(trend, 0, 2, 8, 4, { kind: "trend", range: "7d" }),
    place(list, 8, 2, 4, 4, { kind: "list", limit: 5 }),
    place("message-todo-center", 0, 6, 4, 3, { kind: "list", limit: 5 }),
    place(distribution, 4, 6, 4, 3),
    place("quick-links", 8, 6, 4, 3),
  ];
}

function platformAdminPanels(
  trend: string,
  list: string,
  distribution: string,
): Placement[] {
  return [
    place(trend, 0, 2, 8, 4, { kind: "trend", range: "7d" }),
    place(list, 8, 2, 4, 4, { kind: "list", limit: 5 }),
    place(distribution, 0, 6, 6, 3),
    place("quick-links", 6, 6, 6, 3),
  ];
}

function businessPanels(schedule: string): Placement[] {
  return [
    place(schedule, 0, 2, 7, 4, { kind: "list", limit: 5 }),
    place("message-todo-center", 7, 2, 5, 4, { kind: "list", limit: 5 }),
    place("quick-links", 0, 6, 8, 3),
  ];
}

function platformBusinessPanels(schedule: string): Placement[] {
  return [
    place(schedule, 0, 2, 8, 4, { kind: "list", limit: 5 }),
    place("quick-links", 8, 2, 4, 4),
  ];
}

function bureauPortalPanels(startY: number): Placement[] {
  return [
    place("bureau.user-overview", 0, startY, 12, 2),
    place("bureau.calendar-tasks", 0, startY + 2, 8, 5),
    place("message-todo-center", 8, startY + 2, 4, 5, { kind: "list", limit: 5 }),
    place("quick-links", 0, startY + 7, 12, 4),
    place("bureau.bureau-news", 0, startY + 11, 6, 4, { kind: "list", limit: 5 }),
    place("bureau.information-disclosure", 6, startY + 11, 6, 4, { kind: "list", limit: 5 }),
    place("bureau.teaching-app-ranking", 0, startY + 15, 4, 4),
    place("bureau.personal-growth", 4, startY + 15, 4, 4),
    place("bureau.subscriptions", 8, startY + 15, 4, 4, { kind: "list", limit: 5 }),
  ];
}

const AGENT_BANNER_ROWS = 3;

function withAgentBanner(placements: Placement[]): Placement[] {
  return [
    place("etonedu-agent", 0, 0, 12, AGENT_BANNER_ROWS),
    ...placements.map((placement) => ({
      ...placement,
      y: placement.y + AGENT_BANNER_ROWS,
    })),
  ];
}

function bureauResourcePanels(startY: number): Placement[] {
  return [
    place("bureau.grade-applications", 0, startY, 4, 3),
    place("bureau.application-types", 4, startY, 4, 3),
    place("bureau.activity-rank", 8, startY, 4, 3),
    place("bureau.resource-sharing", 0, startY + 3, 6, 3),
    place("bureau.resource-growth", 6, startY + 3, 6, 3),
    place("bureau.resource-contribution", 0, startY + 6, 4, 3),
    place("bureau.subject-resources", 4, startY + 6, 8, 3),
    place("bureau.resource-ranking", 0, startY + 9, 6, 4),
  ];
}

function buildTemplate(
  tenantType: TenantType,
  profile: WorkbenchProfile,
  revision: number,
  placements: Placement[],
): WorkbenchTemplate {
  const widgets: WorkbenchLayoutItem[] = placements.map((placement) => {
    const definition = workbenchWidgetRegistry.get(placement.widgetKey);
    if (!definition) {
      throw new Error(`未注册的工作台组件：${placement.widgetKey}`);
    }
    if (!isWorkbenchWidgetCompatible(definition, tenantType, profile)) {
      throw new Error(`组件 ${placement.widgetKey} 不兼容 ${tenantType}/${profile}`);
    }
    return {
      widgetKey: placement.widgetKey,
      visible: true,
      x: placement.x,
      y: placement.y,
      w: placement.w,
      h: placement.h,
      settings: placement.settings ?? defaultWorkbenchWidgetSettings(definition.kind),
    };
  });
  return { tenantType, profile, revision, widgets };
}

export const workbenchTemplates: WorkbenchTemplate[] = [
  buildTemplate("school", "admin", 5, withAgentBanner([
    statsRow(),
    ...adminPanels(
      "school.attendance-trend",
      "school.operational-alerts",
      "school.student-distribution",
    ),
    place("account-panel", 8, 9, 4, 6),
  ])),
  buildTemplate("school", "business", 5, withAgentBanner([
    statsRow(),
    ...businessPanels("school.today-schedule"),
    place("account-panel", 8, 9, 4, 6),
  ])),
  buildTemplate("bureau", "admin", 10, withAgentBanner([
    statsRow(),
    place("bureau.operation-trend", 0, 2, 8, 4, { kind: "trend", range: "7d" }),
    place("bureau.school-operating-status", 8, 2, 4, 4),
    ...bureauPortalPanels(6),
    ...bureauResourcePanels(25),
    place("account-panel", 8, 38, 4, 6),
  ])),
  buildTemplate("bureau", "business", 10, withAgentBanner([
    statsRow(),
    ...bureauPortalPanels(2),
    ...bureauResourcePanels(21),
    place("account-panel", 8, 34, 4, 6),
  ])),
  buildTemplate("org", "admin", 5, withAgentBanner([
    statsRow(),
    ...adminPanels("org.enrollment-trend", "org.refund-tasks", "org.teacher-status"),
    place("account-panel", 8, 9, 4, 6),
  ])),
  buildTemplate("org", "business", 5, withAgentBanner([
    statsRow(),
    ...businessPanels("org.class-schedule"),
    place("account-panel", 8, 9, 4, 6),
  ])),
  buildTemplate("platform", "admin", 5, withAgentBanner([
    statsRow(),
    ...platformAdminPanels(
      "platform.tenant-trend",
      "platform.config-health",
      "platform.tenant-distribution",
    ),
    place("account-panel", 8, 9, 4, 6),
  ])),
  buildTemplate("platform", "business", 5, withAgentBanner([
    statsRow(),
    ...platformBusinessPanels("platform.operation-schedule"),
    place("account-panel", 8, 9, 4, 6),
  ])),
];

export function workbenchTemplateKey(tenantType: TenantType, profile: WorkbenchProfile) {
  return `${tenantType}:${profile}`;
}

export const workbenchTemplatesByKey = new Map(
  workbenchTemplates.map((template) => [
    workbenchTemplateKey(template.tenantType, template.profile),
    template,
  ]),
);

export function getWorkbenchTemplate(tenantType: TenantType, profile: WorkbenchProfile) {
  const template = workbenchTemplatesByKey.get(workbenchTemplateKey(tenantType, profile));
  if (!template) throw new Error(`未找到 ${tenantType}/${profile} 工作台模板`);
  return template;
}
