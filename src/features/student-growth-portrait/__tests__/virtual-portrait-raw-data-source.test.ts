import { describe, expect, it } from "vitest";
import { runtimeStudentGrowthPortraitRepository } from "../runtime-student-growth-portrait-repository";
import {
  virtualPortraitDataMetadata,
  virtualPortraitRawDataSource,
  virtualPortraitSchoolNames,
} from "../virtual-portrait-raw-data-source";
import type { PortraitQuery } from "../data-contract";

const fullQuery = {
  tenantId: "local-demo",
  academicYears: ["2025-2026"],
  terms: ["first"],
} satisfies PortraitQuery;

describe("virtualPortraitRawDataSource", () => {
  it("provides deterministic, clearly labelled raw records for six virtual schools", async () => {
    const raw = await virtualPortraitRawDataSource.load(fullQuery);

    expect(virtualPortraitDataMetadata).toMatchObject({
      isVirtual: true,
      schoolCount: 6,
      studentCount: 72,
    });
    expect(raw.students).toHaveLength(72);
    expect(new Set(raw.students.map((student) => student.schoolId)).size).toBe(6);
    expect(Object.keys(virtualPortraitSchoolNames)).toHaveLength(6);
    expect(raw.events.some((event) => "targetCredits" in event)).toBe(true);
    expect(raw.events.some((event) => "examId" in event)).toBe(true);
    expect(raw.events.filter((event) => "examId" in event)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        examType: "midterm",
        administrationScope: "district-unified",
        assessmentProgramId: expect.stringContaining("district-unified/"),
        paperVersion: expect.stringContaining("district-paper/"),
        comparableScope: "district-unified",
      }),
      expect.objectContaining({ examType: "final", administrationScope: "district-unified" }),
    ]));
    expect(raw.events.some((event) => "receivedAt" in event && "kind" in event)).toBe(true);
    expect(raw.events.some((event) => "testBatchId" in event)).toBe(true);
    expect(raw.events.some((event) => "enteredAt" in event)).toBe(true);
    expect(raw.events.some((event) => "category" in event && "amount" in event)).toBe(true);
    expect(raw.events.some((event) => "activityId" in event)).toBe(true);
  });

  it("filters raw students and events before they reach the aggregating repository", async () => {
    const query = {
      ...fullQuery,
      schoolIds: ["virtual-primary-a"],
      educationStages: ["primary"],
      grades: ["四年级"],
    } satisfies PortraitQuery;
    const raw = await virtualPortraitRawDataSource.load(query);
    const dataset = await runtimeStudentGrowthPortraitRepository.query(query);

    expect(raw.students).toHaveLength(6);
    expect(raw.students.every((student) => student.grade === "四年级")).toBe(true);
    expect(raw.events.every((event) => event.schoolId === "virtual-primary-a")).toBe(true);
    expect(dataset.metrics.find((metric) => metric.key === "enrolled-student-count")?.value).toBe(6);
    expect(dataset.schools).toHaveLength(1);
  });

  it("filters academic records by subject without removing non-academic facts", async () => {
    const raw = await virtualPortraitRawDataSource.load({
      ...fullQuery,
      subjects: ["数学"],
    });
    const academicEvents = raw.events.filter((event) => "examId" in event);

    expect(academicEvents).not.toHaveLength(0);
    expect(academicEvents.every((event) => event.subject === "数学")).toBe(true);
    expect(raw.events.some((event) => "targetCredits" in event)).toBe(true);
  });

  it("covers multiple grades, subjects and repeated domain facts for richer regional demos", async () => {
    const raw = await virtualPortraitRawDataSource.load(fullQuery);
    const grades = new Set(raw.students.map((student) => student.grade));
    const honorRecords = raw.events.filter((event) => "receivedAt" in event && "kind" in event);
    const sunshineRuns = raw.events.filter((event) => "distanceKilometers" in event);
    const dailyEvaluations = raw.events.filter((event) => "evaluatedAt" in event && "type" in event);
    const scienceExams = raw.events.filter((event) => "examId" in event && event.subject === "科学");

    expect(grades).toEqual(new Set(["四年级", "五年级", "七年级", "八年级", "高一", "高二"]));
    expect(scienceExams.length).toBeGreaterThan(0);
    expect(honorRecords.length).toBeGreaterThan(36);
    expect(new Set(honorRecords.map((event) => event.awardType)).size).toBeGreaterThanOrEqual(8);
    expect(new Set(honorRecords.map((event) => event.level)).size).toBeGreaterThanOrEqual(6);
    expect(new Set(honorRecords.map((event) => event.awardGrade)).size).toBeGreaterThanOrEqual(5);
    expect(sunshineRuns.length).toBeGreaterThan(72);
    expect(dailyEvaluations.length).toBeGreaterThan(144);
    expect(new Set(dailyEvaluations.map((event) => event.theme)).size).toBeGreaterThanOrEqual(6);
  });

  it("keeps school comparison metrics visibly differentiated without hard-coded chart results", async () => {
    const dataset = await runtimeStudentGrowthPortraitRepository.query(fullQuery);
    for (const metricKey of [
      "five-education-evaluation-coverage-rate",
      "fitness-test-record-coverage-rate",
      "honor-student-coverage-rate",
      "library-borrower-coverage-rate",
      "practice-participation-rate",
    ]) {
      const values = dataset.schools
        .map((school) => school.metrics.find((metric) => metric.key === metricKey)?.value)
        .filter((value): value is number => value !== undefined);
      expect(new Set(values).size, metricKey).toBeGreaterThan(1);
    }
  });

  it("derives the sports overview and sunshine-run summary from raw student records", async () => {
    const dataset = await runtimeStudentGrowthPortraitRepository.query(fullQuery);
    for (const metricKey of [
      "sports-goal-completion-rate",
      "fitness-standard-pass-rate",
      "sunshine-run-total-distance",
      "sunshine-run-session-count",
      "sunshine-run-distance-per-participant",
      "sunshine-run-duration-per-participant",
    ]) {
      const metric = dataset.metrics.find((item) => item.key === metricKey);
      expect(metric, metricKey).toBeDefined();
      expect(metric?.value, metricKey).toBeGreaterThan(0);
    }
  });

  it("provides traceable prior-period facts for real period-over-period comparisons", async () => {
    const previousQuery = {
      ...fullQuery,
      academicYears: ["2024-2025"],
      terms: ["second"],
    } satisfies PortraitQuery;
    const [currentDataset, previousDataset, previousRaw] = await Promise.all([
      runtimeStudentGrowthPortraitRepository.query(fullQuery),
      runtimeStudentGrowthPortraitRepository.query(previousQuery),
      virtualPortraitRawDataSource.load(previousQuery),
    ]);
    const currentEvaluationCoverage = currentDataset.metrics.find(
      (metric) => metric.key === "five-education-evaluation-coverage-rate",
    );
    const previousEvaluationCoverage = previousDataset.metrics.find(
      (metric) => metric.key === "five-education-evaluation-coverage-rate",
    );
    const currentAcademicSummary = currentDataset.unifiedExamSummaries.find((summary) => (
      summary.assessmentGrade === "四年级"
      && summary.subject === "数学"
      && summary.examType === "final"
    ));
    const previousAcademicSummary = previousDataset.unifiedExamSummaries.find((summary) => (
      summary.assessmentGrade === "四年级"
      && summary.subject === "数学"
      && summary.examType === "final"
    ));
    const previousAcademicRecords = previousRaw.events.filter((event) => "examId" in event);

    expect(previousAcademicRecords).not.toHaveLength(0);
    expect(previousAcademicRecords.every((record) => (
      record.academicYear === "2024-2025"
      && record.term === "second"
      && record.assessmentProgramId.includes("2024-2025-second")
    ))).toBe(true);
    expect(previousEvaluationCoverage?.quality).toMatchObject({
      observedStudentCount: 57,
      eligibleStudentCount: 72,
    });
    expect(previousEvaluationCoverage?.value).toBeLessThan(currentEvaluationCoverage?.value ?? 0);
    expect(previousAcademicSummary?.scoreRate).toBeLessThan(currentAcademicSummary?.scoreRate ?? 0);
  });
});
