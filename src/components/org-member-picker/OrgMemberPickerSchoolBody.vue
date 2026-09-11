<template>
  <div class="picker-body">
    <section class="pane">
      <div class="pane-head">
        <h3 class="pane-title">组织范围</h3>
        <p v-if="leftDesc" class="pane-desc">{{ leftDesc }}</p>
      </div>
      <div class="pane-scroll">
        <label class="tree-row">
          <el-checkbox
            :model-value="allChecked"
            :indeterminate="someChecked"
            @change="toggleAll"
          />
          <span class="tree-strong">{{ rootLabel }}</span>
        </label>
        <div v-for="group in schoolGroups" :key="group.label" class="tree-group">
          <div class="tree-row tree-child">
            <span class="tree-strong">{{ group.label }}</span>
          </div>
          <label v-for="school in group.schools" :key="school.id" class="tree-row tree-school">
            <el-checkbox
              :model-value="selectedIds.includes(school.id)"
              @change="(checked: boolean | string | number) => toggle(school.id, checked === true)"
            />
            <span>{{ school.name }}</span>
          </label>
        </div>
      </div>
    </section>

    <section class="pane">
      <div class="pane-head">
        <el-input v-model="keyword" clearable :prefix-icon="Search" placeholder="搜索学校名称" />
        <div class="segmented">
          <button
            v-for="segment in segments"
            :key="segment.value"
            type="button"
            class="segment"
            :class="{ active: activeSegment === segment.value }"
            @click="activeSegment = segment.value"
          >
            {{ segment.label }}
          </button>
        </div>
      </div>
      <div class="pane-scroll">
        <label v-for="school in filteredSchools" :key="school.id" class="candidate-row">
          <el-checkbox
            :model-value="selectedIds.includes(school.id)"
            @change="(checked: boolean | string | number) => toggle(school.id, checked === true)"
          />
          <div class="candidate-main">
            <div class="candidate-name">{{ school.name }}</div>
            <div class="candidate-meta">{{ school.stageLabel }} · {{ school.groupLabel }}</div>
          </div>
        </label>
        <div v-if="filteredSchools.length === 0" class="empty-pane">没有匹配的学校</div>
      </div>
    </section>

    <section class="pane pane-last">
      <div class="pane-head">
        <div class="selected-toolbar">
          <span class="selected-count">已选数量：{{ selectedIds.length }}</span>
          <button type="button" class="clear-link" @click="clearSelected">清空</button>
        </div>
        <p v-if="rightDesc" class="pane-desc">{{ rightDesc }}</p>
      </div>
      <div class="pane-scroll">
        <div v-for="school in selectedSchools" :key="school.id" class="selected-row">
          <div class="selected-info">
            <div class="selected-name">{{ school.name }}</div>
            <div class="selected-meta">{{ school.stageLabel }} · {{ school.groupLabel }}</div>
          </div>
          <div class="selected-actions">
            <el-radio v-model="leadId" :value="school.id">牵头校</el-radio>
            <button type="button" class="remove-btn" @click="toggle(school.id, false)">×</button>
          </div>
        </div>
        <div v-if="selectedIds.length === 0" class="empty-pane">尚未选择</div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Search } from "@element-plus/icons-vue";
import type { OrgMemberPickerSchool } from "@/components/org-member-picker/types";

defineOptions({ name: "OrgMemberPickerSchoolBody" });

const props = defineProps<{
  /** 学校候选项 */
  schools: OrgMemberPickerSchool[];
  /** 左侧说明 */
  leftDesc: string;
  /** 右侧说明 */
  rightDesc: string;
  /** 根节点名称 */
  rootLabel: string;
}>();

const selectedIds = defineModel<string[]>("selectedIds", { required: true });
const leadId = defineModel<string | null>("leadId", { required: true });
const keyword = ref("");
const activeSegment = ref("all");
const segments = [
  { label: "全部", value: "all" },
  { label: "小学", value: "小学" },
  { label: "中学", value: "中学" },
  { label: "九年一贯", value: "九年一贯" },
];

const schoolGroups = computed(() => {
  const map = new Map<string, OrgMemberPickerSchool[]>();
  for (const school of props.schools) {
    const list = map.get(school.groupLabel) ?? [];
    list.push(school);
    map.set(school.groupLabel, list);
  }
  return Array.from(map.entries()).map(([label, schools]) => ({ label, schools }));
});

const filteredSchools = computed(() => {
  const q = keyword.value.trim();
  return props.schools.filter((school) => {
    const matchSegment =
      activeSegment.value === "all" || school.stageLabel === activeSegment.value;
    return matchSegment && (!q || school.name.includes(q) || school.groupLabel.includes(q));
  });
});

const selectedSchools = computed(() =>
  selectedIds.value
    .map((id) => props.schools.find((school) => school.id === id))
    .filter((school): school is OrgMemberPickerSchool => Boolean(school)),
);

const allChecked = computed(
  () => props.schools.length > 0 && selectedIds.value.length === props.schools.length,
);
const someChecked = computed(
  () => selectedIds.value.length > 0 && selectedIds.value.length < props.schools.length,
);

function toggle(id: string, checked: boolean) {
  if (checked) {
    if (!selectedIds.value.includes(id)) selectedIds.value = [...selectedIds.value, id];
    return;
  }
  selectedIds.value = selectedIds.value.filter((item) => item !== id);
  if (leadId.value === id) leadId.value = null;
}

function toggleAll(checked: boolean | string | number) {
  selectedIds.value = checked === true ? props.schools.map((school) => school.id) : [];
  if (checked !== true) leadId.value = null;
}

function clearSelected() {
  selectedIds.value = [];
  leadId.value = null;
}
</script>

<style scoped src="./org-member-picker-dialog.css"></style>
