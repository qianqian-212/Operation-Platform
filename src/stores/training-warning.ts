import { ref } from "vue";
import { defineStore } from "pinia";
import { trainingWarningRepository } from "@/features/training-warning/training-warning-repository";
import type {
  TrainingWarningOverviewStats,
  TrainingWarningBanner,
  TrainingWarningSchoolRow,
  TrainingWarningSortKey,
  TrainingWarningTeacherDetail,
  TrainingWarningTeacherRow,
} from "@/features/training-warning/types";
import { useUserStore } from "@/stores/user";

function emptyStats(): TrainingWarningOverviewStats {
  return { teacherCount: 0, reachedCount: 0, unreachedCount: 0, reachRatePercent: 0 };
}

export const useTrainingWarningStore = defineStore("training-warning", () => {
  const userStore = useUserStore();
  const loading = ref(false);
  const banner = ref<TrainingWarningBanner | null>(null);
  const stats = ref(emptyStats());
  const schoolRows = ref<TrainingWarningSchoolRow[]>([]);
  const schoolTotal = ref(0);
  const schoolKeyword = ref("");
  const sortKey = ref<TrainingWarningSortKey>("reach-rate");
  const schoolPage = ref(1);
  const schoolPageSize = ref(10);

  const schoolDetailName = ref("");
  const schoolDetailId = ref("");
  const schoolStats = ref(emptyStats());
  const teachers = ref<TrainingWarningTeacherRow[]>([]);
  const teacherTotal = ref(0);
  const teacherPage = ref(1);
  const teacherPageSize = ref(10);
  const teacherStatus = ref<"" | "reached" | "unreached">("");
  const teacherSubject = ref("");
  const teacherName = ref("");
  const teacherDetail = ref<TrainingWarningTeacherDetail | null>(null);

  async function loadSchools() {
    loading.value = true;
    try {
      const result = await trainingWarningRepository.listSchools(
        userStore.currentTenant.id,
        schoolKeyword.value,
        sortKey.value,
        schoolPage.value,
        schoolPageSize.value,
      );
      banner.value = result.banner;
      stats.value = result.stats;
      schoolRows.value = result.rows;
      schoolTotal.value = result.total;
    } finally {
      loading.value = false;
    }
  }

  function searchSchools() {
    schoolPage.value = 1;
    return loadSchools();
  }

  function resetSchoolFilter() {
    schoolKeyword.value = "";
    sortKey.value = "reach-rate";
    schoolPage.value = 1;
    return loadSchools();
  }

  async function loadSchoolDetail(schoolId: string) {
    if (!schoolId) {
      schoolDetailId.value = "";
      schoolDetailName.value = "";
      schoolStats.value = emptyStats();
      teachers.value = [];
      teacherTotal.value = 0;
      return;
    }
    loading.value = true;
    try {
      const result = await trainingWarningRepository.schoolDetail(
        userStore.currentTenant.id,
        schoolId,
        teacherPage.value,
        teacherPageSize.value,
        teacherStatus.value,
        teacherSubject.value,
        teacherName.value,
      );
      schoolDetailId.value = result.schoolId;
      schoolDetailName.value = result.schoolName;
      schoolStats.value = result.stats;
      teachers.value = result.teachers;
      teacherTotal.value = result.total;
    } finally {
      loading.value = false;
    }
  }

  function searchTeachers() {
    teacherPage.value = 1;
    return loadSchoolDetail(schoolDetailId.value);
  }

  function resetTeacherFilter() {
    teacherStatus.value = "";
    teacherSubject.value = "";
    teacherName.value = "";
    teacherPage.value = 1;
    return loadSchoolDetail(schoolDetailId.value);
  }

  async function loadTeacherDetail(teacherId: string) {
    teacherDetail.value = await trainingWarningRepository.teacherDetail(
      userStore.currentTenant.id,
      teacherId,
    );
  }

  return {
    loading,
    banner,
    stats,
    schoolRows,
    schoolTotal,
    schoolKeyword,
    sortKey,
    schoolPage,
    schoolPageSize,
    schoolDetailName,
    schoolDetailId,
    schoolStats,
    teachers,
    teacherTotal,
    teacherPage,
    teacherPageSize,
    teacherStatus,
    teacherSubject,
    teacherName,
    teacherDetail,
    loadSchools,
    searchSchools,
    resetSchoolFilter,
    loadSchoolDetail,
    searchTeachers,
    resetTeacherFilter,
    loadTeacherDetail,
  };
});
