import {
  DEFAULT_CURRICULUM_NODE_ID,
  type CollectiveLessonPrepItem,
  type CollectiveLessonPrepStatus,
  type CurriculumNode,
} from "@/features/collective-lesson-prep/types";

const RELATED_ACTIVITY_ID = "activity-chinese";
const RELATED_ACTIVITY_NAME = "跨校集体备课·小学语文三年级《富饶的西沙群岛》";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function unitNode(
  id: string,
  label: string,
  lessons: ReadonlyArray<readonly [string, string, string]>,
): CurriculumNode {
  return {
    id,
    label,
    children: lessons.map(([lessonId, lessonLabel, textLabel]) => ({
      id: lessonId,
      label: lessonLabel,
      children: [{ id: `${lessonId}-text`, label: textLabel }],
    })),
  };
}

const CURRICULUM_TREE: CurriculumNode[] = [
  {
    id: "unit-1",
    label: "第一单元",
    children: [
      {
        id: "lesson-1-1",
        label: "第1课 沁园春·长沙/...",
        children: [{ id: "lesson-1-1-text", label: "《沁园春。长沙》" }],
      },
      {
        id: "lesson-1-2",
        label: "第2课",
        children: [{ id: "lesson-1-2-text", label: "《立在地球边上放号》" }],
      },
      {
        id: "lesson-1-3",
        label: "第3课",
        children: [{ id: "lesson-1-3-text", label: "《峨日朵雪峰之侧》" }],
      },
      { id: "lesson-1-task", label: "单元学习任务" },
    ],
  },
  unitNode("unit-3", "第三单元", [
    ["lesson-3-1", "第1课", "《短歌行》"],
    ["lesson-3-2", "第2课", "《归园田居》"],
  ]),
  unitNode("unit-4", "第四单元", [
    ["lesson-4-1", "第1课", "《赤壁赋》"],
    ["lesson-4-2", "第2课", "《登泰山记》"],
  ]),
  unitNode("unit-5", "第五单元", [
    ["lesson-5-1", "第1课", "《拿来主义》"],
    ["lesson-5-2", "第2课", "《喜看稻菽千重浪》"],
  ]),
  unitNode("unit-6", "第六单元", [
    ["lesson-6-1", "第1课", "《劝学》"],
    ["lesson-6-2", "第2课", "《师说》"],
  ]),
  unitNode("unit-7", "第七单元", [
    ["lesson-7-1", "第1课", "《故都的秋》"],
    ["lesson-7-2", "第2课", "《荷塘月色》"],
  ]),
  unitNode("unit-8", "第八单元", [
    ["lesson-8-1", "第1课", "《谏太宗十思疏》"],
    ["lesson-8-2", "第2课", "《答司马谏议书》"],
  ]),
  unitNode("unit-9", "第九单元", [
    ["lesson-9-1", "第1课", "《窦娥冤》"],
    ["lesson-9-2", "第2课", "《雷雨》"],
  ]),
  unitNode("unit-10", "第十单元", [
    ["lesson-10-1", "第1课", "《琵琶行》"],
    ["lesson-10-2", "第2课", "《蜀道难》"],
  ]),
  unitNode("unit-11", "第十一单元", [
    ["lesson-11-1", "第1课", "《登高》"],
    ["lesson-11-2", "第2课", "《梦游天姥吟留别》"],
  ]),
];

function prep(input: {
  id: string;
  title: string;
  status: CollectiveLessonPrepStatus;
  progress: number;
  leadSchoolName: string;
  chapterLabel: string;
  curriculumPath: string[];
  subject?: string;
  date?: string;
  outputCount?: number;
  participantCount?: number;
}): CollectiveLessonPrepItem {
  const isPending = input.status === "pending";
  return {
    id: input.id,
    title: input.title,
    allianceName: "城东学区教研联盟",
    participantCount: input.participantCount ?? 6,
    leadTeacherName: "王老师",
    leadSchoolName: input.leadSchoolName,
    chapterLabel: input.chapterLabel,
    activityId: RELATED_ACTIVITY_ID,
    activityName: RELATED_ACTIVITY_NAME,
    progress: input.progress,
    date: isPending ? "" : (input.date ?? "2026-06-12"),
    outputCount: isPending ? 0 : (input.outputCount ?? 3),
    status: input.status,
    subject: input.subject ?? "语文",
    curriculumPath: input.curriculumPath,
  };
}

