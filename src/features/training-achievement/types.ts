import type { StatusTagColor } from "@/components/StatusTag.vue";

/** 研修成果审核状态 */
export type TrainingAchievementStatus =
  | "draft"
  | "school-reviewing"
  | "district-reviewing"
  | "approved"
  | "district-rejected";

/** 研修类型 */
export type TrainingAchievementType =
  | "teaching-result"
  | "training"
  | "research-award"
  | "paper"
  | "school-based";

/** 附件材料类别 */
export type TrainingAchievementAttachmentKind = "certificate" | "report";

export interface TrainingAchievementAttachment {
  id: string;
  kind: TrainingAchievementAttachmentKind;
  name: string;
  sizeLabel: string;
  mimeHint: "pdf" | "image" | "word";
}

export interface TrainingAchievementAuditRecord {
  id: string;
  title: string;
  occurredAt: string;
  actorLabel: string;
  comment?: string;
  tone: "success" | "primary" | "neutral" | "danger";
}

export interface TrainingAchievementRow {
  id: string;
  code: string;
  title: string;
  bureauName: string;
  semester: string;
  type: TrainingAchievementType;
  levelLabel: string;
  submittedAt: string;
  status: TrainingAchievementStatus;
  earnedCredits: number | null;
}

export interface TrainingAchievementDetail extends TrainingAchievementRow {
  teacherName: string;
  schoolName: string;
  subject: string;
  stage: string;
  declaredScore: number;
  abstract: string;
  attachments: TrainingAchievementAttachment[];
  auditRecords: TrainingAchievementAuditRecord[];
}

export interface TrainingAchievementFilter {
  status: TrainingAchievementStatus | "";
  type: TrainingAchievementType | "";
  semester: string;
  title: string;
}

export interface TrainingAchievementFormInput {
  title: string;
  type: TrainingAchievementType | "";
  levelId: string;
  bureauId: string;
  semester: string;
  subject: string;
  stage: string;
  abstract: string;
  certificateFiles: TrainingAchievementAttachment[];
  reportFiles: TrainingAchievementAttachment[];
  asDraft: boolean;
}

export interface TrainingAchievementLevelOption {
  id: string;
  label: string;
  score: number;
}

export interface PageResult<T> {
  list: T[];
  total: number;
}

export const TRAINING_ACHIEVEMENT_STATUS_MAP: Record<
  TrainingAchievementStatus,
  { label: string; tagColor: StatusTagColor }
> = {
  draft: { label: "草稿", tagColor: "gray" },
  "school-reviewing": { label: "学校审核中", tagColor: "blue" },
  "district-reviewing": { label: "区级审核中", tagColor: "blue" },
  approved: { label: "已通过", tagColor: "green" },
  "district-rejected": { label: "区级已驳回", tagColor: "red" },
};

export const TRAINING_ACHIEVEMENT_TYPE_MAP: Record<
  TrainingAchievementType,
  { label: string }
> = {
  "teaching-result": { label: "教学成果" },
  training: { label: "培训进修" },
  "research-award": { label: "科研获奖" },
  paper: { label: "论文发表" },
  "school-based": { label: "校本研修" },
};

export const TRAINING_ACHIEVEMENT_LEVELS: Record<
  TrainingAchievementType,
  readonly TrainingAchievementLevelOption[]
> = {
  "teaching-result": [
    { id: "city-first", label: "市级 / 一等", score: 10 },
    { id: "city-second", label: "市级 / 二等", score: 8 },
    { id: "city-third", label: "市级 / 三等", score: 6 },
    { id: "province", label: "省级", score: 12 },
  ],
  training: [
    { id: "province-backbone", label: "省级", score: 10 },
    { id: "city-backbone", label: "市级", score: 6 },
    { id: "district", label: "区级", score: 4 },
  ],
  "research-award": [
    { id: "city-first", label: "市级 / 一等", score: 10 },
    { id: "city-second", label: "市级 / 二等", score: 8 },
    { id: "city-third", label: "市级 / 三等", score: 6 },
  ],
  paper: [
    { id: "province-journal", label: "省级期刊", score: 8 },
    { id: "city-journal", label: "市级期刊", score: 6 },
  ],
  "school-based": [{ id: "school", label: "校级", score: 4 }],
};

export const TRAINING_ACHIEVEMENT_SEMESTER_OPTIONS = [
  { value: "2026-fall", label: "2026秋季" },
  { value: "2026-spring", label: "2026春季" },
  { value: "2025-fall", label: "2025秋季" },
] as const;

export function semesterDisplayLabel(semester: string) {
  return (
    TRAINING_ACHIEVEMENT_SEMESTER_OPTIONS.find((item) => item.value === semester)?.label ??
    semester
  );
}

export const TRAINING_ACHIEVEMENT_BUREAU_OPTIONS = [
  { id: "bureau-xx", label: "XX区教育局" },
] as const;

export const TRAINING_ACHIEVEMENT_SUBJECT_OPTIONS = [
  "语文",
  "数学",
  "英语",
  "科学",
  "信息技术",
] as const;

export const TRAINING_ACHIEVEMENT_STAGE_OPTIONS = [
  "小学",
  "初中",
  "高中",
] as const;

export function isRejectedStatus(status: TrainingAchievementStatus) {
  return status === "district-rejected";
}

export function formatEarnedCredits(credits: number | null) {
  if (credits === null) return "—";
  return `+${credits}分`;
}

export function resolveLevelLabel(
  type: TrainingAchievementType | "",
  levelId: string,
) {
  if (!type || !levelId) return "";
  return TRAINING_ACHIEVEMENT_LEVELS[type].find((item) => item.id === levelId)?.label ?? "";
}

export function resolveLevelScore(
  type: TrainingAchievementType | "",
  levelId: string,
) {
  if (!type || !levelId) return 0;
  return TRAINING_ACHIEVEMENT_LEVELS[type].find((item) => item.id === levelId)?.score ?? 0;
}
