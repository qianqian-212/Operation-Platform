import {
  listCollectiveLessonPrepItems,
  listCurriculumTree,
} from "@/features/collective-lesson-prep/mock-data";
import type {
  CollectiveLessonPrepFilter,
  CollectiveLessonPrepItem,
  CollectiveLessonPrepListResult,
  CollectiveLessonPrepStats,
  CurriculumNode,
} from "@/features/collective-lesson-prep/types";

export interface CollectiveLessonPrepRepository {
  listCurriculum(tenantId: string): Promise<CurriculumNode[]>;
  list(tenantId: string, filter: CollectiveLessonPrepFilter): Promise<CollectiveLessonPrepListResult>;
}

function emptyStats(): CollectiveLessonPrepStats {
  return { total: 0, ongoing: 0, completed: 0, pending: 0 };
}

function summarize(items: readonly CollectiveLessonPrepItem[]): CollectiveLessonPrepStats {
  return items.reduce((stats, item) => {
    stats.total += 1;
    stats[item.status] += 1;
    return stats;
  }, emptyStats());
}

function matchesKeyword(item: CollectiveLessonPrepItem, keyword: string) {
  if (!keyword) return true;
  return [item.title, item.allianceName, item.leadTeacherName, item.chapterLabel, item.activityName]
    .some((field) => field.includes(keyword));
}

function matchesFilter(item: CollectiveLessonPrepItem, filter: CollectiveLessonPrepFilter) {
  if (filter.status && item.status !== filter.status) return false;
  if (filter.subject && item.subject !== filter.subject) return false;
  if (filter.curriculumNodeId && !item.curriculumPath.includes(filter.curriculumNodeId)) {
    return false;
  }
  return matchesKeyword(item, filter.keyword.trim());
}

const localCollectiveLessonPrepRepository: CollectiveLessonPrepRepository = {
  async listCurriculum(_tenantId) {
    return listCurriculumTree();
  },

  async list(_tenantId, filter) {
    const all = listCollectiveLessonPrepItems();
    return {
      stats: summarize(all),
      list: all.filter((item) => matchesFilter(item, filter)),
    };
  },
};

export const collectiveLessonPrepRepository: CollectiveLessonPrepRepository =
  localCollectiveLessonPrepRepository;
