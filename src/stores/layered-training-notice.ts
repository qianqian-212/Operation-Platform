import { ref } from "vue";
import { defineStore } from "pinia";
import { layeredTrainingNoticeRepository } from "@/features/layered-training-notice/layered-training-notice-repository";
import type {
  LayeredTrainingNoticeQuery,
  LayeredTrainingNoticeRow,
  LayeredTrainingNoticeType,
} from "@/features/layered-training-notice/types";
import { useUserStore } from "@/stores/user";

interface NoticeFilterForm {
  schoolName: string;
  noticeType: LayeredTrainingNoticeType | "";
}

function emptyFilter(): NoticeFilterForm {
  return { schoolName: "", noticeType: "" };
}

export const useLayeredTrainingNoticeStore = defineStore("layered-training-notice", () => {
  const userStore = useUserStore();
  const loading = ref(false);
  const rows = ref<LayeredTrainingNoticeRow[]>([]);
  const total = ref(0);
  const schools = ref<string[]>([]);
  const filterForm = ref(emptyFilter());
  const currentPage = ref(1);
  const pageSize = ref(10);
  let requestSequence = 0;

  function buildQuery(): LayeredTrainingNoticeQuery {
    return {
      schoolName: filterForm.value.schoolName,
      noticeType: filterForm.value.noticeType,
      page: currentPage.value,
      pageSize: pageSize.value,
    };
  }

  async function loadList() {
    const sequence = ++requestSequence;
    loading.value = true;
    try {
      const result = await layeredTrainingNoticeRepository.list(
        userStore.currentTenant.id,
        buildQuery(),
      );
      if (sequence !== requestSequence) return;
      rows.value = result.rows;
      total.value = result.total;
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

  return {
    loading,
    rows,
    total,
    schools,
    filterForm,
    currentPage,
    pageSize,
    loadList,
    search,
    resetFilter,
    setPage,
    setPageSize,
  };
});
