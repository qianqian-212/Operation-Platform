<template>
  <div class="task-center">
    <WorkbenchSecondaryTabs
      v-model="activeCategory"
      :options="categoryOptions"
      :panel-id="panelId"
      aria-label="消息分类"
    />
    <div :id="panelId" class="task-panel" role="tabpanel" aria-label="消息与待办列表">
      <WorkbenchItemCards
        :items="filteredItems"
        empty-text="暂无事项"
        interactive
        @select="openDetail"
      >
        <template #empty>
          <p class="task-empty-title">{{ emptyDescription }}</p>
          <p class="task-empty-hint">{{ emptyHint }}</p>
        </template>
      </WorkbenchItemCards>
    </div>

    <el-drawer v-model="drawerVisible" :title="detailTitle" size="min(420px, 90vw)" append-to-body>
      <template v-if="selectedItem">
        <div class="task-detail-meta">
          <el-tag size="small" :type="workbenchTagType(selectedItem.tone)">
            {{ workbenchItemLabel(selectedItem) }}
          </el-tag>
          <span>{{ selectedItem.meta }}</span>
        </div>
        <h3>{{ selectedItem.title }}</h3>
        <p>{{ selectedItem.summary ?? defaultDetail }}</p>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from "vue";
import WorkbenchItemCards from "@/features/workbench/components/WorkbenchItemCards.vue";
import WorkbenchSecondaryTabs from "@/features/workbench/components/WorkbenchSecondaryTabs.vue";
import { workbenchItemLabel, workbenchTagType } from "@/features/workbench/workbench-tag";
import type { WorkbenchInboxCategory, WorkbenchInboxData } from "@/features/workbench/types";

defineOptions({ name: "WorkbenchTaskCenter" });

const props = defineProps<{ data: WorkbenchInboxData }>();
const activeCategory = ref<"all" | WorkbenchInboxCategory>("all");
const drawerVisible = ref(false);
const selectedItemId = ref<string | null>(null);
const panelId = useId();
const categoryOptions = [
  { label: "全部", value: "all" },
  { label: "通知消息", value: "notice" },
  { label: "待办", value: "todo" },
  { label: "日常", value: "daily" },
];
const items = computed(() => props.data.items);
const filteredItems = computed(() => activeCategory.value === "all"
  ? items.value
  : items.value.filter((item) => item.category === activeCategory.value));
const selectedItem = computed(() =>
  items.value.find((item) => item.id === selectedItemId.value) ?? null,
);
const detailTitle = computed(() =>
  selectedItem.value?.category === "notice" ? "消息详情" : "待办详情",
);
const emptyDescription = computed(() => emptyText(activeCategory.value));
const emptyHint = computed(() => emptyHintText(activeCategory.value));
const defaultDetail = "该事项已进入个人工作队列，请在办理时限前完成材料核验、补充处理意见并确认结果。";

function emptyText(category: "all" | WorkbenchInboxCategory) {
  if (category === "notice") return "暂无通知消息";
  if (category === "todo") return "暂无待办";
  if (category === "daily") return "暂无日常事项";
  return "暂无事项";
}

function emptyHintText(category: "all" | WorkbenchInboxCategory) {
  if (category === "notice") return "切换到「全部」可查看待办和其他事项。";
  if (category === "todo") return "切换到「全部」可查看通知和日常事项。";
  if (category === "daily") return "切换到「全部」可查看通知和待办。";
  return "新的通知和待办会显示在这里。";
}

function openDetail(id: string) {
  selectedItemId.value = id;
  drawerVisible.value = true;
}
</script>

<style scoped>
.task-center {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  gap: var(--spacing-12);
}

.task-panel {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}

.task-empty-title,
.task-empty-hint {
  margin: 0;
}

.task-empty-title {
  color: var(--color-title);
  font-size: var(--font-size-sm);
}

.task-empty-hint {
  color: var(--color-body);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-xs);
}

.task-detail-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  margin-bottom: var(--spacing-12);
}

.task-detail-meta span {
  color: var(--color-body);
  font-size: var(--font-size-xs);
}

.task-detail-meta + h3 {
  margin: 0 0 var(--spacing-12);
  color: var(--color-title);
  font-size: var(--font-size-lg);
}

.task-detail-meta ~ p {
  margin: 0;
  color: var(--color-body);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-lg);
}
</style>
