import {
  ALLIANCE_SCHOOL_OPTIONS,
  ALLIANCE_TEACHER_OPTIONS,
} from "@/features/teaching-research-alliance/mock-data";
import {
  createActivityMockRow,
  getActivityMockDetail,
  listActivityAllianceOptions,
  listActivityMockRows,
  saveActivityObservation,
} from "@/features/cross-school-activity/mock-data";
import type {
  ActivityAllianceOption,
  ActivityObservation,
  CrossSchoolActivityCreateInput,
  CrossSchoolActivityDetail,
  CrossSchoolActivityFilter,
  CrossSchoolActivityRow,
  PageResult,
} from "@/features/cross-school-activity/types";
import type {
  SchoolOption,
  TeacherOption,
} from "@/features/teaching-research-alliance/types";

export interface CrossSchoolActivityRepository {
  list(
    tenantId: string,
    filter: CrossSchoolActivityFilter,
    page: number,
    pageSize: number,
  ): Promise<PageResult<CrossSchoolActivityRow>>;
  detail(tenantId: string, id: string): Promise<CrossSchoolActivityDetail | undefined>;
  create(
    tenantId: string,
    input: CrossSchoolActivityCreateInput,
  ): Promise<CrossSchoolActivityRow>;
  saveObservation(
    tenantId: string,
    id: string,
    observation: ActivityObservation,
  ): Promise<CrossSchoolActivityDetail>;
  listAlliances(tenantId: string): Promise<ActivityAllianceOption[]>;
  listSchools(tenantId: string): Promise<SchoolOption[]>;
  listTeachers(tenantId: string, schoolIds: readonly string[]): Promise<TeacherOption[]>;
}

function matchesFilter(row: CrossSchoolActivityRow, filter: CrossSchoolActivityFilter) {
  const keyword = filter.name.trim();
  if (keyword && !row.name.includes(keyword)) return false;
  if (filter.type && row.type !== filter.type) return false;
  if (filter.status && row.status !== filter.status) return false;
  if (filter.allianceId && row.allianceId !== filter.allianceId) return false;
  return true;
}

function validateCreateInput(input: CrossSchoolActivityCreateInput) {
  if (!input.name.trim()) throw new Error("活动主题不能为空");
  if (!input.scheduledAt.trim()) throw new Error("请选择活动时间");
  if (!input.leadSchoolId) throw new Error("请选择牵头学校");
  if (input.memberSchoolIds.length < 2) throw new Error("请至少选择 2 所学校");
  if (input.teacherIds.length < 1) throw new Error("请至少选择 1 名参与教师");
  if (input.type === "lesson-prep" && !input.topic?.title.trim()) {
    throw new Error("请填写课题名称");
  }
  if (input.type === "lesson-observation" && !input.observation?.courseName.trim()) {
    throw new Error("请填写课程名称");
  }
}

const localCrossSchoolActivityRepository: CrossSchoolActivityRepository = {
  async list(_tenantId, filter, page, pageSize) {
    const matched = listActivityMockRows().filter((row) => matchesFilter(row, filter));
    const start = (page - 1) * pageSize;
    return {
      list: matched.slice(start, start + pageSize),
      total: matched.length,
    };
  },

  async detail(_tenantId, id) {
    return getActivityMockDetail(id);
  },

  async create(_tenantId, input) {
    validateCreateInput(input);
    return createActivityMockRow(input);
  },

  async saveObservation(_tenantId, id, observation) {
    if (!observation.courseName.trim()) throw new Error("请填写课程名称");
    if (!observation.instructorId) throw new Error("请选择授课老师");
    if (!observation.scheduledAt.trim()) throw new Error("请选择授课时间");
    if (!observation.assessmentTemplate.trim()) throw new Error("请选择考核模板");
    if (!observation.materials.length) throw new Error("请上传课程资料");
    if (!observation.reviewerId) throw new Error("请选择评课老师");
    if (!observation.reviewMethod.trim()) throw new Error("请选择评课方式");
    return saveActivityObservation(id, observation);
  },

  async listAlliances() {
    return listActivityAllianceOptions();
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

export const crossSchoolActivityRepository: CrossSchoolActivityRepository =
  localCrossSchoolActivityRepository;
