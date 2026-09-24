import { describe, expect, it } from "vitest";
import { effectEvaluationRepository } from "@/features/effect-evaluation/effect-evaluation-repository";

describe("effect evaluation repository", () => {
  it("returns design stats, metrics and school comparison rows", async () => {
    const dataset = await effectEvaluationRepository.load("bureau-001");
    expect(dataset.stats).toEqual({
      schoolCount: 12,
      participatingCount: 6,
      nonParticipatingCount: 3,
      awardIncreasePercent: 248,
    });
    expect(dataset.metrics.map((metric) => metric.title)).toEqual([
      "竞赛获奖",
      "论文发表",
      "技能证书获取",
    ]);
    expect(dataset.metrics[0]).toMatchObject({
      participating: { displayValue: "42次" },
      nonParticipating: { displayValue: "12次" },
    });
    expect(dataset.summary.paragraphs[0]).toContain("8.25 次/年");
    expect(dataset.schools).toHaveLength(4);
    expect(dataset.schools[0]).toMatchObject({
      schoolName: "阳光小学",
      participating: true,
      awardCount: 6,
    });
  });
});
