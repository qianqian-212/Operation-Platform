<template>
  <section class="pane pane-last">
    <div class="pane-head">
      <div class="selected-toolbar">
        <span class="selected-count">已选数量：{{ selectedCount }}</span>
        <button type="button" class="clear-link" @click="emit('clear')">清空</button>
      </div>
    </div>
    <div class="pane-scroll">
      <div v-for="group in groups" :key="group.orgId" class="selected-group">
        <div class="selected-org-head">
          <span>{{ group.orgName }}</span>
          <button type="button" class="remove-btn" @click="emit('remove-org', group.orgId)">
            ×
          </button>
        </div>
        <div v-for="person in group.people" :key="person.id" class="selected-row">
          <div class="selected-info">
            <div class="avatar">{{ avatarText(person.name) }}</div>
            <div class="selected-name">{{ person.name }}</div>
          </div>
          <button
            type="button"
            class="remove-btn"
            :disabled="lockedIds.includes(person.id)"
            @click="emit('remove', person.id)"
          >
            ×
          </button>
        </div>
      </div>
      <div v-if="groups.length === 0" class="empty-pane">尚未选择</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { OrgMemberPickerSelectedGroup } from "@/components/org-member-picker/org-member-picker-tree";

defineOptions({ name: "OrgMemberPickerSelectedPane" });

defineProps<{
  /** 按学校分组的已选人员 */
  groups: OrgMemberPickerSelectedGroup[];
  /** 已选总数 */
  selectedCount: number;
  /** 不可移除人员 */
  lockedIds: string[];
}>();

const emit = defineEmits<{
  remove: [id: string];
  "remove-org": [orgId: string];
  clear: [];
}>();

function avatarText(name: string) {
  return name.slice(-2);
}
</script>

<style scoped src="./org-member-picker-dialog.css"></style>
