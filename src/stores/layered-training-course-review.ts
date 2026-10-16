import { ref } from "vue";
import { defineStore } from "pinia";
import { layeredTrainingCourseReviewRepository } from "@/features/layered-training-course-review/layered-training-course-review-repository";
import type {
  LayeredTrainingCourseDetail,
  LayeredTrainingCourseKind,
  LayeredTrainingCourseListQuery,
  LayeredTrainingCourseRow,
  LayeredTrainingCourseStatus,
} from "@/features/layered-training-course-review/types";
import { useUserStore } from "@/stores/user";

interface CourseFilterForm {
  statusTab: LayeredTrainingCourseStatus;
  schoolName: string;
  kind: LayeredTrainingCourseKind | "";
}

function emptyCounts(): Record<LayeredTrainingCourseStatus, number> {
  return { pending: 0, approved: 0, rejected: 0 };
}

function emptyFilter(): CourseFilterForm {
  return { statusTab: "pending", schoolName: "", kind: "" };
}

export const useLayeredTrainingCourseReviewStore = defineStore(
  "layered-training-course-review",
  () => {
    const userStore = useUserStore();
    const loading = ref(false);
    const rows = ref<LayeredTrainingCourseRow[]>([]);
    const total = ref(0);
    const tabCounts = ref(emptyCounts());
    const schools = ref<string[]>([]);
    const detail = ref<LayeredTrainingCourseDetail | null>(null);
    const filterForm = ref(emptyFilter());
    const currentPage = ref(1);
    const pageSize = ref(10);
    let requestSequence = 0;

    function buildQuery(): LayeredTrainingCourseListQuery {
      return {
        statusTab: filterForm.value.statusTab,
        schoolName: filterForm.value.schoolName,
        kind: filterForm.value.kind,
        page: currentPage.value,
        pageSize: pageSize.value,
      };
    }

    async function loadList() {
      const sequence = ++requestSequence;
      loading.value = true;
      try {
        const result = await layeredTrainingCourseReviewRepository.list(
          userStore.currentTenant.id,
          buildQuery(),
        );
        if (sequence !== requestSequence) return;
        rows.value = result.rows;
        total.value = result.total;
        tabCounts.value = result.tabCounts;
        schools.value = result.schools;
      } finally {
        if (sequence === requestSequence) loading.value = false;
      }
    }

    function search() {
      currentPage.value = 1;
      return loadList();
    }

    function resetFilter() {
      const statusTab = filterForm.value.statusTab;
      filterForm.value = { ...emptyFilter(), statusTab };
      currentPage.value = 1;
      return loadList();
    }

    function setStatusTab(tab: LayeredTrainingCourseStatus) {
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
      detail.value = await layeredTrainingCourseReviewRepository.detail(
        userStore.currentTenant.id,
        id,
      );
    }

    async function approve(id: string, comment: string) {
      detail.value = await layeredTrainingCourseReviewRepository.approve(
        userStore.currentTenant.id,
        id,
        comment,
      );
      await loadList();
    }

    async function reject(id: string, comment: string) {
      detail.value = await layeredTrainingCourseReviewRepository.reject(
        userStore.currentTenant.id,
        id,
        comment,
      );
      await loadList();
    }

    return {
      loading,
      rows,
      total,
      tabCounts,
      schools,
      detail,
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
    };
  },
);
