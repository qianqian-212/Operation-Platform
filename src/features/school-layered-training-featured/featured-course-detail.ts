import type { FeaturedCourse } from "@/features/school-layered-training-featured/types";

export interface FeaturedDetailTag {
  label: string;
  tone: "violet" | "green" | "pink";
}

export interface FeaturedDetailChapter {
  id: string;
  label: string;
  hot: boolean;
}

export interface FeaturedDetailBar {
  star: number;
  percent: number;
}

export interface FeaturedDetailInfoRow {
  label: string;
  value: string;
}

export interface FeaturedDetailAudience {
  label: string;
  tone: "green" | "blue";
}

export interface FeaturedDetailModel {
  title: string;
  tags: FeaturedDetailTag[];
  score: number;
  studyCount: number;
  lessonIndex: number;
  lessonTitle: string;
  lessonTotal: number;
  playedLabel: string;
  durationLabel: string;
  chapters: FeaturedDetailChapter[];
  peakCount: number;
  peakHint: string;
  creditLabel: string;
  hoursLabel: string;
  stageLabel: string;
  subject: string;
  fitStage: string;
  sourceLabel: string;
  uploadOrg: string;
  instructor: string;
  summary: string;
  audienceTags: FeaturedDetailAudience[];
  goals: string[];
  reviewScore: number;
  reviewTotal: number;
  reviewBars: FeaturedDetailBar[];
}

const PEAK_HINT =
  "进度条上的橙色标记为播放峰值点，标记了多位教师反复观看的视频片段。峰值越高，说明知识点越受关注";

const UNIT_CHAPTERS: FeaturedDetailChapter[] = [
  { id: "plan", label: "带着·单元整体规划", hot: false },
  { id: "goal", label: "强攻难度·目标设计", hot: true },
  { id: "task", label: "热门·情境任务设计", hot: false },
];

const UNIT_BARS: FeaturedDetailBar[] = [
  { star: 5, percent: 80 },
  { star: 4, percent: 60 },
  { star: 3, percent: 80 },
  { star: 2, percent: 80 },
  { star: 1, percent: 40 },
];

export function presentFeaturedDetail(course: FeaturedCourse): FeaturedDetailModel {
  return course.id === "sfc-001" ? unitDetail(course) : baseDetail(course);
}

export function featuredDetailInfoRows(detail: FeaturedDetailModel): FeaturedDetailInfoRow[] {
  return [
    { label: "学分", value: detail.creditLabel },
    { label: "学时", value: detail.hoursLabel },
    { label: "学段", value: detail.stageLabel },
    { label: "学科", value: detail.subject },
    { label: "适用阶段", value: detail.fitStage },
    { label: "来源", value: detail.sourceLabel },
    { label: "上传学校", value: detail.uploadOrg },
    { label: "主讲人", value: detail.instructor },
  ];
}

export function playedPercent(playedLabel: string, durationLabel: string) {
  const played = clockSeconds(playedLabel);
  const duration = clockSeconds(durationLabel);
  if (!duration) return 0;
  return Math.min(100, Math.round((played / duration) * 100));
}

function unitDetail(course: FeaturedCourse): FeaturedDetailModel {
  return {
    ...baseDetail(course),
    tags: [
      { label: "语文学科", tone: "violet" },
      { label: "骨干型教师", tone: "green" },
      { label: "区域精品", tone: "pink" },
    ],
    score: 4.5,
    studyCount: 58,
    lessonTotal: 6,
    playedLabel: "14:25",
    durationLabel: "40:12",
    chapters: UNIT_CHAPTERS,
    peakCount: 3,
    peakHint: PEAK_HINT,
    stageLabel: "中学",
    fitStage: "成长期/骨干型",
    sourceLabel: "区域资源",
    uploadOrg: "区教研发展中心",
    instructor: "王教授",
    audienceTags: [
      { label: "骨干型教师", tone: "green" },
      { label: "语文学科", tone: "blue" },
    ],
    reviewScore: 4.8,
    reviewTotal: 120,
    reviewBars: UNIT_BARS,
  };
}

function baseDetail(course: FeaturedCourse): FeaturedDetailModel {
  return {
    title: course.title,
    tags: detailTags(course),
    score: course.rating,
    studyCount: course.learnerCount,
    lessonIndex: 1,
    lessonTitle: course.lessonTitle,
    lessonTotal: 1,
    playedLabel: "00:00",
    durationLabel: "40:12",
    chapters: [{ id: "current", label: course.lessonTitle, hot: false }],
    peakCount: 0,
    peakHint: "",
    creditLabel: `${course.credit}分`,
    hoursLabel: `${course.hours}学时`,
    stageLabel: course.stage,
    subject: course.subject,
    fitStage: course.fitStage,
    sourceLabel: course.source,
    uploadOrg: course.uploadOrg,
    instructor: course.instructor,
    summary: course.summary,
    audienceTags: [{ label: course.subject, tone: "blue" }],
    goals: course.goals,
    reviewScore: course.rating,
    reviewTotal: 0,
    reviewBars: [],
  };
}

function detailTags(course: FeaturedCourse): FeaturedDetailTag[] {
  return [
    { label: `${course.subject}学科`, tone: "violet" },
    { label: course.fitStage, tone: "green" },
    { label: course.source, tone: "pink" },
  ].filter((item) => item.label);
}

function clockSeconds(value: string) {
  const [minutes, seconds] = value.split(":");
  return Number(minutes || 0) * 60 + Number(seconds || 0);
}
