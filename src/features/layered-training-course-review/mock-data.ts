import type {
  LayeredTrainingCourseDetail,
  LayeredTrainingCourseKind,
  LayeredTrainingCourseLesson,
  LayeredTrainingCourseListQuery,
  LayeredTrainingCourseRow,
  LayeredTrainingCourseStatus,
} from "@/features/layered-training-course-review/types";

interface CourseSeed {
  title: string;
  kind: LayeredTrainingCourseKind;
  subject: string;
  schoolName: string;
  uploaderName: string;
  uploadedAt: string;
  status: LayeredTrainingCourseStatus;
  stageLabel: string;
  groups: string[];
  summary: string;
  reviewComment: string;
  lessons: Array<Omit<LayeredTrainingCourseLesson, "id">>;
}

const READING_LESSONS: Array<Omit<LayeredTrainingCourseLesson, "id">> = [
  { indexLabel: "第1讲", title: "选书标准与阅读计划", durationLabel: "32分钟", uploaded: true },
  { indexLabel: "第2讲", title: "课堂讨论设计", durationLabel: "40分钟", uploaded: true },
  { indexLabel: "第3讲", title: "整本书阅读评价", durationLabel: "35分钟", uploaded: true },
  { indexLabel: "第4讲", title: "阅读成果展示", durationLabel: "28分钟", uploaded: true },
  { indexLabel: "第5讲", title: "家校共读策略", durationLabel: "30分钟", uploaded: true },
  { indexLabel: "第6讲", title: "课程总结与答疑", durationLabel: "25分钟", uploaded: true },
];

const MATH_LESSONS: Array<Omit<LayeredTrainingCourseLesson, "id">> = [
  { indexLabel: "第1讲", title: "数感建立", durationLabel: "30分钟", uploaded: true },
  { indexLabel: "第2讲", title: "运算策略", durationLabel: "36分钟", uploaded: true },
  { indexLabel: "第3讲", title: "图形观察", durationLabel: "28分钟", uploaded: true },
  { indexLabel: "第4讲", title: "问题解决", durationLabel: "42分钟", uploaded: true },
  { indexLabel: "第5讲", title: "错题复盘", durationLabel: "26分钟", uploaded: true },
  { indexLabel: "第6讲", title: "课堂提问", durationLabel: "33分钟", uploaded: true },
  { indexLabel: "第7讲", title: "分层练习", durationLabel: "31分钟", uploaded: true },
  { indexLabel: "第8讲", title: "单元评价", durationLabel: "24分钟", uploaded: true },
];

const FEATURED_SEEDS: CourseSeed[] = [
  {
    title: "整本书阅读指导策略",
    kind: "video",
    subject: "语文",
    schoolName: "第一小学",
    uploaderName: "王主任",
    uploadedAt: "2026-09-22",
    status: "pending",
    stageLabel: "小学",
    groups: ["新学期", "成长期", "新教师培养组"],
    summary:
      "本课程围绕整本书阅读的教学策略展开，涵盖选书标准、阅读计划制定、课堂讨论设计等核心内容，适合新学期和成长期教师学习。",
    reviewComment: "",
    lessons: READING_LESSONS,
  },
  {
    title: "小学数学思维训练方法",
    kind: "video",
    subject: "数学",
    schoolName: "第二小学",
    uploaderName: "李主任",
    uploadedAt: "2026-09-23",
    status: "pending",
    stageLabel: "小学",
    groups: ["新学期", "成长期"],
    summary: "围绕小学数学思维训练的课堂组织与分层练习，适合新学期和成长期教师学习。",
    reviewComment: "",
    lessons: MATH_LESSONS,
  },
  {
    title: "科学实验课设计指南",
    kind: "document",
    subject: "科学",
    schoolName: "第三小学",
    uploaderName: "张主任",
    uploadedAt: "2026-09-23",
    status: "pending",
    stageLabel: "小学",
    groups: ["新学期", "成长期"],
    summary: "围绕小学科学实验课的目标、材料、步骤与安全要求，帮助教师设计可落地的实验教学。",
    reviewComment: "",
    lessons: [
      { indexLabel: "资料", title: "科学实验课设计指南", durationLabel: "—", uploaded: true },
    ],
  },
];

const APPROVED_TITLES = [
  "新教师课堂导入技巧",
  "成长型教师提问设计",
  "小学英语绘本阅读",
  "作业设计与讲评",
  "项目化学习入门",
  "差异化教学实践",
  "班级管理沟通课",
  "跨学科主题学习",
  "学生评价量规编写",
  "信息技术融合课例",
  "校本教研组织方法",
  "学习支架设计",
  "朗读教学策略",
  "数学文化微课",
  "实验安全规范",
  "家校协同沟通",
  "骨干教师示范课评析",
  "学期教研计划撰写",
];

const REJECTED_TITLES = ["未完成的观课记录模板", "缺少课时说明的研修简报"];
const SCHOOLS = ["第一小学", "第二小学", "第三小学", "实验小学"];
const SUBJECTS = ["语文", "数学", "英语", "科学"];
const UPLOADERS = ["王主任", "李主任", "张主任", "陈主任"];

function lessonCountLabel(kind: LayeredTrainingCourseKind, count: number) {
  return kind === "video" ? `${count}讲` : `${count}个`;
}

