import type { StatusTagColor } from "@/components/StatusTag.vue";

/** 分层研修进度通知类型 */
export type LayeredTrainingNoticeType = "first" | "periodic";

/** 通知发出后的复查结果 */
export type LayeredTrainingNoticeResult = "unmet" | "met" | "reviewing";

export interface LayeredTrainingNoticeRow {
  id: string;
  notifiedAt: string;
  teacherName: string;
  schoolName: string;
  subject: string;
  noticeType: LayeredTrainingNoticeType;
  staleDays: number;
  result: LayeredTrainingNoticeResult;
}

export interface LayeredTrainingNoticeQuery {
  schoolName: string;
  noticeType: LayeredTrainingNoticeType | "";
  page: number;
  pageSize: number;
}

export interface LayeredTrainingNoticeListResult {
  rows: LayeredTrainingNoticeRow[];
  total: number;
  schools: string[];
}

export const LAYERED_TRAINING_NOTICE_TYPE_MAP: Record<
  LayeredTrainingNoticeType,
  { label: string; tagColor: StatusTagColor }
> = {
  first: { label: "首次通知", tagColor: "blue" },
  periodic: { label: "周期复查通知", tagColor: "orange" },
};

export const LAYERED_TRAINING_NOTICE_TYPE_OPTIONS: Array<{
  value: LayeredTrainingNoticeType;
  label: string;
}> = [
  { value: "first", label: LAYERED_TRAINING_NOTICE_TYPE_MAP.first.label },
  { value: "periodic", label: LAYERED_TRAINING_NOTICE_TYPE_MAP.periodic.label },
];

export const LAYERED_TRAINING_NOTICE_RESULT_MAP: Record<
  LayeredTrainingNoticeResult,
  { label: string; tone: "danger" | "success" | "warning" }
> = {
  unmet: { label: "仍未达标", tone: "danger" },
  met: { label: "已达标", tone: "success" },
  reviewing: { label: "进入复查", tone: "warning" },
};
