import type { StatusTagColor } from "@/components/StatusTag.vue";
import type { CurriculumNode } from "@/features/collective-lesson-prep/types";

export type AchievementSharingType = "lesson-plan" | "courseware" | "paper" | "case";

export type { CurriculumNode };

export interface AchievementSharingItem {
  id: string;
  title: string;
  schoolName: string;
  teacherName: string;
  publishedAt: string;
  downloadCount: number;
  summary: string;
  type: AchievementSharingType;
  visibilityLabel: string;
  curriculumPath: string[];
}

export interface AchievementSharingFilter {
  type: AchievementSharingType | "";
  keyword: string;
  curriculumNodeId: string;
}

export interface AchievementSharingStats {
  total: number;
  materialCount: number;
  paperCount: number;
  downloadCount: number;
}

export interface AchievementSharingListResult {
  stats: AchievementSharingStats;
  list: AchievementSharingItem[];
}

export const ACHIEVEMENT_SHARING_TYPE_MAP: Record<
  AchievementSharingType,
  { label: string; tagColor: StatusTagColor }
> = {
  "lesson-plan": { label: "教案", tagColor: "orange" },
  courseware: { label: "课件", tagColor: "orange" },
  paper: { label: "论文", tagColor: "green" },
  case: { label: "案例", tagColor: "blue" },
};

export const ACHIEVEMENT_SHARING_TYPE_OPTIONS = [
  { value: "lesson-plan", label: "教案" },
  { value: "courseware", label: "课件" },
  { value: "paper", label: "论文" },
  { value: "case", label: "案例" },
] as const;
