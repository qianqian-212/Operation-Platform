import { describe, expect, it } from "vitest";
import { ADMIN_ROLE_ID } from "@/features/access-control/types";
import { defaultTenantShellConfig } from "@/features/shell-config/default-shell-config";
import { isValidTenantConfiguration } from "@/features/tenant-config/tenant-configuration-validation";
import type { TenantConfiguration } from "@/features/tenant-config/types";
import type { TenantInfo } from "@/types/user";

const tenant: TenantInfo = {
  id: "school-001",
  name: "测试学校",
  shortName: "测试",
  type: "school",
};

function configuration(pageKey: string): TenantConfiguration {
  return {
    version: 1,
    menuRecords: [
      {
        id: "module",
        tenantId: tenant.id,
        parentId: null,
        type: "module",
        name: "教学管理",
        icon: null,
        pageKey: null,
        externalUrl: null,
        externalOpenMode: null,
        sort: 10,
        visible: true,
      },
      {
        id: "page",
        tenantId: tenant.id,
        parentId: "module",
        type: "page",
        name: "新版本页面",
        icon: null,
        pageKey,
        externalUrl: null,
        externalOpenMode: null,
        sort: 10,
        visible: true,
      },
    ],
    shellConfig: defaultTenantShellConfig(),
    roles: [
      {
        id: ADMIN_ROLE_ID,
        tenantId: tenant.id,
        name: "管理员",
        description: "",
        builtIn: true,
        enabled: true,
        sort: 10,
        menuIds: ["page"],
      },
    ],
  };
}

describe("tenant configuration validation", () => {
  it("accepts a structurally valid menu page introduced by a newer frontend", () => {
    expect(isValidTenantConfiguration(configuration("future-page"), tenant)).toBe(true);
  });

  it("still rejects structural errors around an unknown page", () => {
    const value = configuration("future-page");
    value.menuRecords[1]!.parentId = "missing";

    expect(isValidTenantConfiguration(value, tenant)).toBe(false);
  });
});
