import {
  getExcellentAchievementDetail,
  listExcellentAchievements,
  toggleExcellentAchievementLike,
} from "@/features/school-excellent-achievements/mock-data";
import type {
  ExcellentAchievementDetail,
  ExcellentAchievementListQuery,
  ExcellentAchievementListResult,
} from "@/features/school-excellent-achievements/types";

export interface SchoolExcellentAchievementsRepository {
  list(tenantId: string, query: ExcellentAchievementListQuery): Promise<ExcellentAchievementListResult>;
  detail(tenantId: string, id: string): Promise<ExcellentAchievementDetail>;
  toggleLike(tenantId: string, id: string): Promise<ExcellentAchievementDetail>;
}

const localRepository: SchoolExcellentAchievementsRepository = {
  async list(_tenantId, query) {
    return listExcellentAchievements(query);
  },
  async detail(_tenantId, id) {
    const detail = getExcellentAchievementDetail(id);
    if (!detail) throw new Error("成果不存在");
    return detail;
  },
  async toggleLike(_tenantId, id) {
    return toggleExcellentAchievementLike(id);
  },
};

export const schoolExcellentAchievementsRepository: SchoolExcellentAchievementsRepository =
  localRepository;
