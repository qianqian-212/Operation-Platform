<template>
  <div v-loading="loading" class="lt-group-page">
    <LayeredTrainingGroupSidebar
      :groups="groups"
      :selected-id="selectedGroupId"
      @create="createOpen = true"
      @select="selectGroup"
      @delete="confirmDelete"
    />
    <LayeredTrainingGroupMembers
      :group-name="selectedGroup?.name ?? ''"
      :members="members"
      :total="memberTotal"
      :current-page="currentPage"
      :page-size="pageSize"
      @update:page="setPage"
      @update:page-size="setPageSize"
      @open-history="historyOpen = true"
      @open-member="memberOpen = true"
      @open-import="importOpen = true"
    />
    <LayeredTrainingGroupCreateDialog v-model="createOpen" :saving="saving" @confirm="handleCreate" />
    <LayeredTrainingGroupMemberDialog v-model="memberOpen" :saving="saving" @confirm="handleAddMember" />
    <LayeredTrainingGroupImportDialog v-model="importOpen" :saving="saving" @confirm="handleImport" />
    <LayeredTrainingGroupImportHistoryDialog v-model="historyOpen" :records="imports" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { ElMessage, ElMessageBox } from "element-plus";
import type {
  LayeredTrainingGroupImportPayload,
  LayeredTrainingGroupMemberDraft,
} from "@/features/layered-training-group/types";
import { useLayeredTrainingGroupStore } from "@/stores/layered-training-group";
import LayeredTrainingGroupCreateDialog from "@/views/bureau/ai-teacher-development/LayeredTrainingGroupCreateDialog.vue";
import LayeredTrainingGroupImportDialog from "@/views/bureau/ai-teacher-development/LayeredTrainingGroupImportDialog.vue";
import LayeredTrainingGroupImportHistoryDialog from "@/views/bureau/ai-teacher-development/LayeredTrainingGroupImportHistoryDialog.vue";
import LayeredTrainingGroupMemberDialog from "@/views/bureau/ai-teacher-development/LayeredTrainingGroupMemberDialog.vue";
import LayeredTrainingGroupMembers from "@/views/bureau/ai-teacher-development/LayeredTrainingGroupMembers.vue";
import LayeredTrainingGroupSidebar from "@/views/bureau/ai-teacher-development/LayeredTrainingGroupSidebar.vue";

defineOptions({ name: "LayeredTrainingGroupView" });

const createOpen = ref(false);
const memberOpen = ref(false);
const importOpen = ref(false);
const historyOpen = ref(false);
const saving = ref(false);
const groupStore = useLayeredTrainingGroupStore();
const {
  loading,
  groups,
  selectedGroupId,
  members,
  memberTotal,
  imports,
  currentPage,
  pageSize,
} = storeToRefs(groupStore);
const { load, selectGroup, createGroup, removeGroup, addMember, importMembers, setPage, setPageSize } =
  groupStore;

const selectedGroup = computed(() =>
  groups.value.find((group) => group.id === selectedGroupId.value) ?? null,
);

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

async function run(action: () => Promise<void>, fallback: string) {
  saving.value = true;
  try {
    await action();
    return true;
  } catch (error) {
    ElMessage.error(errorMessage(error, fallback));
    return false;
  } finally {
    saving.value = false;
  }
}

async function handleCreate(name: string) {
  const saved = await run(() => createGroup(name), "新增分组失败");
  if (saved) createOpen.value = false;
}

async function handleAddMember(draft: LayeredTrainingGroupMemberDraft) {
  const saved = await run(() => addMember(draft), "添加成员失败");
  if (saved) memberOpen.value = false;
}

async function handleImport(payload: LayeredTrainingGroupImportPayload) {
  const saved = await run(() => importMembers(payload), "导入名单失败");
  if (saved) {
    importOpen.value = false;
    ElMessage.success("名单已导入");
  }
}

async function confirmDelete(groupId: string) {
  const group = groups.value.find((item) => item.id === groupId);
  if (!group) return;
  if (group.courseLinked) {
    ElMessage.warning("该分组已关联课程，无法删除");
    return;
  }
  try {
    await ElMessageBox.confirm(`确认删除分组「${group.name}」？分组内的成员会一并删除。`, "删除分组", {
      type: "warning",
    });
  } catch {
    return;
  }
  const removed = await run(() => removeGroup(groupId), "删除分组失败");
  if (removed) ElMessage.success("已删除");
}

onMounted(() => {
  void load();
});
</script>

<style src="./layered-training-group.css"></style>
