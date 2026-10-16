import { beforeEach, describe, expect, it } from "vitest";
import { resetLayeredTrainingCourseReviewMockData } from "@/features/layered-training-course-review/mock-data";
import { layeredTrainingCourseReviewRepository } from "@/features/layered-training-course-review/layered-training-course-review-repository";
import type { LayeredTrainingCourseListQuery } from "@/features/layered-training-course-review/types";

const pendingQuery: LayeredTrainingCourseListQuery = {
  statusTab: "pending",
  schoolName: "",
  kind: "",
  page: 1,
  pageSize: 10,
};

describe("layered training course review repository", () => {
  beforeEach(() => {
    resetLayeredTrainingCourseReviewMockData();
  });

  it("lists pending courses and keeps the design counts", async () => {
    const result = await layeredTrainingCourseReviewRepository.list("bureau-001", pendingQuery);
    expect(result.tabCounts).toEqual({ pending: 3, approved: 18, rejected: 2 });
    expect(result.total).toBe(3);
    expect(result.rows.map((row) => row.title)).toEqual([
      "整本书阅读指导策略",
      "小学数学思维训练方法",
      "科学实验课设计指南",
    ]);
    expect(result.rows[0]).toMatchObject({
      kind: "video",
      lessonCountLabel: "6讲",
      subject: "语文",
      schoolName: "第一小学",
      uploaderName: "王主任",
      uploadedAt: "2026-09-22",
    });
  });

  it("filters pending rows by school and course kind", async () => {
    const school = await layeredTrainingCourseReviewRepository.list("bureau-001", {
      ...pendingQuery,
      schoolName: "第三小学",
    });
    expect(school.rows).toHaveLength(1);
    expect(school.rows[0]?.title).toBe("科学实验课设计指南");

    const documents = await layeredTrainingCourseReviewRepository.list("bureau-001", {
      ...pendingQuery,
      kind: "document",
    });
    expect(documents.rows.every((row) => row.kind === "document")).toBe(true);
  });

  it("approves a pending course and rejects only with a reason", async () => {
    const detail = await layeredTrainingCourseReviewRepository.detail("bureau-001", "ltc-001");
    expect(detail?.lessons).toHaveLength(6);
    expect(detail?.summary).toContain("整本书阅读");

    await expect(
      layeredTrainingCourseReviewRepository.reject("bureau-001", "ltc-001", "  "),
    ).rejects.toThrow("驳回时必须填写驳回原因");

    const rejected = await layeredTrainingCourseReviewRepository.reject(
      "bureau-001",
      "ltc-002",
      "课时说明不完整",
    );
    expect(rejected.status).toBe("rejected");
    expect(rejected.reviewComment).toBe("课时说明不完整");

    const approved = await layeredTrainingCourseReviewRepository.approve("bureau-001", "ltc-001", "");
    expect(approved.status).toBe("approved");
    await expect(
      layeredTrainingCourseReviewRepository.approve("bureau-001", "ltc-001", "再次通过"),
    ).rejects.toThrow("该课程已完成审核");
  });
});
