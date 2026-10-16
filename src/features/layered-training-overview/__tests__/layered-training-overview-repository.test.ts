import { describe, expect, it } from "vitest";
import { queryLayeredTrainingOverview } from "@/features/layered-training-overview/mock-data";
import { layeredTrainingOverviewRepository } from "@/features/layered-training-overview/layered-training-overview-repository";
import type { LayeredTrainingOverviewQuery } from "@/features/layered-training-overview/types";

const fallQuery: LayeredTrainingOverviewQuery = {
  semester: "2026-1",
  schoolKeyword: "",
  teacherSchool: "",
  teacherSubject: "",
  page: 1,
  pageSize: 10,
  schoolSort: "reach",
};

describe("layered training overview repository", () => {
  it("returns the regional summary and the seeded first teacher page", async () => {
    const result = await layeredTrainingOverviewRepository.load("bureau-001", fallQuery);
    expect(result.summary).toMatchObject({
      teacherCount: 856,
      schoolCount: 8,
      participationRate: 85,
      participantCount: 450,
      participationBaseCount: 486,
      averageCompletionRate: 85,
      creditReachRate: 80,
      unmetCreditCount: 30,
    });
    expect(result.schools[0]).toMatchObject({ name: "阳光小学", reachRate: 25, reachTone: "warning" });
    expect(result.schools).toHaveLength(8);
    expect(result.teacherTotal).toBe(450);
    expect(result.teachers[0]).toMatchObject({
      name: "张小明",
      schoolName: "第一小学",
      subject: "语文",
      hoursLabel: "24/36",
      creditsLabel: "8/12",
      completionRate: 67,
      status: "in-progress",
    });
    expect(result.teachers[2]).toMatchObject({ name: "王刚", status: "slow" });
  });

  it("filters schools without changing the regional summary", () => {
    const result = queryLayeredTrainingOverview({ ...fallQuery, schoolKeyword: "实验" });
    expect(result.summary.teacherCount).toBe(856);
    expect(result.schools).toHaveLength(1);
    expect(result.schools[0]).toMatchObject({ name: "实验小学", reachRate: 78 });
  });

  it("filters and pages the teacher ledger", () => {
    const english = queryLayeredTrainingOverview({
      ...fallQuery,
      teacherSubject: "英语",
      pageSize: 450,
    });
    expect(english.teachers.every((item) => item.subject === "英语")).toBe(true);
    expect(english.teachers.some((item) => item.name === "王刚")).toBe(true);
    expect(english.teacherTotal).toBeLessThan(450);

    const secondPage = queryLayeredTrainingOverview({ ...fallQuery, page: 2 });
    expect(secondPage.teachers).toHaveLength(10);
    expect(secondPage.teachers[0]?.name).not.toBe("张小明");
  });

  it("switches the semester dataset", () => {
    const spring = queryLayeredTrainingOverview({ ...fallQuery, semester: "2025-2" });
    expect(spring.summary.teacherCount).toBe(120);
    expect(spring.schools).toHaveLength(2);
    expect(spring.teacherTotal).toBe(20);
  });
});
