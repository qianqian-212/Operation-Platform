import { ref } from "vue";
import { defineStore } from "pinia";
import { collectiveLessonPrepRepository } from "@/features/collective-lesson-prep/collective-lesson-prep-repository";
import {
  DEFAULT_CURRICULUM_NODE_ID,
  DEFAULT_EXPANDED_CURRICULUM_KEYS,
  type CollectiveLessonPrepFilter,
  type CollectiveLessonPrepItem,
  type CollectiveLessonPrepStats,
  type CurriculumNode,
} from "@/features/collective-lesson-prep/types";
import { useUserStore } from "@/stores/user";

export function defaultCollectiveLessonPrepFilter(): CollectiveLessonPrepFilter {
  return {
    status: "",
    subject: "",
    keyword: "",
    curriculumNodeId: DEFAULT_CURRICULUM_NODE_ID,
  };
}

export function emptyCollectiveLessonPrepStats(): CollectiveLessonPrepStats {
  return { total: 0, ongoing: 0, completed: 0, pending: 0 };
}

export const useCollectiveLessonPrepStore = defineStore("collective-lesson-prep", () => {
  const userStore = useUserStore();
  const loading = ref(false);
  const tableData = ref<CollectiveLessonPrepItem[]>([]);
  const curriculumTree = ref<CurriculumNode[]>([]);
  const expandedKeys = ref<string[]>([...DEFAULT_EXPANDED_CURRICULUM_KEYS]);
  const selectedNodeId = ref(DEFAULT_CURRICULUM_NODE_ID);
  const stats = ref<CollectiveLessonPrepStats>(emptyCollectiveLessonPrepStats());
  const filterForm = ref<CollectiveLessonPrepFilter>(defaultCollectiveLessonPrepFilter());
  let requestSequence = 0;

  async function loadCurriculum() {
    curriculumTree.value = await collectiveLessonPrepRepository.listCurriculum(
      userStore.currentTenant.id,
    );
  }

  async function loadList() {
    const sequence = requestSequence + 1;
    requestSequence = sequence;
    loading.value = true;
    try {
      const result = await collectiveLessonPrepRepository.list(
        userStore.currentTenant.id,
        { ...filterForm.value },
      );
      if (sequence !== requestSequence) return;
      tableData.value = result.list;
      stats.value = result.stats;
    } finally {
      if (sequence === requestSequence) loading.value = false;
    }
  }

  async function search() {
    await loadList();
  }

  async function selectCurriculumNode(nodeId: string) {
    selectedNodeId.value = nodeId;
    filterForm.value.curriculumNodeId = nodeId;
    await loadList();
  }

  return {
    loading,
    tableData,
    curriculumTree,
    expandedKeys,
    selectedNodeId,
    stats,
    filterForm,
    loadCurriculum,
    loadList,
    search,
    selectCurriculumNode,
  };
});
