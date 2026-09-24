import { describe, expect, it } from "vitest";
import {
  DEVELOPING_PAGE_KEY,
  listSelectablePageResources,
  pageRegistry,
  pageRegistryByKey,
  pageResourceOptionLabel,
  resolvePagePathForMenu,
} from "@/config/page-registry";
import type { MenuConfigRecord } from "@/features/menu-config/types";

describe("page registry", () => {
  it("uses unique stable keys and paths", () => {
    expect(new Set(pageRegistry.map((page) => page.key)).size).toBe(pageRegistry.length);
    expect(new Set(pageRegistry.map((page) => page.path)).size).toBe(pageRegistry.length);
  });

  it("registers the existing device and organization review pages", () => {
    expect(pageRegistryByKey.get("device-list")?.path).toBe("/security/new-gate/device-list");
    expect(pageRegistryByKey.get("bureau-org-review")?.path).toBe("/bureau/custody/org/review");
    expect(pageRegistryByKey.get("bureau-org-review-detail")?.path).toBe(
      "/bureau/custody/org/review/:id",
    );
    expect(pageRegistryByKey.get("device-list")?.status).toBe("available");
    expect(pageRegistryByKey.get("family-notice")?.status).toBe("developing-placeholder");
  });

  it("declares at least one tenant type for every page", () => {
    expect(pageRegistry.every((page) => page.tenantTypes.length > 0)).toBe(true);
  });

  it("registers menu configuration as an operation platform admin page", () => {
    expect(pageRegistryByKey.get("system-organization-management")).toMatchObject({
      path: "/system/organization",
      tenantTypes: ["platform"],
      requiresAdmin: true,
    });
    expect(pageRegistryByKey.get("system-role-management")).toMatchObject({
      path: "/system/roles",
      tenantTypes: ["platform"],
      requiresAdmin: true,
    });
    expect(pageRegistryByKey.get("system-menu-config")).toMatchObject({
      path: "/system/menu-config",
      tenantTypes: ["platform"],
      requiresAdmin: true,
    });
    expect(pageRegistryByKey.get("system-workbench-widgets")).toMatchObject({
      path: "/system/workbench-widgets",
      tenantTypes: ["platform"],
      requiresAdmin: true,
    });
    expect(pageRegistryByKey.has("system-permission-management")).toBe(false);
  });

  it("registers the regional overview as a standalone new-tab page", () => {
    expect(pageRegistryByKey.get("bureau-regional-education-overview")).toMatchObject({
      title: "区域教育总览",
      path: "/bureau/visualization/regional-education-overview",
      tenantTypes: ["bureau"],
      status: "available",
      surface: "standalone",
      openMode: "new-tab",
    });
  });

  it("registers the smart sports cockpit as a standalone new-tab page", () => {
    expect(pageRegistryByKey.get("bureau-smart-sports-cockpit")).toMatchObject({
      title: "智慧体育数据驾驶舱",
      path: "/bureau/ai-precision-teaching/smart-sports/cockpit",
      tenantTypes: ["bureau"],
      status: "available",
      surface: "standalone",
      openMode: "new-tab",
    });
  });

  it("registers the bureau student growth overview as an available shell page", () => {
    expect(pageRegistryByKey.get("bureau-student-growth-portrait")).toMatchObject({
      title: "学生成长概览",
      path: "/bureau/education-governance/student-growth-portrait",
      tenantTypes: ["bureau"],
      status: "available",
      surface: "shell",
      openMode: "current",
    });
    expect(pageRegistryByKey.has("bureau-new-student-growth-portrait")).toBe(false);
  });

  it("registers the bureau student growth archive list and detail pages", () => {
    expect(pageRegistryByKey.get("bureau-student-growth-archive")).toMatchObject({
      title: "学生成长档案",
      path: "/bureau/education-governance/student-growth-archive",
      tenantTypes: ["bureau"],
      status: "available",
      surface: "shell",
      selectable: true,
    });
    expect(pageRegistryByKey.get("bureau-student-growth-archive-detail")).toMatchObject({
      title: "学生个人档案",
      path: "/bureau/education-governance/student-growth-archive/:studentId",
      tenantTypes: ["bureau"],
      status: "available",
      selectable: false,
      menuOwnerKey: "bureau-student-growth-archive",
    });
  });

  it("registers the bureau teaching research alliance list and detail pages", () => {
    expect(pageRegistryByKey.get("bureau-teaching-research-alliance")).toMatchObject({
      title: "教研联盟管理",
      path: "/bureau/ai-teacher-development/cross-school-research/alliance",
      tenantTypes: ["bureau"],
      status: "available",
      surface: "shell",
      selectable: true,
    });
    expect(pageRegistryByKey.get("bureau-teaching-research-alliance-create")).toMatchObject({
      title: "创建教研联盟",
      path: "/bureau/ai-teacher-development/cross-school-research/alliance/create",
      tenantTypes: ["bureau"],
      status: "available",
      selectable: false,
      menuOwnerKey: "bureau-teaching-research-alliance",
    });
    expect(pageRegistryByKey.get("bureau-teaching-research-alliance-detail")).toMatchObject({
      title: "教研联盟详情",
      path: "/bureau/ai-teacher-development/cross-school-research/alliance/:id",
      tenantTypes: ["bureau"],
      status: "available",
      selectable: false,
      menuOwnerKey: "bureau-teaching-research-alliance",
    });
  });

  it("registers the bureau cross-school activity list and detail pages", () => {
    expect(pageRegistryByKey.get("bureau-cross-school-activity")).toMatchObject({
      title: "活动管理",
      path: "/bureau/ai-teacher-development/cross-school-research/activities",
      tenantTypes: ["bureau"],
      status: "available",
      surface: "shell",
      selectable: true,
    });
    expect(pageRegistryByKey.get("bureau-cross-school-activity-create")).toMatchObject({
      title: "创建跨校教研活动",
      path: "/bureau/ai-teacher-development/cross-school-research/activities/create",
      tenantTypes: ["bureau"],
      status: "available",
      selectable: false,
      menuOwnerKey: "bureau-cross-school-activity",
    });
    expect(pageRegistryByKey.get("bureau-cross-school-activity-detail")).toMatchObject({
      title: "跨校教研活动详情",
      path: "/bureau/ai-teacher-development/cross-school-research/activities/:id",
      tenantTypes: ["bureau"],
      status: "available",
      selectable: false,
      menuOwnerKey: "bureau-cross-school-activity",
    });
  });

  it("registers the school cross-school research list pages", () => {
    expect(pageRegistryByKey.get("school-cross-school-team")).toMatchObject({
      title: "跨校团队",
      path: "/ai-teacher-development/cross-school-research/teams",
      tenantTypes: ["school"],
      status: "available",
      selectable: true,
    });
    expect(pageRegistryByKey.get("school-cross-school-team-detail")).toMatchObject({
      title: "跨校团队详情",
      path: "/ai-teacher-development/cross-school-research/teams/:id",
      tenantTypes: ["school"],
      status: "available",
      selectable: false,
      menuOwnerKey: "school-cross-school-team",
    });
    expect(pageRegistryByKey.get("school-cross-school-activity")).toMatchObject({
      title: "活动管理",
      path: "/ai-teacher-development/cross-school-research/activities",
      tenantTypes: ["school"],
      status: "available",
      selectable: true,
    });
    expect(pageRegistryByKey.get("school-cross-school-activity-create")).toMatchObject({
      title: "创建跨校教研活动",
      path: "/ai-teacher-development/cross-school-research/activities/create",
      tenantTypes: ["school"],
      status: "available",
      selectable: false,
      menuOwnerKey: "school-cross-school-activity",
    });
    expect(pageRegistryByKey.get("school-cross-school-activity-detail")).toMatchObject({
      title: "跨校教研活动详情",
      path: "/ai-teacher-development/cross-school-research/activities/:id",
      tenantTypes: ["school"],
      status: "available",
      selectable: false,
      menuOwnerKey: "school-cross-school-activity",
    });
    expect(pageRegistryByKey.get("school-collective-lesson-prep")).toMatchObject({
      title: "集体备课管理",
      path: "/ai-teacher-development/cross-school-research/lesson-prep",
      tenantTypes: ["school"],
      status: "available",
      selectable: true,
    });
    expect(pageRegistryByKey.get("school-lesson-observation")).toMatchObject({
      title: "听评课管理",
      path: "/ai-teacher-development/cross-school-research/lesson-observation",
      tenantTypes: ["school"],
      status: "available",
      selectable: true,
    });
    expect(pageRegistryByKey.get("school-lesson-observation-detail")).toMatchObject({
      title: "听评课详情",
      path: "/ai-teacher-development/cross-school-research/lesson-observation/:id",
      tenantTypes: ["school"],
      status: "available",
      selectable: false,
      menuOwnerKey: "school-lesson-observation",
    });
    expect(pageRegistryByKey.get("school-achievement-sharing")).toMatchObject({
      title: "成果共享",
      path: "/ai-teacher-development/cross-school-research/achievement-sharing",
      tenantTypes: ["school"],
      status: "available",
      selectable: true,
    });
  });

  it("registers the bureau collective lesson prep page", () => {
    expect(pageRegistryByKey.get("bureau-collective-lesson-prep")).toMatchObject({
      title: "集体备课管理",
      path: "/bureau/ai-teacher-development/cross-school-research/lesson-prep",
      tenantTypes: ["bureau"],
      status: "available",
      surface: "shell",
      selectable: true,
    });
  });

  it("registers the bureau lesson observation list and detail pages", () => {
    expect(pageRegistryByKey.get("bureau-lesson-observation")).toMatchObject({
      title: "听评课管理",
      path: "/bureau/ai-teacher-development/cross-school-research/lesson-observation",
      tenantTypes: ["bureau"],
      status: "available",
      surface: "shell",
      selectable: true,
    });
    expect(pageRegistryByKey.get("bureau-lesson-observation-detail")).toMatchObject({
      title: "听评课详情",
      path: "/bureau/ai-teacher-development/cross-school-research/lesson-observation/:id",
      tenantTypes: ["bureau"],
      status: "available",
      selectable: false,
      menuOwnerKey: "bureau-lesson-observation",
    });
  });

  it("registers the bureau achievement sharing and effect evaluation pages", () => {
    expect(pageRegistryByKey.get("bureau-achievement-sharing")).toMatchObject({
      title: "成果共享",
      path: "/bureau/ai-teacher-development/cross-school-research/achievement-sharing",
      tenantTypes: ["bureau"],
      status: "available",
      surface: "shell",
      selectable: true,
    });
    expect(pageRegistryByKey.get("bureau-effect-evaluation")).toMatchObject({
      title: "效果评估",
      path: "/bureau/ai-teacher-development/cross-school-research/effect-evaluation",
      tenantTypes: ["bureau"],
      status: "available",
      surface: "shell",
      selectable: true,
    });
  });

  it("registers the bureau training standard config page", () => {
    expect(pageRegistryByKey.get("bureau-training-standard-config")).toMatchObject({
      title: "研修标准配置",
      path: "/bureau/ai-teacher-development/teaching-monitoring/standards",
      tenantTypes: ["bureau"],
      status: "available",
      surface: "shell",
      selectable: true,
    });
  });

  it("registers bureau training review, warning and statistics pages", () => {
    expect(pageRegistryByKey.get("bureau-training-achievement-review")).toMatchObject({
      title: "成果终审",
      path: "/bureau/ai-teacher-development/teaching-monitoring/achievement-review",
      tenantTypes: ["bureau"],
      status: "available",
      surface: "shell",
      selectable: true,
    });
    expect(pageRegistryByKey.get("bureau-training-warning")).toMatchObject({
      title: "预警管理",
      path: "/bureau/ai-teacher-development/teaching-monitoring/warnings",
      tenantTypes: ["bureau"],
      selectable: true,
    });
    expect(pageRegistryByKey.get("bureau-training-warning-school-detail")).toMatchObject({
      title: "教师学分详情",
      path: "/bureau/ai-teacher-development/teaching-monitoring/warnings/:schoolId",
      tenantTypes: ["bureau"],
      selectable: false,
      menuOwnerKey: "bureau-training-warning",
    });
    expect(pageRegistryByKey.get("bureau-training-statistics")).toMatchObject({
      title: "研修统计",
      path: "/bureau/ai-teacher-development/teaching-monitoring/statistics",
      tenantTypes: ["bureau"],
      selectable: true,
    });
  });

  it("registers the school my training achievement pages", () => {
    expect(pageRegistryByKey.get("school-my-training-achievements")).toMatchObject({
      title: "我的成果",
      path: "/ai-teacher-development/teaching-monitoring/achievements",
      tenantTypes: ["school"],
      status: "available",
      surface: "shell",
      selectable: true,
    });
    expect(pageRegistryByKey.get("school-my-training-achievements-submit")).toMatchObject({
      title: "提交研修成果",
      path: "/ai-teacher-development/teaching-monitoring/achievements/submit",
      tenantTypes: ["school"],
      status: "available",
      selectable: false,
      menuOwnerKey: "school-my-training-achievements",
    });
    expect(pageRegistryByKey.get("school-my-training-achievements-detail")).toMatchObject({
      title: "成果详情",
      path: "/ai-teacher-development/teaching-monitoring/achievements/:id",
      tenantTypes: ["school"],
      status: "available",
      selectable: false,
      menuOwnerKey: "school-my-training-achievements",
    });
  });

  it("registers a reusable menu-scoped developing placeholder page", () => {
    const page = pageRegistryByKey.get(DEVELOPING_PAGE_KEY);

    expect(page).toMatchObject({
      title: "功能开发中缺省页",
      path: "/developing/:menuId",
      status: "developing-placeholder",
      selectable: true,
      allowDuplicateMenuBinding: true,
      menuRouteParam: "menuId",
    });
    expect(page?.tenantTypes).toEqual(["school", "bureau", "org", "platform"]);
    expect(page ? resolvePagePathForMenu(page, "menu-123") : "").toBe("/developing/menu-123");
  });

  it("lists selectable page resources by tenant and occupied menu binding", () => {
    const records: MenuConfigRecord[] = [{
      id: "menu-device-list",
      tenantId: "school-a",
      parentId: "module-a",
      type: "page",
      name: "设备列表",
      icon: null,
      pageKey: "device-list",
      externalUrl: null,
      externalOpenMode: null,
      sort: 10,
      visible: true,
    }];

    expect(
      listSelectablePageResources({ tenantType: "school", records })
        .some((page) => page.key === "device-list"),
    ).toBe(false);
    expect(
      listSelectablePageResources({
        tenantType: "school",
        records,
        editingRecordId: "menu-device-list",
      }).some((page) => page.key === "device-list"),
    ).toBe(true);
    expect(
      listSelectablePageResources({ tenantType: "school", records })
        .filter((page) => page.key === DEVELOPING_PAGE_KEY),
    ).toHaveLength(1);
  });

  it("uses page resource labels that expose both page name and route", () => {
    const page = pageRegistryByKey.get("device-list")!;

    expect(pageResourceOptionLabel(page)).toBe("[已开发] 设备列表 · /security/new-gate/device-list");
  });
});
