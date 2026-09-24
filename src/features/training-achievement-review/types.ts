import type { StatusTagColor } from "@/components/StatusTag.vue";

/** 成果终审状态 */
export type AchievementReviewStatus = "pending" | "approved" | "rejected";

/** 研修成果类型 */
export type AchievementReviewType =
  | "teaching-result"
  | "training"
  | "research-award"
  | "paper"
  | "school-based";

export interface AchievementReviewAttachment {
  id: string;
  name: string;
  sizeLabel: string;
}

export interface AchievementReviewAuditRecord {
  id: string;
  action: string;
  at: string;
  actorName: string;
  orgName: string;
  result?: "approved" | "rejected";
  comment?: string;
}

export interface AchievementReviewStats {
  pendingCount: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  passRatePercent: number;
  featuredCount: number;
  featuredThisMonth: number;
  likeCount: number;
  viewCount: number;
}

export interface AchievementReviewRow {
  id: string;
  title: string;
  schoolName: string;
  teacherName: string;
  type: AchievementReviewType;
  levelLabel: string;
  scoreLabel: string;
  submittedAt: string;
  status: AchievementReviewStatus;
  featured: boolean;
}

export interface AchievementReviewDetail extends AchievementReviewRow {
  code: string;
  subject: string;
  attachments: AchievementReviewAttachment[];
  auditRecords: AchievementReviewAuditRecord[];
  recommendReason: string;
}

export interface AchievementReviewListQuery {
  statusTab: "pending" | "approved" | "rejected" | "all";
  schoolName: string;
  type: AchievementReviewType | "";
  keyword: string;
  page: number;
  pageSize: number;
}

export interface AchievementReviewListResult {
  stats: AchievementReviewStats;
  rows: AchievementReviewRow[];
  total: number;
  tabCounts: Record<"pending" | "approved" | "rejected" | "all", number>;
}

export const ACHIEVEMENT_REVIEW_STATUS_MAP: Record<
  AchievementReviewStatus,
  { label: string; tagColor: StatusTagColor }
> = {
  pending: { label: "待终审", tagColor: "orange" },
  approved: { label: "已通过", tagColor: "green" },
  rejected: { label: "已驳回", tagColor: "red" },
};

export const ACHIEVEMENT_REVIEW_TYPE_MAP: Record<
  AchievementReviewType,
  { label: string }
> = {
  "teaching-result": { label: "教学成果" },
  training: { label: "培训进修" },
  "research-award": { label: "科研获奖" },
  paper: { label: "论文发表" },
  "school-based": { label: "校本研修" },
};

export const ACHIEVEMENT_REVIEW_TYPE_OPTIONS = Object.entries(ACHIEVEMENT_REVIEW_TYPE_MAP).map(
  ([value, meta]) => ({ value: value as AchievementReviewType, label: meta.label }),
);
