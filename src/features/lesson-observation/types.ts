export type LessonObservationReviewMethod = "线下评课" | "直播评课" | "视频评课";

export interface LessonObservationOption {
  id: string;
  name: string;
}

export interface LessonObservationReviewer {
  id: string;
  name: string;
  schoolName: string;
  score: number | null;
  comment: string;
  reviewedAt: string;
}

export interface LessonObservationEvaluationItem {
  id: string;
  category: string;
  standard: string;
  score: number;
}

export interface LessonObservationArchive {
  id: string;
  title: string;
  description: string;
}

export interface LessonObservationRow {
  id: string;
  courseName: string;
  instructorName: string;
  schoolId: string;
  schoolName: string;
  lessonDate: string;
  period: string;
  gradeSubject: string;
  allianceId: string;
  allianceName: string;
  reviewMethod: LessonObservationReviewMethod;
  assessmentTemplate: string;
  score: number | null;
  reviewerNames: string[];
}

export interface LessonObservationDetail extends LessonObservationRow {
  totalScore: number;
  reviewedCount: number;
  reviewers: LessonObservationReviewer[];
  evaluations: LessonObservationEvaluationItem[];
  archives: LessonObservationArchive[];
}

export interface LessonObservationFilter {
  teacherName: string;
  allianceId: string;
  schoolId: string;
  reviewMethod: LessonObservationReviewMethod | "";
  startDate: string;
  endDate: string;
}

export interface LessonObservationPageResult {
  list: LessonObservationRow[];
  total: number;
}

export const LESSON_OBSERVATION_REVIEW_METHODS: readonly LessonObservationReviewMethod[] = [
  "线下评课",
  "直播评课",
  "视频评课",
];

export function defaultLessonObservationFilter(): LessonObservationFilter {
  return {
    teacherName: "",
    allianceId: "",
    schoolId: "",
    reviewMethod: "",
    startDate: "",
    endDate: "",
  };
}

export function formatObservationIndex(index: number) {
  return String(index).padStart(2, "0");
}

export function formatObservationScore(score: number | null) {
  return score == null ? "-" : String(score);
}

export function formatReviewerNames(names: readonly string[]) {
  return names.join("、");
}

export function formatObservationSchedule(lessonDate: string, period: string) {
  return `${lessonDate} ${period}`;
}

export function formatInstructorSchool(name: string, schoolName: string) {
  return `${name}（${schoolName}）`;
}

export function evaluationCategorySpans(items: readonly LessonObservationEvaluationItem[]) {
  const spans = items.map(() => 0);
  let index = 0;
  while (index < items.length) {
    let count = 1;
    while (items[index + count]?.category === items[index]?.category) count += 1;
    spans[index] = count;
    index += count;
  }
  return spans;
}
