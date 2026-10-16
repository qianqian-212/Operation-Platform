<template>
  <section class="stats-row" aria-label="分层研修数据概览">
    <article v-for="card in cards" :key="card.key" class="stat-card">
      <span class="stat-icon" :class="`is-${card.key}`">
        <el-icon :size="22"><component :is="card.icon" /></el-icon>
      </span>
      <div>
        <p class="stat-label">{{ card.label }}</p>
        <p class="stat-value">{{ card.value }}</p>
        <p class="stat-caption" :class="`is-${card.captionTone}`">{{ card.caption }}</p>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, type Component } from "vue";
import { CircleCheck, Clock, User } from "@element-plus/icons-vue";
import {
  buildOverviewStatCards,
  type LayeredTrainingOverviewSummary,
} from "@/features/layered-training-overview/types";

defineOptions({ name: "LayeredTrainingOverviewStats" });

const props = defineProps<{
  /** 当前学期汇总，加载完成前为空 */
  summary: LayeredTrainingOverviewSummary | null;
}>();

const STAT_ICONS: Record<string, Component> = {
  teachers: User,
  participation: User,
  completion: CircleCheck,
  credit: Clock,
};

const cards = computed(() =>
  buildOverviewStatCards(props.summary).map((card) => ({
    ...card,
    icon: STAT_ICONS[card.key] ?? User,
  })),
);
</script>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--spacing-12);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-16);
  min-height: 108px;
  padding: var(--spacing-20) var(--spacing-24);
  background: var(--color-white);
  border-radius: var(--radius-lg);
}

.stat-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
}

.stat-icon.is-teachers,
.stat-icon.is-participation,
.stat-icon.is-credit {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.stat-icon.is-completion {
  background: var(--color-success-light);
  color: var(--color-success);
}

.stat-label,
.stat-caption {
  margin: 0;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-xs);
}

.stat-value {
  margin: var(--spacing-4) 0;
  color: var(--color-title);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: 1.2;
}

.stat-caption.is-success {
  color: var(--color-success-dark-text);
}

.stat-caption.is-danger {
  color: var(--color-error);
}

@media (max-width: 1100px) {
  .stats-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .stats-row {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
