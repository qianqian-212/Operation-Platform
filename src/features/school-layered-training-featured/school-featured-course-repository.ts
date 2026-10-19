import {
  findFeaturedLearning,
  getFeaturedCourse,
  listFeaturedCatalog,
  listFeaturedLearning,
  listFeaturedNewItems,
  listFeaturedRanking,
  listFeaturedRecommendations,
  listFeaturedReviews,
} from "@/features/school-layered-training-featured/mock-data";
import type {
  FeaturedCatalogQuery,
  FeaturedCourse,
  FeaturedFreshItem,
  FeaturedLearningCourse,
  FeaturedRecommendQuery,
  FeaturedReview,
} from "@/features/school-layered-training-featured/types";

export interface SchoolFeaturedCourseRepository {
  recommendations(tenantId: string, query: FeaturedRecommendQuery): Promise<FeaturedCourse[]>;
  ranking(tenantId: string, query: FeaturedRecommendQuery): Promise<FeaturedCourse[]>;
  catalog(tenantId: string, query: FeaturedCatalogQuery): Promise<FeaturedCourse[]>;
  fresh(tenantId: string): Promise<FeaturedFreshItem[]>;
  learning(tenantId: string): Promise<FeaturedLearningCourse[]>;
  detail(tenantId: string, id: string): Promise<FeaturedCourse | null>;
  reviews(tenantId: string, courseId: string): Promise<FeaturedReview[]>;
  learningOf(tenantId: string, courseId: string): Promise<FeaturedLearningCourse | null>;
}

const localRepository: SchoolFeaturedCourseRepository = {
  async recommendations(_tenantId, query) {
    return listFeaturedRecommendations(query);
  },
  async ranking(_tenantId, query) {
    return listFeaturedRanking(query);
  },
  async catalog(_tenantId, query) {
    return listFeaturedCatalog(query);
  },
  async fresh() {
    return listFeaturedNewItems();
  },
  async learning() {
    return listFeaturedLearning();
  },
  async detail(_tenantId, id) {
    return getFeaturedCourse(id);
  },
  async reviews(_tenantId, courseId) {
    return listFeaturedReviews(courseId);
  },
  async learningOf(_tenantId, courseId) {
    return findFeaturedLearning(courseId);
  },
};

export const schoolFeaturedCourseRepository: SchoolFeaturedCourseRepository = localRepository;
