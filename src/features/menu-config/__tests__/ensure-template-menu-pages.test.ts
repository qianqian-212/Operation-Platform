import { describe, expect, it } from "vitest";
import { cloneTenantTemplate } from "@/config/menu-templates";
import { DEVELOPING_PAGE_KEY } from "@/config/page-registry";
import { createDefaultRoles } from "@/features/access-control/default-roles";
import { STAFF_ROLE_ID } from "@/features/access-control/types";
import {
  ensureTemplateMenuPages,
  grantMissingTemplateMenuIds,
} from "@/features/menu-config/ensure-template-menu-pages";
import { normalizeLoadedMenuRecords } from "@/features/menu-config/align-template-menu-names";
import type { TenantInfo } from "@/types/user";

const bureau: TenantInfo = {
  id: "bureau-menu-ensure",
  name: "演示教育局",
  shortName: "演示教育局",
  type: "bureau",
  enabled: true,
};

function child(records: ReturnType<typeof cloneTenantTemplate>, parentId: string, name: string) {
  return records.find((record) => record.parentId === parentId && record.name === name);
}

describe("ensureTemplateMenuPages", () => {
  it("inserts missing collective prep and observation pages under 跨校协同教研", () => {
    const stored = cloneTenantTemplate(bureau).filter(
      (record) =>
        record.pageKey !== "bureau-collective-lesson-prep" &&
        record.pageKey !== "bureau-lesson-observation" &&
        record.pageKey !== "bureau-achievement-sharing" &&
        record.pageKey !== "bureau-effect-evaluation",
    );

    const ensured = ensureTemplateMenuPages(bureau, stored);
    const teacherDevelopment = stored.find(
      (record) => record.parentId === null && record.name === "AI教师发展",
    )!;
    const teachingResearch = child(ensured, teacherDevelopment.id, "教研与科研")!;
    const crossSchool = child(ensured, teachingResearch.id, "跨校协同教研")!;

    expect(child(ensured, crossSchool.id, "集体备课管理")).toMatchObject({
      type: "page",
      pageKey: "bureau-collective-lesson-prep",
    });
    expect(child(ensured, crossSchool.id, "听评课管理")).toMatchObject({
      type: "page",
      pageKey: "bureau-lesson-observation",
    });
    expect(child(ensured, crossSchool.id, "成果共享")).toMatchObject({
      type: "page",
      pageKey: "bureau-achievement-sharing",
    });
    expect(child(ensured, crossSchool.id, "效果评估")).toMatchObject({
      type: "page",
      pageKey: "bureau-effect-evaluation",
    });
    expect(ensureTemplateMenuPages(bureau, ensured)).toHaveLength(ensured.length);
  });

  it("converts leftover 教学监测与研修管理 leaf and inserts 研修标准配置", () => {
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
          ? {
              ...record,
              type: "page" as const,
              pageKey: DEVELOPING_PAGE_KEY,
            }
          : record,
      )
      .filter((record) => record.pageKey !== "bureau-training-standard-config");

    const ensured = normalizeLoadedMenuRecords(bureau, stored);
    const directory = child(ensured, teachingResearch.id, "教学监测与研修管理")!;
    expect(directory.type).toBe("directory");
    expect(child(ensured, directory.id, "研修标准配置")).toMatchObject({
      type: "page",
      pageKey: "bureau-training-standard-config",
    });
  });

  it("inserts missing school 我的成果 under 教学监测与研修管理", () => {
    const school: TenantInfo = {
      id: "school-menu-ensure",
      name: "演示学校",
      shortName: "演示学校",
      type: "school",
      enabled: true,
    };
    const template = cloneTenantTemplate(school);
    const teacherDevelopment = template.find(
      (record) => record.parentId === null && record.name === "AI教师发展",
    )!;
    const teachingResearch = child(template, teacherDevelopment.id, "教研与科研")!;
    const monitoring = child(template, teachingResearch.id, "教学监测与研修管理")!;
    const stored = template
      .filter((record) => record.parentId !== monitoring.id)
      .map((record) =>
        record.id === monitoring.id
          ? {
              ...record,
              type: "page" as const,
              pageKey: DEVELOPING_PAGE_KEY,
            }
          : record,
      )
      .filter((record) => record.pageKey !== "school-my-training-achievements");

    const ensured = normalizeLoadedMenuRecords(school, stored);
    const directory = child(ensured, teachingResearch.id, "教学监测与研修管理")!;
    expect(directory.type).toBe("directory");
    expect(child(ensured, directory.id, "我的成果")).toMatchObject({
      type: "page",
      pageKey: "school-my-training-achievements",
    });
  });

  it("creates school 跨校协同教研 directory when missing and inserts required pages", () => {
    const school: TenantInfo = {
      id: "school-cross-school-ensure",
      name: "演示学校",
      shortName: "演示学校",
      type: "school",
      enabled: true,
    };
    const template = cloneTenantTemplate(school);
    const teacherDevelopment = template.find(
      (record) => record.parentId === null && record.name === "AI教师发展",
    )!;
    const teachingResearch = child(template, teacherDevelopment.id, "教研与科研")!;
    const crossSchool = child(template, teachingResearch.id, "跨校协同教研")!;
    const stored = template.filter(
      (record) =>
        record.id !== crossSchool.id &&
        record.parentId !== crossSchool.id &&
        record.pageKey !== "school-cross-school-team" &&
        record.pageKey !== "school-cross-school-activity" &&
        record.pageKey !== "school-collective-lesson-prep" &&
        record.pageKey !== "school-lesson-observation" &&
        record.pageKey !== "school-achievement-sharing",
    );

    const ensured = ensureTemplateMenuPages(school, stored);
    const directory = child(ensured, teachingResearch.id, "跨校协同教研")!;
    expect(directory.type).toBe("directory");
    expect(child(ensured, directory.id, "跨校团队")).toMatchObject({
      type: "page",
      pageKey: "school-cross-school-team",
    });
    expect(child(ensured, directory.id, "活动管理")).toMatchObject({
      type: "page",
      pageKey: "school-cross-school-activity",
    });
    expect(child(ensured, directory.id, "集体备课管理")).toMatchObject({
      type: "page",
      pageKey: "school-collective-lesson-prep",
    });
    expect(child(ensured, directory.id, "听评课管理")).toMatchObject({
      type: "page",
      pageKey: "school-lesson-observation",
    });
    expect(child(ensured, directory.id, "成果共享")).toMatchObject({
      type: "page",
      pageKey: "school-achievement-sharing",
    });
  });

  it("converts a leftover 跨校协同教研 leaf into a directory before inserting pages", () => {
    const template = cloneTenantTemplate(bureau);
    const teacherDevelopment = template.find(
      (record) => record.parentId === null && record.name === "AI教师发展",
    )!;
    const teachingResearch = child(template, teacherDevelopment.id, "教研与科研")!;
    const crossSchool = child(template, teachingResearch.id, "跨校协同教研")!;
    const stored = template
      .filter((record) => record.parentId !== crossSchool.id)
      .map((record) =>
        record.id === crossSchool.id
          ? {
              ...record,
              type: "page" as const,
              pageKey: DEVELOPING_PAGE_KEY,
            }
          : record,
      );

    const ensured = normalizeLoadedMenuRecords(bureau, stored);
    const directory = child(ensured, teachingResearch.id, "跨校协同教研")!;
    expect(directory.type).toBe("directory");
    expect(child(ensured, directory.id, "集体备课管理")?.pageKey).toBe("bureau-collective-lesson-prep");
    expect(child(ensured, directory.id, "听评课管理")?.pageKey).toBe("bureau-lesson-observation");
    expect(child(ensured, directory.id, "成果共享")?.pageKey).toBe("bureau-achievement-sharing");
    expect(child(ensured, directory.id, "效果评估")?.pageKey).toBe("bureau-effect-evaluation");
  });

  it("grants new leaves only to roles that already had a sibling page", () => {
    const stored = cloneTenantTemplate(bureau).filter(
      (record) => record.pageKey !== "bureau-collective-lesson-prep",
    );
    const activity = stored.find((record) => record.pageKey === "bureau-cross-school-activity")!;
    const roles = createDefaultRoles(bureau, stored).map((role) =>
      role.id === STAFF_ROLE_ID ? { ...role, menuIds: [activity.id] } : role,
    );
    const customRole = {
      ...roles[1]!,
      id: "custom-role",
      builtIn: false,
      menuIds: [],
    };
    const next = ensureTemplateMenuPages(bureau, stored);
    const granted = grantMissingTemplateMenuIds([...roles, customRole], stored, next);
    const prep = next.find((record) => record.pageKey === "bureau-collective-lesson-prep")!;

    expect(granted.find((role) => role.id === STAFF_ROLE_ID)?.menuIds).toContain(prep.id);
    expect(granted.find((role) => role.id === "custom-role")?.menuIds).not.toContain(prep.id);
  });

  it("drops converted directory ids from roles so normalized config stays persistable", () => {
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
          ? {
              ...record,
              type: "page" as const,
              pageKey: DEVELOPING_PAGE_KEY,
            }
          : record,
      )
      .filter((record) => record.pageKey !== "bureau-training-standard-config");

    const roles = createDefaultRoles(bureau, stored);
    const next = ensureTemplateMenuPages(bureau, stored);
    const granted = grantMissingTemplateMenuIds(roles, stored, next);
    const standards = next.find((record) => record.pageKey === "bureau-training-standard-config")!;
    const leafIds = new Set(
      next
        .filter((record) => record.type === "page" || record.type === "external")
        .map((record) => record.id),
    );

    for (const role of granted) {
      expect(role.menuIds.every((id) => leafIds.has(id))).toBe(true);
      expect(role.menuIds).not.toContain(monitoring.id);
      expect(role.menuIds).toContain(standards.id);
    }
  });
});
