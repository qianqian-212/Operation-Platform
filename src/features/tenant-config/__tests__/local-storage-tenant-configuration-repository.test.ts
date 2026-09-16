import { beforeEach, describe, expect, it } from "vitest";
import { tenantRoleStorageKey } from "@/features/access-control/local-storage-role-repository";
import { tenantMenuStorageKey } from "@/features/menu-config/local-storage-menu-repository";
import { tenantShellConfigStorageKey } from "@/features/shell-config/local-storage-shell-config-repository";
import {
  LocalStorageTenantConfigurationRepository,
  TenantConfigurationPersistenceError,
  tenantConfigurationStorageKey,
} from "@/features/tenant-config/local-storage-tenant-configuration-repository";
import type { TenantInfo } from "@/types/user";
import {
  getWorkbenchTemplate,
} from "@/features/workbench/workbench-templates";
import {
  createDefaultWorkbenchLayout,
} from "@/features/workbench/workbench-layout";
import {
  workbenchLayoutStorageKey,
} from "@/features/workbench/local-storage-workbench-layout-repository";
import {
  tenantMemberStorageKey,
} from "@/features/tenant-members/local-storage-tenant-member-repository";
import {
  activeRoleStorageKey,
} from "@/features/access-control/local-storage-active-role-repository";

const school: TenantInfo = {
  id: "school-aggregate",
  name: "聚合配置学校",
  shortName: "聚合学校",
  type: "school",
  enabled: true,
};
const bureau: TenantInfo = {
  id: "bureau-aggregate",
  name: "聚合配置教育局",
  shortName: "聚合教育局",
  type: "bureau",
  enabled: true,
};

