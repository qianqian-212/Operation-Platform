import {
  getLayeredTrainingCourseDetail,
  listLayeredTrainingCourses,
  reviewLayeredTrainingCourse,
} from "@/features/layered-training-course-review/mock-data";
import type {
  LayeredTrainingCourseDetail,
  LayeredTrainingCourseListQuery,
  LayeredTrainingCourseListResult,
} from "@/features/layered-training-course-review/types";

export interface LayeredTrainingCourseReviewRepository {
  list(
    tenantId: string,
    query: LayeredTrainingCourseListQuery,
  ): Promise<LayeredTrainingCourseListResult>;
  detail(tenantId: string, id: string): Promise<LayeredTrainingCourseDetail | null>;
  approve(tenantId: string, id: string, comment: string): Promise<LayeredTrainingCourseDetail>;
  reject(tenantId: string, id: string, comment: string): Promise<LayeredTrainingCourseDetail>;
}

const localRepository: LayeredTrainingCourseReviewRepository = {
  async list(_tenantId, query) {
    return listLayeredTrainingCourses(query);
  },
  async detail(_tenantId, id) {
    return getLayeredTrainingCourseDetail(id);
  },
  async approve(_tenantId, id, comment) {
    return reviewLayeredTrainingCourse(id, true, comment);
  },
  async reject(_tenantId, id, comment) {
    return reviewLayeredTrainingCourse(id, false, comment);
  },
};

export const layeredTrainingCourseReviewRepository: LayeredTrainingCourseReviewRepository =
  localRepository;
