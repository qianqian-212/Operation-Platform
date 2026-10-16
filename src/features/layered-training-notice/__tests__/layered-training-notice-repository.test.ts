import { describe, expect, it } from "vitest";
import { listLayeredTrainingNotices } from "@/features/layered-training-notice/mock-data";
import { layeredTrainingNoticeRepository } from "@/features/layered-training-notice/layered-training-notice-repository";
import type { LayeredTrainingNoticeQuery } from "@/features/layered-training-notice/types";

const emptyQuery: LayeredTrainingNoticeQuery = {
  schoolName: "",
  noticeType: "",
  page: 1,
  pageSize: 10,
};

describe("layered training notice repository", () => {
  it("lists the automatic notice ledger with the seeded first page", async () => {
    const result = await layeredTrainingNoticeRepository.list("bureau-001", emptyQuery);
    expect(result.total).toBe(128);
    expect(result.rows).toHaveLength(10);
    expect(result.rows[0]).toMatchObject({
      notifiedAt: "2026-10-10 09:00",
      teacherName: "王刚",
      schoolName: "第一小学",
      subject: "英语",
      noticeType: "periodic",
      staleDays: 28,
      result: "unmet",
    });
    expect(result.schools).toEqual(expect.arrayContaining(["第一小学", "实验小学", "第三小学"]));
  });

  it("filters by school and notice type without mutating later pages", () => {
    const school = listLayeredTrainingNotices({
      ...emptyQuery,
      schoolName: "实验小学",
      pageSize: 50,
    });
    expect(school.rows.every((row) => row.schoolName === "实验小学")).toBe(true);
    expect(school.rows.some((row) => row.teacherName === "周杰")).toBe(true);

    const firstNotices = listLayeredTrainingNotices({
      ...emptyQuery,
      noticeType: "first",
      pageSize: 128,
    });
    expect(firstNotices.rows.every((row) => row.noticeType === "first")).toBe(true);
    expect(firstNotices.total).toBeLessThan(128);

    const secondPage = listLayeredTrainingNotices({ ...emptyQuery, page: 2 });
    expect(secondPage.rows[0]?.id).not.toBe(resultId(emptyQuery));
  });
});

function resultId(query: Parameters<typeof listLayeredTrainingNotices>[0]) {
  return listLayeredTrainingNotices(query).rows[0]?.id ?? "";
}
