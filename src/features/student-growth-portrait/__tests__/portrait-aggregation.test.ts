import { describe, expect, it } from "vitest";
import { aggregatePortraitDataset, defaultPortraitAggregationRules } from "../portrait-aggregation";
import type { PortraitMetric } from "../data-contract";
import { portraitAggregationQuery, portraitRawRecords } from "./fixtures/portrait-raw-records";

function metric(dataset: ReturnType<typeof aggregatePortraitDataset>, key: string): PortraitMetric {
  const result = dataset.metrics.find((item) => item.key === key);
  if (!result) throw new Error(`Expected metric ${key}`);
  return result;
}

describe("aggregatePortraitDataset", () => {
  const dataset = aggregatePortraitDataset(
    portraitRawRecords,
    portraitAggregationQuery,
    "2026-01-01T00:00:00Z",
    { ...defaultPortraitAggregationRules, minimumPublishableGroupSize: 1 },
  );

  it("calculates five-education completion from credits instead of averaging student percentages", () => {
    expect(metric(dataset, "five-education-goal-completion-rate")).toMatchObject({
      value: 88.57,
      unit: "%",
      numerator: 62,
      denominator: 70,
      population: { scope: "district", eligibleStudentCount: 4 },
      quality: { observedStudentCount: 4, coverageRate: 100, validRecordCount: 7 },
    });
  });

  it("reports evaluation coverage against all selected active students", () => {
    expect(metric(dataset, "five-education-evaluation-coverage-rate")).toMatchObject({
      value: 75,
      numerator: 3,
      denominator: 4,
      quality: { status: "partial", observedStudentCount: 3, coverageRate: 75 },
    });
  });

  it("summarizes unified midterm and final scores only within the same exam, subject, grade and paper version", () => {
    expect(metric(dataset, "academic-unified-exam-record-coverage-rate")).toMatchObject({
      value: 75,
      numerator: 3,
      denominator: 4,
      comparability: "district-comparable",
    });
    expect(dataset.unifiedExamSummaries).toEqual(expect.arrayContaining([
      expect.objectContaining({
        examId: "g5-final-fall",
        examType: "final",
        assessmentGrade: "五年级",
        subject: "数学",
        paperVersion: "district-paper/primary/五年级/2025-first-v1",
        scoreRate: 86.67,
        excellentRate: 33.33,
        goodOrAboveRate: 100,
        passRate: 100,
        lowScoreRate: 0,
        studentCount: 3,
        eligibleStudentCount: 3,
      }),
      expect.objectContaining({ examId: "g5-midterm-fall", examType: "midterm", subject: "数学" }),
    ]));
    const finalMath = dataset.unifiedExamSummaries.find((item) => (
      item.examId === "g5-final-fall" && item.subject === "数学"
    ));
    expect(finalMath?.scoreBandDistribution).toEqual([
      { key: "excellent", studentCount: 1, rate: 33.33 },
      { key: "good", studentCount: 2, rate: 66.67 },
      { key: "pass", studentCount: 0, rate: 0 },
      { key: "low", studentCount: 0, rate: 0 },
    ]);
    expect(finalMath?.schoolSummaries.find((school) => school.schoolId === "school-a"))
      .toMatchObject({ scoreRate: 89, standardScore: 54.45, excellentRate: 50 });
    expect(dataset.unifiedExamTrends).toEqual(expect.arrayContaining([
      expect.objectContaining({
        assessmentGrade: "五年级",
        subject: "数学",
        comparability: "descriptive-score-rate-only",
        points: [
          expect.objectContaining({ examType: "midterm", scoreRate: 85.67 }),
          expect.objectContaining({ examType: "final", scoreRate: 86.67, changeFromPrevious: 1 }),
        ],
      }),
    ]));
  });

  it("counts distinct honored students rather than award records for honor coverage", () => {
    expect(metric(dataset, "honor-student-coverage-rate")).toMatchObject({
      value: 50,
      numerator: 2,
      denominator: 4,
      quality: { observedStudentCount: 2, validRecordCount: 3, coverageRate: 50 },
    });
  });

  it("excludes unverified practice records from participation", () => {
    expect(metric(dataset, "practice-participation-rate")).toMatchObject({
      value: 50,
      numerator: 2,
      denominator: 4,
      quality: { observedStudentCount: 2, validRecordCount: 3, coverageRate: 50 },
    });
  });

  it("emits evidence-backed low-coverage signals instead of an unsupported diagnosis", () => {
    expect(dataset.attentionSignals).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: "low-data-coverage",
        domain: "honor",
        evidence: [expect.objectContaining({
          metricKey: "honor-student-coverage-rate",
          observedValue: 50,
          referenceValue: 80,
          unit: "%",
        })],
      }),
    ]));
  });

  it("does not fabricate a trend when the query contains one comparable period", () => {
    expect(dataset.generatedAt).toBe("2026-01-01T00:00:00Z");
    expect(dataset.trends).toEqual([]);
  });

  it("suppresses school and exam subgroup indicators below the minimum publishable size", () => {
    const protectedDataset = aggregatePortraitDataset(
      portraitRawRecords,
      portraitAggregationQuery,
      "2026-01-01T00:00:00Z",
    );

    expect(protectedDataset.schools.every((school) => school.metrics.length === 0)).toBe(true);
    expect(protectedDataset.unifiedExamSummaries.every((summary) => summary.schoolSummaries.length === 0)).toBe(true);
  });
});
