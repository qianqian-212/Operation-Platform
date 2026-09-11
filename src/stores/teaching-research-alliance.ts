import { ref } from "vue";
import { defineStore } from "pinia";
import {
  teachingResearchAllianceRepository,
} from "@/features/teaching-research-alliance/teaching-research-alliance-repository";
import type {
  AllianceStatus,
  TeachingResearchAllianceCreateInput,
  TeachingResearchAllianceFilter,
  TeachingResearchAllianceRow,
} from "@/features/teaching-research-alliance/types";
import { useUserStore } from "@/stores/user";

export function defaultAllianceFilter(): TeachingResearchAllianceFilter {
  return {
    name: "",
    status: "",
  };
}

export const useTeachingResearchAllianceStore = defineStore(
  "teaching-research-alliance",
  () => {
    const userStore = useUserStore();
    const loading = ref(false);
    const tableData = ref<TeachingResearchAllianceRow[]>([]);
    const filterForm = ref<TeachingResearchAllianceFilter>(defaultAllianceFilter());
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    let requestSequence = 0;

    async function loadList() {
      const sequence = requestSequence + 1;
      requestSequence = sequence;
      loading.value = true;
      try {
        const result = await teachingResearchAllianceRepository.list(
          userStore.currentTenant.id,
          { ...filterForm.value },
          currentPage.value,
          pageSize.value,
        );
        if (sequence !== requestSequence) return;
        tableData.value = result.list;
        total.value = result.total;
      } finally {
        if (sequence === requestSequence) loading.value = false;
      }
    }

    async function search() {
      currentPage.value = 1;
      await loadList();
    }

    async function resetFilter() {
      filterForm.value = defaultAllianceFilter();
      currentPage.value = 1;
      await loadList();
    }

    async function setPageSize(size: number) {
      pageSize.value = size;
      currentPage.value = 1;
      await loadList();
    }

    async function setPage(page: number) {
      currentPage.value = page;
      await loadList();
    }

    async function createAlliance(input: TeachingResearchAllianceCreateInput) {
      const row = await teachingResearchAllianceRepository.create(
        userStore.currentTenant.id,
        input,
      );
      currentPage.value = 1;
      await loadList();
      return row;
    }

    async function setStatus(id: string, status: AllianceStatus) {
      await teachingResearchAllianceRepository.setStatus(
        userStore.currentTenant.id,
        id,
        status,
      );
      await loadList();
    }

    async function loadDetail(id: string) {
      return teachingResearchAllianceRepository.detail(userStore.currentTenant.id, id);
    }

    return {
      loading,
      tableData,
      filterForm,
      currentPage,
      pageSize,
      total,
      loadList,
      search,
      resetFilter,
      setPageSize,
      setPage,
      createAlliance,
      setStatus,
      loadDetail,
    };
  },
);
