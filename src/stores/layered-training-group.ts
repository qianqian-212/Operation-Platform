import { ref } from "vue";
import { defineStore } from "pinia";
import { layeredTrainingGroupRepository } from "@/features/layered-training-group/layered-training-group-repository";
import type {
  LayeredTrainingGroup,
  LayeredTrainingGroupImportPayload,
  LayeredTrainingGroupImportRecord,
  LayeredTrainingGroupMember,
  LayeredTrainingGroupMemberDraft,
} from "@/features/layered-training-group/types";
import { useUserStore } from "@/stores/user";

export const useLayeredTrainingGroupStore = defineStore("layered-training-group", () => {
  const userStore = useUserStore();
  const loading = ref(false);
  const groups = ref<LayeredTrainingGroup[]>([]);
  const selectedGroupId = ref("");
  const members = ref<LayeredTrainingGroupMember[]>([]);
  const memberTotal = ref(0);
  const imports = ref<LayeredTrainingGroupImportRecord[]>([]);
  const currentPage = ref(1);
  const pageSize = ref(10);
  let requestSequence = 0;

  function tenantId() {
    return userStore.currentTenant.id;
  }

  async function loadMembers(sequence: number) {
    const result = await layeredTrainingGroupRepository.listMembers(tenantId(), {
      groupId: selectedGroupId.value,
      page: currentPage.value,
      pageSize: pageSize.value,
    });
    if (sequence !== requestSequence) return;
    members.value = result.rows;
    memberTotal.value = result.total;
  }

  async function load() {
    const sequence = ++requestSequence;
    loading.value = true;
    try {
      const [nextGroups, nextImports] = await Promise.all([
        layeredTrainingGroupRepository.listGroups(tenantId()),
        layeredTrainingGroupRepository.listImports(tenantId()),
      ]);
      if (sequence !== requestSequence) return;
      groups.value = nextGroups;
      imports.value = nextImports;
      const selectedExists = nextGroups.some((group) => group.id === selectedGroupId.value);
      if (!selectedExists) selectedGroupId.value = nextGroups[0]?.id ?? "";
      await loadMembers(sequence);
    } finally {
      if (sequence === requestSequence) loading.value = false;
    }
  }

  function selectGroup(groupId: string) {
    selectedGroupId.value = groupId;
    currentPage.value = 1;
    return load();
  }

  async function createGroup(name: string) {
    const created = await layeredTrainingGroupRepository.createGroup(tenantId(), name);
    selectedGroupId.value = created.id;
    currentPage.value = 1;
    await load();
  }

  async function removeGroup(groupId: string) {
    await layeredTrainingGroupRepository.removeGroup(tenantId(), groupId);
    if (selectedGroupId.value === groupId) selectedGroupId.value = "";
    currentPage.value = 1;
    await load();
  }

  async function addMember(draft: LayeredTrainingGroupMemberDraft) {
    await layeredTrainingGroupRepository.addMember(tenantId(), selectedGroupId.value, draft);
    currentPage.value = Math.max(1, Math.ceil((memberTotal.value + 1) / pageSize.value));
    await load();
  }

  async function importMembers(payload: LayeredTrainingGroupImportPayload) {
    await layeredTrainingGroupRepository.importMembers(tenantId(), payload);
    currentPage.value = 1;
    await load();
  }

  function setPage(page: number) {
    currentPage.value = page;
    return load();
  }

  function setPageSize(size: number) {
    pageSize.value = size;
    currentPage.value = 1;
    return load();
  }

  return {
    loading,
    groups,
    selectedGroupId,
    members,
    memberTotal,
    imports,
    currentPage,
    pageSize,
    load,
    selectGroup,
    createGroup,
    removeGroup,
    addMember,
    importMembers,
    setPage,
    setPageSize,
  };
});
