import {
  getAchievementReviewDetail,
  listAchievementReviews,
  listApprovedAchievementsForFeature,
  reviewAchievement,
  setAchievementFeatured,
} from "@/features/training-achievement-review/mock-data";
import type {
  AchievementReviewDetail,
  AchievementReviewListQuery,
  AchievementReviewListResult,
  AchievementReviewRow,
} from "@/features/training-achievement-review/types";

export interface TrainingAchievementReviewRepository {
  list(tenantId: string, query: AchievementReviewListQuery): Promise<AchievementReviewListResult>;
  detail(tenantId: string, id: string): Promise<AchievementReviewDetail>;
  approve(tenantId: string, id: string, remark: string): Promise<AchievementReviewDetail>;
  reject(tenantId: string, id: string, remark: string): Promise<AchievementReviewDetail>;
  feature(
    tenantId: string,
    id: string,
    featured: boolean,
    reason?: string,
  ): Promise<AchievementReviewDetail>;
  listFeatureCandidates(tenantId: string): Promise<AchievementReviewRow[]>;
}

const localRepository: TrainingAchievementReviewRepository = {
  async list(_tenantId, query) {
    return listAchievementReviews(query);
  },
  async detail(_tenantId, id) {
    const detail = getAchievementReviewDetail(id);
    if (!detail) throw new Error("成果不存在");
    return detail;
  },
  async approve(_tenantId, id, remark) {
    return reviewAchievement(id, true, remark);
  },
  async reject(_tenantId, id, remark) {
    return reviewAchievement(id, false, remark);
  },
  async feature(_tenantId, id, featured, reason = "") {
    return setAchievementFeatured(id, featured, reason);
  },
  async listFeatureCandidates(_tenantId) {
    return listApprovedAchievementsForFeature();
  },
};

export const trainingAchievementReviewRepository: TrainingAchievementReviewRepository =
  localRepository;
