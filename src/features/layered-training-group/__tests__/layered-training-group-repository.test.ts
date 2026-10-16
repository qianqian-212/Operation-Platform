import { beforeEach, describe, expect, it } from "vitest";
import { resetLayeredTrainingCourseReviewMockData } from "@/features/layered-training-course-review/mock-data";
import { resetLayeredTrainingGroupMockData } from "@/features/layered-training-group/mock-data";
import { layeredTrainingGroupRepository } from "@/features/layered-training-group/layered-training-group-repository";

describe("layered training group repository", () => {
  beforeEach(() => {
    resetLayeredTrainingGroupMockData();
    resetLayeredTrainingCourseReviewMockData();
  });

  it("rejects deleting a group that a course already uses", async () => {
    const groups = await layeredTrainingGroupRepository.listGroups("bureau-001");
    const linked = groups.find((group) => group.name === "新教师培养组");
    const free = groups.find((group) => group.name === "骨干研修组");
    if (!linked || !free) throw new Error("缺少预置分组");

    expect(linked.courseLinked).toBe(true);
    expect(free.courseLinked).toBe(false);
    await expect(layeredTrainingGroupRepository.removeGroup("bureau-001", linked.id)).rejects.toThrow(
      "该分组已关联课程，无法删除",
    );
    const remaining = await layeredTrainingGroupRepository.listGroups("bureau-001");
    expect(remaining.some((group) => group.id === linked.id)).toBe(true);
  });

  it("deletes an unlinked group together with its members", async () => {
    const groups = await layeredTrainingGroupRepository.listGroups("bureau-001");
    const free = groups.find((group) => group.name === "骨干研修组");
    if (!free) throw new Error("缺少骨干研修组");

    await layeredTrainingGroupRepository.removeGroup("bureau-001", free.id);
    const remaining = await layeredTrainingGroupRepository.listGroups("bureau-001");
    const members = await layeredTrainingGroupRepository.listMembers("bureau-001", {
      groupId: free.id,
      page: 1,
      pageSize: 10,
    });
    expect(remaining.some((group) => group.name === "骨干研修组")).toBe(false);
    expect(members.total).toBe(0);
  });

  it("creates a group and rejects a duplicate name", async () => {
    const created = await layeredTrainingGroupRepository.createGroup("bureau-001", " 名师工作室组 ");
    expect(created).toMatchObject({ name: "名师工作室组", courseLinked: false });
    await expect(layeredTrainingGroupRepository.createGroup("bureau-001", "名师工作室组")).rejects.toThrow(
      "分组名称已存在",
    );
  });

  it("adds a member and rejects the same phone in that group", async () => {
    const groups = await layeredTrainingGroupRepository.listGroups("bureau-001");
    const free = groups.find((group) => group.name === "青年教师组");
    if (!free) throw new Error("缺少青年教师组");

    await layeredTrainingGroupRepository.addMember("bureau-001", free.id, {
      schoolName: "阳光小学",
      teacherName: "张晓晓",
      phone: "13800000088",
    });
    const page = await layeredTrainingGroupRepository.listMembers("bureau-001", {
      groupId: free.id,
      page: 1,
      pageSize: 10,
    });
    expect(page.rows.map((row) => row.teacherName)).toContain("张晓晓");
    await expect(
      layeredTrainingGroupRepository.addMember("bureau-001", free.id, {
        schoolName: "阳光小学",
        teacherName: "张晓晓",
        phone: "13800000088",
      }),
    ).rejects.toThrow("该手机号码已在当前分组中");
  });

  it("imports a sheet as a group and updates the same phone", async () => {
    await layeredTrainingGroupRepository.importMembers("bureau-001", {
      fileName: "名单.xlsx",
      sheets: [
        {
          groupName: "新教师培养组",
          rows: [{ schoolName: "实验小学", teacherName: "张老师", phone: "13800000000" }],
        },
        {
          groupName: "支教研修组",
          rows: [{ schoolName: "第一小学", teacherName: "李芳", phone: "13800000099" }],
        },
      ],
    });

    const groups = await layeredTrainingGroupRepository.listGroups("bureau-001");
    const support = groups.find((group) => group.name === "支教研修组");
    const primary = groups.find((group) => group.name === "新教师培养组");
    if (!support || !primary) throw new Error("导入后缺少分组");
    const primaryMembers = await layeredTrainingGroupRepository.listMembers("bureau-001", {
      groupId: primary.id,
      page: 1,
      pageSize: 20,
    });
    const supportMembers = await layeredTrainingGroupRepository.listMembers("bureau-001", {
      groupId: support.id,
      page: 1,
      pageSize: 10,
    });
    expect(primaryMembers.rows.find((row) => row.phone === "13800000000")).toMatchObject({
      schoolName: "实验小学",
      teacherName: "张老师",
    });
    expect(primaryMembers.total).toBe(12);
    expect(supportMembers.rows[0]).toMatchObject({ teacherName: "李芳" });
    const records = await layeredTrainingGroupRepository.listImports("bureau-001");
    expect(records[0]).toMatchObject({ fileName: "名单.xlsx", groupCount: 2, memberCount: 2 });
  });
});
