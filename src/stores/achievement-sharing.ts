import { ref } from "vue";
import { defineStore } from "pinia";
import { achievementSharingRepository } from "@/features/achievement-sharing/achievement-sharing-repository";
import type {
  AchievementSharingFilter,
  AchievementSharingItem,
  AchievementSharingStats,
  CurriculumNode,
} from "@/features/achievement-sharing/types";
import {
  DEFAULT_CURRICULUM_NODE_ID,
  DEFAULT_EXPANDED_CURRICULUM_KEYS,
} from "@/features/collective-lesson-prep/types";
import { useUserStore } from "@/stores/user";

export function defaultAchievementSharingFilter(): AchievementSharingFilter {
  return {
    type: "",
    keyword: "",
    curriculumNodeId: DEFAULT_CURRICULUM_NODE_ID,
  };
}

export function emptyAchievementSharingStats(): AchievementSharingStats {
  return { total: 0, materialCount: 0, paperCount: 0, downloadCount: 0 };
}

export const useAchievementSharingStore = defineStore("achievement-sharing", () => {
  const userStore = useUserStore();
  const loading = ref(false);
  const tableData = ref<AchievementSharingItem[]>([]);
  const curriculumTree = ref<CurriculumNode[]>([]);
  const expandedKeys = ref<string[]>([...DEFAULT_EXPANDED_CURRICULUM_KEYS]);
  const selectedNodeId = ref(DEFAULT_CURRICULUM_NODE_ID);
  const stats = ref<AchievementSharingStats>(emptyAchievementSharingStats());
  const filterForm = ref<AchievementSharingFilter>(defaultAchievementSharingFilter());
  let requestSequence = 0;

  async function loadCurriculum() {
    curriculumTree.value = await achievementSharingRepository.listCurriculum(
      userStore.currentTenant.id,
    );
  }

  async function loadList() {
    const sequence = requestSequence + 1;
    requestSequence = sequence;
    loading.value = true;
    try {
      const result = await achievementSharingRepository.list(
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
