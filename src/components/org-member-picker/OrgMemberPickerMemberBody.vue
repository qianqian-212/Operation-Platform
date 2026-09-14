<template>
  <div class="picker-body">
    <OrgMemberPickerTreePane
      :orgs="orgs"
      :selected-ids="selectedIds"
      :expanded-ids="expandedIds"
      :active-key="activeKey"
      @focus="emit('focus', $event)"
      @toggle-expand="emit('toggle-expand', $event)"
      @toggle-org="(orgId, checked) => emit('toggle-org', orgId, checked)"
      @toggle-ids="(ids, checked) => emit('toggle-ids', ids, checked)"
    />
    <OrgMemberPickerCandidatePane
      v-model:keyword="keyword"
      :people="people"
      :selected-ids="selectedIds"
      :locked-ids="lockedIds"
      @toggle="(id, checked) => emit('toggle', id, checked)"
      @toggle-all="emit('toggle-all', $event)"
    />
    <OrgMemberPickerSelectedPane
      :groups="groups"
      :selected-count="selectedIds.length"
      :locked-ids="lockedIds"
      @remove="emit('remove', $event)"
      @remove-org="emit('remove-org', $event)"
      @clear="emit('clear')"
    />
  </div>
</template>

<script setup lang="ts">
import OrgMemberPickerCandidatePane from "@/components/org-member-picker/OrgMemberPickerCandidatePane.vue";
import OrgMemberPickerSelectedPane from "@/components/org-member-picker/OrgMemberPickerSelectedPane.vue";
import OrgMemberPickerTreePane from "@/components/org-member-picker/OrgMemberPickerTreePane.vue";
import type {
  OrgMemberPickerOrgNode,
  OrgMemberPickerSelectedGroup,
} from "@/components/org-member-picker/org-member-picker-tree";
import type { OrgMemberPickerPerson } from "@/components/org-member-picker/types";

defineOptions({ name: "OrgMemberPickerMemberBody" });

defineProps<{
  /** 左侧组织树 */
  orgs: OrgMemberPickerOrgNode[];
  /** 中间栏人员 */
  people: OrgMemberPickerPerson[];
  /** 已选人员 */
  selectedIds: string[];
  /** 展开学校 */
  expandedIds: string[];
  /** 当前聚焦节点 */
  activeKey: string;
  /** 右侧分组 */
  groups: OrgMemberPickerSelectedGroup[];
  /** 锁定人员 */
  lockedIds: string[];
}>();

const keyword = defineModel<string>("keyword", { required: true });

const emit = defineEmits<{
  focus: [key: string];
  "toggle-expand": [orgId: string];
  "toggle-org": [orgId: string, checked: boolean];
  "toggle-ids": [ids: string[], checked: boolean];
  toggle: [id: string, checked: boolean];
  "toggle-all": [checked: boolean];
  remove: [id: string];
  "remove-org": [orgId: string];
  clear: [];
}>();
</script>

<style scoped src="./org-member-picker-dialog.css"></style>
