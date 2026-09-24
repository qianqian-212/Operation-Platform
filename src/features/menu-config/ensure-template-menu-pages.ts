import { cloneTenantTemplate } from "@/config/menu-templates";
import type { RoleRecord } from "@/features/access-control/types";
import type { MenuConfigRecord } from "@/features/menu-config/types";
import type { TenantInfo, TenantType } from "@/types/user";

const REQUIRED_TEMPLATE_PAGE_KEYS: Partial<Record<TenantType, readonly string[]>> = {
  bureau: [
    "bureau-teaching-research-alliance",
    "bureau-cross-school-activity",
    "bureau-collective-lesson-prep",
    "bureau-lesson-observation",
    "bureau-achievement-sharing",
    "bureau-effect-evaluation",
    "bureau-training-standard-config",
    "bureau-training-achievement-review",
    "bureau-training-warning",
    "bureau-training-statistics",
  ],
  school: [
    "school-cross-school-team",
    "school-cross-school-activity",
    "school-collective-lesson-prep",
    "school-lesson-observation",
    "school-achievement-sharing",
    "school-my-training-achievements",
  ],
};

function cloneRecords(records: readonly MenuConfigRecord[]) {
  return records.map((record) => ({ ...record }));
}

function templatePage(template: readonly MenuConfigRecord[], pageKey: string) {
  return template.find((record) => record.type === "page" && record.pageKey === pageKey);
}

function nextChildSort(records: readonly MenuConfigRecord[], parentId: string) {
  const sorts = records.filter((record) => record.parentId === parentId).map((record) => record.sort);
  return (sorts.length ? Math.max(...sorts) : 0) + 10;
}

function findSiblingParentId(
  records: readonly MenuConfigRecord[],
  template: readonly MenuConfigRecord[],
  templateParentId: string,
  pageKey: string,
) {
  const siblingKeys = new Set(
    template
      .filter(
        (record) =>
          record.parentId === templateParentId &&
          record.type === "page" &&
          record.pageKey &&
          record.pageKey !== pageKey,
      )
      .map((record) => record.pageKey),
  );
  return (
    records.find(
      (record) => record.type === "page" && record.pageKey != null && siblingKeys.has(record.pageKey),
    )?.parentId ?? null
  );
}

function convertNamedLeafToDirectory(records: MenuConfigRecord[], name: string) {
  const index = records.findIndex((record) => record.type === "page" && record.name === name);
  const leaf = index >= 0 ? records[index] : undefined;
  if (!leaf) return null;
  records[index] = {
    ...leaf,
    type: "directory",
    pageKey: null,
    externalUrl: null,
    externalOpenMode: null,
  };
  return leaf.id;
}

function ensureTemplateDirectory(
  records: MenuConfigRecord[],
  template: readonly MenuConfigRecord[],
  templateDirectoryId: string,
  tenantId: string,
): string | null {
  const existing = records.find((record) => record.id === templateDirectoryId);
  if (existing && (existing.type === "directory" || existing.type === "module")) {
    return existing.id;
  }

  const directory = template.find(
    (record) =>
      record.id === templateDirectoryId &&
      (record.type === "directory" || record.type === "module"),
  );
  if (!directory) return null;

  const parentId = directory.parentId
    ? ensureTemplateDirectory(records, template, directory.parentId, tenantId)
    : null;
  if (directory.parentId && !parentId) return null;

  const byName =
    records.find(
      (record) =>
        (record.type === "directory" || record.type === "module") &&
        record.name === directory.name &&
        record.parentId === parentId,
    )?.id ?? null;
  if (byName) return byName;

  const converted = convertNamedLeafToDirectory(records, directory.name);
  if (converted) return converted;

  const id = `${tenantId}:${directory.id}`;
  records.push({
    ...directory,
    id,
    tenantId,
    parentId,
    sort: parentId ? nextChildSort(records, parentId) : directory.sort,
  });
  return id;
}

function resolveParentId(
  records: MenuConfigRecord[],
  template: readonly MenuConfigRecord[],
  pageKey: string,
  tenantId: string,
) {
  const page = templatePage(template, pageKey);
  const parent = page?.parentId ? template.find((record) => record.id === page.parentId) : undefined;
  if (!parent) return null;
  return (
    findSiblingParentId(records, template, parent.id, pageKey) ??
    records.find((record) => record.type === "directory" && record.name === parent.name)?.id ??
    convertNamedLeafToDirectory(records, parent.name) ??
    ensureTemplateDirectory(records, template, parent.id, tenantId)
  );
}

function leafMenuIdSet(records: readonly MenuConfigRecord[]) {
  return new Set(
    records
      .filter((record) => record.type === "page" || record.type === "external")
      .map((record) => record.id),
  );
}

export function ensureTemplateMenuPages(
  tenant: TenantInfo,
  records: readonly MenuConfigRecord[],
) {
  const required = REQUIRED_TEMPLATE_PAGE_KEYS[tenant.type];
  if (!required?.length) return cloneRecords(records);
  const template = cloneTenantTemplate(tenant);
  const next = cloneRecords(records);
  for (const pageKey of required) {
    if (next.some((record) => record.type === "page" && record.pageKey === pageKey)) continue;
    const parentId = resolveParentId(next, template, pageKey, tenant.id);
    const page = parentId ? templatePage(template, pageKey) : undefined;
    if (!parentId || !page) continue;
    next.push({
      ...page,
      id: `${parentId}:${pageKey}`,
      tenantId: tenant.id,
      parentId,
      sort: nextChildSort(next, parentId),
    });
  }
  return next;
}

export function grantMissingTemplateMenuIds(
  roles: readonly RoleRecord[],
  previous: readonly MenuConfigRecord[],
  next: readonly MenuConfigRecord[],
) {
  const previousIds = new Set(previous.map((record) => record.id));
  const leafIds = leafMenuIdSet(next);
  const addedIds = next
    .filter((record) => record.type === "page" && record.visible && !previousIds.has(record.id))
    .map((record) => record.id);

  const convertedIds = new Set<string>();
  for (const record of previous) {
    const updated = next.find((item) => item.id === record.id);
    if (record.type === "page" && updated?.type === "directory") convertedIds.add(record.id);
  }

  const requiredKeys = new Set(
    Object.values(REQUIRED_TEMPLATE_PAGE_KEYS).flatMap((keys) => keys ?? []),
  );
  const anchorIds = new Set(
    previous
      .filter((record) => record.type === "page" && record.pageKey && requiredKeys.has(record.pageKey))
      .map((record) => record.id),
  );
  for (const id of convertedIds) anchorIds.add(id);

  const needsPrune = roles.some((role) => role.menuIds.some((id) => !leafIds.has(id)));
  if (!addedIds.length && !needsPrune) {
    return roles.map((role) => ({ ...role, menuIds: [...role.menuIds] }));
  }

  return roles.map((role) => {
    const hadAnchor = role.menuIds.some((id) => anchorIds.has(id));
    const menuIds = role.menuIds.filter((id) => leafIds.has(id));
    if (hadAnchor) {
      for (const id of addedIds) {
        if (!menuIds.includes(id)) menuIds.push(id);
      }
    }
    return { ...role, menuIds };
  });
}

export function roleMenuIdsDiffer(left: readonly RoleRecord[], right: readonly RoleRecord[]) {
  if (left.length !== right.length) return true;
  return left.some((role, index) => {
    const other = right[index];
    if (!other || role.id !== other.id || role.menuIds.length !== other.menuIds.length) return true;
    const otherIds = new Set(other.menuIds);
    return role.menuIds.some((id) => !otherIds.has(id));
  });
}
