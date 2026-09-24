export interface TrainingStatisticsStats {
  achievementCount: number;
  teacherCount: number;
  reachRatePercent: number;
}

export interface TrainingStatisticsSchoolRow {
  id: string;
  schoolName: string;
  teacherCount: number;
  reachedCount: number;
  unreachedCount: number;
  reachRatePercent: number;
}

export interface TrainingStatisticsListResult {
  stats: TrainingStatisticsStats;
  rows: TrainingStatisticsSchoolRow[];
  total: number;
}

export const TRAINING_STATISTICS_SEMESTER_OPTIONS = [
  { value: "2026-1", label: "2026年第一学期" },
  { value: "2025-2", label: "2025年第二学期" },
  { value: "2025-1", label: "2025年第一学期" },
] as const;
