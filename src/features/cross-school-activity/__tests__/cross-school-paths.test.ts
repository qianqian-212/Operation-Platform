import { describe, expect, it } from "vitest";
import {
  crossSchoolAchievementSharingPath,
  crossSchoolActivityListPath,
  crossSchoolLessonObservationListPath,
  crossSchoolLessonPrepListPath,
  crossSchoolResearchBasePath,
} from "@/features/cross-school-activity/cross-school-paths";

describe("cross-school research path helpers", () => {
  it("resolves bureau prefixes from bureau routes", () => {
    const path = "/bureau/ai-teacher-development/cross-school-research/activities/activity-1";
    expect(crossSchoolResearchBasePath(path)).toBe(
      "/bureau/ai-teacher-development/cross-school-research",
    );
    expect(crossSchoolActivityListPath(path)).toBe(
      "/bureau/ai-teacher-development/cross-school-research/activities",
    );
    expect(crossSchoolLessonObservationListPath(path)).toBe(
      "/bureau/ai-teacher-development/cross-school-research/lesson-observation",
    );
    expect(crossSchoolLessonPrepListPath(path)).toBe(
      "/bureau/ai-teacher-development/cross-school-research/lesson-prep",
    );
    expect(crossSchoolAchievementSharingPath(path)).toBe(
      "/bureau/ai-teacher-development/cross-school-research/achievement-sharing",
    );
  });

  it("resolves school prefixes from school routes", () => {
    const path = "/ai-teacher-development/cross-school-research/lesson-prep";
    expect(crossSchoolResearchBasePath(path)).toBe(
      "/ai-teacher-development/cross-school-research",
    );
    expect(crossSchoolActivityListPath(path)).toBe(
      "/ai-teacher-development/cross-school-research/activities",
    );
    expect(crossSchoolLessonObservationListPath(path)).toBe(
      "/ai-teacher-development/cross-school-research/lesson-observation",
    );
  });
});
