import type { TrainingAchievementType } from "@/features/training-achievement/types";
import type {
  ExcellentAchievementCard,
  ExcellentAchievementCoverTheme,
  ExcellentAchievementDetail,
  ExcellentAchievementListQuery,
  ExcellentAchievementListResult,
} from "@/features/school-excellent-achievements/types";

const COVER_THEMES: ExcellentAchievementCoverTheme[] = [
  "violet",
  "rose",
  "cyan",
  "green",
  "coral",
  "lilac",
];

const TYPE_CYCLE: TrainingAchievementType[] = [
  "teaching-result",
  "paper",
  "training",
  "research-award",
  "school-based",
  "teaching-result",
];

const TITLES = [
  "基于核心素养的单元整体教学实践研究成果报告",
  "小学语文情境化阅读教学策略研究",
  "区域骨干教师专项培训学习总结与反思",
  "跨学科项目式学习实践探索",
  "校本教研共同体建设路径研究",
  "数学深度学习课堂观察与改进案例",
  "英语绘本阅读课程开发与实施报告",
  "科学探究实验教学创新实践",
];

const AUTHORS = [
  { teacherName: "张三", schoolName: "实验小学" },
  { teacherName: "李四", schoolName: "阳光小学" },
  { teacherName: "王五", schoolName: "育才中学" },
  { teacherName: "赵六", schoolName: "实验小学" },
  { teacherName: "钱七", schoolName: "第一小学" },
  { teacherName: "孙八", schoolName: "第二中学" },
];

const STAGES = ["小学", "初中", "高中"] as const;
const SUBJECTS = ["语文", "数学", "英语", "物理", "科学"] as const;

const ABSTRACT =
  "本成果围绕核心素养导向的单元整体教学展开系统实践，通过目标重构、任务链设计与表现性评价，形成可迁移的课堂实施路径与校本案例资源，服务区域教师研修与课堂提质。";

function buildCard(index: number): ExcellentAchievementCard {
  const author = AUTHORS[index % AUTHORS.length]!;
  const type = TYPE_CYCLE[index % TYPE_CYCLE.length]!;
  const day = String((index % 28) + 1).padStart(2, "0");
  return {
    id: `excellent-${String(index + 1).padStart(3, "0")}`,
    title: TITLES[index % TITLES.length]!,
    teacherName: author.teacherName,
    schoolName: author.schoolName,
    type,
    stage: STAGES[index % STAGES.length]!,
    subject: SUBJECTS[index % SUBJECTS.length]!,
    featured: index % 3 === 0,
    likeCount: 180 - (index % 40) * 3,
    publishedAt: `2026-09-${day}`,
    coverTheme: COVER_THEMES[index % COVER_THEMES.length]!,
  };
}

const ALL_CARDS: ExcellentAchievementCard[] = Array.from({ length: 86 }, (_, index) =>
  buildCard(index),
);

const likedIds = new Set<string>();

function cloneCard(card: ExcellentAchievementCard): ExcellentAchievementCard {
  return { ...card };
}

export function listExcellentAchievements(
  query: ExcellentAchievementListQuery,
): ExcellentAchievementListResult {
  let rows = ALL_CARDS.map(cloneCard);
  if (query.type) rows = rows.filter((item) => item.type === query.type);
  if (query.stage) rows = rows.filter((item) => item.stage === query.stage);
  if (query.subject) rows = rows.filter((item) => item.subject === query.subject);
  rows.sort((left, right) => {
    if (query.sortKey === "likes") return right.likeCount - left.likeCount;
    return right.publishedAt.localeCompare(left.publishedAt);
  });
  const start = (query.page - 1) * query.pageSize;
  return {
    rows: rows.slice(start, start + query.pageSize),
    total: rows.length,
  };
}

export function getExcellentAchievementDetail(id: string): ExcellentAchievementDetail | null {
  const card = ALL_CARDS.find((item) => item.id === id);
  if (!card) return null;
  const liked = likedIds.has(id);
  return {
    ...cloneCard(card),
    likeCount: liked ? card.likeCount + 1 : card.likeCount,
    liked,
    honorLabel: "区级优秀",
    abstract: ABSTRACT,
    viewCount: 1256 + Number(id.replace(/\D/g, "")) % 300,
    attachments: [
      {
        id: `${id}-file-1`,
        name: `成果研究报告_${card.teacherName}.docx`,
        sizeLabel: "2.4 MB",
      },
    ],
  };
}

export function toggleExcellentAchievementLike(id: string): ExcellentAchievementDetail {
  const detail = getExcellentAchievementDetail(id);
  if (!detail) throw new Error("成果不存在");
  if (likedIds.has(id)) likedIds.delete(id);
  else likedIds.add(id);
  const next = getExcellentAchievementDetail(id);
  if (!next) throw new Error("成果不存在");
  return next;
}
