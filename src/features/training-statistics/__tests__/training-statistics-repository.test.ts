import { describe, expect, it } from "vitest";
import { trainingStatisticsRepository } from "@/features/training-statistics/training-statistics-repository";

describe("training statistics repository", () => {
  it("returns year overview stats and school compliance rows", async () => {
    const result = await trainingStatisticsRepository.list("bureau-001", "2026-1", "", 1, 10);
    expect(result.stats).toMatchObject({
      achievementCount: 20,
    });
    expect(result.stats.teacherCount).toBeGreaterThan(0);
    expect(result.rows[0]).toMatchObject({
      schoolName: "阳光小学",
    });
    expect(result.total).toBeGreaterThanOrEqual(result.rows.length);
  });
});
