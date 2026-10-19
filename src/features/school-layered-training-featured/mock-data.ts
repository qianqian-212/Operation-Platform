import {
  matchesFeaturedCredit,
  type FeaturedCatalogQuery,
  type FeaturedCourse,
  type FeaturedLearningCourse,
  type FeaturedFreshItem,
  type FeaturedRecommendQuery,
  type FeaturedReview,
} from "@/features/school-layered-training-featured/types";

const UNIT_SUMMARY =
  "本课程围绕新课标下的大单元教学设计展开，从理念基础、目标设计、情境任务设计、评价设计等多个维度，系统讲解大单元教学的设计方法与实施策略。课程结合丰富的一线教学案例，帮助教师快速掌握大单元教学的核心思路，提升课堂教学设计能力。";

function course(partial: FeaturedCourse): FeaturedCourse {
  return partial;
}

const COURSES: FeaturedCourse[] = [
  course({
    id: "sfc-001",
    title: "新课标下的大单元教学设计与实践",
    shortTitle: "大单元教学",
    subject: "语文",
    stage: "初中",
    hours: 12,
    credit: 2,
    rating: 4.8,
    learnerCount: 1286,
    completionRate: 85,
    eligible: true,
    instructor: "王评",
    source: "区域精品",
    uploadOrg: "区教发发展中心",
    fitStage: "成长期 / 骨干型",
    summary: UNIT_SUMMARY,
    audience: "骨干教师、成长型教师、语文学科、初中。",
    goals: [
      "理解大单元教学的核心理念与理论基础",
      "掌握大单元教学目标的设计方法",
      "学会设计真实情境下的任务驱动学习",
      "能够运用多元评价方式促进学生发展",
    ],
    lessonTitle: "大单元教学理念解读",
    recommendTone: "primary",
    recommendLabel: "骨干推荐",
  }),
  course({
    id: "sfc-002",
    title: "整本书阅读的教学指导与评价",
    shortTitle: "整本书阅读",
    subject: "语文",
    stage: "小学",
    hours: 8,
    credit: 1,
    rating: 4.7,
    learnerCount: 956,
    completionRate: 78,
    eligible: false,
    instructor: "李评",
    source: "同层级热门",
    uploadOrg: "区教发发展中心",
    fitStage: "成熟期",
    summary: "围绕整本书阅读的选书、推进和评价，帮助教师把整本书阅读落到课堂。",
    audience: "小学语文教师。",
    goals: ["制定学期阅读计划", "设计课堂讨论", "完成过程评价"],
    lessonTitle: "选书标准与阅读计划",
    recommendTone: "success",
    recommendLabel: "同层级热门",
  }),
  course({
    id: "sfc-003",
    title: "王崧舟：作文教学创新与实践",
    shortTitle: "作文教学",
    subject: "语文",
    stage: "初中",
    hours: 16,
    credit: 3,
    rating: 4.9,
    learnerCount: 2341,
    completionRate: 92,
    eligible: true,
    instructor: "王崧舟",
    source: "专家课程",
    uploadOrg: "区教发发展中心",
    fitStage: "骨干型",
    summary: "以作文教学的真实课堂为例，讲解序列设计、讲评和改进。",
    audience: "初中语文骨干教师。",
    goals: ["重建作文教学目标", "设计讲评活动", "形成序列化训练"],
    lessonTitle: "作文教学的问题与转向",
    recommendTone: "warning",
    recommendLabel: "专家推荐",
  }),
  course({
    id: "sfc-004",
    title: "群文阅读的理论基础与课堂实施",
    shortTitle: "群文阅读",
    subject: "语文",
    stage: "初中",
    hours: 10,
    credit: 1.5,
    rating: 4.6,
    learnerCount: 842,
    completionRate: 72,
    eligible: true,
    instructor: "赵评",
    source: "区域精品",
    uploadOrg: "区教发发展中心",
    fitStage: "骨干型",
    summary: "说明群文阅读的议题、文本组元和课堂实施。",
    audience: "初中语文教师。",
    goals: ["确定议题", "组织文本", "实施课堂评价"],
    lessonTitle: "群文阅读的议题确定",
    recommendTone: "violet",
    recommendLabel: "区域精品",
  }),
  course({
    id: "sfc-005",
    title: "语文核心素养培养路径",
    shortTitle: "核心素养",
    subject: "语文",
    stage: "高中",
    hours: 14,
    credit: 2.5,
    rating: 4.5,
    learnerCount: 768,
    completionRate: 80,
    eligible: true,
    instructor: "周评",
    source: "区域精品",
    uploadOrg: "区教发发展中心",
    fitStage: "骨干型",
    summary: "把语文核心素养拆成可观察的课堂路径。",
    audience: "高中语文教师。",
    goals: ["对齐核心素养", "设计学习任务"],
    lessonTitle: "核心素养的课堂表现",
    recommendTone: "",
    recommendLabel: "",
  }),
  course({
    id: "sfc-006",
    title: "古诗词教学的审美渗透",
    shortTitle: "古诗词",
    subject: "语文",
    stage: "小学",
    hours: 6,
    credit: 1,
    rating: 4.5,
    learnerCount: 623,
    completionRate: 68,
    eligible: false,
    instructor: "吴评",
    source: "区域精品",
    uploadOrg: "区教发发展中心",
    fitStage: "成长期",
    summary: "在古诗词教学中渗透审美体验。",
    audience: "小学语文教师。",
    goals: ["设计诵读活动", "引导意象理解"],
    lessonTitle: "意象与审美",
    recommendTone: "",
    recommendLabel: "",
  }),
  course({
    id: "sfc-007",
    title: "文言文教学方法创新",
    shortTitle: "文言文",
    subject: "语文",
    stage: "初中",
    hours: 10,
    credit: 1.5,
    rating: 4.4,
    learnerCount: 534,
    completionRate: 75,
    eligible: true,
    instructor: "郑评",
    source: "区域精品",
    uploadOrg: "区教发发展中心",
    fitStage: "骨干型",
    summary: "用任务和比较阅读改进文言文课堂。",
    audience: "初中语文教师。",
    goals: ["设计比较阅读", "降低文言门槛"],
    lessonTitle: "文言课堂的任务设计",
    recommendTone: "",
    recommendLabel: "",
  }),
  course({
    id: "sfc-008",
    title: "写作教学序列设计",
    shortTitle: "写作序列",
    subject: "语文",
    stage: "初中",
    hours: 12,
    credit: 2,
    rating: 4.4,
    learnerCount: 498,
    completionRate: 65,
    eligible: true,
    instructor: "钱评",
    source: "区域精品",
    uploadOrg: "区教发发展中心",
    fitStage: "骨干型",
    summary: "按学期编排写作训练序列。",
    audience: "初中语文教师。",
    goals: ["编排学期序列", "设计讲评量规"],
    lessonTitle: "序列化写作目标",
    recommendTone: "",
    recommendLabel: "",
  }),
  course({
    id: "sfc-009",
    title: "现代文阅读深度教学",
    shortTitle: "现代文",
    subject: "语文",
    stage: "高中",
    hours: 8,
    credit: 1,
    rating: 4.3,
    learnerCount: 421,
    completionRate: 70,
    eligible: false,
    instructor: "孙评",
    source: "区域精品",
    uploadOrg: "区教发发展中心",
    fitStage: "成熟期",
    summary: "引导高中现代文从信息提取走向深度理解。",
    audience: "高中语文教师。",
    goals: ["设计深度提问", "组织文本细读"],
    lessonTitle: "从信息到理解",
    recommendTone: "",
    recommendLabel: "",
  }),
  course({
    id: "sfc-010",
    title: "口语交际教学策略",
    shortTitle: "口语交际",
    subject: "语文",
    stage: "小学",
    hours: 6,
    credit: 1,
    rating: 4.3,
    learnerCount: 356,
    completionRate: 62,
    eligible: true,
    instructor: "冯评",
    source: "区域精品",
    uploadOrg: "区教发发展中心",
    fitStage: "骨干型",
    summary: "用真实交际任务组织小学口语课堂。",
    audience: "小学语文教师。",
    goals: ["设计交际任务", "评价表达质量"],
    lessonTitle: "真实交际任务",
    recommendTone: "",
    recommendLabel: "",
  }),
  course({
    id: "sfc-011",
    title: "教师心理健康与职业发展",
    shortTitle: "心理健康",
    subject: "综合",
    stage: "中学",
    hours: 8,
    credit: 1,
    rating: 4.6,
    learnerCount: 640,
    completionRate: 68,
    eligible: true,
    instructor: "周评",
    source: "区域精品",
    uploadOrg: "区教发发展中心",
    fitStage: "骨干型",
    summary: "面向各学段教师的心理健康与职业发展规划课程。",
    audience: "全体教师。",
    goals: ["识别职业压力", "建立支持关系"],
    lessonTitle: "职业压力识别",
    recommendTone: "",
    recommendLabel: "",
  }),
  course({
    id: "sfc-012",
    title: "教育信息化2.0素养提升",
    shortTitle: "教育信息化",
    subject: "综合",
    stage: "中学",
    hours: 18,
    credit: 3,
    rating: 4.5,
    learnerCount: 510,
    completionRate: 82,
    eligible: true,
    instructor: "吴评",
    source: "区域精品",
    uploadOrg: "区教发发展中心",
    fitStage: "骨干型",
    summary: "帮助教师把信息化工具用到真实课堂。",
    audience: "全体教师。",
    goals: ["选择合适工具", "设计信息化活动"],
    lessonTitle: "课堂中的数字工具",
    recommendTone: "",
    recommendLabel: "",
  }),
];