const UNIT_ONE_PATH = [DEFAULT_CURRICULUM_NODE_ID, "lesson-1-1", "lesson-1-1-text"];

const PREP_ITEMS: CollectiveLessonPrepItem[] = [
  prep({
    id: "prep-campus-ongoing",
    title: "大青树下的小学",
    status: "ongoing",
    progress: 65,
    leadSchoolName: "阳光小学",
    chapterLabel: "第一单元 校园生活",
    curriculumPath: UNIT_ONE_PATH,
  }),
  prep({
    id: "prep-campus-completed",
    title: "大青树下的小学",
    status: "completed",
    progress: 100,
    leadSchoolName: "智慧校园阳光小学",
    chapterLabel: "第一单元 校园生活",
    curriculumPath: UNIT_ONE_PATH,
  }),
  prep({
    id: "prep-campus-pending",
    title: "大青树下的小学",
    status: "pending",
    progress: 0,
    leadSchoolName: "阳光小学",
    chapterLabel: "第一单元 校园生活",
    curriculumPath: UNIT_ONE_PATH,
  }),
  prep({
    id: "prep-short-song",
    title: "短歌行",
    status: "ongoing",
    progress: 40,
    leadSchoolName: "阳光小学",
    chapterLabel: "第三单元 生命的诗意",
    curriculumPath: ["unit-3", "lesson-3-1", "lesson-3-1-text"],
  }),
  prep({
    id: "prep-red-cliff",
    title: "赤壁赋",
    status: "ongoing",
    progress: 55,
    leadSchoolName: "文德小学",
    chapterLabel: "第四单元 自然情怀",
    curriculumPath: ["unit-4", "lesson-4-1", "lesson-4-1-text"],
  }),
  prep({
    id: "prep-take-ism",
    title: "拿来主义",
    status: "ongoing",
    progress: 30,
    leadSchoolName: "春风小学",
    chapterLabel: "第五单元 整本书阅读",
    curriculumPath: ["unit-5", "lesson-5-1", "lesson-5-1-text"],
  }),
  prep({
    id: "prep-exhortation",
    title: "劝学",
    status: "ongoing",
    progress: 72,
    leadSchoolName: "阳光小学",
    chapterLabel: "第六单元 学习之道",
    curriculumPath: ["unit-6", "lesson-6-1", "lesson-6-1-text"],
    date: "2026-06-18",
    outputCount: 2,
  }),
  prep({
    id: "prep-lotus",
    title: "荷塘月色",
    status: "ongoing",
    progress: 20,
    leadSchoolName: "星湖小学",
    chapterLabel: "第七单元 自然与情思",
    curriculumPath: ["unit-7", "lesson-7-2", "lesson-7-2-text"],
    date: "2026-06-20",
    outputCount: 1,
  }),
  prep({
    id: "prep-garden",
    title: "归园田居",
    status: "completed",
    progress: 100,
    leadSchoolName: "阳光小学",
    chapterLabel: "第三单元 生命的诗意",
    curriculumPath: ["unit-3", "lesson-3-2", "lesson-3-2-text"],
    date: "2026-05-28",
  }),
  prep({
    id: "prep-math-ratio",
    title: "比的认识",
    status: "completed",
    progress: 100,
    leadSchoolName: "科创小学",
    chapterLabel: "第八单元 数量关系",
    curriculumPath: ["unit-8", "lesson-8-1", "lesson-8-1-text"],
    subject: "数学",
    date: "2026-06-02",
    outputCount: 4,
  }),
  prep({
    id: "prep-pipa",
    title: "琵琶行",
    status: "pending",
    progress: 0,
    leadSchoolName: "阳光小学",
    chapterLabel: "第十单元 诗意人生",
    curriculumPath: ["unit-10", "lesson-10-1", "lesson-10-1-text"],
  }),
  prep({
    id: "prep-english-reading",
    title: "My School Life",
    status: "pending",
    progress: 0,
    leadSchoolName: "翠竹小学",
    chapterLabel: "第十一单元 School Days",
    curriculumPath: ["unit-11", "lesson-11-1", "lesson-11-1-text"],
    subject: "英语",
  }),
];

export function listCurriculumTree() {
  return clone(CURRICULUM_TREE);
}

export function listCollectiveLessonPrepItems() {
  return clone(PREP_ITEMS);
}
