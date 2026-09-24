import type { TrainingAchievementType } from "@/features/training-achievement/types";
import {
  TRAINING_ACHIEVEMENT_STAGE_OPTIONS,
  TRAINING_ACHIEVEMENT_SUBJECT_OPTIONS,
  TRAINING_ACHIEVEMENT_TYPE_MAP,
} from "@/features/training-achievement/types";

/** 卡片封面主题 */
export type ExcellentAchievementCoverTheme =
  | "violet"
  | "rose"
  | "cyan"
  | "green"
  | "coral"
  | "lilac";

/** 列表排序 */
export type ExcellentAchievementSortKey = "latest" | "likes";

export interface ExcellentAchievementAttachment {
  id: string;
  name: string;
  sizeLabel: string;
}

export interface ExcellentAchievementCard {
  id: string;
  title: string;
  teacherName: string;
  schoolName: string;
  type: TrainingAchievementType;
  stage: string;
  subject: string;
  featured: boolean;
  likeCount: number;
  publishedAt: string;
  coverTheme: ExcellentAchievementCoverTheme;
}

export interface ExcellentAchievementDetail extends ExcellentAchievementCard {
  honorLabel: string;
  abstract: string;
  viewCount: number;
  liked: boolean;
  attachments: ExcellentAchievementAttachment[];
}

export interface ExcellentAchievementListQuery {
  type: TrainingAchievementType | "";
  stage: string;
  subject: string;
  sortKey: ExcellentAchievementSortKey;
  page: number;
  pageSize: number;
}

export interface ExcellentAchievementListResult {
  rows: ExcellentAchievementCard[];
  total: number;
}

export const EXCELLENT_ACHIEVEMENT_TYPE_OPTIONS = [
  { value: "" as const, label: "全部类型" },
  ...Object.entries(TRAINING_ACHIEVEMENT_TYPE_MAP).map(([value, meta]) => ({
    value: value as TrainingAchievementType,
    label: meta.label,
  })),
];

export const EXCELLENT_ACHIEVEMENT_STAGE_OPTIONS = [
  { value: "", label: "全部学段" },
  ...TRAINING_ACHIEVEMENT_STAGE_OPTIONS.map((item) => ({ value: item, label: item })),
];

export const EXCELLENT_ACHIEVEMENT_SUBJECT_OPTIONS = [
  { value: "", label: "全部学科" },
  ...TRAINING_ACHIEVEMENT_SUBJECT_OPTIONS.map((item) => ({ value: item, label: item })),
];

export const EXCELLENT_ACHIEVEMENT_SORT_OPTIONS = [
  { value: "latest" as const, label: "最新发布" },
  { value: "likes" as const, label: "最多点赞" },
];

export const EXCELLENT_ACHIEVEMENT_COVER_ICON: Record<
  ExcellentAchievementCoverTheme,
  "trophy" | "document" | "school" | "medal" | "reading" | "opportunity"
> = {
  violet: "trophy",
  rose: "document",
  cyan: "school",
  green: "medal",
  coral: "reading",
  lilac: "opportunity",
};
