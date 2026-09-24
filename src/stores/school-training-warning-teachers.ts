import { ref } from "vue";
import { defineStore } from "pinia";
import { schoolTrainingWarningTeachersRepository } from "@/features/school-training-warning-teachers/school-training-warning-teachers-repository";
import type {
  SchoolWarningTeacherBanner,
  SchoolWarningTeacherDetail,
  SchoolWarningTeacherRow,
  SchoolWarningTeacherStatus,
} from "@/features/school-training-warning-teachers/types";
import type { TrainingWarningOverviewStats } from "@/features/training-warning/types";
import { useUserStore } from "@/stores/user";

function emptyStats(): TrainingWarningOverviewStats {
  return { teacherCount: 0, reachedCount: 0, unreachedCount: 0, reachRatePercent: 0 };
}

export const useSchoolTrainingWarningTeachersStore = defineStore(
  "school-training-warning-teachers",
  () => {
    const userStore = useUserStore();
    const loading = ref(false);
    const schoolName = ref("");
    const banner = ref<SchoolWarningTeacherBanner | null>(null);
    const stats = ref(emptyStats());
    const teachers = ref<SchoolWarningTeacherRow[]>([]);
    const total = ref(0);
    const teacherPage = ref(1);
    const teacherPageSize = ref(10);
    const teacherStatus = ref<SchoolWarningTeacherStatus | "">("");
    const teacherSubject = ref("");
    const teacherName = ref("");
    const semester = ref("");
    const teacherDetail = ref<SchoolWarningTeacherDetail | null>(null);

    async function loadList() {
      loading.value = true;
      try {
        const result = await schoolTrainingWarningTeachersRepository.list(
          userStore.currentTenant.id,
          teacherStatus.value,
          teacherSubject.value,
          teacherName.value,
          teacherPage.value,
          teacherPageSize.value,
        );
        schoolName.value = result.schoolName;
        banner.value = result.banner;
        stats.value = result.stats;
        teachers.value = result.teachers;
        total.value = result.total;
      } finally {
        loading.value = false;
      }
    }

    function search() {
      teacherPage.value = 1;
      return loadList();
    }

    function resetFilter() {
      teacherStatus.value = "";
      teacherSubject.value = "";
      teacherName.value = "";
      semester.value = "";
      teacherPage.value = 1;
      return loadList();
    }

    async function loadTeacherDetail(teacherId: string) {
      teacherDetail.value = await schoolTrainingWarningTeachersRepository.teacherDetail(
        userStore.currentTenant.id,
        teacherId,
      );
    }

    return {
      loading,
      schoolName,
      banner,
      stats,
      teachers,
      total,
      teacherPage,
      teacherPageSize,
      teacherStatus,
      teacherSubject,
      teacherName,
      semester,
      teacherDetail,
      loadList,
      search,
      resetFilter,
      loadTeacherDetail,
    };
  },
);
