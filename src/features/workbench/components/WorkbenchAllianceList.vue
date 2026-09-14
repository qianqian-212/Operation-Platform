<template>
  <section class="alliance-list" aria-label="教研联盟概览">
    <ul class="alliance-list-items">
      <li v-for="item in data.items" :key="item.id" class="alliance-list-card">
        <div class="alliance-list-topline">
          <strong :title="item.title">{{ item.title }}</strong>
          <el-tag size="small" :type="workbenchTagType(item.statusTone)">
            {{ item.statusLabel }}
          </el-tag>
        </div>
        <p class="alliance-list-description">{{ item.description }}</p>
        <dl class="alliance-list-stats">
          <div v-for="stat in item.stats" :key="`${item.id}-${stat.label}`">
            <dd>{{ stat.value }}</dd>
            <dt>{{ stat.label }}</dt>
          </div>
        </dl>
        <div class="alliance-list-meta">
          <small>{{ item.createdAt }}</small>
          <small>管理员：{{ item.adminName }}</small>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { workbenchTagType } from "@/features/workbench/workbench-tag";
import type { WorkbenchAllianceListData } from "@/features/workbench/types";

defineOptions({ name: "WorkbenchAllianceList" });

defineProps<{
  data: WorkbenchAllianceListData;
}>();
</script>

<style scoped>
.alliance-list {
  display: flex;
  flex-direction: column;
  --workbench-item-card-min-width: 20rem;
}

.alliance-list-items {
  display: flex;
  flex-wrap: wrap;
  align-content: start;
  gap: var(--spacing-12);
  padding: 0;
  margin: 0;
  list-style: none;
}

.alliance-list-card {
  position: relative;
  display: flex;
  min-width: min(100%, var(--workbench-item-card-min-width));
  flex: 1 1 var(--workbench-item-card-min-width);
  flex-direction: column;
  gap: var(--spacing-10);
  padding: var(--spacing-14) var(--spacing-16);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.alliance-list-card::before {
  position: absolute;
  top: var(--spacing-14);
  left: 0;
  width: 3px;
  height: var(--line-height-md);
  background: var(--color-primary);
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
  content: "";
}

.alliance-list-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-12);
}

.alliance-list-topline strong {
  min-width: 0;
  overflow: hidden;
  color: var(--color-title);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-md);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alliance-list-description {
  margin: 0;
  overflow: hidden;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alliance-list-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-8);
  padding: var(--spacing-12) var(--spacing-10);
  margin: 0;
  background: var(--color-bg-muted);
  border-radius: var(--radius-md);
}

.alliance-list-stats div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  text-align: center;
}

.alliance-list-stats dt {
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
}

.alliance-list-stats dd {
  margin: 0;
  overflow: hidden;
  color: var(--color-primary);
  font-size: var(--font-size-xl);
  font-variant-numeric: tabular-nums;
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-lg);
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.alliance-list-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-8);
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-xs);
}

.alliance-list-meta small {
  font-size: inherit;
}
</style>
