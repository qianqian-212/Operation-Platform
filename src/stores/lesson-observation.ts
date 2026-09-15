import { ref } from "vue";
import { defineStore } from "pinia";
import { lessonObservationRepository } from "@/features/lesson-observation/lesson-observation-repository";
import {
  defaultLessonObservationFilter,
  type LessonObservationFilter,
  type LessonObservationOption,
  type LessonObservationRow,
} from "@/features/lesson-observation/types";
import { useUserStore } from "@/stores/user";

export const useLessonObservationStore = defineStore("lesson-observation", () => {
  const userStore = useUserStore();
  const loading = ref(false);
  const tableData = ref<LessonObservationRow[]>([]);
  const allianceOptions = ref<LessonObservationOption[]>([]);
  const schoolOptions = ref<LessonObservationOption[]>([]);
  const filterForm = ref<LessonObservationFilter>(defaultLessonObservationFilter());
  const currentPage = ref(1);
  const pageSize = ref(10);
  const total = ref(0);
  let requestSequence = 0;

  async function loadOptions() {
    const tenantId = userStore.currentTenant.id;
    const [alliances, schools] = await Promise.all([
      lessonObservationRepository.listAlliances(tenantId),
      lessonObservationRepository.listSchools(tenantId),
    ]);
    allianceOptions.value = alliances;
    schoolOptions.value = schools;
  }

  async function loadList() {
    const sequence = requestSequence + 1;
    requestSequence = sequence;
    loading.value = true;
    try {
      const result = await lessonObservationRepository.list(
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
    filterForm.value = defaultLessonObservationFilter();
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
    return lessonObservationRepository.detail(userStore.currentTenant.id, id);
  }

  return {
    loading,
    tableData,
    allianceOptions,
    schoolOptions,
    filterForm,
    currentPage,
    pageSize,
    total,
    loadOptions,
    loadList,
    search,
    resetFilter,
    setPageSize,
    setPage,
    loadDetail,
  };
});
