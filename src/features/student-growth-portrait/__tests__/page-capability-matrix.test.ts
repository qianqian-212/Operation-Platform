import { describe, expect, it } from "vitest";
import { portraitMetricDefinitionByKey } from "../metric-registry";
import {
  assertStudentGrowthCapabilityMatrix,
  pageCapabilityForTopic,
  studentGrowthPageCapabilityMatrix,
  studentGrowthTopicCapabilityMatrix,
} from "../page-capability-matrix";
import {
  assertRegionalPortraitAnchorMatrix,
  regionalPortraitAnchorMatrix,
} from "../regional-portrait-anchor-matrix";

describe("student growth portrait page capability matrix", () => {
  it("is the explicit source of every topic boundary", () => {
    expect(studentGrowthTopicCapabilityMatrix).toHaveLength(10);
    expect(studentGrowthTopicCapabilityMatrix.find((topic) => topic.key === "life")).toMatchObject({ status: "restricted" });
    expect(studentGrowthTopicCapabilityMatrix.find((topic) => topic.key === "academic")).toMatchObject({ status: "limited" });
  });

  it("only references metrics from the metric dictionary", () => {
    expect(() => assertStudentGrowthCapabilityMatrix()).not.toThrow();
    for (const capability of studentGrowthPageCapabilityMatrix) {
      expect(capability.metricKeys.every((key) => portraitMetricDefinitionByKey.has(key))).toBe(true);
    }
  });

  it("does not authorize a topic without a concrete page capability", () => {
    expect(pageCapabilityForTopic("five-education")?.metricKeys).toEqual([
      "five-education-goal-completion-rate",
      "five-education-evaluation-coverage-rate",
    ]);
    expect(pageCapabilityForTopic("life")?.status).toBe("restricted");
  });

  it("places shared participation and coverage facts in one regional data summary", () => {
    expect(studentGrowthPageCapabilityMatrix.slice(0, 4).map((capability) => capability.key)).toEqual([
      "overview-summary",
      "overview-school-comparison",
      "overview-data-summary",
      "overview-data-attention",
    ]);
    expect(studentGrowthPageCapabilityMatrix.find((capability) => capability.key === "overview-data-summary")?.metricKeys)
      .toContain("practice-participation-rate");
    expect(studentGrowthPageCapabilityMatrix.find((capability) => capability.key === "overview-data-summary")?.metricKeys)
      .toContain("academic-unified-exam-record-coverage-rate");
  });

  it("defines ten flat anchors for one regional portrait page instead of ten routes", () => {
    expect(() => assertRegionalPortraitAnchorMatrix()).not.toThrow();
    expect(regionalPortraitAnchorMatrix.map((anchor) => anchor.label)).toEqual([
      "区域发展总览",
      "学业发展画像",
      "学生群体画像",
      "学校发展画像",
      "区域均衡分析",
      "综合素质画像",
      "成长支持成效",
      "专题分析",
      "AI 分析助手",
      "区域发展报告",
    ]);
    expect(regionalPortraitAnchorMatrix.find((anchor) => anchor.key === "student-cohorts"))
      .toMatchObject({ status: "planned", metricKeys: [] });
  });
});
