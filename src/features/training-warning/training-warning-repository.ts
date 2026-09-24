import {
  getTrainingWarningSchoolDetail,
  getTrainingWarningTeacherDetail,
  listTrainingWarningSchools,
} from "@/features/training-warning/mock-data";
import type {
  TrainingWarningSchoolDetail,
  TrainingWarningSchoolListResult,
  TrainingWarningSortKey,
  TrainingWarningTeacherDetail,
} from "@/features/training-warning/types";

export interface TrainingWarningRepository {
  listSchools(
    tenantId: string,
    schoolKeyword: string,
    sort: TrainingWarningSortKey,
    page: number,
    pageSize: number,
  ): Promise<TrainingWarningSchoolListResult>;
  schoolDetail(
    tenantId: string,
    schoolId: string,
    page: number,
    pageSize: number,
    status: "" | "reached" | "unreached",
    subject: string,
    teacherName: string,
  ): Promise<TrainingWarningSchoolDetail>;
  teacherDetail(tenantId: string, teacherId: string): Promise<TrainingWarningTeacherDetail>;
}

const localRepository: TrainingWarningRepository = {
  async listSchools(_tenantId, schoolKeyword, sort, page, pageSize) {
    return listTrainingWarningSchools(schoolKeyword, sort, page, pageSize);
  },
  async schoolDetail(_tenantId, schoolId, page, pageSize, status, subject, teacherName) {
    return getTrainingWarningSchoolDetail(schoolId, page, pageSize, status, subject, teacherName);
  },
  async teacherDetail(_tenantId, teacherId) {
    return getTrainingWarningTeacherDetail(teacherId);
  },
};

export const trainingWarningRepository: TrainingWarningRepository = localRepository;
