import { describe, expect, it } from "vitest";
import { cloneTenantTemplate } from "@/config/menu-templates";
import { DEVELOPING_PAGE_KEY } from "@/config/page-registry";
import { createDefaultRoles } from "@/features/access-control/default-roles";
import { ADMIN_ROLE_ID, STAFF_ROLE_ID } from "@/features/access-control/types";
import {
  ensureTemplateMenuPages,
  grantMissingTemplateMenuIds,
} from "@/features/menu-config/ensure-template-menu-pages";
import { normalizeLoadedMenuRecords } from "@/features/menu-config/align-template-menu-names";
import { resolveTenantRouteAccess } from "@/router/tenant-route-access";
import type { TenantInfo } from "@/types/user";

const bureau: TenantInfo = {
  id: "bureau-001",
  name: "体验区教育局",
  shortName: "体验区教育局",
  type: "bureau",
  enabled: true,
};

function child(records: ReturnType<typeof cloneTenantTemplate>, parentId: string, name: string) {
  return records.find((record) => record.parentId === parentId && record.name === name);
}

describe("bureau training standard route access", () => {
  it("allows admin after ensure converts monitoring leaf", () => {
    const template = cloneTenantTemplate(bureau);
    const teacherDevelopment = template.find(
      (record) => record.parentId === null && record.name === "AI教师发展",
    )!;
    const teachingResearch = child(template, teacherDevelopment.id, "教研与科研")!;
    const monitoring = child(template, teachingResearch.id, "教学监测与研修管理")!;
    const stored = template
      .filter((record) => record.parentId !== monitoring.id)
      .map((record) =>
        record.id === monitoring.id
          ? { ...record, type: "page" as const, pageKey: DEVELOPING_PAGE_KEY }
          : record,
      )
      .filter((record) => record.pageKey !== "bureau-training-standard-config");

    const roles = createDefaultRoles(bureau, stored);
    const menus = normalizeLoadedMenuRecords(bureau, stored);
    const granted = grantMissingTemplateMenuIds(roles, stored, menus);
    const standards = menus.find((record) => record.pageKey === "bureau-training-standard-config");
    expect(standards).toBeTruthy();

    const access = resolveTenantRouteAccess(
      {
        path: "/bureau/ai-teacher-development/teaching-monitoring/standards",
        meta: {
          pageKey: "bureau-training-standard-config",
          menuOwnerKey: "bureau-training-standard-config",
        },
      },
      ADMIN_ROLE_ID,
      menus,
      undefined,
      granted,
    );
    expect(access).toEqual({ kind: "allow" });
  });

  it("allows staff role that never owned monitoring after ensure", () => {
    const template = cloneTenantTemplate(bureau);
    const teacherDevelopment = template.find(
      (record) => record.parentId === null && record.name === "AI教师发展",
    )!;
    const teachingResearch = child(template, teacherDevelopment.id, "教研与科研")!;
    const monitoring = child(template, teachingResearch.id, "教学监测与研修管理")!;
    const stored = template
      .filter((record) => record.parentId !== monitoring.id)
      .map((record) =>
        record.id === monitoring.id
          ? { ...record, type: "page" as const, pageKey: DEVELOPING_PAGE_KEY }
          : record,
      )
      .filter((record) => record.pageKey !== "bureau-training-standard-config");

    const roles = createDefaultRoles(bureau, stored).map((role) =>
      role.id === STAFF_ROLE_ID
        ? { ...role, menuIds: role.menuIds.filter((id) => id !== monitoring.id) }
        : role,
    );
    const menus = ensureTemplateMenuPages(bureau, stored);
    const granted = grantMissingTemplateMenuIds(roles, stored, menus);
    const standards = menus.find((record) => record.pageKey === "bureau-training-standard-config")!;

    const access = resolveTenantRouteAccess(
      {
        path: "/bureau/ai-teacher-development/teaching-monitoring/standards",
        meta: {
          pageKey: "bureau-training-standard-config",
          menuOwnerKey: "bureau-training-standard-config",
        },
      },
      STAFF_ROLE_ID,
      menus,
      undefined,
      granted,
    );
    expect(granted.find((role) => role.id === STAFF_ROLE_ID)?.menuIds).toContain(standards.id);
    expect(access).toEqual({ kind: "allow" });
  });
});
