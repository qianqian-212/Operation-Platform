import type { PortraitQuery, PortraitRawData } from "../../data-contract";

/**
 * Deliberately small, hand-checkable records for portrait aggregation tests.
 * These are not UI mock data and must not be used by production components.
 */
const currentSource = (id: string, studentId: string, schoolId: string, occurredAt: string) => ({
  id,
  studentId,
  schoolId,
  occurredAt,
  academicYear: "2025-2026",
  term: "first" as const,
  sourceSystem: "aggregation-test-fixture",
  sourceRecordId: id,
  status: "valid" as const,
  importedAt: "2025-12-31T00:00:00Z",
});

const previousSource = (id: string, studentId: string, schoolId: string, occurredAt: string) => ({
  ...currentSource(id, studentId, schoolId, occurredAt),
  academicYear: "2024-2025",
  term: "second" as const,
});

const unifiedExamMetadata = (examType: "midterm" | "final") => ({
  examType,
  administrationScope: "district-unified" as const,
  assessmentProgramId: "district-unified/primary/五年级/2025-first",
  paperVersion: "district-paper/primary/五年级/2025-first-v1",
  assessmentGrade: "五年级",
});

export const portraitRawRecords = {
  students: [
    { studentId: "student-a", schoolId: "school-a", educationStage: "primary", grade: "五年级", enrollmentStatus: "active", enrolledAt: "2021-09-01" },
    { studentId: "student-b", schoolId: "school-a", educationStage: "primary", grade: "五年级", enrollmentStatus: "active", enrolledAt: "2021-09-01" },
    { studentId: "student-c", schoolId: "school-b", educationStage: "primary", grade: "五年级", enrollmentStatus: "active", enrolledAt: "2021-09-01" },
    { studentId: "student-d", schoolId: "school-b", educationStage: "primary", grade: "六年级", enrollmentStatus: "active", enrolledAt: "2020-09-01" },
  ],
  events: [
    { ...currentSource("goal-a-moral", "student-a", "school-a", "2025-12-20"), targetCredits: 10, earnedCredits: 10, goalCategory: "moral" },
    { ...currentSource("goal-a-academic", "student-a", "school-a", "2025-12-20"), targetCredits: 10, earnedCredits: 8, goalCategory: "intellectual" },
    { ...currentSource("goal-b-moral", "student-b", "school-a", "2025-12-20"), targetCredits: 10, earnedCredits: 6, goalCategory: "moral" },
    { ...currentSource("goal-b-academic", "student-b", "school-a", "2025-12-20"), targetCredits: 10, earnedCredits: 10, goalCategory: "intellectual" },
    { ...currentSource("goal-c-moral", "student-c", "school-b", "2025-12-20"), targetCredits: 10, earnedCredits: 9, goalCategory: "moral" },
    { ...currentSource("goal-c-academic", "student-c", "school-b", "2025-12-20"), targetCredits: 10, earnedCredits: 9, goalCategory: "intellectual" },
    { ...currentSource("goal-d-moral", "student-d", "school-b", "2025-12-20"), targetCredits: 10, earnedCredits: 10, goalCategory: "moral" },

    { ...currentSource("evaluation-a-moral", "student-a", "school-a", "2025-12-20"), evaluationFormVersion: "v1", dimension: "moral", secondaryIndicator: "conduct", item: "行为规范", level: "excellent" },
    { ...currentSource("evaluation-a-academic", "student-a", "school-a", "2025-12-20"), evaluationFormVersion: "v1", dimension: "intellectual", secondaryIndicator: "learning-habit", item: "学习习惯", level: "average" },
    { ...currentSource("evaluation-b-moral", "student-b", "school-a", "2025-12-20"), evaluationFormVersion: "v1", dimension: "moral", secondaryIndicator: "conduct", item: "行为规范", level: "needs-effort" },
    { ...currentSource("evaluation-b-academic", "student-b", "school-a", "2025-12-20"), evaluationFormVersion: "v1", dimension: "intellectual", secondaryIndicator: "learning-habit", item: "学习习惯", level: "excellent" },
    { ...currentSource("evaluation-c-moral", "student-c", "school-b", "2025-12-20"), evaluationFormVersion: "v1", dimension: "moral", secondaryIndicator: "conduct", item: "行为规范", level: "excellent" },
    { ...currentSource("evaluation-c-academic", "student-c", "school-b", "2025-12-20"), evaluationFormVersion: "v1", dimension: "intellectual", secondaryIndicator: "learning-habit", item: "学习习惯", level: "excellent" },

    { ...previousSource("exam-a-previous", "student-a", "school-a", "2025-06-30"), examId: "g5-final-spring", examName: "五年级期末统考", ...unifiedExamMetadata("final"), subject: "数学", score: 88, fullScore: 100, rank: 2, comparableStudentCount: 3, comparableScope: "district-unified", examAt: "2025-06-30" },
    { ...currentSource("exam-a-midterm", "student-a", "school-a", "2025-10-31"), examId: "g5-midterm-fall", examName: "五年级期中统考", ...unifiedExamMetadata("midterm"), subject: "数学", score: 92, fullScore: 100, rank: 1, comparableStudentCount: 3, comparableScope: "district-unified", examAt: "2025-10-31" },
    { ...currentSource("exam-a-final", "student-a", "school-a", "2025-12-20"), examId: "g5-final-fall", examName: "五年级期末统考", ...unifiedExamMetadata("final"), subject: "数学", score: 94, fullScore: 100, rank: 1, comparableStudentCount: 3, comparableScope: "district-unified", examAt: "2025-12-20" },
    { ...previousSource("exam-b-previous", "student-b", "school-a", "2025-06-30"), examId: "g5-final-spring", examName: "五年级期末统考", ...unifiedExamMetadata("final"), subject: "数学", score: 90, fullScore: 100, rank: 1, comparableStudentCount: 3, comparableScope: "district-unified", examAt: "2025-06-30" },
    { ...currentSource("exam-b-midterm", "student-b", "school-a", "2025-10-31"), examId: "g5-midterm-fall", examName: "五年级期中统考", ...unifiedExamMetadata("midterm"), subject: "数学", score: 86, fullScore: 100, rank: 2, comparableStudentCount: 3, comparableScope: "district-unified", examAt: "2025-10-31" },
    { ...currentSource("exam-b-final", "student-b", "school-a", "2025-12-20"), examId: "g5-final-fall", examName: "五年级期末统考", ...unifiedExamMetadata("final"), subject: "数学", score: 84, fullScore: 100, rank: 3, comparableStudentCount: 3, comparableScope: "district-unified", examAt: "2025-12-20" },
    { ...previousSource("exam-c-previous", "student-c", "school-b", "2025-06-30"), examId: "g5-final-spring", examName: "五年级期末统考", ...unifiedExamMetadata("final"), subject: "数学", score: 76, fullScore: 100, rank: 3, comparableStudentCount: 3, comparableScope: "district-unified", examAt: "2025-06-30" },
    { ...currentSource("exam-c-midterm", "student-c", "school-b", "2025-10-31"), examId: "g5-midterm-fall", examName: "五年级期中统考", ...unifiedExamMetadata("midterm"), subject: "数学", score: 79, fullScore: 100, rank: 3, comparableStudentCount: 3, comparableScope: "district-unified", examAt: "2025-10-31" },
    { ...currentSource("exam-c-final", "student-c", "school-b", "2025-12-20"), examId: "g5-final-fall", examName: "五年级期末统考", ...unifiedExamMetadata("final"), subject: "数学", score: 82, fullScore: 100, rank: 2, comparableStudentCount: 3, comparableScope: "district-unified", examAt: "2025-12-20" },
    { ...currentSource("exam-a-chinese", "student-a", "school-a", "2025-12-20"), examId: "g5-final-fall", examName: "五年级期末统考", ...unifiedExamMetadata("final"), subject: "语文", score: 85, fullScore: 100, rank: 2, comparableStudentCount: 3, comparableScope: "district-unified", examAt: "2025-12-20" },
    { ...currentSource("exam-b-chinese", "student-b", "school-a", "2025-12-20"), examId: "g5-final-fall", examName: "五年级期末统考", ...unifiedExamMetadata("final"), subject: "语文", score: 91, fullScore: 100, rank: 1, comparableStudentCount: 3, comparableScope: "district-unified", examAt: "2025-12-20" },
    { ...currentSource("exam-c-chinese", "student-c", "school-b", "2025-12-20"), examId: "g5-final-fall", examName: "五年级期末统考", ...unifiedExamMetadata("final"), subject: "语文", score: 74, fullScore: 100, rank: 3, comparableStudentCount: 3, comparableScope: "district-unified", examAt: "2025-12-20" },

    { ...currentSource("honor-a", "student-a", "school-a", "2025-10-01"), kind: "title", name: "学习之星", level: "school", category: "学习", organizer: "学校", receivedAt: "2025-10-01" },
    { ...currentSource("honor-b", "student-a", "school-a", "2025-11-01"), kind: "award", name: "田径比赛二等奖", level: "district", category: "体育", organizer: "区教育局", competitionName: "区田径赛", receivedAt: "2025-11-01" },
    { ...currentSource("honor-c", "student-c", "school-b", "2025-10-12"), kind: "medal", name: "艺术节奖章", level: "city", category: "艺术", organizer: "市教育局", receivedAt: "2025-10-12" },

    { ...currentSource("fitness-a-bmi", "student-a", "school-a", "2025-10-15"), testBatchId: "fitness-2025", metric: "bmi", value: 18.5, unit: "kg/m²", standardStatus: "pass", standardVersion: "2014", testedAt: "2025-10-15" },
    { ...currentSource("fitness-a-endurance", "student-a", "school-a", "2025-10-15"), testBatchId: "fitness-2025", metric: "endurance", value: 85, unit: "score", standardStatus: "pass", standardVersion: "2014", testedAt: "2025-10-15" },
    { ...currentSource("fitness-b-bmi", "student-b", "school-a", "2025-10-15"), testBatchId: "fitness-2025", metric: "bmi", value: 24.2, unit: "kg/m²", standardStatus: "fail", standardVersion: "2014", testedAt: "2025-10-15" },
    { ...currentSource("fitness-b-endurance", "student-b", "school-a", "2025-10-15"), testBatchId: "fitness-2025", metric: "endurance", value: 58, unit: "score", standardStatus: "fail", standardVersion: "2014", testedAt: "2025-10-15" },
    { ...currentSource("fitness-c-bmi", "student-c", "school-b", "2025-10-15"), testBatchId: "fitness-2025", metric: "bmi", value: 17.8, unit: "kg/m²", standardStatus: "pass", standardVersion: "2014", testedAt: "2025-10-15" },
    { ...currentSource("fitness-c-endurance", "student-c", "school-b", "2025-10-15"), testBatchId: "fitness-2025", metric: "endurance", value: 88, unit: "score", standardStatus: "pass", standardVersion: "2014", testedAt: "2025-10-15" },
    { ...currentSource("exercise-a-knees", "student-a", "school-a", "2025-09-10"), exerciseType: "high-knees", sessionCount: 1, completedAt: "2025-09-10", isVerified: true },
    { ...currentSource("exercise-a-squat", "student-a", "school-a", "2025-09-11"), exerciseType: "squat", sessionCount: 1, completedAt: "2025-09-11", isVerified: true },
    { ...currentSource("exercise-b-knees", "student-b", "school-a", "2025-09-10"), exerciseType: "high-knees", sessionCount: 1, completedAt: "2025-09-10", isVerified: true },
    { ...currentSource("run-a-1", "student-a", "school-a", "2025-09-12"), distanceKilometers: 1.5, durationSeconds: 540, completedAt: "2025-09-12", isValidRun: true },
    { ...currentSource("run-a-2", "student-a", "school-a", "2025-09-19"), distanceKilometers: 2, durationSeconds: 720, completedAt: "2025-09-19", isValidRun: true },
    { ...currentSource("run-c-1", "student-c", "school-b", "2025-09-13"), distanceKilometers: 1, durationSeconds: 420, completedAt: "2025-09-13", isValidRun: true },

    { ...currentSource("library-visit-a-1", "student-a", "school-a", "2025-09-03"), enteredAt: "2025-09-03T09:00:00", leftAt: "2025-09-03T09:40:00" },
    { ...currentSource("library-visit-a-2", "student-a", "school-a", "2025-09-17"), enteredAt: "2025-09-17T09:00:00", leftAt: "2025-09-17T09:20:00" },
    { ...currentSource("library-visit-c-1", "student-c", "school-b", "2025-09-08"), enteredAt: "2025-09-08T09:00:00", leftAt: "2025-09-08T09:30:00" },
    { ...currentSource("loan-a-1", "student-a", "school-a", "2025-09-03"), bookId: "book-1", category: "文学", borrowedAt: "2025-09-03" },
    { ...currentSource("loan-a-2", "student-a", "school-a", "2025-09-17"), bookId: "book-2", category: "数理化", borrowedAt: "2025-09-17" },
    { ...currentSource("loan-c-1", "student-c", "school-b", "2025-09-08"), bookId: "book-3", category: "文学", borrowedAt: "2025-09-08" },
    { ...currentSource("attendance-a-normal", "student-a", "school-a", "2025-09-01"), type: "normal", durationMinutes: 0, recordedAt: "2025-09-01" },
    { ...currentSource("attendance-a-late", "student-a", "school-a", "2025-09-02"), type: "late", durationMinutes: 8, recordedAt: "2025-09-02" },
    { ...currentSource("attendance-b-normal", "student-b", "school-a", "2025-09-01"), type: "normal", durationMinutes: 0, recordedAt: "2025-09-01" },
    { ...currentSource("attendance-b-early", "student-b", "school-a", "2025-09-02"), type: "early-leave", durationMinutes: 12, recordedAt: "2025-09-02" },
    { ...currentSource("attendance-c-sick", "student-c", "school-b", "2025-09-01"), type: "sick-leave", durationMinutes: 0, recordedAt: "2025-09-01" },

    { ...currentSource("practice-a-moral", "student-a", "school-a", "2025-09-20"), activityId: "practice-1", category: "moral", participatedAt: "2025-09-20", isVerified: true },
    { ...currentSource("practice-a-physical", "student-a", "school-a", "2025-10-20"), activityId: "practice-2", category: "physical", participatedAt: "2025-10-20", isVerified: true },
    { ...currentSource("practice-b-labor", "student-b", "school-a", "2025-09-20"), activityId: "practice-3", category: "labor", participatedAt: "2025-09-20", isVerified: false },
    { ...currentSource("practice-c-aesthetic", "student-c", "school-b", "2025-10-08"), activityId: "practice-4", category: "aesthetic", participatedAt: "2025-10-08", isVerified: true },
    { ...currentSource("daily-a-praise", "student-a", "school-a", "2025-09-06"), type: "praise", theme: "学习习惯", evaluatedAt: "2025-09-06" },
    { ...currentSource("daily-a-improvement", "student-a", "school-a", "2025-09-13"), type: "improvement", theme: "任务坚持", evaluatedAt: "2025-09-13" },
    { ...currentSource("daily-b-improvement", "student-b", "school-a", "2025-09-06"), type: "improvement", theme: "行为规范", evaluatedAt: "2025-09-06" },
    { ...currentSource("daily-c-praise", "student-c", "school-b", "2025-09-06"), type: "praise", theme: "合作参与", evaluatedAt: "2025-09-06" },
  ],
} satisfies PortraitRawData;

export const portraitAggregationQuery = {
  tenantId: "bureau-001",
  academicYears: ["2025-2026"],
  terms: ["first"],
  educationStages: ["primary"],
  schoolIds: ["school-a", "school-b"],
} satisfies PortraitQuery;
