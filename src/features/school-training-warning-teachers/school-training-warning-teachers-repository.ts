import {
  getSchoolWarningTeacherDetail,
  listSchoolWarningTeachers,
} from "@/features/school-training-warning-teachers/mock-data";
import type {
  SchoolWarningTeacherDetail,
  SchoolWarningTeacherListResult,
  SchoolWarningTeacherStatus,
} from "@/features/school-training-warning-teachers/types";

export interface SchoolTrainingWarningTeachersRepository {
  list(
    tenantId: string,
    status: SchoolWarningTeacherStatus | "",
    subject: string,
    teacherName: string,
    page: number,
    pageSize: number,
  ): Promise<SchoolWarningTeacherListResult>;
  teacherDetail(tenantId: string, teacherId: string): Promise<SchoolWarningTeacherDetail>;
}

const localRepository: SchoolTrainingWarningTeachersRepository = {
  async list(_tenantId, status, subject, teacherName, page, pageSize) {
    return listSchoolWarningTeachers(status, subject, teacherName, page, pageSize);
  },
  async teacherDetail(_tenantId, teacherId) {
    return getSchoolWarningTeacherDetail(teacherId);
  },
};

export const schoolTrainingWarningTeachersRepository: SchoolTrainingWarningTeachersRepository =
  localRepository;
