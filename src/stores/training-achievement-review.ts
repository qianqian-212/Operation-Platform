import { ref } from "vue";
import { defineStore } from "pinia";
import { trainingAchievementReviewRepository } from "@/features/training-achievement-review/training-achievement-review-repository";
import type {
  AchievementReviewDetail,
  AchievementReviewListQuery,
  AchievementReviewRow,
  AchievementReviewStats,
  AchievementReviewType,
} from "@/features/training-achievement-review/types";
import { useUserStore } from "@/stores/user";

function emptyStats(): AchievementReviewStats {
  return {
    pendingCount: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    passRatePercent: 0,
    featuredCount: 0,
    featuredThisMonth: 0,
    likeCount: 0,
    viewCount: 0,
  };
}

export const useTrainingAchievementReviewStore = defineStore("training-achievement-review", () => {
  const userStore = useUserStore();
  const loading = ref(false);
  const stats = ref(emptyStats());
  const rows = ref<AchievementReviewRow[]>([]);
  const total = ref(0);
  const tabCounts = ref({ pending: 0, approved: 0, rejected: 0, all: 0 });
  const detail = ref<AchievementReviewDetail | null>(null);
  const featureCandidates = ref<AchievementReviewRow[]>([]);
  const filterForm = ref({
    statusTab: "pending" as AchievementReviewListQuery["statusTab"],
    schoolName: "",
    type: "" as AchievementReviewType | "",
    keyword: "",
  });
  const currentPage = ref(1);
  const pageSize = ref(10);
  let requestSequence = 0;

  function buildQuery(): AchievementReviewListQuery {
    return {
      ...filterForm.value,
      page: currentPage.value,
      pageSize: pageSize.value,
    };
  }

  async function loadList() {
    const sequence = ++requestSequence;
    loading.value = true;
    try {
      const result = await trainingAchievementReviewRepository.list(
        userStore.currentTenant.id,
        buildQuery(),
      );
      if (sequence !== requestSequence) return;
      stats.value = result.stats;
      rows.value = result.rows;
      total.value = result.total;
      tabCounts.value = result.tabCounts;
    } finally {
      if (sequence === requestSequence) loading.value = false;
    }
  }

  function search() {
    currentPage.value = 1;
    return loadList();
  }

  function resetFilter() {
    filterForm.value = { statusTab: "pending", schoolName: "", type: "", keyword: "" };
    currentPage.value = 1;
    return loadList();
  }

  function setStatusTab(tab: AchievementReviewListQuery["statusTab"]) {
    filterForm.value.statusTab = tab;
    currentPage.value = 1;
    return loadList();
  }

  function setPage(page: number) {
    currentPage.value = page;
    return loadList();
  }

  function setPageSize(size: number) {
    pageSize.value = size;
    currentPage.value = 1;
    return loadList();
  }

  async function loadDetail(id: string) {
    detail.value = await trainingAchievementReviewRepository.detail(userStore.currentTenant.id, id);
  }

  async function approve(id: string, remark: string) {
    detail.value = await trainingAchievementReviewRepository.approve(
      userStore.currentTenant.id,
      id,
      remark,
    );
    await loadList();
  }

  async function reject(id: string, remark: string) {
    detail.value = await trainingAchievementReviewRepository.reject(
      userStore.currentTenant.id,
      id,
      remark,
    );
    await loadList();
  }

  async function loadFeatureCandidates() {
    featureCandidates.value = await trainingAchievementReviewRepository.listFeatureCandidates(
      userStore.currentTenant.id,
    );
  }

  async function feature(id: string, featured: boolean, reason = "") {
    await trainingAchievementReviewRepository.feature(
      userStore.currentTenant.id,
      id,
      featured,
      reason,
    );
    await loadList();
  }

  return {
    loading,
    stats,
    rows,
    total,
    tabCounts,
    detail,
    featureCandidates,
    filterForm,
    currentPage,
    pageSize,
    loadList,
    search,
    resetFilter,
    setStatusTab,
    setPage,
    setPageSize,
    loadDetail,
    approve,
    reject,
    loadFeatureCandidates,
    feature,
  };
});
