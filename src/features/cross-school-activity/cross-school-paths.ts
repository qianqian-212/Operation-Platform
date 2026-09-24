/** Shared path prefixes for bureau vs school cross-school research surfaces. */
export function crossSchoolResearchBasePath(currentPath: string) {
  return currentPath.startsWith("/bureau/")
    ? "/bureau/ai-teacher-development/cross-school-research"
    : "/ai-teacher-development/cross-school-research";
}

export function crossSchoolActivityListPath(currentPath: string) {
  return `${crossSchoolResearchBasePath(currentPath)}/activities`;
}

export function crossSchoolLessonObservationListPath(currentPath: string) {
  return `${crossSchoolResearchBasePath(currentPath)}/lesson-observation`;
}

export function crossSchoolLessonPrepListPath(currentPath: string) {
  return `${crossSchoolResearchBasePath(currentPath)}/lesson-prep`;
}

export function crossSchoolAchievementSharingPath(currentPath: string) {
  return `${crossSchoolResearchBasePath(currentPath)}/achievement-sharing`;
}
