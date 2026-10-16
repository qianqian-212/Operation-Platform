import type { StatusTagColor } from "@/components/StatusTag.vue";

/** 分层研修课程审核状态 */
export type LayeredTrainingCourseStatus = "pending" | "approved" | "rejected";

/** 分层研修课程形态 */
export type LayeredTrainingCourseKind = "video" | "document";

export interface LayeredTrainingCourseLesson {
  id: string;
  indexLabel: string;
  title: string;
  durationLabel: string;
  uploaded: boolean;
}

export interface LayeredTrainingCourseRow {
  id: string;
  title: string;
  kind: LayeredTrainingCourseKind;
  lessonCountLabel: string;
  subject: string;
  schoolName: string;
  uploaderName: string;
  uploadedAt: string;
  status: LayeredTrainingCourseStatus;
}

export interface LayeredTrainingCourseDetail extends LayeredTrainingCourseRow {
  stageLabel: string;
  groups: string[];
  summary: string;
  lessons: LayeredTrainingCourseLesson[];
  reviewComment: string;
}

export interface LayeredTrainingCourseListQuery {
  statusTab: LayeredTrainingCourseStatus;
  schoolName: string;
  kind: LayeredTrainingCourseKind | "";
  page: number;
  pageSize: number;
}

export interface LayeredTrainingCourseListResult {
  rows: LayeredTrainingCourseRow[];
  total: number;
  tabCounts: Record<LayeredTrainingCourseStatus, number>;
  schools: string[];
}

export const LAYERED_TRAINING_COURSE_STATUS_MAP: Record<
  LayeredTrainingCourseStatus,
  { label: string; tagColor: StatusTagColor }
> = {
  pending: { label: "待审核", tagColor: "orange" },
  approved: { label: "已通过", tagColor: "green" },
  rejected: { label: "已驳回", tagColor: "red" },
};

export const LAYERED_TRAINING_COURSE_KIND_MAP: Record<
  LayeredTrainingCourseKind,
  { label: string }
> = {
  video: { label: "视频课程" },
  document: { label: "文档资料" },
};

export const LAYERED_TRAINING_COURSE_KIND_OPTIONS: Array<{
  value: LayeredTrainingCourseKind;
  label: string;
}> = [
  { value: "video", label: LAYERED_TRAINING_COURSE_KIND_MAP.video.label },
  { value: "document", label: LAYERED_TRAINING_COURSE_KIND_MAP.document.label },
];

export const LAYERED_TRAINING_COURSE_STATUS_TABS: LayeredTrainingCourseStatus[] = [
  "pending",
  "approved",
  "rejected",
];