const REVIEW_TEXT =
  "课程内容非常扎实，特别是第3讲的目标设计部分，讲解得很透彻，案例也很丰富。学完后对大单元教学有了系统性的认识，推荐给正在摸索大单元教学的老师们！";

const REVIEWS: FeaturedReview[] = [
  {
    id: "sfr-001",
    courseId: "sfc-001",
    teacherName: "张晓晓",
    schoolName: "实验小学",
    meta: "实验小学 · 语文 · 骨干型教师",
    timeLabel: "2天前",
    avatarText: "张晓",
    avatarTone: "primary",
    rating: 5,
    content: REVIEW_TEXT,
    likes: 567,
    comments: 12,
  },
  {
    id: "sfr-002",
    courseId: "sfc-001",
    teacherName: "张晓晓",
    schoolName: "实验小学",
    meta: "实验小学 · 语文 · 骨干型教师",
    timeLabel: "2天前",
    avatarText: "张晓",
    avatarTone: "violet",
    rating: 4,
    content: REVIEW_TEXT,
    likes: 567,
    comments: 12,
  },
];

const LEARNING: FeaturedLearningCourse[] = [
  {
    id: "sfl-001",
    courseId: "sfc-001",
    title: "新课标下的大单元教学设计与实践",
    subject: "语文",
    credit: 2,
    progress: 35,
    lastStudy: "9月9日",
    status: "slow",
    barColor: "var(--color-error)",
  },
  {
    id: "sfl-002",
    courseId: "sfc-002",
    title: "整本书阅读指导策略",
    subject: "语文",
    credit: 1,
    progress: 20,
    lastStudy: "9月5日",
    status: "slow",
    barColor: "var(--color-warning)",
  },
  {
    id: "sfl-003",
    courseId: "sfc-011",
    title: "教师心理健康与职业发展",
    subject: "综合",
    credit: 1,
    progress: 68,
    lastStudy: "9月22日",
    status: "ongoing",
    barColor: "var(--color-primary)",
  },
  {
    id: "sfl-004",
    courseId: "sfc-012",
    title: "教育信息化2.0素养提升",
    subject: "综合",
    credit: 3,
    progress: 82,
    lastStudy: "9月23日",
    status: "nearly",
    barColor: "var(--color-success)",
  },
];