describe("tenant configuration repository", () => {
  beforeEach(() => localStorage.clear());

  it("migrates legacy keys into one tenant configuration aggregate", () => {
    const repository = new LocalStorageTenantConfigurationRepository(localStorage);
    const result = repository.list(school);

    expect(result.configuration.menuRecords.length).toBeGreaterThan(0);
    expect(result.configuration.roles.map((role) => role.id)).toContain("admin");
    expect(result.configuration.shellConfig.workbench.label).toBe("工作台");
    expect(localStorage.getItem(tenantConfigurationStorageKey(school.id))).not.toBeNull();
  });

  it("rejects semantic menu corruption and restores the full aggregate", () => {
    const repository = new LocalStorageTenantConfigurationRepository(localStorage, () => 1000);
    const configuration = repository.list(school).configuration;
    const first = configuration.menuRecords[0]!;
    const second = configuration.menuRecords[1]!;
    first.parentId = second.id;
    second.parentId = first.id;
    localStorage.setItem(
      tenantConfigurationStorageKey(school.id),
      JSON.stringify(configuration),
    );

    const recovered = repository.list(school);

    expect(recovered.recoveryNotice).toContain("已恢复默认");
    expect(recovered.configuration.menuRecords.some((record) => record.parentId === null)).toBe(true);
    expect(
      localStorage.getItem(
        `operation-platform:tenant-configuration:invalid:${school.id}:1000`,
      ),
    ).not.toBeNull();
  });

  it("persists menu, shell and roles with one aggregate write", () => {
    const repository = new LocalStorageTenantConfigurationRepository(localStorage);
    const configuration = repository.list(school).configuration;
    configuration.shellConfig.workbench.label = "统一入口";
    configuration.roles[1]!.description = "更新后的角色";

    repository.replace(school, configuration);
    const stored = JSON.parse(
      localStorage.getItem(tenantConfigurationStorageKey(school.id))!,
    );

    expect(stored.shellConfig.workbench.label).toBe("统一入口");
    expect(stored.roles[1].description).toBe("更新后的角色");
    expect(stored.menuRecords).toHaveLength(configuration.menuRecords.length);
  });

  it("does not replace an existing education bureau menu with a newer default template", () => {
    const repository = new LocalStorageTenantConfigurationRepository(localStorage);
    const configuration = repository.list(bureau).configuration;
    const firstModule = configuration.menuRecords.find((record) => record.type === "module")!;
    firstModule.name = "现有自定义菜单";
    repository.replace(bureau, configuration);

    const reloaded = new LocalStorageTenantConfigurationRepository(localStorage).list(bureau);

    expect(reloaded.configuration.menuRecords.find((record) => record.id === firstModule.id)?.name)
      .toBe("现有自定义菜单");
    expect(reloaded.recoveryNotice).toBeNull();
  });

  it("removes aggregate and legacy data when a tenant is deleted", () => {
    const repository = new LocalStorageTenantConfigurationRepository(localStorage);
    repository.list(school);
    localStorage.setItem(tenantMenuStorageKey(school.id), "legacy-menu");
    localStorage.setItem(tenantShellConfigStorageKey(school.id), "legacy-shell");
    localStorage.setItem(tenantRoleStorageKey(school.id), "legacy-roles");
    localStorage.setItem(tenantMemberStorageKey(school.id), "tenant-members");
    localStorage.setItem(
      activeRoleStorageKey({ tenantId: school.id, userId: "user-a" }),
      "admin",
    );
    const workbenchContext = { tenant: school, userId: "user-a", profile: "admin" } as const;
    const workbenchKey = workbenchLayoutStorageKey(workbenchContext);
    localStorage.setItem(
      workbenchKey,
      JSON.stringify(
        createDefaultWorkbenchLayout(
          workbenchContext,
          getWorkbenchTemplate(school.type, "admin"),
        ),
      ),
    );

    repository.remove(school.id);

    expect(localStorage.getItem(tenantConfigurationStorageKey(school.id))).toBeNull();
    expect(localStorage.getItem(tenantMenuStorageKey(school.id))).toBeNull();
    expect(localStorage.getItem(tenantShellConfigStorageKey(school.id))).toBeNull();
    expect(localStorage.getItem(tenantRoleStorageKey(school.id))).toBeNull();
    expect(localStorage.getItem(tenantMemberStorageKey(school.id))).toBeNull();
    expect(
      localStorage.getItem(activeRoleStorageKey({ tenantId: school.id, userId: "user-a" })),
    ).toBeNull();
    expect(localStorage.getItem(workbenchKey)).toBeNull();
  });

  it("rolls back every configuration key when tenant cleanup fails", () => {
    const setupRepository = new LocalStorageTenantConfigurationRepository(localStorage);
    setupRepository.list(school);
    localStorage.setItem(tenantMenuStorageKey(school.id), "legacy-menu");
    localStorage.setItem(tenantShellConfigStorageKey(school.id), "legacy-shell");
    localStorage.setItem(tenantRoleStorageKey(school.id), "legacy-roles");
    localStorage.setItem(tenantMemberStorageKey(school.id), "tenant-members");
    localStorage.setItem(
      activeRoleStorageKey({ tenantId: school.id, userId: "user-a" }),
      "admin",
    );
    const workbenchContext = { tenant: school, userId: "user-a", profile: "admin" } as const;
    const workbenchKey = workbenchLayoutStorageKey(workbenchContext);
    localStorage.setItem(
      workbenchKey,
      JSON.stringify(
        createDefaultWorkbenchLayout(
          workbenchContext,
          getWorkbenchTemplate(school.type, "admin"),
        ),
      ),
    );
    const keys = [
      tenantConfigurationStorageKey(school.id),
      tenantMenuStorageKey(school.id),
      tenantShellConfigStorageKey(school.id),
      tenantRoleStorageKey(school.id),
      tenantMemberStorageKey(school.id),
      activeRoleStorageKey({ tenantId: school.id, userId: "user-a" }),
      workbenchKey,
    ];
    const previous = new Map(keys.map((key) => [key, localStorage.getItem(key)]));
    let failed = false;
    const storage = new Proxy(localStorage, {
      get(target, property) {
        if (property === "removeItem") {
          return (key: string) => {
            if (!failed && key === tenantShellConfigStorageKey(school.id)) {
              failed = true;
              throw new DOMException("remove failed");
            }
            target.removeItem(key);
          };
        }
        const value = Reflect.get(target, property);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
    const repository = new LocalStorageTenantConfigurationRepository(storage);

    expect(() => repository.remove(school.id)).toThrow(TenantConfigurationPersistenceError);
    for (const [key, value] of previous) {
      expect(localStorage.getItem(key)).toBe(value);
    }
  });

  it("adds newly required platform system pages to stored tenant configuration", () => {
    const platform: TenantInfo = {
      id: "platform-aggregate",
      name: "运营平台",
      shortName: "运营平台",
      type: "platform",
      enabled: true,
    };
    const repository = new LocalStorageTenantConfigurationRepository(localStorage);
    const configuration = repository.list(platform).configuration;
    const removed = configuration.menuRecords.find(
      (record) => record.pageKey === "system-workbench-widgets",
    );
    configuration.menuRecords = configuration.menuRecords.filter(
      (record) => record.pageKey !== "system-workbench-widgets",
    );
    configuration.roles = configuration.roles.map((role) => ({
      ...role,
      menuIds: role.menuIds.filter((menuId) => menuId !== removed?.id),
    }));
    repository.replace(platform, configuration);

    const reloaded = repository.list(platform);
    expect(
      reloaded.configuration.menuRecords.some(
        (record) => record.pageKey === "system-workbench-widgets",
      ),
    ).toBe(true);
  });

  it("renames the stored bureau activity page to 活动管理", () => {
    const repository = new LocalStorageTenantConfigurationRepository(localStorage);
    const configuration = repository.list(bureau).configuration;
    configuration.menuRecords = configuration.menuRecords.map((record) =>
      record.pageKey === "bureau-cross-school-activity"
        ? { ...record, name: "跨校教研活动" }
        : record,
    );
    repository.replace(bureau, configuration);

    const reloaded = repository.list(bureau);
    expect(
      reloaded.configuration.menuRecords.find(
        (record) => record.pageKey === "bureau-cross-school-activity",
      )?.name,
    ).toBe("活动管理");
  });

  it("adds missing bureau cross-school pages to an already initialized tenant", () => {
    const repository = new LocalStorageTenantConfigurationRepository(localStorage);
    const configuration = repository.list(bureau).configuration;
    const removedKeys = new Set(["bureau-collective-lesson-prep", "bureau-lesson-observation"]);
    const removedIds = new Set(
      configuration.menuRecords
        .filter((record) => record.pageKey && removedKeys.has(record.pageKey))
        .map((record) => record.id),
    );
    configuration.menuRecords = configuration.menuRecords.filter(
      (record) => !record.pageKey || !removedKeys.has(record.pageKey),
    );
    configuration.roles = configuration.roles.map((role) => ({
      ...role,
      menuIds: role.menuIds.filter((menuId) => !removedIds.has(menuId)),
    }));
    repository.replace(bureau, configuration);

    const reloaded = repository.list(bureau);
    const prep = reloaded.configuration.menuRecords.find(
      (record) => record.pageKey === "bureau-collective-lesson-prep",
    );
    const observation = reloaded.configuration.menuRecords.find(
      (record) => record.pageKey === "bureau-lesson-observation",
    );
    expect(prep?.name).toBe("集体备课管理");
    expect(observation?.name).toBe("听评课管理");
    expect(reloaded.configuration.roles[1]?.menuIds).toEqual(
      expect.arrayContaining([prep?.id, observation?.id]),
    );
  });
});
