import {
  getSchoolAchievementAuditDetail,
  listSchoolAchievementAudits,
  reviewSchoolAchievement,
} from "@/features/school-training-achievement-audit/mock-data";
import type {
  SchoolAchievementAuditDetail,
  SchoolAchievementAuditListQuery,
  SchoolAchievementAuditListResult,
} from "@/features/school-training-achievement-audit/types";

export interface SchoolTrainingAchievementAuditRepository {
  list(
    tenantId: string,
    query: SchoolAchievementAuditListQuery,
  ): Promise<SchoolAchievementAuditListResult>;
  detail(tenantId: string, id: string): Promise<SchoolAchievementAuditDetail>;
  approve(tenantId: string, id: string, remark: string): Promise<SchoolAchievementAuditDetail>;
  reject(tenantId: string, id: string, remark: string): Promise<SchoolAchievementAuditDetail>;
}

const localRepository: SchoolTrainingAchievementAuditRepository = {
  async list(_tenantId, query) {
    return listSchoolAchievementAudits(query);
  },
  async detail(_tenantId, id) {
    const detail = getSchoolAchievementAuditDetail(id);
    if (!detail) throw new Error("成果不存在");
    return detail;
  },
  async approve(_tenantId, id, remark) {
    return reviewSchoolAchievement(id, true, remark);
  },
  async reject(_tenantId, id, remark) {
    return reviewSchoolAchievement(id, false, remark);
  },
};

export const schoolTrainingAchievementAuditRepository: SchoolTrainingAchievementAuditRepository =
  localRepository;
