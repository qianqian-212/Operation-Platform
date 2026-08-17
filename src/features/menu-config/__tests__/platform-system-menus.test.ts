import { describe, expect, it } from "vitest";
import { cloneTenantTemplate } from "@/config/menu-templates";
import { ensurePlatformSystemMenus } from "@/features/menu-config/platform-system-menus";
import type { TenantInfo } from "@/types/user";

const platform: TenantInfo = {
  id: "platform-menus",
  name: "运营平台",
  shortName: "运营平台",
  type: "platform",
  enabled: true,
};

describe("platform system menus", () => {
  it("adds missing required system pages without duplicating existing ones", () => {
    const template = cloneTenantTemplate(platform);
    const withoutWidgets = template.filter(
      (record) => record.pageKey !== "system-workbench-widgets",
    );

    const migrated = ensurePlatformSystemMenus(platform, withoutWidgets);
    const again = ensurePlatformSystemMenus(platform, migrated);

    expect(migrated.filter((record) => record.pageKey === "system-workbench-widgets")).toHaveLength(1);
    expect(again.map((record) => record.id)).toEqual(migrated.map((record) => record.id));
  });

  it("leaves non-platform tenants unchanged", () => {
    const school: TenantInfo = {
      id: "school-menus",
      name: "学校",
      shortName: "学校",
      type: "school",
      enabled: true,
    };
    const records = cloneTenantTemplate(school);
    expect(ensurePlatformSystemMenus(school, records)).toEqual(records);
  });
});
