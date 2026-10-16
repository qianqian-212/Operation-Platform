import {
  MANAGED_COURSE_UPDATED_AT,
  managedCourseActions,
  managedCourseFormError,
  managedCourseLessonCountLabel,
  managedCourseToForm,
  resetManagedCourseLessonSequence,
  type ManagedCourse,
  type ManagedCourseForm,
  type ManagedCourseKind,
  type ManagedCourseListQuery,
  type ManagedCourseRow,
  type ManagedCourseShelf,
  type ManagedCourseShelfAction,
  type ManagedCourseStage,
  type ManagedCourseStatus,
} from "@/features/layered-training-course-manage/types";

function lesson(id: string, title: string, fileName: string, durationMinutes: number | null) {
  return { id, title, fileName, durationMinutes };
}

function videoLessons(prefix: string, titles: string[]) {
  return titles.map((title, index) =>
    lesson(`${prefix}-l${index + 1}`, title, `${title}.mp4`, 24 + index * 2),
  );
}

const FEATURED: ManagedCourse[] = [
  {
    id: "ltm-001",
    title: "新课标大单元教学设计",
    kind: "video",
    subject: "语文",
    stage: "primary",
    groupType: "system",
    groupName: "新学期",
    credit: 2,
    summary: "围绕新课标大单元教学的目标、任务与评价，帮助教师完成单元整体设计。",
    lessons: videoLessons("ltm-001", [
      "大单元教学理念解读",
      "单元目标与任务设计",
      "学习活动组织",
      "课堂评价量规",
      "作业与展示",
      "单元复盘",
    ]),
    reviewStatus: "approved",
    shelfStatus: "published",
    updatedAt: "2026-09-20",
    reviewComment: "",
  },
  {
    id: "ltm-002",
    title: "整本书阅读指导策略",
    kind: "video",
    subject: "语文",
    stage: "primary",
    groupType: "system",
    groupName: "新学期",
    credit: 2,
    summary: "围绕整本书阅读的选书、计划和课堂讨论，适合新学期教师学习。",
    lessons: videoLessons("ltm-002", [
      "选书标准与阅读计划",
      "课堂讨论设计",
      "整本书阅读评价",
      "阅读成果展示",
      "家校共读策略",
      "课程总结与答疑",
    ]),
    reviewStatus: "pending",
    shelfStatus: "unpublished",
    updatedAt: "2026-09-22",
    reviewComment: "",
  },
  {
    id: "ltm-003",
    title: "小学数学思维训练",
    kind: "document",
    subject: "数学",
    stage: "primary",
    groupType: "system",
    groupName: "成长期",
    credit: 1,
    summary: "提供小学数学思维训练的学案与练习说明。",
    lessons: [lesson("ltm-003-l1", "思维训练学案", "思维训练学案.docx", null)],
    reviewStatus: "draft",
    shelfStatus: "unpublished",
    updatedAt: "2026-09-18",
    reviewComment: "",
  },
  {
    id: "ltm-004",
    title: "英语情景教学案例",
    kind: "courseware",
    subject: "英语",
    stage: "primary",
    groupType: "custom",
    groupName: "新教师培养组",
    credit: 1,
    summary: "用情景任务组织小学英语课堂的课件案例。",
    lessons: [lesson("ltm-004-l1", "情景教学课件", "情景教学课件.pptx", null)],
    reviewStatus: "rejected",
    shelfStatus: "unpublished",
    updatedAt: "2026-09-23",
    reviewComment: "课件课时说明不完整，请补充后再提交。",
  },
  {
    id: "ltm-005",
    title: "教师心理健康与职业发展",
    kind: "video",
    subject: "综合",
    stage: "all",
    groupType: "system",
    groupName: "成熟期",
    credit: 3,
    summary: "面向各学段教师的心理健康与职业发展规划课程。",
    lessons: videoLessons("ltm-005", [
      "职业压力识别",
      "情绪调节",
      "同伴支持",
      "专业成长规划",
      "工作边界",
      "复原力练习",
      "案例研讨",
      "课程总结",
    ]),
    reviewStatus: "approved",
    shelfStatus: "published",
    updatedAt: "2026-09-19",
    reviewComment: "",
  },
  {
    id: "ltm-006",
    title: "群文阅读的理论基础与课堂实施",
    kind: "video",
    subject: "语文",
    stage: "junior",
    groupType: "system",
    groupName: "成长期",
    credit: 2,
    summary: "说明群文阅读的议题选择、文本组元和课堂实施。",
    lessons: videoLessons("ltm-006", ["理论基础", "议题确定", "文本组元", "课堂实施", "评价反馈"]),
    reviewStatus: "draft",
    shelfStatus: "unpublished",
    updatedAt: "2026-09-21",
    reviewComment: "",
  },
  {
    id: "ltm-007",
    title: "整本书阅读课程化实践",
    kind: "video",
    subject: "语文",
    stage: "primary",
    groupType: "system",
    groupName: "新学期",
    credit: 2,
    summary: "把整本书阅读落实到学期课程安排中的实践案例。",
    lessons: videoLessons("ltm-007", ["课程化目标", "学期安排", "课堂推进", "过程评价", "成果展示", "复盘改进"]),
    reviewStatus: "approved",
    shelfStatus: "offline",
    updatedAt: "2026-09-10",
    reviewComment: "",
  },
];

