import { describe, expect, it } from "vitest";
import { portraitMetricDefinitionByKey } from "../metric-registry";
import {
  assertStudentGrowthCapabilityMatrix,
  pageCapabilityForTopic,
  studentGrowthPageCapabilityMatrix,
  studentGrowthTopicCapabilityMatrix,
} from "../page-capability-matrix";
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
      "five-education-evaluated-student-count",
      "five-education-evaluation-record-count",
      "five-education-evaluation-form-version-count",
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
});
