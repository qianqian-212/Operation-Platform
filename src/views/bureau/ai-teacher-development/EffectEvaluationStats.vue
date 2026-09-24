<template>
  <section class="stats-row" aria-label="效果评估统计">
    <article v-for="card in cards" :key="card.key" class="stat-card">
      <span class="stat-icon" :class="`is-${card.key}`" aria-hidden="true">
        <el-icon :size="20"><component :is="card.icon" /></el-icon>
      </span>
      <div class="stat-copy">
        <p class="stat-label">{{ card.label }}</p>
        <p class="stat-value">
          <strong>{{ card.display }}</strong>
        </p>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { CircleCheck, CircleClose, OfficeBuilding, TrophyBase } from "@element-plus/icons-vue";
import type { EffectEvaluationStats } from "@/features/effect-evaluation/types";

defineOptions({ name: "EffectEvaluationStats" });

const props = defineProps<{
  /** 效果评估概览统计 */
  stats: EffectEvaluationStats;
}>();

const cards = computed(() => [
  {
    key: "total",
    label: "总学校数",
    display: String(props.stats.schoolCount),
    icon: OfficeBuilding,
  },
  {
    key: "participating",
    label: "参与学校",
    display: String(props.stats.participatingCount),
    icon: CircleCheck,
  },
  {
    key: "nonParticipating",
    label: "未参与学校",
    display: String(props.stats.nonParticipatingCount),
    icon: CircleClose,
  },
  {
    key: "increase",
    label: "获奖提升率",
    display: `${props.stats.awardIncreasePercent}%`,
    icon: TrophyBase,
  },
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

.stat-icon.is-participating {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.stat-icon.is-nonParticipating {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.stat-icon.is-increase {
  background: var(--color-success-light);
  color: var(--color-success-dark-text);
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
  margin: 0;
  color: var(--color-title);
}

.stat-value strong {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: 32px;
}

@media (max-width: 1100px) {
  .stats-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
