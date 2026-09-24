import { listAchievementSharingItems } from "@/features/achievement-sharing/mock-data";
import type {
  AchievementSharingFilter,
  AchievementSharingItem,
  AchievementSharingListResult,
  AchievementSharingStats,
  CurriculumNode,
} from "@/features/achievement-sharing/types";
import { listCurriculumTree } from "@/features/collective-lesson-prep/mock-data";

export interface AchievementSharingRepository {
  listCurriculum(tenantId: string): Promise<CurriculumNode[]>;
  list(tenantId: string, filter: AchievementSharingFilter): Promise<AchievementSharingListResult>;
}

function emptyStats(): AchievementSharingStats {
  return { total: 0, materialCount: 0, paperCount: 0, downloadCount: 0 };
}

function isMaterial(type: AchievementSharingItem["type"]) {
  return type === "lesson-plan" || type === "courseware";
}

function summarize(items: readonly AchievementSharingItem[]): AchievementSharingStats {
  const stats = items.reduce((next, item) => {
    next.total += 1;
    if (isMaterial(item.type)) next.materialCount += 1;
    if (item.type === "paper") next.paperCount += 1;
    return next;
  }, emptyStats());
  // 设计稿概览「总下载数」为独立汇总口径，不按列表单卡下载次数累加。
  stats.downloadCount = 3;
  return stats;
}

function matchesFilter(item: AchievementSharingItem, filter: AchievementSharingFilter) {
  if (filter.type && item.type !== filter.type) return false;
  if (filter.curriculumNodeId && !item.curriculumPath.includes(filter.curriculumNodeId)) {
    return false;
  }
  const keyword = filter.keyword.trim();
  if (!keyword) return true;
  return [item.title, item.schoolName, item.teacherName, item.summary].some((field) => (
    field.includes(keyword)
  ));
}

const localAchievementSharingRepository: AchievementSharingRepository = {
  async listCurriculum(_tenantId) {
    return listCurriculumTree();
  },

  async list(_tenantId, filter) {
    const all = listAchievementSharingItems();
    return {
      stats: summarize(all),
      list: all.filter((item) => matchesFilter(item, filter)),
    };
  },
};

export const achievementSharingRepository: AchievementSharingRepository =
  localAchievementSharingRepository;
