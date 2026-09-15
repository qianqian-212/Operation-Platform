import {
  getLessonObservationMockDetail,
  listLessonObservationAllianceOptions,
  listLessonObservationMockRows,
  listLessonObservationSchoolOptions,
} from "@/features/lesson-observation/mock-data";
import type {
  LessonObservationDetail,
  LessonObservationFilter,
  LessonObservationOption,
  LessonObservationPageResult,
  LessonObservationRow,
} from "@/features/lesson-observation/types";

export interface LessonObservationRepository {
  list(
    tenantId: string,
    filter: LessonObservationFilter,
    page: number,
    pageSize: number,
  ): Promise<LessonObservationPageResult>;
  detail(tenantId: string, id: string): Promise<LessonObservationDetail | undefined>;
  listAlliances(tenantId: string): Promise<LessonObservationOption[]>;
  listSchools(tenantId: string): Promise<LessonObservationOption[]>;
}

function matchesTeacher(row: LessonObservationRow, teacherName: string) {
  if (!teacherName) return true;
  return row.instructorName.includes(teacherName);
}

function matchesDateRange(row: LessonObservationRow, startDate: string, endDate: string) {
  if (startDate && row.lessonDate < startDate) return false;
  if (endDate && row.lessonDate > endDate) return false;
  return true;
}

function matchesFilter(row: LessonObservationRow, filter: LessonObservationFilter) {
  if (!matchesTeacher(row, filter.teacherName.trim())) return false;
  if (filter.allianceId && row.allianceId !== filter.allianceId) return false;
  if (filter.schoolId && row.schoolId !== filter.schoolId) return false;
  if (filter.reviewMethod && row.reviewMethod !== filter.reviewMethod) return false;
  return matchesDateRange(row, filter.startDate, filter.endDate);
}

const localLessonObservationRepository: LessonObservationRepository = {
  async list(_tenantId, filter, page, pageSize) {
    const matched = listLessonObservationMockRows().filter((row) => matchesFilter(row, filter));
    const start = (page - 1) * pageSize;
    return {
      list: matched.slice(start, start + pageSize),
      total: matched.length,
    };
  },

  async detail(_tenantId, id) {
    return getLessonObservationMockDetail(id);
  },

  async listAlliances() {
    return listLessonObservationAllianceOptions();
  },

  async listSchools() {
    return listLessonObservationSchoolOptions();
  },
};

export const lessonObservationRepository: LessonObservationRepository =
  localLessonObservationRepository;
