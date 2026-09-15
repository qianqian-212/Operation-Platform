import { ensurePlatformSystemMenus } from "@/features/menu-config/platform-system-menus";
import type { MenuConfigRecord } from "@/features/menu-config/types";
import type { TenantInfo } from "@/types/user";

const TEMPLATE_PAGE_MENU_RENAMES: ReadonlyArray<{
  pageKey: string;
  from: string;
  to: string;
}> = [{ pageKey: "bureau-cross-school-activity", from: "跨校教研活动", to: "活动管理" }];

export function alignTemplateMenuNames(
  records: readonly MenuConfigRecord[],
): MenuConfigRecord[] {
  return records.map((record) => {
    const rename = TEMPLATE_PAGE_MENU_RENAMES.find(
      (item) =>
        record.type === "page" &&
        record.pageKey === item.pageKey &&
        record.name === item.from,
    );
    return rename ? { ...record, name: rename.to } : { ...record };
  });
}

export function menuRecordsDiffer(
  left: readonly MenuConfigRecord[],
  right: readonly MenuConfigRecord[],
) {
  if (left.length !== right.length) return true;
  return left.some((record, index) => {
    const other = right[index];
    return (
      !other ||
      record.id !== other.id ||
      record.name !== other.name ||
      record.pageKey !== other.pageKey
    );
  });
}

export function normalizeLoadedMenuRecords(
  tenant: TenantInfo,
  records: readonly MenuConfigRecord[],
) {
  return alignTemplateMenuNames(ensurePlatformSystemMenus(tenant, records));
}
