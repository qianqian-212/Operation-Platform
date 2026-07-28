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

    expect(raw.students).toHaveLength(12);
    expect(raw.events.every((event) => event.schoolId === "virtual-primary-a")).toBe(true);
    expect(dataset.metrics.find((metric) => metric.key === "enrolled-student-count")?.value).toBe(12);
    expect(dataset.schools).toHaveLength(1);
  });
});
