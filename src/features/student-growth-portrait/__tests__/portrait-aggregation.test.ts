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
    expect(metric(dataset, "five-education-evaluated-student-count"))
      .toMatchObject({ value: 3, unit: "人", numerator: 3 });
    expect(metric(dataset, "five-education-evaluation-record-count"))
      .toMatchObject({ value: 6, unit: "条", numerator: 6 });
    expect(metric(dataset, "five-education-evaluation-form-version-count"))
      .toMatchObject({ value: 1, unit: "套", numerator: 1 });
    expect(dataset.distributions.map((distribution) => distribution.key)).toEqual(
      expect.arrayContaining([
        "five-education-dimension-v1-moral-level-distribution",
        "five-education-dimension-v1-intellectual-level-distribution",
      ]),
    );
    const moralDistribution = dataset.distributions.find(
      (distribution) => distribution.key === "five-education-dimension-v1-moral-level-distribution",
    );
    expect(moralDistribution).toMatchObject({
      label: "moral",
      group: { key: "v1", label: "v1" },
    });
    expect(moralDistribution?.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "excellent", value: 66.67, studentCount: 2 }),
      expect.objectContaining({ key: "needs-effort", value: 33.33, studentCount: 1 }),
    ]));
    expect(dataset.schools.find((school) => school.schoolId === "school-a")?.distributions)
      .toEqual(expect.arrayContaining([
        expect.objectContaining({
          key: "five-education-dimension-v1-moral-level-distribution",
        }),
      ]));
  });

  it("publishes traceable grade snapshots from the same filtered student population", () => {
    const grade = dataset.grades.find((item) => item.grade === "五年级");
    expect(grade).toMatchObject({
      educationStage: "primary",
      grade: "五年级",
      studentCount: 3,
    });
    expect(grade?.metrics.find((item) => item.key === "five-education-evaluation-coverage-rate"))
      .toMatchObject({
        value: 100,
        numerator: 3,
        denominator: 3,
        population: {
          scope: "grade",
          educationStage: "primary",
          grade: "五年级",
          eligibleStudentCount: 3,
        },
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
        scoreNumerator: 260,
        scoreDenominator: 300,
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

  it("publishes honor type, level and grade distributions from explicit honor fields", () => {
    expect(metric(dataset, "honor-national-count")).toMatchObject({ value: 0, unit: "项" });
    expect(metric(dataset, "honor-provincial-count")).toMatchObject({ value: 0, unit: "项" });
    expect(metric(dataset, "honor-city-count")).toMatchObject({ value: 1, unit: "项" });
    expect(dataset.distributions.map((distribution) => distribution.key)).toEqual(
      expect.arrayContaining([
        "honor-award-type-distribution",
        "honor-award-level-distribution",
        "honor-award-grade-distribution",
      ]),
    );
    const levelDistribution = dataset.distributions.find(
      (distribution) => distribution.key === "honor-award-level-distribution",
    );
    expect(levelDistribution?.items).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "district", value: 33.33, studentCount: 1 }),
      expect.objectContaining({ key: "school", value: 33.33, studentCount: 1 }),
      expect.objectContaining({ key: "city", value: 33.33, studentCount: 1 }),
    ]));
    expect(levelDistribution?.quality).toMatchObject({
      observedStudentCount: 2,
      validRecordCount: 3,
    });
  });

  it("excludes unverified practice records from participation", () => {
    expect(metric(dataset, "practice-participation-rate")).toMatchObject({
      value: 50,
      numerator: 2,
      denominator: 4,
      quality: { observedStudentCount: 2, validRecordCount: 3, coverageRate: 50 },
    });
    expect(metric(dataset, "practice-activity-count-per-student")).toMatchObject({
      value: 0.75,
      numerator: 3,
      denominator: 4,
    });
    expect(metric(dataset, "practice-category-count-per-student")).toMatchObject({
      value: 0.75,
      numerator: 3,
      denominator: 4,
    });
    expect(metric(dataset, "practice-category-coverage-rate")).toMatchObject({
      value: 42.86,
      numerator: 3,
      denominator: 7,
    });
    expect(metric(dataset, "practice-moral-participant-count")).toMatchObject({ value: 1 });
    expect(metric(dataset, "practice-physical-participant-count")).toMatchObject({ value: 1 });
    expect(metric(dataset, "practice-aesthetic-participant-count")).toMatchObject({ value: 1 });
    expect(metric(dataset, "practice-volunteer-participant-count")).toMatchObject({ value: 0 });
    expect(metric(dataset, "practice-moral-participation-rate")).toMatchObject({
      value: 25,
      numerator: 1,
      denominator: 4,
      unit: "%",
    });
    expect(metric(dataset, "practice-volunteer-participation-rate")).toMatchObject({
      value: 0,
      numerator: 0,
      denominator: 4,
      unit: "%",
    });
  });

  it("separates daily-evaluation record coverage from positive evaluation share", () => {
    expect(metric(dataset, "daily-evaluation-record-coverage-rate")).toMatchObject({
      value: 75,
      numerator: 3,
      denominator: 4,
      comparability: "district-comparable",
    });
    expect(metric(dataset, "daily-evaluation-positive-rate")).toMatchObject({
      value: 50,
      numerator: 2,
      denominator: 4,
      comparability: "within-school-trend-only",
    });
    expect(metric(dataset, "daily-evaluation-improvement-rate")).toMatchObject({
      value: 50,
      numerator: 2,
      denominator: 4,
      comparability: "within-school-trend-only",
    });
  });

  it("aggregates library visits, valid dwell time, borrow volume, transactions and categories", () => {
    expect(metric(dataset, "library-visits-per-student")).toMatchObject({
      value: 0.75,
      unit: "次/生",
      numerator: 3,
      denominator: 4,
    });
    expect(metric(dataset, "library-dwell-hours-per-student")).toMatchObject({
      value: 0.38,
      unit: "小时/生",
      numerator: 1.5,
      denominator: 4,
    });
    expect(metric(dataset, "book-borrow-volume-per-student")).toMatchObject({
      value: 0.75,
      unit: "册/生",
      numerator: 3,
      denominator: 4,
    });
    expect(metric(dataset, "book-borrow-transactions-per-student")).toMatchObject({
      value: 0.75,
      unit: "次/生",
      numerator: 3,
      denominator: 4,
    });
    expect(metric(dataset, "library-visit-count-last-7-days")).toMatchObject({
      value: 1,
      unit: "次",
      numerator: 1,
    });
    expect(metric(dataset, "library-visit-count-last-30-days")).toMatchObject({
      value: 3,
      unit: "次",
      numerator: 3,
    });
    expect(metric(dataset, "book-borrow-volume-last-7-days")).toMatchObject({
      value: 1,
      unit: "册",
      numerator: 1,
    });
    expect(metric(dataset, "book-borrow-volume-last-30-days")).toMatchObject({
      value: 3,
      unit: "册",
      numerator: 3,
    });
    expect(metric(dataset, "book-borrow-transaction-count-last-7-days")).toMatchObject({
      value: 1,
      unit: "次",
      numerator: 1,
    });
    expect(metric(dataset, "book-borrow-transaction-count-last-30-days")).toMatchObject({
      value: 3,
      unit: "次",
      numerator: 3,
    });
    expect(dataset.distributions.find(
      (distribution) => distribution.key === "behavior-book-category-distribution",
    )?.items).toEqual(expect.arrayContaining([
      { key: "文学", value: 66.67, studentCount: 2 },
      { key: "数理化", value: 33.33, studentCount: 1 },
    ]));
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
