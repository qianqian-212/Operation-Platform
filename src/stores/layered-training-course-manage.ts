import { ref } from "vue";
import { defineStore } from "pinia";
import { layeredTrainingCourseManageRepository } from "@/features/layered-training-course-manage/layered-training-course-manage-repository";
import type { LayeredTrainingCourseManageRepository } from "@/features/layered-training-course-manage/layered-training-course-manage-repository";
import { schoolLayeredTrainingCourseManageRepository } from "@/features/layered-training-course-manage/school-layered-training-course-manage-repository";
import type {
  ManagedCourse,
  ManagedCourseForm,
  ManagedCourseKind,
  ManagedCourseListQuery,
  ManagedCourseRow,
  ManagedCourseShelfAction,
  ManagedCourseStatus,
} from "@/features/layered-training-course-manage/types";
import { useUserStore } from "@/stores/user";

interface ManagedCourseFilterForm {
  kind: ManagedCourseKind | "";
  reviewStatus: ManagedCourseStatus | "";
}

function emptyFilter(): ManagedCourseFilterForm {
  return { kind: "", reviewStatus: "" };
}

function createCourseManageStore(repository: LayeredTrainingCourseManageRepository) {
  return () => {
    const userStore = useUserStore();
    const loading = ref(false);
    const rows = ref<ManagedCourseRow[]>([]);
    const total = ref(0);
    const detail = ref<ManagedCourse | null>(null);
    const filterForm = ref(emptyFilter());
    const currentPage = ref(1);
    const pageSize = ref(10);
    let requestSequence = 0;

    function buildQuery(): ManagedCourseListQuery {
      return {
        kind: filterForm.value.kind,
        reviewStatus: filterForm.value.reviewStatus,
        page: currentPage.value,
        pageSize: pageSize.value,
      };
    }

    async function loadList() {
      const sequence = ++requestSequence;
      loading.value = true;
      try {
        const result = await repository.list(
          userStore.currentTenant.id,
          buildQuery(),
        );
        if (sequence !== requestSequence) return;
        rows.value = result.rows;
        total.value = result.total;
      } finally {
        if (sequence === requestSequence) loading.value = false;
      }
    }

    function search() {
      currentPage.value = 1;
      return loadList();
    }

    function resetFilter() {
      filterForm.value = emptyFilter();
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
      detail.value = await repository.detail(
        userStore.currentTenant.id,
        id,
      );
      return detail.value;
    }

    function save(id: string, form: ManagedCourseForm, intent: "draft" | "submit") {
      return repository.save(
        userStore.currentTenant.id,
        id,
        form,
        intent,
      );
    }

    async function submit(id: string) {
      await repository.submit(userStore.currentTenant.id, id);
      await loadList();
    }

    async function remove(id: string) {
      await repository.remove(userStore.currentTenant.id, id);
      await loadList();
    }

    async function setShelf(id: string, action: ManagedCourseShelfAction) {
      await repository.setShelf(userStore.currentTenant.id, id, action);
      await loadList();
    }

    return {
      loading,
      rows,
      total,
      detail,
      filterForm,
      currentPage,
      pageSize,
      loadList,
      search,
      resetFilter,
      setPage,
      setPageSize,
      loadDetail,
      save,
      submit,
      remove,
      setShelf,
    };
  };
}

export const useLayeredTrainingCourseManageStore = defineStore(
  "layered-training-course-manage",
  createCourseManageStore(layeredTrainingCourseManageRepository),
);

export const useSchoolLayeredTrainingCourseManageStore = defineStore(
  "school-layered-training-course-manage",
  createCourseManageStore(schoolLayeredTrainingCourseManageRepository),
);