function generatedLessons(kind: LayeredTrainingCourseKind, count: number) {
  return Array.from({ length: count }, (_, index) => ({
    indexLabel: kind === "video" ? `第${index + 1}讲` : "资料",
    title: kind === "video" ? `第${index + 1}讲课程内容` : "课程资料",
    durationLabel: kind === "video" ? `${20 + index * 4}分钟` : "—",
    uploaded: true,
  }));
}

function generatedSeed(
  title: string,
  index: number,
  status: LayeredTrainingCourseStatus,
): CourseSeed {
  const kind: LayeredTrainingCourseKind = index % 3 === 2 ? "document" : "video";
  const lessonCount = kind === "video" ? 4 + (index % 3) : 1;
  const subject = SUBJECTS[index % SUBJECTS.length] ?? "语文";
  return {
    title,
    kind,
    subject,
    schoolName: SCHOOLS[index % SCHOOLS.length] ?? "第一小学",
    uploaderName: UPLOADERS[index % UPLOADERS.length] ?? "王主任",
    uploadedAt: `2026-09-${String(10 + (index % 12)).padStart(2, "0")}`,
    status,
    stageLabel: "小学",
    groups: index % 2 === 0 ? ["新学期", "成长期"] : ["成长期"],
    summary: `面向小学${subject}教师的分层研修课程，覆盖${title}的核心做法。`,
    reviewComment: status === "approved" ? "内容完整，符合分层研修要求。" : "课时材料不完整，请补充后再提交。",
    lessons: generatedLessons(kind, lessonCount),
  };
}

function toDetail(seed: CourseSeed, index: number): LayeredTrainingCourseDetail {
  const id = `ltc-${String(index + 1).padStart(3, "0")}`;
  return {
    id,
    title: seed.title,
    kind: seed.kind,
    lessonCountLabel: lessonCountLabel(seed.kind, seed.lessons.length),
    subject: seed.subject,
    schoolName: seed.schoolName,
    uploaderName: seed.uploaderName,
    uploadedAt: seed.uploadedAt,
    status: seed.status,
    stageLabel: seed.stageLabel,
    groups: [...seed.groups],
    summary: seed.summary,
    reviewComment: seed.reviewComment,
    lessons: seed.lessons.map((lesson, lessonIndex) => ({
      ...lesson,
      id: `${id}-l${lessonIndex + 1}`,
    })),
  };
}

function createStore() {
  const generated = [
    ...APPROVED_TITLES.map((title, index) => generatedSeed(title, index, "approved")),
    ...REJECTED_TITLES.map((title, index) =>
      generatedSeed(title, APPROVED_TITLES.length + index, "rejected"),
    ),
  ];
  return [...FEATURED_SEEDS, ...generated].map(toDetail);
}

function cloneDetail(detail: LayeredTrainingCourseDetail): LayeredTrainingCourseDetail {
  return {
    ...detail,
    groups: [...detail.groups],
    lessons: detail.lessons.map((lesson) => ({ ...lesson })),
  };
}

let store = createStore();

export function resetLayeredTrainingCourseReviewMockData() {
  store = createStore();
}

export function listLayeredTrainingCourseGroupNames() {
  const names = new Set<string>();
  for (const course of store) {
    for (const name of course.groups) names.add(name);
  }
  return [...names];
}

function toRow(detail: LayeredTrainingCourseDetail): LayeredTrainingCourseRow {
  return {
    id: detail.id,
    title: detail.title,
    kind: detail.kind,
    lessonCountLabel: detail.lessonCountLabel,
    subject: detail.subject,
    schoolName: detail.schoolName,
    uploaderName: detail.uploaderName,
    uploadedAt: detail.uploadedAt,
    status: detail.status,
  };
}

function uniqueSchools(rows: readonly LayeredTrainingCourseDetail[]) {
  const names: string[] = [];
  for (const row of rows) {
    if (!names.includes(row.schoolName)) names.push(row.schoolName);
  }
  return names;
}

function matchesCourse(detail: LayeredTrainingCourseDetail, query: LayeredTrainingCourseListQuery) {
  if (detail.status !== query.statusTab) return false;
  const schoolName = query.schoolName.trim();
  if (schoolName && detail.schoolName !== schoolName) return false;
  if (query.kind && detail.kind !== query.kind) return false;
  return true;
}

function countStatus(status: LayeredTrainingCourseStatus) {
  return store.filter((item) => item.status === status).length;
}

export function listLayeredTrainingCourses(query: LayeredTrainingCourseListQuery) {
  const filtered = store.filter((item) => matchesCourse(item, query));
  const start = Math.max(query.page - 1, 0) * query.pageSize;
  return {
    rows: filtered.slice(start, start + query.pageSize).map(toRow),
    total: filtered.length,
    tabCounts: {
      pending: countStatus("pending"),
      approved: countStatus("approved"),
      rejected: countStatus("rejected"),
    },
    schools: uniqueSchools(store),
  };
}

export function getLayeredTrainingCourseDetail(id: string) {
  const found = store.find((item) => item.id === id);
  return found ? cloneDetail(found) : null;
}

export function reviewLayeredTrainingCourse(id: string, approved: boolean, comment: string) {
  const index = store.findIndex((item) => item.id === id);
  const current = store[index];
  if (!current) throw new Error("课程不存在");
  if (current.status !== "pending") throw new Error("该课程已完成审核");
  const reviewComment = comment.trim();
  if (!approved && !reviewComment) throw new Error("驳回时必须填写驳回原因");
  const status: LayeredTrainingCourseStatus = approved ? "approved" : "rejected";
  const next = cloneDetail({ ...current, status, reviewComment });
  store[index] = next;
  return cloneDetail(next);
}
