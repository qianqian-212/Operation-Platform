import type { StatusTagColor } from "@/components/StatusTag.vue";

/** 精品课程页签 */
export type FeaturedCourseTab = "recommend" | "catalog" | "learning";

/** 学习进度状态 */
export type FeaturedLearningStatus = "slow" | "ongoing" | "nearly";

export interface FeaturedCourse {
  id: string;
  title: string;
  shortTitle: string;
  subject: string;
  stage: string;
  hours: number;
  credit: number;
  rating: number;
  learnerCount: number;
  completionRate: number;
  eligible: boolean;
  instructor: string;
  source: string;
  uploadOrg: string;
  fitStage: string;
  summary: string;
  audience: string;
  goals: string[];
  lessonTitle: string;
  recommendTone: "primary" | "success" | "violet" | "warning" | "";
  recommendLabel: string;
}

export interface FeaturedFreshItem {
  id: string;
  /** 对应精品课程，点击后进入该课程详情 */
  courseId: string;
  title: string;
  ratingText: string;
  reviewText: string;
  trendText: string;
}

export interface FeaturedReview {
  id: string;
  courseId: string;
  teacherName: string;
  schoolName: string;
  meta: string;
  timeLabel: string;
  avatarText: string;
  avatarTone: "primary" | "violet";
  rating: number;
  content: string;
  likes: number;
  comments: number;
}

export interface FeaturedLearningCourse {
  id: string;
  courseId: string;
  title: string;
  subject: string;
  credit: number;
  progress: number;
  lastStudy: string;
  status: FeaturedLearningStatus;
  barColor: string;
}

export interface FeaturedRecommendQuery {
  semester: string;
  bureau: string;
  subject: string;
  developmentStage: string;
  stage: string;
  creditBand: string;
}

export interface FeaturedCatalogQuery {
  subject: string;
  stage: string;
  eligibility: "" | "eligible" | "ineligible";
}

export const FEATURED_COURSE_TABS: Array<{ name: FeaturedCourseTab; label: string }> = [
  { name: "recommend", label: "精选推荐" },
  { name: "catalog", label: "全部课程" },
  { name: "learning", label: "在修课程" },
];

export const FEATURED_SEMESTER_OPTIONS = ["2026年秋季学期", "2026年春季学期"];
export const FEATURED_BUREAU_OPTIONS = ["XX区教育局", "体验区教育局"];
export const FEATURED_SUBJECT_OPTIONS = ["语文", "数学", "英语", "综合"];
export const FEATURED_DEVELOPMENT_OPTIONS = ["骨干型", "成长期", "成熟期"];
export const FEATURED_STAGE_OPTIONS = ["小学", "初中", "高中", "中学"];
export const FEATURED_CREDIT_OPTIONS = [
  { value: "", label: "全部" },
  { value: "low", label: "1学分及以下" },
  { value: "mid", label: "2学分" },
  { value: "high", label: "3学分及以上" },
];

export const FEATURED_SUBJECT_NAV = [
  { subject: "语文", count: 32 },
  { subject: "数学", count: 28 },
  { subject: "英语", count: 25 },
  { subject: "物理", count: 18 },
  { subject: "化学", count: 15 },
  { subject: "生物", count: 12 },
  { subject: "道法", count: 14 },
  { subject: "历史", count: 16 },
  { subject: "地理", count: 11 },
  { subject: "综合", count: 23 },
];

export const FEATURED_LEARNING_STATUS_MAP: Record<
  FeaturedLearningStatus,
  { label: string; tagColor: StatusTagColor }
> = {
  slow: { label: "进度缓慢", tagColor: "orange" },
  ongoing: { label: "进行中", tagColor: "blue" },
  nearly: { label: "接近完成", tagColor: "green" },
};

export const FEATURED_RECOMMEND_NOTE =
  "课程名称后的「可修」表示符合您当前发展阶段（骨干型教师），可点击学习；「不可修」表示暂不符合您的发展阶段，无法选修。";

export const FEATURED_CATALOG_NOTE =
  "以下为当前学期全部上架课程，可筛选并选课。「可修」表示符合您当前发展阶段（骨干型教师），可点击选课；「不可修」暂无法选修。";

export function featuredCreditText(credit: number) {
  return `${credit}学分`;
}

export function featuredHoursText(hours: number) {
  return `${hours}学时`;
}

export function featuredEligibleLabel(eligible: boolean) {
  return eligible ? "可修" : "不可修";
}

export function matchesFeaturedCredit(credit: number, band: string) {
  if (!band) return true;
  if (band === "low") return credit <= 1;
  if (band === "mid") return credit === 2;
  return credit >= 3;
}
