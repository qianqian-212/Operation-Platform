import type { StatusTagColor } from "@/components/StatusTag.vue";

/** 课程管理中的课程形态 */
export type ManagedCourseKind = "video" | "document" | "courseware";

/** 课程审核进度 */
export type ManagedCourseStatus = "draft" | "pending" | "approved" | "rejected";

/** 课程上架状态 */
export type ManagedCourseShelf = "unpublished" | "published" | "offline";

/** 适用学段 */
export type ManagedCourseStage = "primary" | "junior" | "all";

/** 适用分组来源 */
export type ManagedCourseGroupType = "system" | "custom";

/** 列表行可执行的操作 */
export type ManagedCourseAction =
  | "view"
  | "edit"
  | "submit"
  | "publish"
  | "unpublish"
  | "republish"
  | "delete";

/** 上下架操作 */
export type ManagedCourseShelfAction = "publish" | "unpublish" | "republish";

export interface ManagedCourseLesson {
  id: string;
  title: string;
  fileName: string;
  durationMinutes: number | null;
}

export interface ManagedCourse {
  id: string;
  title: string;
  kind: ManagedCourseKind;
  subject: string;
  stage: ManagedCourseStage;
  groupType: ManagedCourseGroupType | "";
  groupName: string;
  credit: number;
  summary: string;
  lessons: ManagedCourseLesson[];
  reviewStatus: ManagedCourseStatus;
  shelfStatus: ManagedCourseShelf;
  updatedAt: string;
  reviewComment: string;
}

export interface ManagedCourseRow {
  id: string;
  title: string;
  kind: ManagedCourseKind;
  lessonCountLabel: string;
  subject: string;
  stage: ManagedCourseStage;
  updatedAt: string;
  reviewStatus: ManagedCourseStatus;
  shelfStatus: ManagedCourseShelf;
  actions: ManagedCourseAction[];
}

export interface ManagedCourseForm {
  title: string;
  kind: ManagedCourseKind | "";
  subject: string;
  stage: ManagedCourseStage | "";
  groupType: ManagedCourseGroupType | "";
  groupName: string;
  creditText: string;
  summary: string;
  lessons: ManagedCourseLesson[];
}

export interface ManagedCourseListQuery {
  kind: ManagedCourseKind | "";
  reviewStatus: ManagedCourseStatus | "";
  page: number;
  pageSize: number;
}

export interface ManagedCourseListResult {
  rows: ManagedCourseRow[];
  total: number;
}

export interface ManagedCourseResource {
  id: string;
  name: string;
  kind: ManagedCourseKind;
  durationMinutes: number | null;
}

export const MANAGED_COURSE_KIND_MAP: Record<ManagedCourseKind, { label: string }> = {
  video: { label: "视频课程" },
  document: { label: "文档资料" },
  courseware: { label: "课件" },
};

export const MANAGED_COURSE_KIND_OPTIONS: Array<{ value: ManagedCourseKind; label: string }> = [
  { value: "video", label: MANAGED_COURSE_KIND_MAP.video.label },
  { value: "document", label: MANAGED_COURSE_KIND_MAP.document.label },
  { value: "courseware", label: MANAGED_COURSE_KIND_MAP.courseware.label },
];

export const MANAGED_COURSE_STATUS_MAP: Record<
  ManagedCourseStatus,
  { label: string; tagColor: StatusTagColor }
> = {
  draft: { label: "草稿", tagColor: "gray" },
  pending: { label: "待审核", tagColor: "orange" },
  approved: { label: "已通过", tagColor: "green" },
  rejected: { label: "已驳回", tagColor: "red" },
};

export const MANAGED_COURSE_STATUS_OPTIONS: Array<{ value: ManagedCourseStatus; label: string }> = [
  { value: "draft", label: MANAGED_COURSE_STATUS_MAP.draft.label },
  { value: "pending", label: MANAGED_COURSE_STATUS_MAP.pending.label },
  { value: "approved", label: MANAGED_COURSE_STATUS_MAP.approved.label },
  { value: "rejected", label: MANAGED_COURSE_STATUS_MAP.rejected.label },
];

export const MANAGED_COURSE_SHELF_MAP: Record<
  ManagedCourseShelf,
  { label: string; tagColor: StatusTagColor }
> = {
  unpublished: { label: "未上架", tagColor: "gray" },
  published: { label: "已上架", tagColor: "green" },
  offline: { label: "已下架", tagColor: "orange" },
};

export const MANAGED_COURSE_STAGE_MAP: Record<ManagedCourseStage, { label: string }> = {
  primary: { label: "小学" },
  junior: { label: "初中" },
  all: { label: "全学段" },
};

export const MANAGED_COURSE_STAGE_OPTIONS: Array<{ value: ManagedCourseStage; label: string }> = [
  { value: "primary", label: MANAGED_COURSE_STAGE_MAP.primary.label },
  { value: "junior", label: MANAGED_COURSE_STAGE_MAP.junior.label },
  { value: "all", label: MANAGED_COURSE_STAGE_MAP.all.label },
];

export const MANAGED_COURSE_SUBJECT_OPTIONS = ["语文", "数学", "英语", "科学", "综合", "物理"];

