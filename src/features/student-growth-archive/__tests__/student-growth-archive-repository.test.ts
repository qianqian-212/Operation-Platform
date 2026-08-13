import { describe, expect, it } from "vitest";
import { guangdongProvinceRegion } from "@/features/tenant/administrative-region";
import { buildArchiveSchoolTree } from "../school-tree";
import { VirtualStudentGrowthArchiveRepository } from "../student-growth-archive-repository";
import { listArchiveSchools } from "../virtual-archive-roster";

describe("student growth archive repository", () => {
  const repository = new VirtualStudentGrowthArchiveRepository();

  it("builds region path ancestors with school leaves", async () => {
    const region = {
      code: "445202",
      name: "榕城区",
      scope: "district" as const,
      path: [
        { code: "440000", name: "广东省", scope: "province" as const },
        { code: "445200", name: "揭阳市", scope: "city" as const },
        { code: "445202", name: "榕城区", scope: "district" as const },
      ],
    };
    const { tree, expandedKeys } = await repository.getSchoolTree(region);
    expect(tree).toHaveLength(1);
    expect(tree[0]).toMatchObject({ id: "region:440000", kind: "region", label: "广东省" });
    expect(tree[0]?.children?.[0]).toMatchObject({ id: "region:445200", label: "揭阳市" });
    expect(tree[0]?.children?.[0]?.children?.[0]).toMatchObject({
      id: "region:445202",
      label: "榕城区",
    });
    expect(tree[0]?.children?.[0]?.children?.[0]?.children?.[0]).toMatchObject({
      kind: "school",
      schoolId: "virtual-primary-a",
    });
    expect(expandedKeys).toEqual([
      "region:440000",
      "region:445200",
      "region:445202",
    ]);
  });

  it("falls back to an unscoped region root when tenant has no administrative region", () => {
    const tree = buildArchiveSchoolTree(undefined, listArchiveSchools());
    expect(tree[0]).toMatchObject({ id: "region:unscoped", label: "辖区学校", kind: "region" });
    expect(tree[0]?.children?.length).toBe(listArchiveSchools().length);
  });

  it("filters students by school, stage, grade, class, status and keyword", async () => {
    const rows = await repository.listStudents({
      schoolId: "virtual-primary-a",
      educationStage: "primary",
      grade: "四年级",
      classId: "virtual-primary-a-class-01",
      enrollmentStatus: "active",
      keyword: "陈",
    });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => (
      row.schoolId === "virtual-primary-a"
      && row.grade === "四年级"
      && row.classId === "virtual-primary-a-class-01"
      && row.enrollmentStatus === "active"
      && row.name.includes("陈")
    ))).toBe(true);
  });

  it("lists class and grade options for a school", async () => {
    await expect(repository.listClassOptions("virtual-junior-a")).resolves.toEqual([
      { classId: "virtual-junior-a-class-01", className: "1 班" },
      { classId: "virtual-junior-a-class-02", className: "2 班" },
    ]);
    await expect(repository.listGradeOptions("virtual-junior-a", "junior")).resolves.toEqual([
      "七年级",
      "八年级",
    ]);
  });

  it("uses province-only region roots without inventing city nodes", async () => {
    const { tree } = await repository.getSchoolTree(guangdongProvinceRegion);
    expect(tree[0]).toMatchObject({ id: "region:440000", label: "广东省" });
    expect(tree[0]?.children?.[0]?.kind).toBe("school");
  });

  it("finds the first school leaf for default selection", async () => {
    const { tree } = await repository.getSchoolTree({
      code: "445202",
      name: "榕城区",
      scope: "district",
      path: [
        { code: "440000", name: "广东省", scope: "province" },
        { code: "445200", name: "揭阳市", scope: "city" },
        { code: "445202", name: "榕城区", scope: "district" },
      ],
    });
    const { findFirstSchoolNode } = await import("../school-tree");
    expect(findFirstSchoolNode(tree)).toMatchObject({
      kind: "school",
      schoolId: "virtual-primary-a",
    });
  });
});
