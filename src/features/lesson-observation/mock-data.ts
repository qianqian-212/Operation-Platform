import type {
  LessonObservationArchive,
  LessonObservationDetail,
  LessonObservationEvaluationItem,
  LessonObservationOption,
  LessonObservationReviewer,
  LessonObservationReviewMethod,
  LessonObservationRow,
} from "@/features/lesson-observation/types";

interface SeedRow {
  id: string;
  courseName: string;
  instructorName: string;
  schoolId: string;
  schoolName: string;
  lessonDate: string;
  gradeSubject: string;
  reviewMethod: LessonObservationReviewMethod;
  score: number | null;
  allianceId: string;
}

const ALLIANCE_EAST: LessonObservationOption = {
  id: "alliance-east",
  name: "城东学区教研联盟",
};

const ALLIANCE_NANSHAN: LessonObservationOption = {
  id: "alliance-nanshan",
  name: "南山教育集团教研共同体",
};

const ALLIANCE_WEST: LessonObservationOption = {
  id: "alliance-west",
  name: "西湖片区小学教研联盟",
};

const DEFAULT_REVIEWERS: readonly LessonObservationReviewer[] = [
  {
    id: "rev-zhang",
    name: "张小小",
    schoolName: "阳光小学",
    score: 94,
    comment: "重点突出，学生参与度高。",
    reviewedAt: "2023-06-05 10:20",
  },
  {
    id: "rev-chen",
    name: "陈果果",
    schoolName: "文德小学",
    score: 92,
    comment: "环节清晰，可再加强分层提问。",
    reviewedAt: "2023-06-05 10:28",
  },
  {
    id: "rev-li",
    name: "李木木",
    schoolName: "实验学校",
    score: 96,
    comment: "朗读指导细致，课堂氛围好。",
    reviewedAt: "2023-06-05 10:35",
  },
  {
    id: "rev-luo",
    name: "罗小言",
    schoolName: "科创小学",
    score: null,
    comment: "",
    reviewedAt: "",
  },
  {
    id: "rev-he",
    name: "何天天",
    schoolName: "星湖小学",
    score: null,
    comment: "",
    reviewedAt: "",
  },
];

const SCREENSHOT_EVALUATIONS: readonly LessonObservationEvaluationItem[] = [
  {
    id: "eval-1",
    category: "教学内容",
    standard: "教学内容准确，教学容量适度；层次清楚，安排合理，注意新旧知识联系",
    score: 9,
  },
  {
    id: "eval-2",
    category: "教学效果",
    standard: "教学具有吸引力，能激发学生对本学科知识的兴趣，学生思维集中，学习积极性高",
    score: 10,
  },
  {
    id: "eval-3",
    category: "教学效果",
    standard: "达到预期的教学目标。学生对教师讲授的重点内容印象深刻，能理解或掌握大部分课堂教学内容",
    score: 10,
  },
  {
    id: "eval-4",
    category: "教学方法",
    standard: "能够根据教学内容和学生实际选择恰当方法，启发引导有效",
    score: 9,
  },
  {
    id: "eval-5",
    category: "教学方法",
    standard: "课堂提问指向明确，反馈及时，关注不同层次学生",
    score: 10,
  },
  {
    id: "eval-6",
    category: "教师素养",
    standard: "教学语言规范简洁，教态自然，板书工整",
    score: 9,
  },
  {
    id: "eval-7",
    category: "教师素养",
    standard: "能够灵活处理课堂生成，体现专业判断",
    score: 10,
  },
  {
    id: "eval-8",
    category: "课堂互动",
    standard: "师生、生生互动充分，合作学习组织有序",
    score: 9,
  },
  {
    id: "eval-9",
    category: "目标达成",
    standard: "学习目标可观察、可检测，当堂反馈到位",
    score: 9,
  },
  {
    id: "eval-10",
    category: "作业与评价",
    standard: "练习设计梯度合理，评价方式服务教学目标",
    score: 9,
  },
];

const SCREENSHOT_ARCHIVES: readonly LessonObservationArchive[] = [
  {
    id: "arch-detail",
    title: "测试听课-评课明细报告.pdf",
    description: "含每位评课老师的评分明细与评语",
  },
  {
    id: "arch-summary",
    title: "测试听课-评课汇总报告.pdf",
    description: "含每位评课老师的评分明细与评语",
  },
  {
    id: "arch-materials",
    title: "测试听课-课程资料.zip",
    description: "含每位评课老师的评分明细与评语",
  },
];

