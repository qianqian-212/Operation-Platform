import {
  getManagedCourse,
  listManagedCourses,
  removeManagedCourse,
  saveManagedCourse,
  setManagedCourseShelf,
  submitManagedCourse,
} from "@/features/layered-training-course-manage/mock-data";
import type {
  ManagedCourse,
  ManagedCourseForm,
  ManagedCourseListQuery,
  ManagedCourseListResult,
  ManagedCourseShelfAction,
} from "@/features/layered-training-course-manage/types";

export interface LayeredTrainingCourseManageRepository {
  list(tenantId: string, query: ManagedCourseListQuery): Promise<ManagedCourseListResult>;
  detail(tenantId: string, id: string): Promise<ManagedCourse | null>;
  save(
    tenantId: string,
    id: string,
    form: ManagedCourseForm,
    intent: "draft" | "submit",
  ): Promise<ManagedCourse>;
  submit(tenantId: string, id: string): Promise<ManagedCourse>;
  remove(tenantId: string, id: string): Promise<void>;
  setShelf(tenantId: string, id: string, action: ManagedCourseShelfAction): Promise<ManagedCourse>;
}

const localRepository: LayeredTrainingCourseManageRepository = {
  async list(_tenantId, query) {
    return listManagedCourses(query);
  },
  async detail(_tenantId, id) {
    return getManagedCourse(id);
  },
  async save(_tenantId, id, form, intent) {
    return saveManagedCourse(id, form, intent);
  },
  async submit(_tenantId, id) {
    return submitManagedCourse(id);
  },
  async remove(_tenantId, id) {
    removeManagedCourse(id);
  },
  async setShelf(_tenantId, id, action) {
    return setManagedCourseShelf(id, action);
  },
};

export const layeredTrainingCourseManageRepository: LayeredTrainingCourseManageRepository =
  localRepository;
