import type { StatusTagColor } from "@/components/StatusTag.vue";

/** 学校列表排序 */
export type LayeredTrainingSchoolSort = "reach" | "participation" | "completion";

/** 教师研修进度状态 */
export type LayeredTrainingTeacherStatus =
  | "in-progress"
  | "completed"
  | "slow"
  | "near-complete";

/** 进度条颜色 */
export type LayeredTrainingBarTone = "primary" | "success" | "warning" | "danger";

/** 指标说明颜色 */
export type LayeredTrainingCaptionTone = "default" | "success" | "danger";

export interface LayeredTrainingOverviewSummary {
  /** 全区教师总数 */
  teacherCount: number;
  /** 覆盖学校数 */
  schoolCount: number;
  /** 研修参与率，百分比数值 */
  participationRate: number;
  /** 已参与教师数 */
  participantCount: number;
  /** 参与率说明里的分母 */
  participationBaseCount: number;
  /** 平均课程完成率，百分比数值 */
  averageCompletionRate: number;
  /** 完成率相对上周的说明 */
  completionChangeLabel: string;
  /** 完成率变化的展示颜色 */
  completionChangeTone: LayeredTrainingCaptionTone;
  /** 学分达标率，百分比数值 */
  creditReachRate: number;
  /** 未达标人数 */
  unmetCreditCount: number;
}

export interface LayeredTrainingOverviewSchool {
  /** 学校标识 */
  id: string;
  /** 学校名称 */
  name: string;
  /** 教师总数 */
  teacherCount: number;
  /** 已参与人数 */
  participantCount: number;
  /** 参与率，百分比数值 */
  participationRate: number;
  /** 课程完成率，百分比数值 */
  completionRate: number;
  /** 学分达标率，百分比数值 */
  reachRate: number;
  /** 参与率进度条颜色 */
  participationTone: LayeredTrainingBarTone;
  /** 完成率进度条颜色 */
  completionTone: LayeredTrainingBarTone;
  /** 达标率进度条颜色 */
  reachTone: LayeredTrainingBarTone;
}

export interface LayeredTrainingOverviewTeacher {
  /** 教师记录标识 */
  id: string;
  /** 教师姓名 */
  name: string;
  /** 所在学校 */
  schoolName: string;
  /** 学科 */
  subject: string;
  /** 已修学时，如 24/36 */
  hoursLabel: string;
  /** 已获学分，如 8/12 */
  creditsLabel: string;
  /** 完成率，百分比数值 */
  completionRate: number;
  /** 完成率进度条颜色 */
  completionTone: LayeredTrainingBarTone;
  /** 进度状态 */
  status: LayeredTrainingTeacherStatus;
}

export interface LayeredTrainingOverviewQuery {
  /** 统计学期 */
  semester: string;
  /** 学校名称关键字 */
  schoolKeyword: string;
  /** 教师表学校筛选，空字符串表示全部 */
  teacherSchool: string;
  /** 教师表学科筛选，空字符串表示全部 */
  teacherSubject: string;
  /** 教师表页码，从 1 开始 */
  page: number;
  /** 教师表每页条数 */
  pageSize: number;
  /** 学校表排序 */
  schoolSort: LayeredTrainingSchoolSort;
}

export interface LayeredTrainingOverviewResult {
  summary: LayeredTrainingOverviewSummary;
  schools: LayeredTrainingOverviewSchool[];
  schoolOptions: string[];
  subjectOptions: string[];
  teachers: LayeredTrainingOverviewTeacher[];
  teacherTotal: number;
}

export interface LayeredTrainingOverviewStatCard {
  key: string;
  label: string;
  value: string;
  caption: string;
  captionTone: LayeredTrainingCaptionTone;
}

export const LAYERED_TRAINING_OVERVIEW_SEMESTER_OPTIONS = [
  { value: "2026-1", label: "2026年第一学期" },
  { value: "2025-2", label: "2025年第二学期" },
  { value: "2025-1", label: "2025年第一学期" },
] as const;

export const LAYERED_TRAINING_SCHOOL_SORT_OPTIONS: ReadonlyArray<{
  value: LayeredTrainingSchoolSort;
  label: string;
}> = [
  { value: "reach", label: "按达标率排序" },
  { value: "participation", label: "按参与率排序" },
  { value: "completion", label: "按完成率排序" },
];

export const LAYERED_TRAINING_TEACHER_STATUS_MAP: Record<
  LayeredTrainingTeacherStatus,
  { label: string; tagColor: StatusTagColor }
> = {
  "in-progress": { label: "进行中", tagColor: "orange" },
  completed: { label: "已完成", tagColor: "green" },
  slow: { label: "进度缓慢", tagColor: "red" },
  "near-complete": { label: "接近完成", tagColor: "green" },
};

/** 学校进度条：60% 以下为偏低。 */
export function schoolRateTone(percent: number): LayeredTrainingBarTone {
  if (percent < 60) return "warning";
  return "success";
}

/** 教师完成率进度条：80% 及以上为完成，50% 以下为缓慢。 */
export function teacherCompletionTone(percent: number): LayeredTrainingBarTone {
  if (percent < 50) return "danger";
  if (percent < 80) return "warning";
  return "success";
}

/** 顶部四张指标卡。空数据时不渲染占位数字。 */
export function buildOverviewStatCards(
  summary: LayeredTrainingOverviewSummary | null,
): LayeredTrainingOverviewStatCard[] {
  if (!summary) return [];
  return [
    {
      key: "teachers",
      label: "教师总数",
      value: String(summary.teacherCount),
      caption: `覆盖${summary.schoolCount}所学校`,
      captionTone: "default",
    },
    {
      key: "participation",
      label: "研修参与率",
      value: `${summary.participationRate}%`,
      caption: `${summary.participantCount}/${summary.participationBaseCount}人参与`,
      captionTone: "default",
    },
    {
      key: "completion",
      label: "平均课程完成率",
      value: `${summary.averageCompletionRate}%`,
      caption: summary.completionChangeLabel,
      captionTone: summary.completionChangeTone,
    },
    {
      key: "credit",
      label: "学分达标率",
      value: `${summary.creditReachRate}%`,
      caption: `${summary.unmetCreditCount}人未达标`,
      captionTone: "default",
    },
  ];
}
