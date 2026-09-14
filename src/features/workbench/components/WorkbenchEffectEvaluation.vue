<template>
  <section class="effect-evaluation" aria-label="效果评估速览">
    <ul class="effect-metrics">
      <li v-for="metric in data.metrics" :key="metric.id" class="effect-metric">
        <h3 :title="metric.title">{{ metric.title }}</h3>
        <div
          v-for="series in seriesOf(metric)"
          :key="`${metric.id}-${series.label}`"
          class="effect-series"
        >
          <div class="effect-series-meta">
            <span>{{ series.label }}</span>
            <strong>{{ series.displayValue }}</strong>
          </div>
          <el-progress
            :percentage="series.percentage"
            :color="series.color"
            :show-text="false"
            :stroke-width="6"
            aria-hidden="true"
          />
        </div>
      </li>
    </ul>

    <div class="effect-summary" aria-label="竞赛获奖均值">
      <p>{{ data.summary.title }}</p>
      <dl>
        <div>
          <dd>
            <span>{{ data.summary.participatingAverage }}</span>
            <small v-if="data.summary.unit">{{ data.summary.unit }}</small>
          </dd>
          <dt>{{ data.summary.participatingLabel }}</dt>
        </div>
        <div>
          <dd>
            <span>{{ data.summary.nonParticipatingAverage }}</span>
            <small v-if="data.summary.unit">{{ data.summary.unit }}</small>
          </dd>
          <dt>{{ data.summary.nonParticipatingLabel }}</dt>
        </div>
        <div class="is-increase">
          <dd>{{ data.summary.increasePercent }}</dd>
          <dt>{{ data.summary.increaseLabel }}</dt>
        </div>
      </dl>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {
  WorkbenchEffectEvaluationData,
  WorkbenchEffectMetricData,
} from "@/features/workbench/types";

defineOptions({ name: "WorkbenchEffectEvaluation" });

defineProps<{
  data: WorkbenchEffectEvaluationData;
}>();

const PARTICIPATING_BAR_COLOR: Record<string, string> = {
  awards: "var(--color-primary)",
  papers: "var(--color-success-dark-text)",
  certificates: "var(--color-warning)",
};

function seriesOf(metric: WorkbenchEffectMetricData) {
  return [
    {
      ...metric.participating,
      color: PARTICIPATING_BAR_COLOR[metric.id] ?? "var(--color-primary)",
    },
    { ...metric.nonParticipating, color: "var(--color-secondary)" },
  ];
}
</script>

<style scoped>
.effect-evaluation {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
  --workbench-item-card-min-width: 20rem;
}

.effect-metrics {
  display: flex;
  flex-wrap: wrap;
  align-content: start;
  gap: var(--spacing-12);
  padding: 0;
  margin: 0;
  list-style: none;
}

.effect-metric {
  display: flex;
  min-width: min(100%, var(--workbench-item-card-min-width));
  flex: 1 1 var(--workbench-item-card-min-width);
  flex-direction: column;
  gap: var(--spacing-10);
  padding: var(--spacing-12) var(--spacing-14);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.effect-metric h3 {
  margin: 0;
  overflow: hidden;
  color: var(--color-title);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-md);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.effect-series-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-4);
  gap: var(--spacing-8);
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
}

.effect-series-meta strong {
  color: var(--color-title);
  font-variant-numeric: tabular-nums;
  font-weight: var(--font-weight-medium);
}

.effect-series :deep(.el-progress-bar__outer) {
  background-color: var(--color-bg-soft);
}

.effect-summary {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-10);
  padding: var(--spacing-12) var(--spacing-14);
  background: var(--color-bg-muted);
  border-radius: var(--radius-lg);
}

.effect-summary > p {
  margin: 0;
  color: var(--color-title);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-xs);
}

.effect-summary dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-8);
  margin: 0;
}

.effect-summary dl > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--spacing-2);
}

.effect-summary dt {
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
}

.effect-summary dd {
  display: inline-flex;
  align-items: baseline;
  margin: 0;
  overflow: hidden;
  color: var(--color-title);
  font-size: var(--font-size-xl);
  font-variant-numeric: tabular-nums;
  font-weight: var(--font-weight-semibold);
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
  gap: var(--spacing-2);
}

.effect-summary dd small {
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-regular);
}

.effect-summary .is-increase dt,
.effect-summary .is-increase dd {
  color: var(--color-primary);
}
</style>