export const MANAGED_COURSE_GROUP_TYPE_OPTIONS: Array<{
  value: ManagedCourseGroupType;
  label: string;
}> = [
  { value: "system", label: "系统分组" },
  { value: "custom", label: "自定义分组" },
];

export const MANAGED_COURSE_SYSTEM_GROUPS = ["新学期", "成长期", "成熟期"];

export function managedCourseGroups(
  groupType: ManagedCourseGroupType | "",
  customNames: readonly string[] = [],
) {
  if (groupType === "system") return [...MANAGED_COURSE_SYSTEM_GROUPS];
  if (groupType === "custom") return [...customNames];
  return [];
}

export const MANAGED_COURSE_ACTION_LABEL: Record<ManagedCourseAction, string> = {
  view: "查看",
  edit: "编辑",
  submit: "提交审核",
  publish: "上架",
  unpublish: "下架",
  republish: "重新上架",
  delete: "删除",
};

export const MANAGED_COURSE_RESOURCES: ManagedCourseResource[] = [
  { id: "res-v1", name: "大单元教学理念解读.mp4", kind: "video", durationMinutes: 32 },
  { id: "res-v2", name: "课堂实施示范.mp4", kind: "video", durationMinutes: 28 },
  { id: "res-v3", name: "课时总结与答疑.mp4", kind: "video", durationMinutes: 25 },
  { id: "res-d1", name: "思维训练学案.docx", kind: "document", durationMinutes: null },
  { id: "res-c1", name: "情景教学课件.pptx", kind: "courseware", durationMinutes: null },
];

export const MANAGED_COURSE_UPDATED_AT = "2026-10-15";

export function managedCourseLessonCountLabel(kind: ManagedCourseKind, count: number) {
  return kind === "video" ? `${count}讲` : `${count}个`;
}

export function managedCourseActions(
  course: Pick<ManagedCourse, "reviewStatus" | "shelfStatus">,
  shelfEnabled = true,
) {
  if (course.reviewStatus === "pending") return ["view", "delete"] satisfies ManagedCourseAction[];
  if (course.reviewStatus === "draft") return ["submit", "edit", "delete"] satisfies ManagedCourseAction[];
  if (!shelfEnabled || course.reviewStatus !== "approved") {
    return ["edit", "delete"] satisfies ManagedCourseAction[];
  }
  if (course.shelfStatus === "published") {
    return ["unpublish", "edit", "delete"] satisfies ManagedCourseAction[];
  }
  if (course.shelfStatus === "offline") {
    return ["republish", "edit", "delete"] satisfies ManagedCourseAction[];
  }
  return ["edit", "publish", "delete"] satisfies ManagedCourseAction[];
}

export function managedCourseDurationText(minutes: number | null) {
  return minutes === null ? "待检测" : `${minutes}分钟 · 自动检测`;
}

export function emptyManagedCourseForm(): ManagedCourseForm {
  return {
    title: "",
    kind: "video",
    subject: "语文",
    stage: "primary",
    groupType: "",
    groupName: "",
    creditText: "",
    summary: "",
    lessons: [emptyManagedCourseLesson()],
  };
}

let lessonSequence = 0;

export function emptyManagedCourseLesson(): ManagedCourseLesson {
  lessonSequence += 1;
  return {
    id: `draft-lesson-${lessonSequence}`,
    title: "",
    fileName: "",
    durationMinutes: null,
  };
}

export function resetManagedCourseLessonSequence() {
  lessonSequence = 0;
}

export function managedCourseFormError(form: ManagedCourseForm, intent: "draft" | "submit") {
  if (!form.title.trim()) return "请输入课程名称";
  if (intent === "draft") return "";
  if (!form.kind) return "请选择课程类型";
  if (!form.subject) return "请选择所属学科";
  if (!form.stage) return "请选择适用学段";
  if (form.groupType && !form.groupName) return "请选择具体分组";
  if (!validCredit(form.creditText)) return "请输入课程学分";
  const summary = form.summary.trim();
  if (!summary) return "请输入课程简介";
  if (summary.length > 200) return "课程简介不能超过 200 字";
  if (!form.lessons.length) return "请至少添加一个课时";
  if (form.lessons.some((lesson) => !lesson.title.trim())) return "请填写课时标题";
  if (form.lessons.some((lesson) => !lesson.fileName)) return "请上传课时文件";
  return "";
}

function validCredit(value: string) {
  const credit = Number(value);
  return value.trim() !== "" && Number.isInteger(credit) && credit > 0;
}

export function managedCourseToForm(course: ManagedCourse): ManagedCourseForm {
  return {
    title: course.title,
    kind: course.kind,
    subject: course.subject,
    stage: course.stage,
    groupType: course.groupType,
    groupName: course.groupName,
    creditText: String(course.credit),
    summary: course.summary,
    lessons: course.lessons.map((lesson) => ({ ...lesson })),
  };
}

export function defaultManagedLessonFile(kind: ManagedCourseKind | "", index: number) {
  const order = index + 1;
  if (kind === "document") return { fileName: `第${order}讲资料.docx`, durationMinutes: null };
  if (kind === "courseware") return { fileName: `第${order}讲课件.pptx`, durationMinutes: null };
  return { fileName: `第${order}讲视频.mp4`, durationMinutes: 32 };
}
