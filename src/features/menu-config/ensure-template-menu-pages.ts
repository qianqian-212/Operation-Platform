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

function resolveParentId(
  records: MenuConfigRecord[],
  template: readonly MenuConfigRecord[],
  pageKey: string,
) {
  const page = templatePage(template, pageKey);
  const parent = page?.parentId ? template.find((record) => record.id === page.parentId) : undefined;
  if (!parent) return null;
  return (
    findSiblingParentId(records, template, parent.id, pageKey) ??
    records.find((record) => record.type === "directory" && record.name === parent.name)?.id ??
    convertNamedLeafToDirectory(records, parent.name)
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
    const parentId = resolveParentId(next, template, pageKey);
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
  const addedIds = next
    .filter((record) => record.type === "page" && record.visible && !previousIds.has(record.id))
    .map((record) => record.id);
  if (!addedIds.length) return roles.map((role) => ({ ...role, menuIds: [...role.menuIds] }));

  const requiredKeys = new Set(REQUIRED_TEMPLATE_PAGE_KEYS.bureau ?? []);
  const anchorIds = new Set(
    previous
      .filter((record) => record.type === "page" && record.pageKey && requiredKeys.has(record.pageKey))
      .map((record) => record.id),
  );
  for (const record of previous) {
    const updated = next.find((item) => item.id === record.id);
    if (record.type === "page" && updated?.type === "directory") anchorIds.add(record.id);
  }

  return roles.map((role) => {
    if (!role.menuIds.some((id) => anchorIds.has(id))) {
      return { ...role, menuIds: [...role.menuIds] };
    }
    const menuIds = [...role.menuIds];
    for (const id of addedIds) {
      if (!menuIds.includes(id)) menuIds.push(id);
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
