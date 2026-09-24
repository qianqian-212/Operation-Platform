export interface SchoolTrainingStatisticsStats {
  achievementCount: number;
  passRatePercent: number;
  averageCredits: number;
}

export interface SchoolTrainingStatisticsSubjectRow {
  id: string;
  subject: string;
  achievementCount: number;
  sharePercent: number;
  averageCredits: number;
}

export interface SchoolTrainingStatisticsResult {
  schoolName: string;
  stats: SchoolTrainingStatisticsStats;
  rows: SchoolTrainingStatisticsSubjectRow[];
}

export const SCHOOL_TRAINING_STATISTICS_SEMESTER_OPTIONS = [
  { value: "2026-fall", label: "2026年秋季学期" },
  { value: "2026-spring", label: "2026年春季学期" },
  { value: "2025-fall", label: "2025年秋季学期" },
] as const;
