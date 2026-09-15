import { describe, expect, it } from "vitest";
import { collectiveLessonPrepRepository } from "@/features/collective-lesson-prep/collective-lesson-prep-repository";
import { DEFAULT_CURRICULUM_NODE_ID } from "@/features/collective-lesson-prep/types";

function emptyFilter() {
  return { status: "" as const, subject: "", keyword: "", curriculumNodeId: "" };
}

describe("collective lesson prep repository", () => {
  it("returns curriculum tree matching the first unit screenshot labels", async () => {
    const tree = await collectiveLessonPrepRepository.listCurriculum("bureau-001");
    expect(tree[0]).toMatchObject({ id: "unit-1", label: "第一单元" });
    expect(tree[0]?.children?.[0]).toMatchObject({
      id: "lesson-1-1",
      label: "第1课 沁园春·长沙/...",
    });
    expect(tree[0]?.children?.[0]?.children?.[0]?.label).toBe("《沁园春。长沙》");
    expect(tree.map((node) => node.label)).toContain("第十一单元");
    expect(tree.some((node) => node.label === "第二单元")).toBe(false);
  });

  it("summarizes twelve lesson preps and filters the first unit screenshot cards", async () => {
    const all = await collectiveLessonPrepRepository.list("bureau-001", emptyFilter());
    expect(all.stats).toEqual({ total: 12, ongoing: 6, completed: 3, pending: 3 });
    expect(all.list).toHaveLength(12);

    const unitOne = await collectiveLessonPrepRepository.list("bureau-001", {
      ...emptyFilter(),
      curriculumNodeId: DEFAULT_CURRICULUM_NODE_ID,
    });
    expect(unitOne.list.map((item) => item.title)).toEqual([
      "大青树下的小学",
      "大青树下的小学",
      "大青树下的小学",
    ]);
    expect(unitOne.list.map((item) => item.status)).toEqual(["ongoing", "completed", "pending"]);
    expect(unitOne.list[0]).toMatchObject({
      allianceName: "城东学区教研联盟",
      participantCount: 6,
      leadTeacherName: "王老师",
      leadSchoolName: "阳光小学",
      progress: 65,
      outputCount: 3,
      activityName: "跨校集体备课·小学语文三年级《富饶的西沙群岛》",
    });
  });

  it("filters by status, subject and keyword without changing global stats", async () => {
    const math = await collectiveLessonPrepRepository.list("bureau-001", {
      ...emptyFilter(),
      subject: "数学",
    });
    expect(math.stats.total).toBe(12);
    expect(math.list).toHaveLength(1);
    expect(math.list[0]?.title).toBe("比的认识");

    const pending = await collectiveLessonPrepRepository.list("bureau-001", {
      ...emptyFilter(),
      status: "pending",
      keyword: "大青树",
    });
    expect(pending.list).toHaveLength(1);
    expect(pending.list[0]?.id).toBe("prep-campus-pending");
  });
});
