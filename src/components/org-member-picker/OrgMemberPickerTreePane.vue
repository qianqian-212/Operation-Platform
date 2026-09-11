<template>
  <section class="pane">
    <div class="pane-scroll tree-pane">
      <div v-for="org in orgs" :key="org.id">
        <div
          class="tree-row"
          :class="{ active: activeKey === orgKey(org.id) }"
          @click="emit('focus', orgKey(org.id))"
        >
          <button
            class="expand-btn"
            type="button"
            :aria-expanded="expandedIds.includes(org.id)"
            @click.stop="emit('toggle-expand', org.id)"
          >
            <el-icon :class="{ 'is-expanded': expandedIds.includes(org.id) }">
              <ArrowRight />
            </el-icon>
          </button>
          <el-checkbox
            :model-value="selectedOrgIds.includes(org.id)"
            @change="(checked: boolean | string | number) => emit('toggle-org', org.id, checked === true)"
            @click.stop
          />
          <el-icon class="tree-icon"><OfficeBuilding /></el-icon>
          <span class="tree-strong">{{ org.name }}</span>
        </div>
        <div v-if="expandedIds.includes(org.id)" class="tree-children">
          <div
            v-for="group in org.groups"
            :key="group.name"
            class="tree-row tree-group-row"
            :class="{ active: activeKey === groupKey(org.id, group.name) }"
            @click="emit('focus', groupKey(org.id, group.name))"
          >
            <el-checkbox
              :model-value="allIdsSelected(idsOf(group.people), selectedIds)"
              :indeterminate="someIdsSelected(idsOf(group.people), selectedIds)"
              @change="(checked: boolean | string | number) => emit('toggle-ids', idsOf(group.people), checked === true)"
              @click.stop
            />
            <el-icon class="tree-icon"><Folder /></el-icon>
            <span>{{ group.name }}</span>
          </div>
        </div>
      </div>
      <div v-if="orgs.length === 0" class="empty-pane">暂无可选组织</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight, Folder, OfficeBuilding } from "@element-plus/icons-vue";
import {
  allIdsSelected,
  groupKey,
  orgKey,
  someIdsSelected,
  type OrgMemberPickerOrgNode,
} from "@/components/org-member-picker/org-member-picker-tree";
import type { OrgMemberPickerPerson } from "@/components/org-member-picker/types";

defineOptions({ name: "OrgMemberPickerTreePane" });

defineProps<{
  /** 学校及分组树 */
  orgs: OrgMemberPickerOrgNode[];
  /** 当前已选人员 */
  selectedIds: string[];
  /** 已选学校，不连带全选教师 */
  selectedOrgIds: string[];
  /** 展开的学校 */
  expandedIds: string[];
  /** 当前聚焦节点 */
  activeKey: string;
}>();

const emit = defineEmits<{
  focus: [key: string];
  "toggle-expand": [orgId: string];
  "toggle-org": [orgId: string, checked: boolean];
  "toggle-ids": [ids: string[], checked: boolean];
}>();

function idsOf(people: OrgMemberPickerPerson[]) {
  return people.map((person) => person.id);
}
</script>

<style scoped src="./org-member-picker-dialog.css"></style>
