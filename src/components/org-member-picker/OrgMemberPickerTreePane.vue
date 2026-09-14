<template>
  <section class="pane">
    <div class="pane-head">
      <el-input v-model="treeKeyword" clearable :prefix-icon="Search" placeholder="请输入" />
    </div>
    <div class="pane-scroll tree-pane">
      <div v-for="org in visibleOrgs" :key="org.id">
        <div
          class="tree-row"
          :class="{ active: activeKey === orgKey(org.id) }"
          @click="emit('focus', orgKey(org.id))"
        >
          <button
            class="expand-btn"
            type="button"
            :aria-expanded="isExpanded(org.id)"
            @click.stop="emit('toggle-expand', org.id)"
          >
            <el-icon :class="{ 'is-expanded': isExpanded(org.id) }">
              <ArrowRight />
            </el-icon>
          </button>
          <el-checkbox
            :model-value="allIdsSelected(idsOf(org.people), selectedIds)"
            :indeterminate="someIdsSelected(idsOf(org.people), selectedIds)"
            @change="(checked: boolean | string | number) => emit('toggle-org', org.id, checked === true)"
            @click.stop
          />
          <el-icon class="tree-icon"><OfficeBuilding /></el-icon>
          <span class="tree-strong">{{ org.name }}</span>
        </div>
        <div v-if="isExpanded(org.id)" class="tree-children">
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
      <div v-if="visibleOrgs.length === 0" class="empty-pane">
        {{ treeKeyword.trim() ? "没有匹配的组织" : "暂无可选组织" }}
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ArrowRight, Folder, OfficeBuilding, Search } from "@element-plus/icons-vue";
import {
  allIdsSelected,
  filterMemberOrgs,
  groupKey,
  orgKey,
  someIdsSelected,
  type OrgMemberPickerOrgNode,
} from "@/components/org-member-picker/org-member-picker-tree";
import type { OrgMemberPickerPerson } from "@/components/org-member-picker/types";

defineOptions({ name: "OrgMemberPickerTreePane" });

const props = defineProps<{
  /** 学校及分组树 */
  orgs: OrgMemberPickerOrgNode[];
  /** 当前已选人员 */
  selectedIds: string[];
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

const treeKeyword = ref("");
const visibleOrgs = computed(() => filterMemberOrgs(props.orgs, treeKeyword.value));

watch(
  visibleOrgs,
  (orgs) => {
    if (!orgs.length) return;
    const active = props.activeKey;
    const stillVisible = orgs.some(
      (org) => active === orgKey(org.id) || active.startsWith(`group:${org.id}:`),
    );
    const firstOrg = orgs[0];
    if (!stillVisible && firstOrg) emit("focus", orgKey(firstOrg.id));
  },
  { flush: "post" },
);

function idsOf(people: OrgMemberPickerPerson[]) {
  return people.map((person) => person.id);
}

function isExpanded(orgId: string) {
  return Boolean(treeKeyword.value.trim()) || props.expandedIds.includes(orgId);
}
</script>

<style scoped src="./org-member-picker-dialog.css"></style>
