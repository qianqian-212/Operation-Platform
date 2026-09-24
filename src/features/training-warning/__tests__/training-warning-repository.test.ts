import { describe, expect, it } from "vitest";
import { trainingWarningRepository } from "@/features/training-warning/training-warning-repository";

describe("training warning repository", () => {
  it("lists school compliance rows with district banner", async () => {
    const result = await trainingWarningRepository.listSchools(
      "bureau-001",
      "",
      "reach-rate",
      1,
      10,
    );
    expect(result.banner).toMatchObject({
      creditLine: 36,
      triggerPercent: 60,
    });
    expect(result.stats.teacherCount).toBeGreaterThan(0);
    expect(result.rows[0]?.schoolName).toBeTruthy();
    expect(result.rows[0]!.reachRatePercent).toBeLessThanOrEqual(
      result.rows.at(-1)!.reachRatePercent,
    );
  });

  it("loads school teachers and teacher credit detail", async () => {
    const schools = await trainingWarningRepository.listSchools(
      "bureau-001",
      "阳光",
      "name",
      1,
      10,
    );
    const schoolId = schools.rows[0]!.id;
    const detail = await trainingWarningRepository.schoolDetail(
      "bureau-001",
      schoolId,
      1,
      10,
      "",
      "",
      "",
    );
    expect(detail.schoolName).toContain("阳光");
    expect(detail.teachers.length).toBeGreaterThan(0);

    const teacher = await trainingWarningRepository.teacherDetail(
      "bureau-001",
      detail.teachers[0]!.id,
    );
    expect(teacher.items.length).toBeGreaterThan(0);
    expect(teacher.currentCredits).toBeGreaterThanOrEqual(0);
  });
});
