import type { StatusTagColor } from "@/components/StatusTag.vue";

export type CollectiveLessonPrepStatus = "ongoing" | "completed" | "pending";

export interface CurriculumNode {
  id: string;
  label: string;
  children?: CurriculumNode[];
}

export interface CollectiveLessonPrepItem {
  id: string;
  title: string;
  allianceName: string;
  participantCount: number;
  leadTeacherName: string;
  leadSchoolName: string;
  chapterLabel: string;
  activityId: string;
  activityName: string;
  progress: number;
  date: string;
  outputCount: number;
  status: CollectiveLessonPrepStatus;
  subject: string;
  curriculumPath: string[];
}

export interface CollectiveLessonPrepFilter {
  status: CollectiveLessonPrepStatus | "";
  subject: string;
  keyword: string;
  curriculumNodeId: string;
}

export interface CollectiveLessonPrepStats {
  total: number;
  ongoing: number;
  completed: number;
  pending: number;
}

export interface CollectiveLessonPrepListResult {
  stats: CollectiveLessonPrepStats;
  list: CollectiveLessonPrepItem[];
}

export const COLLECTIVE_LESSON_PREP_STATUS_MAP: Record<
  CollectiveLessonPrepStatus,
  { label: string; tagColor: StatusTagColor }
> = {
  ongoing: { label: "进行中", tagColor: "orange" },
  completed: { label: "已完成", tagColor: "green" },
  pending: { label: "待开始", tagColor: "gray" },
};

export const COLLECTIVE_LESSON_PREP_SUBJECT_OPTIONS = [
  "语文",
  "数学",
  "英语",
  "科学",
  "物理",
] as const;

export const DEFAULT_CURRICULUM_NODE_ID = "unit-1";
export const DEFAULT_EXPANDED_CURRICULUM_KEYS = ["unit-1", "lesson-1-1"] as const;
