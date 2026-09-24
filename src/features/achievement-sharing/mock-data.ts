import type {
  AchievementSharingItem,
  AchievementSharingType,
} from "@/features/achievement-sharing/types";

function clone<T>(value: T): T {
  return structuredClone(value);
}

const UNIT_ONE_PATH = ["unit-1", "lesson-1-1", "lesson-1-1-text"];
const SHARED_SUMMARY = "含教案、说课PPT、课后练习，跨校协作完成";
const FEATURED_TITLE = "《富饶的西沙群岛》跨校集体备课教案集";

function item(input: {
  id: string;
  type: AchievementSharingType;
  curriculumPath: string[];
  title?: string;
  schoolName?: string;
  teacherName?: string;
  publishedAt?: string;
  downloadCount?: number;
  summary?: string;
}): AchievementSharingItem {
  return {
    id: input.id,
    title: input.title ?? FEATURED_TITLE,
    schoolName: input.schoolName ?? "阳光小学",
    teacherName: input.teacherName ?? "陈晓晓",
    publishedAt: input.publishedAt ?? "2026-09-09",
    downloadCount: input.downloadCount ?? 100,
    summary: input.summary ?? SHARED_SUMMARY,
    type: input.type,
    visibilityLabel: "联盟内共享",
    curriculumPath: input.curriculumPath,
  };
}

const ITEMS: AchievementSharingItem[] = [
  item({ id: "share-plan-xisha", type: "lesson-plan", curriculumPath: UNIT_ONE_PATH }),
  item({ id: "share-courseware-xisha", type: "courseware", curriculumPath: UNIT_ONE_PATH }),
  item({ id: "share-paper-xisha", type: "paper", curriculumPath: UNIT_ONE_PATH }),
  item({ id: "share-case-xisha", type: "case", curriculumPath: UNIT_ONE_PATH }),
  item({
    id: "share-plan-song",
    type: "lesson-plan",
    title: "《短歌行》跨校备课教案",
    curriculumPath: ["unit-3", "lesson-3-1", "lesson-3-1-text"],
    schoolName: "育才中学",
    downloadCount: 0,
  }),
  item({
    id: "share-plan-cliff",
    type: "lesson-plan",
    title: "《赤壁赋》跨校备课教案",
    curriculumPath: ["unit-4", "lesson-4-1", "lesson-4-1-text"],
    schoolName: "文德小学",
    downloadCount: 0,
  }),
  item({
    id: "share-plan-lotus",
    type: "lesson-plan",
    title: "《荷塘月色》跨校备课教案",
    curriculumPath: ["unit-7", "lesson-7-2", "lesson-7-2-text"],
    schoolName: "星湖小学",
    downloadCount: 0,
  }),
  item({
    id: "share-courseware-ratio",
    type: "courseware",
    title: "《比的认识》跨校课件",
    curriculumPath: ["unit-8", "lesson-8-1", "lesson-8-1-text"],
    schoolName: "科创小学",
    teacherName: "李明华",
    downloadCount: 0,
  }),
  item({
    id: "share-paper-garden",
    type: "paper",
    title: "《归园田居》跨校教学论文",
    curriculumPath: ["unit-3", "lesson-3-2", "lesson-3-2-text"],
    downloadCount: 0,
  }),
  item({
    id: "share-paper-pipa",
    type: "paper",
    title: "《琵琶行》跨校教学论文",
    curriculumPath: ["unit-10", "lesson-10-1", "lesson-10-1-text"],
    downloadCount: 0,
  }),
  item({
    id: "share-case-exhortation",
    type: "case",
    title: "《劝学》跨校教学案例",
    curriculumPath: ["unit-6", "lesson-6-1", "lesson-6-1-text"],
    downloadCount: 0,
  }),
  item({
    id: "share-case-english",
    type: "case",
    title: "My School Life 跨校教学案例",
    curriculumPath: ["unit-11", "lesson-11-1", "lesson-11-1-text"],
    schoolName: "翠竹小学",
    downloadCount: 0,
  }),
];

export function listAchievementSharingItems() {
  return clone(ITEMS);
}