const SEED_ROWS: readonly SeedRow[] = [
  {
    id: "obs-matchgirl",
    courseName: "卖火柴的小女孩",
    instructorName: "钱佳益",
    schoolId: "school-sunshine",
    schoolName: "阳光小学",
    lessonDate: "2023-06-05",
    gradeSubject: "一年级/语文",
    reviewMethod: "线下评课",
    score: 94,
    allianceId: ALLIANCE_EAST.id,
  },
  {
    id: "obs-circle",
    courseName: "圆的认识",
    instructorName: "李松林",
    schoolId: "school-sunshine",
    schoolName: "阳光小学",
    lessonDate: "2023-06-06",
    gradeSubject: "一年级/数学",
    reviewMethod: "直播评课",
    score: 88,
    allianceId: ALLIANCE_EAST.id,
  },
  {
    id: "obs-math-corner",
    courseName: "数学广角",
    instructorName: "何卫军",
    schoolId: "school-sunshine",
    schoolName: "阳光小学",
    lessonDate: "2023-06-07",
    gradeSubject: "一年级/数学",
    reviewMethod: "视频评课",
    score: 88,
    allianceId: ALLIANCE_EAST.id,
  },
  {
    id: "obs-gourd",
    courseName: "宝葫芦的秘密",
    instructorName: "冯玉杰",
    schoolId: "school-sunshine",
    schoolName: "阳光小学",
    lessonDate: "2023-06-08",
    gradeSubject: "一年级/语文",
    reviewMethod: "线下评课",
    score: 88,
    allianceId: ALLIANCE_NANSHAN.id,
  },
  {
    id: "obs-frontier",
    courseName: "塞下曲",
    instructorName: "郑永聪",
    schoolId: "school-ocean",
    schoolName: "海洋小学",
    lessonDate: "2023-06-09",
    gradeSubject: "一年级/语文",
    reviewMethod: "线下评课",
    score: 88,
    allianceId: ALLIANCE_WEST.id,
  },
  {
    id: "obs-country",
    courseName: "乡下孩子",
    instructorName: "钱玛泽",
    schoolId: "school-future",
    schoolName: "未来中学",
    lessonDate: "2023-06-12",
    gradeSubject: "一年级/语文",
    reviewMethod: "线下评课",
    score: 88,
    allianceId: ALLIANCE_NANSHAN.id,
  },
  {
    id: "obs-hood",
    courseName: "小红帽与大灰狼",
    instructorName: "何艳丽",
    schoolId: "school-sunshine",
    schoolName: "阳光小学",
    lessonDate: "2023-06-13",
    gradeSubject: "一年级/语文",
    reviewMethod: "线下评课",
    score: 88,
    allianceId: ALLIANCE_EAST.id,
  },
  {
    id: "obs-triangle",
    courseName: "三角形的认识",
    instructorName: "赵中锴",
    schoolId: "school-hope",
    schoolName: "希望幼儿园",
    lessonDate: "2023-06-14",
    gradeSubject: "一年级/数学",
    reviewMethod: "线下评课",
    score: 88,
    allianceId: ALLIANCE_WEST.id,
  },
  {
    id: "obs-fraction",
    courseName: "分数的初步认识",
    instructorName: "孙岑",
    schoolId: "school-dream",
    schoolName: "梦想高中",
    lessonDate: "2023-06-15",
    gradeSubject: "一年级/数学",
    reviewMethod: "线下评课",
    score: 88,
    allianceId: ALLIANCE_NANSHAN.id,
  },
  {
    id: "obs-line",
    courseName: "射线、直线和线段",
    instructorName: "何天添",
    schoolId: "school-sunshine",
    schoolName: "阳光小学",
    lessonDate: "2023-06-16",
    gradeSubject: "一年级/数学",
    reviewMethod: "线下评课",
    score: 88,
    allianceId: ALLIANCE_EAST.id,
  },
];

let details: LessonObservationDetail[] = createSeedDetails();

function clone<T>(value: T): T {
  return structuredClone(value);
}

function allianceName(id: string) {
  if (id === ALLIANCE_NANSHAN.id) return ALLIANCE_NANSHAN.name;
  if (id === ALLIANCE_WEST.id) return ALLIANCE_WEST.name;
  return ALLIANCE_EAST.name;
}

function toRow(seedRow: SeedRow): LessonObservationRow {
  return {
    id: seedRow.id,
    courseName: seedRow.courseName,
    instructorName: seedRow.instructorName,
    schoolId: seedRow.schoolId,
    schoolName: seedRow.schoolName,
    lessonDate: seedRow.lessonDate,
    period: "第二节",
    gradeSubject: seedRow.gradeSubject,
    allianceId: seedRow.allianceId,
    allianceName: allianceName(seedRow.allianceId),
    reviewMethod: seedRow.reviewMethod,
    assessmentTemplate: "教师通用评价表",
    score: seedRow.score,
    reviewerNames: DEFAULT_REVIEWERS.map((item) => item.name),
  };
}

function toListRow(detail: LessonObservationDetail): LessonObservationRow {
  return {
    id: detail.id,
    courseName: detail.courseName,
    instructorName: detail.instructorName,
    schoolId: detail.schoolId,
    schoolName: detail.schoolName,
    lessonDate: detail.lessonDate,
    period: detail.period,
    gradeSubject: detail.gradeSubject,
    allianceId: detail.allianceId,
    allianceName: detail.allianceName,
    reviewMethod: detail.reviewMethod,
    assessmentTemplate: detail.assessmentTemplate,
    score: detail.score,
    reviewerNames: [...detail.reviewerNames],
  };
}

function toDetail(seedRow: SeedRow): LessonObservationDetail {
  const reviewers = DEFAULT_REVIEWERS.map((item) => clone(item));
  return {
    ...toRow(seedRow),
    totalScore: 100,
    reviewedCount: reviewers.filter((item) => item.score != null).length,
    reviewers,
    evaluations: SCREENSHOT_EVALUATIONS.map((item) => clone(item)),
    archives: SCREENSHOT_ARCHIVES.map((item) => clone(item)),
  };
}

function createSeedDetails() {
  return SEED_ROWS.map(toDetail);
}

export function resetLessonObservationMockData() {
  details = createSeedDetails();
}

export function listLessonObservationMockRows() {
  return details.map(toListRow);
}

export function getLessonObservationMockDetail(id: string) {
  const detail = details.find((item) => item.id === id);
  return detail ? clone(detail) : undefined;
}

export function listLessonObservationAllianceOptions(): LessonObservationOption[] {
  return [ALLIANCE_EAST, ALLIANCE_NANSHAN, ALLIANCE_WEST].map((item) => ({ ...item }));
}

export function listLessonObservationSchoolOptions(): LessonObservationOption[] {
  const schools = new Map<string, string>();
  for (const row of SEED_ROWS) schools.set(row.schoolId, row.schoolName);
  return [...schools].map(([id, name]) => ({ id, name }));
}
