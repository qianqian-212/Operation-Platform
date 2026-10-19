import { ref } from "vue";
import { defineStore } from "pinia";
import { schoolFeaturedCourseRepository } from "@/features/school-layered-training-featured/school-featured-course-repository";
import type {
  FeaturedCatalogQuery,
  FeaturedCourse,
  FeaturedCourseTab,
  FeaturedFreshItem,
  FeaturedLearningCourse,
  FeaturedRecommendQuery,
  FeaturedReview,
} from "@/features/school-layered-training-featured/types";
import { useUserStore } from "@/stores/user";

function emptyRecommendQuery(): FeaturedRecommendQuery {
  return {
    semester: "",
    bureau: "",
    subject: "",
    developmentStage: "",
    stage: "",
    creditBand: "",
  };
}

function emptyCatalogQuery(): FeaturedCatalogQuery {
  return { subject: "", stage: "", eligibility: "" };
}

export const useSchoolFeaturedCourseStore = defineStore("school-layered-training-featured", () => {
  const userStore = useUserStore();
  const tab = ref<FeaturedCourseTab>("recommend");
  const loading = ref(false);
  const recommendQuery = ref(emptyRecommendQuery());
  const catalogQuery = ref(emptyCatalogQuery());
  const recommendations = ref<FeaturedCourse[]>([]);
  const ranking = ref<FeaturedCourse[]>([]);
  const catalog = ref<FeaturedCourse[]>([]);
  const fresh = ref<FeaturedFreshItem[]>([]);
  const learning = ref<FeaturedLearningCourse[]>([]);
  const detail = ref<FeaturedCourse | null>(null);
  const reviews = ref<FeaturedReview[]>([]);
  const learningProgress = ref<FeaturedLearningCourse | null>(null);

  async function loadRecommend() {
    const tenantId = userStore.currentTenant.id;
    const query = recommendQuery.value;
    loading.value = true;
    try {
      const [nextCards, nextRanking, nextFresh] = await Promise.all([
        schoolFeaturedCourseRepository.recommendations(tenantId, query),
        schoolFeaturedCourseRepository.ranking(tenantId, query),
        schoolFeaturedCourseRepository.fresh(tenantId),
      ]);
      recommendations.value = nextCards;
      ranking.value = nextRanking;
      fresh.value = nextFresh;
    } finally {
      loading.value = false;
    }
  }

  async function loadCatalog() {
    loading.value = true;
    try {
      catalog.value = await schoolFeaturedCourseRepository.catalog(
        userStore.currentTenant.id,
        catalogQuery.value,
      );
    } finally {
      loading.value = false;
    }
  }

  async function loadLearning() {
    loading.value = true;
    try {
      learning.value = await schoolFeaturedCourseRepository.learning(userStore.currentTenant.id);
    } finally {
      loading.value = false;
    }
  }

  function searchRecommend() {
    return loadRecommend();
  }

  function resetRecommend() {
    recommendQuery.value = emptyRecommendQuery();
    return loadRecommend();
  }

  function searchCatalog() {
    return loadCatalog();
  }

  function resetCatalog() {
    catalogQuery.value = emptyCatalogQuery();
    return loadCatalog();
  }

  function openSubject(subject: string) {
    catalogQuery.value = { subject, stage: "", eligibility: "" };
    tab.value = "catalog";
    return loadCatalog();
  }

  async function loadDetail(id: string) {
    const tenantId = userStore.currentTenant.id;
    loading.value = true;
    try {
      detail.value = await schoolFeaturedCourseRepository.detail(tenantId, id);
      reviews.value = await schoolFeaturedCourseRepository.reviews(tenantId, id);
      learningProgress.value = await schoolFeaturedCourseRepository.learningOf(tenantId, id);
    } finally {
      loading.value = false;
    }
  }

  return {
    tab,
    loading,
    recommendQuery,
    catalogQuery,
    recommendations,
    ranking,
    catalog,
    fresh,
    learning,
    detail,
    reviews,
    learningProgress,
    loadRecommend,
    loadCatalog,
    loadLearning,
    searchRecommend,
    resetRecommend,
    searchCatalog,
    resetCatalog,
    openSubject,
    loadDetail,
  };
});
