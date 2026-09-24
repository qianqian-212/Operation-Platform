import type { StatusTagColor } from "@/components/StatusTag.vue";

/** 学校成果审核状态 */
export type SchoolAchievementAuditStatus =
  | "pending"
  | "district-reviewing"
  | "approved"
  | "rejected";

/** 研修成果类型 */
export type SchoolAchievementAuditType =
  | "teaching-result"
  | "training"
  | "research-award"
  | "paper"
  | "school-based";

export interface SchoolAchievementAuditAttachment {
  id: string;
  name: string;
  sizeLabel: string;
}

export interface SchoolAchievementAuditRecord {
  id: string;
  title: string;
  occurredAt: string;
  actorLabel: string;
  comment?: string;
  tone: "neutral" | "success" | "danger";
}

export interface SchoolAchievementAuditStats {
  pendingCount: number;
  districtReviewingCount: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
}

export interface SchoolAchievementAuditRow {
  id: string;
  title: string;
  teacherName: string;
  subject: string;
  type: SchoolAchievementAuditType;
  levelLabel: string;
  declaredScore: number;
  submittedAt: string;
  status: SchoolAchievementAuditStatus;
}

export interface SchoolAchievementAuditDetail extends SchoolAchievementAuditRow {
  schoolName: string;
  abstract: string;
  attachments: SchoolAchievementAuditAttachment[];
  auditRecords: SchoolAchievementAuditRecord[];
}

export interface SchoolAchievementAuditListQuery {
  statusTab: "pending" | "district-reviewing" | "approved" | "rejected" | "all";
  semester: string;
  type: SchoolAchievementAuditType | "";
  keyword: string;
  page: number;
  pageSize: number;
}

export interface SchoolAchievementAuditListResult {
  stats: SchoolAchievementAuditStats;
  schoolName: string;
  rows: SchoolAchievementAuditRow[];
  total: number;
  tabCounts: Record<"pending" | "district-reviewing" | "approved" | "rejected" | "all", number>;
}

export const SCHOOL_ACHIEVEMENT_AUDIT_STATUS_MAP: Record<
  SchoolAchievementAuditStatus,
  { label: string; tagColor: StatusTagColor }
> = {
  pending: { label: "待初审", tagColor: "orange" },
  "district-reviewing": { label: "区级审核中", tagColor: "blue" },
  approved: { label: "已通过", tagColor: "green" },
  rejected: { label: "已驳回", tagColor: "red" },
};

export const SCHOOL_ACHIEVEMENT_AUDIT_TYPE_MAP: Record<
  SchoolAchievementAuditType,
  { label: string }
> = {
  "teaching-result": { label: "教学成果" },
  training: { label: "培训进修" },
  "research-award": { label: "科研获奖" },
  paper: { label: "论文发表" },
  "school-based": { label: "校本研修" },
};

export const SCHOOL_ACHIEVEMENT_AUDIT_TYPE_OPTIONS = Object.entries(
  SCHOOL_ACHIEVEMENT_AUDIT_TYPE_MAP,
).map(([value, meta]) => ({
  value: value as SchoolAchievementAuditType,
  label: meta.label,
}));

export const SCHOOL_ACHIEVEMENT_AUDIT_SEMESTER_OPTIONS = [
  { value: "", label: "全部学期" },
  { value: "2026-1", label: "2026年第一学期" },
  { value: "2025-2", label: "2025年第二学期" },
] as const;
