import { ref } from "vue";
import { defineStore } from "pinia";
import { schoolTrainingStatisticsRepository } from "@/features/school-training-statistics/school-training-statistics-repository";
import {
  SCHOOL_TRAINING_STATISTICS_SEMESTER_OPTIONS,
  type SchoolTrainingStatisticsStats,
  type SchoolTrainingStatisticsSubjectRow,
} from "@/features/school-training-statistics/types";
import { useUserStore } from "@/stores/user";

function emptyStats(): SchoolTrainingStatisticsStats {
  return { achievementCount: 0, passRatePercent: 0, averageCredits: 0 };
}

export const useSchoolTrainingStatisticsStore = defineStore("school-training-statistics", () => {
  const userStore = useUserStore();
  const loading = ref(false);
  const schoolName = ref("");
  const stats = ref(emptyStats());
  const rows = ref<SchoolTrainingStatisticsSubjectRow[]>([]);
  const semester = ref<string>(SCHOOL_TRAINING_STATISTICS_SEMESTER_OPTIONS[0].value);

  async function loadList() {
    loading.value = true;
    try {
      const result = await schoolTrainingStatisticsRepository.load(
        userStore.currentTenant.id,
        semester.value,
      );
      schoolName.value = result.schoolName;
      stats.value = result.stats;
      rows.value = result.rows;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    schoolName,
    stats,
    rows,
    semester,
    loadList,
  };
});
