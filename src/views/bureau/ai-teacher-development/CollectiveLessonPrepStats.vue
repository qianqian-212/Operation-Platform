<template>
  <section class="stats-row" aria-label="备课统计">
    <article v-for="card in cards" :key="card.key" class="stat-card">
      <span class="stat-icon" :class="`is-${card.key}`" aria-hidden="true">
        <el-icon :size="20"><component :is="card.icon" /></el-icon>
      </span>
      <div class="stat-copy">
        <p class="stat-label">{{ card.label }}</p>
        <p class="stat-value">
          <strong>{{ card.value }}</strong>
          <span>个</span>
        </p>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { CircleCheck, Clock, EditPen, Notebook } from "@element-plus/icons-vue";
import type { CollectiveLessonPrepStats } from "@/features/collective-lesson-prep/types";

defineOptions({ name: "CollectiveLessonPrepStats" });

const props = defineProps<{
  /** 备课统计汇总 */
  stats: CollectiveLessonPrepStats;
}>();

const cards = computed(() => [
  { key: "total", label: "备课总数", value: props.stats.total, icon: Notebook },
  { key: "ongoing", label: "进行中", value: props.stats.ongoing, icon: EditPen },
  { key: "completed", label: "已完成", value: props.stats.completed, icon: CircleCheck },
  { key: "pending", label: "待开始", value: props.stats.pending, icon: Clock },
]);
</script>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--spacing-12);
  flex-shrink: 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-16);
  min-height: 88px;
  padding: var(--spacing-20) var(--spacing-24);
  background: var(--color-white);
  border-radius: var(--radius-lg);
}

.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.stat-icon.is-total {
  background: color-mix(in srgb, var(--color-chart-violet) 12%, var(--color-white));
  color: var(--color-chart-violet);
}

.stat-icon.is-ongoing {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.stat-icon.is-completed {
  background: var(--color-success-light);
  color: var(--color-success-dark-text);
}

.stat-icon.is-pending {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.stat-copy {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  min-width: 0;
}

.stat-label {
  margin: 0;
  font-size: var(--font-size-md);
  color: var(--color-body);
  line-height: var(--line-height-md);
}

.stat-value {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-4);
  margin: 0;
  color: var(--color-title);
}

.stat-value strong {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: 32px;
}

.stat-value span {
  font-size: var(--font-size-sm);
  color: var(--color-secondary);
}

@media (max-width: 1100px) {
  .stats-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
