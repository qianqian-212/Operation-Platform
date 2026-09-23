import { ref } from "vue";
import { defineStore } from "pinia";
import {
  emptyTrainingAchievementForm,
  trainingAchievementRepository,
} from "@/features/training-achievement/training-achievement-repository";
import type {
  TrainingAchievementFilter,
  TrainingAchievementFormInput,
  TrainingAchievementRow,
} from "@/features/training-achievement/types";
import { useUserStore } from "@/stores/user";

export function defaultTrainingAchievementFilter(): TrainingAchievementFilter {
  return {
    status: "",
    type: "",
    semester: "",
    title: "",
  };
}

export const useTrainingAchievementStore = defineStore("training-achievement", () => {
  const userStore = useUserStore();
  const loading = ref(false);
  const tableData = ref<TrainingAchievementRow[]>([]);
  const filterForm = ref<TrainingAchievementFilter>(defaultTrainingAchievementFilter());
  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  let requestSequence = 0;

  async function loadList() {
    const sequence = requestSequence + 1;
    requestSequence = sequence;
    loading.value = true;
    try {
      const result = await trainingAchievementRepository.list(
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
    filterForm.value = defaultTrainingAchievementFilter();
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
    return trainingAchievementRepository.detail(userStore.currentTenant.id, id);
  }

  async function submit(input: TrainingAchievementFormInput, id?: string) {
    const tenantId = userStore.currentTenant.id;
    const detail = id
      ? await trainingAchievementRepository.update(tenantId, id, input)
      : await trainingAchievementRepository.create(tenantId, input);
    currentPage.value = 1;
    await loadList();
    return detail;
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
    loadDetail,
    submit,
    emptyForm: emptyTrainingAchievementForm,
  };
});
