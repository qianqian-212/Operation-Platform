<template>
  <section class="cross-school-activities" aria-label="近期跨校活动">
    <ul class="activity-items">
      <li v-for="item in data.items" :key="item.id">
        <button
          type="button"
          class="activity-card workbench-surface-card"
          :aria-label="`查看活动详情：${item.title}`"
          @click="openDetail(item.title)"
        >
          <div class="activity-meta">
            <el-tag size="small" :type="workbenchTagType(item.statusTone)">
              {{ item.statusLabel }}
            </el-tag>
            <small>{{ item.meta }}</small>
          </div>
          <strong :title="item.title">{{ item.title }}</strong>
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { workbenchTagType } from "@/features/workbench/workbench-tag";
import type { WorkbenchCrossSchoolActivitiesData } from "@/features/workbench/types";

defineOptions({ name: "WorkbenchCrossSchoolActivities" });

defineProps<{
  data: WorkbenchCrossSchoolActivitiesData;
}>();

function openDetail(title: string) {
  ElMessage.info(`活动详情页即将开放：${title}`);
}
</script>

<style scoped>
.cross-school-activities {
  display: flex;
  flex-direction: column;
  height: 100%;
  --workbench-item-card-min-width: 24rem;
}

.activity-items {
  display: flex;
  flex-wrap: wrap;
  align-content: start;
  gap: var(--spacing-12);
  padding: 0;
  margin: 0;
  list-style: none;
}

.activity-items > li {
  min-width: min(100%, var(--workbench-item-card-min-width));
  flex: 1 1 var(--workbench-item-card-min-width);
}

.activity-card {
  display: flex;
  width: 100%;
  min-width: 0;
  height: 100%;
  flex-direction: column;
  gap: var(--spacing-8);
  padding: var(--spacing-12) var(--spacing-16);
  color: inherit;
  font: inherit;
  text-align: start;
  cursor: pointer;
}

.activity-card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.activity-meta {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: var(--spacing-8);
}

.activity-meta small {
  min-width: 0;
  overflow: hidden;
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-card > strong {
  min-width: 0;
  overflow: hidden;
  color: var(--color-title);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-md);
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
