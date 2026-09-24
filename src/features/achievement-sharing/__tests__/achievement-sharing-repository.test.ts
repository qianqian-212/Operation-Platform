import { describe, expect, it } from "vitest";
import { achievementSharingRepository } from "@/features/achievement-sharing/achievement-sharing-repository";
import { DEFAULT_CURRICULUM_NODE_ID } from "@/features/collective-lesson-prep/types";

function emptyFilter() {
  return { type: "" as const, keyword: "", curriculumNodeId: "" };
}

describe("achievement sharing repository", () => {
  it("summarizes twelve achievements matching the design stats", async () => {
    const all = await achievementSharingRepository.list("bureau-001", emptyFilter());
    expect(all.stats).toEqual({
      total: 12,
      materialCount: 6,
      paperCount: 3,
      downloadCount: 3,
    });
    expect(all.list).toHaveLength(12);
  });

  it("filters the first unit screenshot cards without changing global stats", async () => {
    const unitOne = await achievementSharingRepository.list("bureau-001", {
      ...emptyFilter(),
      curriculumNodeId: DEFAULT_CURRICULUM_NODE_ID,
    });
    expect(unitOne.stats.total).toBe(12);
    expect(unitOne.list).toHaveLength(4);
    expect(unitOne.list.map((item) => item.type)).toEqual([
      "lesson-plan",
      "courseware",
      "paper",
      "case",
    ]);
    expect(unitOne.list[0]).toMatchObject({
      title: "《富饶的西沙群岛》跨校集体备课教案集",
      schoolName: "阳光小学",
      teacherName: "陈晓晓",
      downloadCount: 100,
      visibilityLabel: "联盟内共享",
    });
  });

  it("filters by type and keyword", async () => {
    const papers = await achievementSharingRepository.list("bureau-001", {
      ...emptyFilter(),
      type: "paper",
    });
    expect(papers.list).toHaveLength(3);
    expect(papers.list.every((item) => item.type === "paper")).toBe(true);

    const keyword = await achievementSharingRepository.list("bureau-001", {
      ...emptyFilter(),
      keyword: "比的认识",
    });
    expect(keyword.list).toHaveLength(1);
    expect(keyword.list[0]?.id).toBe("share-courseware-ratio");
  });
});
