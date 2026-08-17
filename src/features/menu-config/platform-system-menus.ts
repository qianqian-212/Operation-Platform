import { cloneTenantTemplate } from "@/config/menu-templates";
import type { MenuConfigRecord } from "@/features/menu-config/types";
import type { TenantInfo } from "@/types/user";

export const PLATFORM_REQUIRED_SYSTEM_PAGE_KEYS = [
  "system-organization-management",
  "system-role-management",
  "system-menu-config",
  "system-workbench-widgets",
] as const;

function cloneRecords(records: readonly MenuConfigRecord[]) {
  return records.map((record) => ({ ...record }));
}

function rootModuleFor(record: MenuConfigRecord, records: readonly MenuConfigRecord[]) {
  const byId = new Map(records.map((item) => [item.id, item]));
  let current: MenuConfigRecord | undefined = record;
  const visited = new Set<string>();
  while (current?.parentId) {
    if (visited.has(current.id)) return null;
    visited.add(current.id);
    current = byId.get(current.parentId);
  }
  return current?.type === "module" ? current : null;
}

function findSystemModule(records: readonly MenuConfigRecord[]) {
  const named = records.find((record) => record.type === "module" && record.name === "系统管理");
  if (named) return named;
  const existingPage = records.find(
    (record) => record.type === "page" && record.pageKey === "system-menu-config",
  );
  return existingPage ? rootModuleFor(existingPage, records) : null;
}

function appendMissingSystemPages(
  tenant: TenantInfo,
  records: MenuConfigRecord[],
  systemModule: MenuConfigRecord,
  template: readonly MenuConfigRecord[],
) {
  let nextSort =
    Math.max(
      0,
      ...records.filter((record) => record.parentId === systemModule.id).map((record) => record.sort),
    ) + 10;
  for (const pageKey of PLATFORM_REQUIRED_SYSTEM_PAGE_KEYS) {
    if (records.some((record) => record.type === "page" && record.pageKey === pageKey)) continue;
    const templatePage = template.find((record) => record.type === "page" && record.pageKey === pageKey);
    if (!templatePage) continue;
    records.push({
      ...templatePage,
      id: `${systemModule.id}:${pageKey}`,
      tenantId: tenant.id,
      parentId: systemModule.id,
      sort: nextSort,
    });
    nextSort += 10;
  }
}

export function ensurePlatformSystemMenus(
  tenant: TenantInfo,
  records: readonly MenuConfigRecord[],
): MenuConfigRecord[] {
  if (tenant.type !== "platform") return cloneRecords(records);
  const nextRecords = cloneRecords(records);
  const template = cloneTenantTemplate(tenant);
  const templateModule =
    template.find((record) => record.type === "module" && record.name === "系统管理") ??
    template.find((record) => record.type === "module");
  if (!templateModule) return nextRecords;
  let systemModule = findSystemModule(nextRecords);
  if (!systemModule) {
    systemModule = {
      ...templateModule,
      id: `${tenant.id}:system-management`,
      tenantId: tenant.id,
      parentId: null,
    };
    nextRecords.push(systemModule);
  }
  appendMissingSystemPages(tenant, nextRecords, systemModule, template);
  return nextRecords;
}