const EXTRA_TITLES = [
  "学习任务群设计入门",
  "跨学科主题学习案例",
  "作业设计与讲评",
  "课堂提问改进",
  "项目化学习起步",
  "差异化教学实践",
  "家校沟通微课",
  "实验安全规范",
  "朗读教学策略",
  "数学文化微课",
  "信息科技融合课例",
  "班主任沟通课",
  "学习支架设计",
  "学期教研计划",
  "骨干教师示范课评析",
  "新教师课堂导入",
];

const EXTRA_SUBJECTS = ["语文", "数学", "英语", "科学", "综合"];
const EXTRA_KINDS: ManagedCourseKind[] = ["video", "document", "courseware"];
const EXTRA_STATUSES: ManagedCourseStatus[] = ["draft", "pending", "approved", "rejected"];
const EXTRA_STAGES: ManagedCourseStage[] = ["primary", "junior", "all"];

function extraShelf(status: ManagedCourseStatus, index: number): ManagedCourseShelf {
  if (status !== "approved") return "unpublished";
  return index % 2 === 0 ? "published" : "offline";
}

function buildExtra(title: string, index: number): ManagedCourse {
  const kind = EXTRA_KINDS[index % EXTRA_KINDS.length] ?? "video";
  const reviewStatus = EXTRA_STATUSES[index % EXTRA_STATUSES.length] ?? "draft";
  const id = `ltm-${String(index + 8).padStart(3, "0")}`;
  const fileName = kind === "video" ? `${title}.mp4` : kind === "document" ? `${title}.docx` : `${title}.pptx`;
  return {
    id,
    title,
    kind,
    subject: EXTRA_SUBJECTS[index % EXTRA_SUBJECTS.length] ?? "语文",
    stage: EXTRA_STAGES[index % EXTRA_STAGES.length] ?? "primary",
    groupType: "system",
    groupName: "新学期",
    credit: 1 + (index % 3),
    summary: `面向教师的分层研修课程，覆盖${title}的核心做法。`,
    lessons: [lesson(`${id}-l1`, title, fileName, kind === "video" ? 30 : null)],
    reviewStatus,
    shelfStatus: extraShelf(reviewStatus, index),
    updatedAt: `2026-09-${String(9 - (index % 9)).padStart(2, "0")}`,
    reviewComment: reviewStatus === "rejected" ? "材料不完整，请补充后再提交。" : "",
  };
}

function createStore() {
  return [...FEATURED, ...EXTRA_TITLES.map(buildExtra)].map(cloneCourse);
}

function cloneCourse(course: ManagedCourse): ManagedCourse {
  return { ...course, lessons: course.lessons.map((lessonItem) => ({ ...lessonItem })) };
}

interface CatalogState {
  courses: ManagedCourse[];
  sequence: number;
  shelf: boolean;
}

function createCatalogState(shelf: boolean): CatalogState {
  return { courses: createStore(), sequence: 23, shelf };
}

let bureauState = createCatalogState(true);
let schoolState = createCatalogState(false);

export function resetManagedCourseMockData() {
  bureauState = createCatalogState(true);
  resetManagedCourseLessonSequence();
}

export function resetSchoolManagedCourseMockData() {
  schoolState = createCatalogState(false);
  resetManagedCourseLessonSequence();
}

function toRow(course: ManagedCourse, shelf: boolean): ManagedCourseRow {
  return {
    id: course.id,
    title: course.title,
    kind: course.kind,
    lessonCountLabel: managedCourseLessonCountLabel(course.kind, course.lessons.length),
    subject: course.subject,
    stage: course.stage,
    updatedAt: course.updatedAt,
    reviewStatus: course.reviewStatus,
    shelfStatus: course.shelfStatus,
    actions: managedCourseActions(course, shelf),
  };
}

function matches(course: ManagedCourse, query: ManagedCourseListQuery) {
  if (query.kind && course.kind !== query.kind) return false;
  if (query.reviewStatus && course.reviewStatus !== query.reviewStatus) return false;
  return true;
}

function listIn(state: CatalogState, query: ManagedCourseListQuery) {
  const filtered = state.courses.filter((course) => matches(course, query));
  const start = Math.max(query.page - 1, 0) * query.pageSize;
  return {
    rows: filtered.slice(start, start + query.pageSize).map((course) => toRow(course, state.shelf)),
    total: filtered.length,
  };
}

