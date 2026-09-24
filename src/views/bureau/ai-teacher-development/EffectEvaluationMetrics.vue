<template>
  <section class="metrics-panel" aria-label="核心指标对比">
    <h2 class="section-title">核心指标对比</h2>
    <ul class="metric-grid">
      <li v-for="metric in metrics" :key="metric.id" class="metric-card">
        <div class="metric-header">
          <h3>{{ metric.title }}</h3>
          <span class="period-tag">{{ metric.periodLabel }}</span>
        </div>
        <div
          v-for="series in seriesOf(metric)"
          :key="`${metric.id}-${series.label}`"
          class="metric-series"
        >
          <div class="series-meta">
            <span>{{ series.label }}</span>
            <strong>{{ series.displayValue }}</strong>
          </div>
          <el-progress
            :percentage="series.percentage"
            :color="series.color"
            :show-text="false"
            :stroke-width="8"
            aria-hidden="true"
          />
        </div>
      </li>
    </ul>
    <EffectEvaluationSummary :summary="summary" />
  </section>
</template>

<script setup lang="ts">
import type {
  EffectEvaluationMetric,
  EffectEvaluationSummary as EffectEvaluationSummaryData,
} from "@/features/effect-evaluation/types";
import EffectEvaluationSummary from "./EffectEvaluationSummary.vue";

defineOptions({ name: "EffectEvaluationMetrics" });

defineProps<{
  /** 核心指标对比数据 */
  metrics: EffectEvaluationMetric[];
  /** 量化结果文案 */
  summary: EffectEvaluationSummaryData;
}>();

function seriesOf(metric: EffectEvaluationMetric) {
  const max = Math.max(metric.participating.value, metric.nonParticipating.value, 1);
  return [
    {
      ...metric.participating,
      percentage: Math.round((metric.participating.value / max) * 100),
      color: "var(--color-primary)",
    },
    {
      ...metric.nonParticipating,
      percentage: Math.round((metric.nonParticipating.value / max) * 100),
      color: "var(--color-secondary)",
    },
  ];
}
</script>

<style scoped>
.metrics-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
  padding: var(--spacing-20) var(--spacing-24);
  background: var(--color-white);
  border-radius: var(--radius-lg);
}

.section-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-16);
  margin: 0;
  padding: 0;
  list-style: none;
}

.metric-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
  padding: var(--spacing-16);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-white);
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-8);
}

.metric-header h3 {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: var(--line-height-md);
}

.period-tag {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  line-height: 22px;
  flex-shrink: 0;
}

.metric-series {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.series-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-8);
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.series-meta strong {
  color: var(--color-title);
  font-variant-numeric: tabular-nums;
  font-weight: var(--font-weight-medium);
}

.metric-series :deep(.el-progress-bar__outer) {
  background-color: var(--color-bg-soft);
}

@media (max-width: 1100px) {
  .metric-grid {
    grid-template-columns: 1fr;
  }
}
</style>
