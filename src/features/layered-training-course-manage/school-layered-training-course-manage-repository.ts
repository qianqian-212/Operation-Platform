import {
  getSchoolManagedCourse,
  listSchoolManagedCourses,
  removeSchoolManagedCourse,
  saveSchoolManagedCourse,
  submitSchoolManagedCourse,
} from "@/features/layered-training-course-manage/mock-data";
import type { LayeredTrainingCourseManageRepository } from "@/features/layered-training-course-manage/layered-training-course-manage-repository";

const schoolRepository: LayeredTrainingCourseManageRepository = {
  async list(_tenantId, query) {
    return listSchoolManagedCourses(query);
  },
  async detail(_tenantId, id) {
    return getSchoolManagedCourse(id);
  },
  async save(_tenantId, id, form, intent) {
    return saveSchoolManagedCourse(id, form, intent);
  },
  async submit(_tenantId, id) {
    return submitSchoolManagedCourse(id);
  },
  async remove(_tenantId, id) {
    removeSchoolManagedCourse(id);
  },
  async setShelf() {
    throw new Error("学校端不支持上下架");
  },
};

export const schoolLayeredTrainingCourseManageRepository: LayeredTrainingCourseManageRepository =
  schoolRepository;
