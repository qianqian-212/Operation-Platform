import { ref } from "vue";
import { defineStore } from "pinia";
import { trainingStatisticsRepository } from "@/features/training-statistics/training-statistics-repository";
import {
  TRAINING_STATISTICS_SEMESTER_OPTIONS,
  type TrainingStatisticsSchoolRow,
  type TrainingStatisticsStats,
} from "@/features/training-statistics/types";
import { useUserStore } from "@/stores/user";

function emptyStats(): TrainingStatisticsStats {
  return { achievementCount: 0, teacherCount: 0, reachRatePercent: 0 };
}

export const useTrainingStatisticsStore = defineStore("training-statistics", () => {
  const userStore = useUserStore();
  const loading = ref(false);
  const stats = ref(emptyStats());
  const rows = ref<TrainingStatisticsSchoolRow[]>([]);
  const total = ref(0);
  const semester = ref<string>(TRAINING_STATISTICS_SEMESTER_OPTIONS[0].value);
  const schoolKeyword = ref("");
  const currentPage = ref(1);
  const pageSize = ref(10);

  async function loadList() {
    loading.value = true;
    try {
      const result = await trainingStatisticsRepository.list(
        userStore.currentTenant.id,
        semester.value,
        schoolKeyword.value,
        currentPage.value,
        pageSize.value,
      );
      stats.value = result.stats;
      rows.value = result.rows;
      total.value = result.total;
    } finally {
      loading.value = false;
    }
  }

  function search() {
    currentPage.value = 1;
    return loadList();
  }

  function resetFilter() {
    semester.value = TRAINING_STATISTICS_SEMESTER_OPTIONS[0].value;
    schoolKeyword.value = "";
    currentPage.value = 1;
    return loadList();
  }

  return {
    loading,
    stats,
    rows,
    total,
    semester,
    schoolKeyword,
    currentPage,
    pageSize,
    loadList,
    search,
    resetFilter,
  };
});
