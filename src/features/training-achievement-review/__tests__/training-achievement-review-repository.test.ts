import { beforeEach, describe, expect, it } from "vitest";
import { resetAchievementReviewMockData } from "@/features/training-achievement-review/mock-data";
import { trainingAchievementReviewRepository } from "@/features/training-achievement-review/training-achievement-review-repository";

describe("training achievement review repository", () => {
  beforeEach(() => {
    resetAchievementReviewMockData();
  });

  it("lists pending rows with overview stats and tab counts", async () => {
    const result = await trainingAchievementReviewRepository.list("bureau-001", {
      statusTab: "pending",
      schoolName: "",
      type: "",
      keyword: "",
      page: 1,
      pageSize: 10,
    });
    expect(result.stats.pendingCount).toBeGreaterThan(0);
    expect(result.tabCounts.pending).toBe(result.stats.pendingCount);
    expect(result.rows.every((row) => row.status === "pending")).toBe(true);
    expect(result.rows[0]).toMatchObject({
      title: "基于核心素养的单元整体教学研究",
      schoolName: "阳光小学",
    });
  });

  it("approves, rejects with remark, and features approved achievements", async () => {
    const pending = await trainingAchievementReviewRepository.list("bureau-001", {
      statusTab: "pending",
      schoolName: "",
      type: "",
      keyword: "",
      page: 1,
      pageSize: 1,
    });
    const id = pending.rows[0]!.id;
    const approved = await trainingAchievementReviewRepository.approve("bureau-001", id, "同意");
    expect(approved.status).toBe("approved");

    await expect(
      trainingAchievementReviewRepository.reject("bureau-001", id, ""),
    ).rejects.toThrow("驳回时必须填写审核备注");

    const featured = await trainingAchievementReviewRepository.feature(
      "bureau-001",
      id,
      true,
      "案例优秀",
    );
    expect(featured.featured).toBe(true);
    expect(featured.recommendReason).toBe("案例优秀");
  });
});
