import { ref } from "vue";
import { defineStore } from "pinia";
import { crossSchoolTeamRepository } from "@/features/cross-school-team/cross-school-team-repository";
import {
  emptyTeamStats,
  type AllianceOption,
  type CrossSchoolTeamFilter,
  type CrossSchoolTeamRow,
  type CrossSchoolTeamStats,
} from "@/features/cross-school-team/types";
import { useUserStore } from "@/stores/user";

export function defaultCrossSchoolTeamFilter(): CrossSchoolTeamFilter {
  return { allianceId: "", subject: "", name: "" };
}

export const useCrossSchoolTeamStore = defineStore("cross-school-team", () => {
  const userStore = useUserStore();
  const loading = ref(false);
  const tableData = ref<CrossSchoolTeamRow[]>([]);
  const allianceOptions = ref<AllianceOption[]>([]);
  const filterForm = ref<CrossSchoolTeamFilter>(defaultCrossSchoolTeamFilter());
  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  const stats = ref<CrossSchoolTeamStats>(emptyTeamStats());
  let requestSequence = 0;

  async function loadAlliances() {
    allianceOptions.value = await crossSchoolTeamRepository.listAlliances(
      userStore.currentTenant.id,
    );
  }

  async function loadList() {
    const sequence = requestSequence + 1;
    requestSequence = sequence;
    loading.value = true;
    try {
      const result = await crossSchoolTeamRepository.list(
        userStore.currentTenant.id,
        { ...filterForm.value },
        currentPage.value,
        pageSize.value,
      );
      if (sequence !== requestSequence) return;
      tableData.value = result.list;
      total.value = result.total;
      stats.value = result.stats;
    } finally {
      if (sequence === requestSequence) loading.value = false;
    }
  }

  async function search() {
    currentPage.value = 1;
    await loadList();
  }

  async function resetFilter() {
    filterForm.value = defaultCrossSchoolTeamFilter();
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

  async function loadDetail(id: string) {
    return crossSchoolTeamRepository.getDetail(userStore.currentTenant.id, id);
  }

  return {
    loading,
    tableData,
    allianceOptions,
    filterForm,
    currentPage,
    pageSize,
    total,
    stats,
    loadAlliances,
    loadList,
    search,
    resetFilter,
    setPageSize,
    setPage,
    loadDetail,
  };
});