function getIn(state: CatalogState, id: string) {
  const found = state.courses.find((course) => course.id === id);
  return found ? cloneCourse(found) : null;
}

function replaceIn(state: CatalogState, next: ManagedCourse) {
  const index = state.courses.findIndex((course) => course.id === next.id);
  if (index < 0) throw new Error("课程不存在");
  state.courses[index] = cloneCourse(next);
  return cloneCourse(next);
}

function submitIn(state: CatalogState, id: string) {
  const current = getIn(state, id);
  if (!current) throw new Error("课程不存在");
  if (current.reviewStatus !== "draft") throw new Error("仅草稿可提交审核");
  const error = managedCourseFormError(managedCourseToForm(current), "submit");
  if (error) throw new Error(error);
  return replaceIn(state, {
    ...current,
    reviewStatus: "pending",
    shelfStatus: "unpublished",
    updatedAt: MANAGED_COURSE_UPDATED_AT,
    reviewComment: "",
  });
}

function removeIn(state: CatalogState, id: string) {
  const index = state.courses.findIndex((course) => course.id === id);
  if (index < 0) throw new Error("课程不存在");
  state.courses.splice(index, 1);
}

function setShelfIn(state: CatalogState, id: string, action: ManagedCourseShelfAction) {
  if (!state.shelf) throw new Error("学校端不支持上下架");
  const current = getIn(state, id);
  if (!current) throw new Error("课程不存在");
  if (current.reviewStatus !== "approved") throw new Error("仅已通过课程可上下架");
  if (action === "unpublish" && current.shelfStatus !== "published") throw new Error("当前课程未上架");
  if (action === "republish" && current.shelfStatus !== "offline") throw new Error("当前课程未下架");
  if (action === "publish" && current.shelfStatus !== "unpublished") throw new Error("当前课程不可上架");
  const shelfStatus: ManagedCourseShelf = action === "unpublish" ? "offline" : "published";
  return replaceIn(state, { ...current, shelfStatus, updatedAt: MANAGED_COURSE_UPDATED_AT });
}

function courseFromForm(id: string, form: ManagedCourseForm, intent: "draft" | "submit", comment: string) {
  const error = managedCourseFormError(form, intent);
  if (error) throw new Error(error);
  if (!form.kind || !form.stage) throw new Error("请完善课程信息");
  return {
    id,
    title: form.title.trim(),
    kind: form.kind,
    subject: form.subject,
    stage: form.stage,
    groupType: form.groupType,
    groupName: form.groupName,
    credit: Number(form.creditText || 0),
    summary: form.summary.trim(),
    lessons: form.lessons.map((item) => ({ ...item, title: item.title.trim() })),
    reviewStatus: intent === "submit" ? "pending" : "draft",
    shelfStatus: "unpublished",
    updatedAt: MANAGED_COURSE_UPDATED_AT,
    reviewComment: intent === "submit" ? "" : comment,
  } satisfies ManagedCourse;
}

function saveIn(state: CatalogState, id: string, form: ManagedCourseForm, intent: "draft" | "submit") {
  if (!id) {
    state.sequence += 1;
    const created = courseFromForm(`ltm-${String(state.sequence).padStart(3, "0")}`, form, intent, "");
    state.courses = [created, ...state.courses];
    return cloneCourse(created);
  }
  const current = getIn(state, id);
  if (!current) throw new Error("课程不存在");
  if (current.reviewStatus === "pending") throw new Error("待审核课程不可编辑");
  return replaceIn(state, courseFromForm(id, form, intent, current.reviewComment));
}

export function listManagedCourses(query: ManagedCourseListQuery) {
  return listIn(bureauState, query);
}

export function getManagedCourse(id: string) {
  return getIn(bureauState, id);
}

export function submitManagedCourse(id: string) {
  return submitIn(bureauState, id);
}

export function removeManagedCourse(id: string) {
  removeIn(bureauState, id);
}

export function setManagedCourseShelf(id: string, action: ManagedCourseShelfAction) {
  return setShelfIn(bureauState, id, action);
}

export function saveManagedCourse(id: string, form: ManagedCourseForm, intent: "draft" | "submit") {
  return saveIn(bureauState, id, form, intent);
}

export function listSchoolManagedCourses(query: ManagedCourseListQuery) {
  return listIn(schoolState, query);
}

export function getSchoolManagedCourse(id: string) {
  return getIn(schoolState, id);
}

export function submitSchoolManagedCourse(id: string) {
  return submitIn(schoolState, id);
}

export function removeSchoolManagedCourse(id: string) {
  removeIn(schoolState, id);
}

export function saveSchoolManagedCourse(id: string, form: ManagedCourseForm, intent: "draft" | "submit") {
  return saveIn(schoolState, id, form, intent);
}
