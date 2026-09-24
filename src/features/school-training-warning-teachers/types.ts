import type { StatusTagColor } from "@/components/StatusTag.vue";
import type {
  TrainingWarningOverviewStats,
  TrainingWarningTeacherDetail,
} from "@/features/training-warning/types";

export type SchoolWarningTeacherStatus = "unreached" | "reached";

export interface SchoolWarningTeacherBanner {
  unreachedTeacherCount: number;
  creditLine: number;
  triggerPercent: number;
}

export interface SchoolWarningTeacherRow {
  id: string;
  name: string;
  subject: string;
  currentCredits: number;
  creditLine: number;
  completionPercent: number;
  status: SchoolWarningTeacherStatus;
}

export interface SchoolWarningTeacherListResult {
  schoolName: string;
  banner: SchoolWarningTeacherBanner;
  stats: TrainingWarningOverviewStats;
  teachers: SchoolWarningTeacherRow[];
  total: number;
}

export type { TrainingWarningTeacherDetail as SchoolWarningTeacherDetail };

export const SCHOOL_WARNING_TEACHER_STATUS_MAP: Record<
  SchoolWarningTeacherStatus,
  { label: string; tagColor: StatusTagColor }
> = {
  unreached: { label: "未达标", tagColor: "red" },
  reached: { label: "已达标", tagColor: "green" },
};

export const SCHOOL_WARNING_SEMESTER_OPTIONS = [
  { value: "", label: "全部学期" },
  { value: "2026-1", label: "2026年第一学期" },
  { value: "2025-2", label: "2025年第二学期" },
] as const;