const NEW_ITEMS: FeaturedFreshItem[] = [
  { id: "sfn-001", courseId: "sfc-001", title: "大单元学历案设计", ratingText: "4.5", reviewText: "56人评价", trendText: "新晋TOP20" },
  { id: "sfn-002", courseId: "sfc-005", title: "任务群教学实施指南", ratingText: "4.5", reviewText: "56人评价", trendText: "新晋TOP20" },
  { id: "sfn-003", courseId: "sfc-003", title: "作文讲评课例精修", ratingText: "4.5", reviewText: "56人评价", trendText: "新晋TOP20" },
  { id: "sfn-004", courseId: "sfc-004", title: "群文阅读议题设计", ratingText: "4.5", reviewText: "56人评价", trendText: "新晋TOP20" },
];

let courses = COURSES.map((item) => ({ ...item, goals: [...item.goals] }));

export function resetSchoolFeaturedCourseMockData() {
  courses = COURSES.map((item) => ({ ...item, goals: [...item.goals] }));
}

function profileValue(value: string, fallback: string) {
  return value || fallback;
}

export function listFeaturedRecommendations(query: FeaturedRecommendQuery) {
  const scoped =
    profileValue(query.subject, "语文") === "语文" &&
    profileValue(query.developmentStage, "骨干型") === "骨干型" &&
    profileValue(query.semester, "2026年秋季学期") === "2026年秋季学期" &&
    profileValue(query.bureau, "XX区教育局") === "XX区教育局";
  if (!scoped) return [];
  return courses.filter(
    (item) => item.recommendLabel && matchesFeaturedCredit(item.credit, query.creditBand),
  );
}

export function listFeaturedRanking(query: FeaturedRecommendQuery) {
  return courses
    .filter((item) => !query.subject || item.subject === query.subject)
    .slice()
    .sort((left, right) => right.rating - left.rating)
    .slice(0, 10);
}

export function listFeaturedCatalog(query: FeaturedCatalogQuery) {
  return courses.filter((item) => {
    if (query.subject && item.subject !== query.subject) return false;
    if (query.stage && item.stage !== query.stage) return false;
    if (query.eligibility === "eligible" && !item.eligible) return false;
    if (query.eligibility === "ineligible" && item.eligible) return false;
    return true;
  });
}

export function listFeaturedNewItems() {
  return NEW_ITEMS.map((item) => ({ ...item }));
}

export function listFeaturedLearning() {
  return LEARNING.map((item) => ({ ...item }));
}

export function getFeaturedCourse(id: string) {
  const found = courses.find((item) => item.id === id);
  return found ? { ...found, goals: [...found.goals] } : null;
}

export function listFeaturedReviews(courseId: string) {
  return REVIEWS.filter((item) => item.courseId === courseId).map((item) => ({ ...item }));
}

export function findFeaturedLearning(courseId: string) {
  const found = LEARNING.find((item) => item.courseId === courseId);
  return found ? { ...found } : null;
}
