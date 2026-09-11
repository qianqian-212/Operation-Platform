import { ref } from "vue";
import { defineStore } from "pinia";
import { crossSchoolActivityRepository } from "@/features/cross-school-activity/cross-school-activity-repository";
import type {
  ActivityAllianceOption,
  CrossSchoolActivityCreateInput,
  CrossSchoolActivityFilter,
  CrossSchoolActivityRow,
} from "@/features/cross-school-activity/types";
import { useUserStore } from "@/stores/user";

export function defaultActivityFilter(): CrossSchoolActivityFilter {
  return {
    name: "",
    type: "",
    status: "",
    allianceId: "",
  };
}

export const useCrossSchoolActivityStore = defineStore("cross-school-activity", () => {
  const userStore = useUserStore();
  const loading = ref(false);
  const tableData = ref<CrossSchoolActivityRow[]>([]);
  const allianceOptions = ref<ActivityAllianceOption[]>([]);
  const filterForm = ref<CrossSchoolActivityFilter>(defaultActivityFilter());
  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  let requestSequence = 0;

  async function loadAlliances() {
    allianceOptions.value = await crossSchoolActivityRepository.listAlliances(
      userStore.currentTenant.id,
    );
  }

  async function loadList() {
    const sequence = requestSequence + 1;
    requestSequence = sequence;
    loading.value = true;
    try {
      const result = await crossSchoolActivityRepository.list(
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
    filterForm.value = defaultActivityFilter();
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

  async function createActivity(input: CrossSchoolActivityCreateInput) {
    const row = await crossSchoolActivityRepository.create(userStore.currentTenant.id, input);
    currentPage.value = 1;
    await loadList();
    return row;
  }

  async function loadDetail(id: string) {
    return crossSchoolActivityRepository.detail(userStore.currentTenant.id, id);
  }

  return {
    loading,
    tableData,
    allianceOptions,
    filterForm,
    currentPage,
    pageSize,
    total,
    loadAlliances,
    loadList,
    search,
    resetFilter,
    setPageSize,
    setPage,
    createActivity,
    loadDetail,
  };
});
