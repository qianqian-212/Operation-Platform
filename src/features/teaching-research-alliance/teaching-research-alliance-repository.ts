import {
  ALLIANCE_SCHOOL_OPTIONS,
  ALLIANCE_TEACHER_OPTIONS,
  createAllianceMockRow,
  getAllianceMockDetail,
  listAllianceMockRows,
  setAllianceMockStatus,
  summarizeAllianceMockStats,
} from "@/features/teaching-research-alliance/mock-data";
import type {
  AllianceStatus,
  SchoolOption,
  TeacherOption,
  TeachingResearchAllianceCreateInput,
  TeachingResearchAllianceDetail,
  TeachingResearchAllianceFilter,
  TeachingResearchAllianceListResult,
  TeachingResearchAllianceRow,
} from "@/features/teaching-research-alliance/types";

export interface TeachingResearchAllianceRepository {
  list(
    tenantId: string,
    filter: TeachingResearchAllianceFilter,
    page: number,
    pageSize: number,
  ): Promise<TeachingResearchAllianceListResult>;
  detail(tenantId: string, id: string): Promise<TeachingResearchAllianceDetail | undefined>;
  create(
    tenantId: string,
    input: TeachingResearchAllianceCreateInput,
  ): Promise<TeachingResearchAllianceRow>;
  setStatus(tenantId: string, id: string, status: AllianceStatus): Promise<boolean>;
  listSchools(tenantId: string): Promise<SchoolOption[]>;
  listTeachers(tenantId: string, schoolIds: readonly string[]): Promise<TeacherOption[]>;
}

function matchesFilter(row: TeachingResearchAllianceRow, filter: TeachingResearchAllianceFilter) {
  const keyword = filter.name.trim();
  if (keyword && !row.name.includes(keyword)) return false;
  if (filter.status && row.status !== filter.status) return false;
  return true;
}

const localTeachingResearchAllianceRepository: TeachingResearchAllianceRepository = {
  async list(_tenantId, filter, page, pageSize) {
    const matched = listAllianceMockRows().filter((row) => matchesFilter(row, filter));
    const start = (page - 1) * pageSize;
    return {
      list: matched.slice(start, start + pageSize),
      total: matched.length,
      stats: summarizeAllianceMockStats(),
    };
  },

  async detail(_tenantId, id) {
    return getAllianceMockDetail(id);
  },

  async create(_tenantId, input) {
    const name = input.name.trim();
    if (!name) throw new Error("联盟名称不能为空");
    if (!input.leadSchoolId) throw new Error("请选择牵头学校");
    if (!input.adminId) throw new Error("请选择管理员");
    if (input.memberSchoolIds.length === 0) throw new Error("请选择成员学校");
    if (input.teacherIds.length === 0) throw new Error("请选择参与教师");
    return createAllianceMockRow(input);
  },

  async setStatus(_tenantId, id, status) {
    return setAllianceMockStatus(id, status);
  },

  async listSchools() {
    return ALLIANCE_SCHOOL_OPTIONS.map((school) => ({ ...school }));
  },

  async listTeachers(_tenantId, schoolIds) {
    const schoolIdSet = new Set(schoolIds);
    return ALLIANCE_TEACHER_OPTIONS.filter((teacher) => schoolIdSet.has(teacher.schoolId)).map(
      (teacher) => ({ ...teacher }),
    );
  },
};

export const teachingResearchAllianceRepository: TeachingResearchAllianceRepository =
  localTeachingResearchAllianceRepository;
