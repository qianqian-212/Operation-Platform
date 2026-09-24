export interface TrainingWarningOverviewStats {
  teacherCount: number;
  reachedCount: number;
  unreachedCount: number;
  reachRatePercent: number;
}

export interface TrainingWarningBanner {
  unreachedTeacherCount: number;
  schoolCount: number;
  creditLine: number;
  triggerPercent: number;
}

export interface TrainingWarningSchoolRow {
  id: string;
  schoolName: string;
  teacherCount: number;
  reachedCount: number;
  unreachedCount: number;
  reachRatePercent: number;
}

export interface TrainingWarningSchoolListResult {
  banner: TrainingWarningBanner;
  stats: TrainingWarningOverviewStats;
  rows: TrainingWarningSchoolRow[];
  total: number;
}

export interface TrainingWarningTeacherRow {
  id: string;
  name: string;
  subject: string;
  currentCredits: number;
  creditLine: number;
  completionPercent: number;
  reached: boolean;
}

export interface TrainingWarningSchoolDetail {
  schoolId: string;
  schoolName: string;
  stats: TrainingWarningOverviewStats;
  teachers: TrainingWarningTeacherRow[];
  total: number;
}

export interface TrainingWarningCreditItem {
  id: string;
  title: string;
  typeLabel: string;
  levelLabel: string;
  at: string;
  statusLabel: string;
  statusTone: "green" | "orange";
  credits: number;
}

export interface TrainingWarningTeacherDetail {
  id: string;
  name: string;
  schoolName: string;
  subject: string;
  hireYear: string;
  currentCredits: number;
  shortfallCredits: number;
  completionPercent: number;
  yearLabel: string;
  items: TrainingWarningCreditItem[];
}

export type TrainingWarningSortKey = "reach-asc" | "reach-desc" | "name";
