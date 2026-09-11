<template>
  <section class="pane">
    <div class="pane-head">
      <el-input v-model="keyword" clearable :prefix-icon="Search" placeholder="请输入" />
    </div>
    <div class="pane-scroll">
      <label class="candidate-row candidate-all">
        <el-checkbox
          :model-value="allChecked"
          :indeterminate="someChecked"
          @change="emit('toggle-all', $event === true)"
        />
        <span class="candidate-name">全选</span>
      </label>
      <label v-for="person in people" :key="person.id" class="candidate-row">
        <el-checkbox
          :model-value="selectedIds.includes(person.id)"
          :disabled="lockedIds.includes(person.id)"
          @change="(checked: boolean | string | number) => emit('toggle', person.id, checked === true)"
        />
        <div class="avatar">{{ avatarText(person.name) }}</div>
        <div class="candidate-main">
          <div class="candidate-name">{{ person.name }}</div>
        </div>
        <el-tag effect="plain">{{ personGroupName(person) }}</el-tag>
      </label>
      <div v-if="people.length === 0" class="empty-pane">没有匹配的人员</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Search } from "@element-plus/icons-vue";
import { allIdsSelected, personGroupName, someIdsSelected } from "@/components/org-member-picker/org-member-picker-tree";
import type { OrgMemberPickerPerson } from "@/components/org-member-picker/types";

defineOptions({ name: "OrgMemberPickerCandidatePane" });

const props = defineProps<{
  /** 当前中间栏人员 */
  people: OrgMemberPickerPerson[];
  /** 已选人员 */
  selectedIds: string[];
  /** 不可取消的人员 */
  lockedIds: string[];
}>();

const emit = defineEmits<{
  toggle: [id: string, checked: boolean];
  "toggle-all": [checked: boolean];
}>();

const keyword = defineModel<string>("keyword", { required: true });
const peopleIds = computed(() => props.people.map((person) => person.id));
const allChecked = computed(() => allIdsSelected(peopleIds.value, props.selectedIds));
const someChecked = computed(() => someIdsSelected(peopleIds.value, props.selectedIds));

function avatarText(name: string) {
  return name.slice(-2);
}
</script>

<style scoped src="./org-member-picker-dialog.css"></style>
