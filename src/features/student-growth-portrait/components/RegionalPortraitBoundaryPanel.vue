<script setup lang="ts">
import { computed } from "vue";
import type { PortraitDataset, PortraitMetric } from "../data-contract";
import { portraitMetricDefinitionByKey } from "../metric-registry";
import type { RegionalPortraitAnchorCapability } from "../regional-portrait-anchor-matrix";

const props = defineProps<{
  anchor: RegionalPortraitAnchorCapability;
  dataset: PortraitDataset;
}>();

const availableMetrics = computed(() => props.dataset.metrics.filter((metric) => props.anchor.metricKeys.includes(metric.key)));

function statusLabel() {
  return { enabled: "可用", limited: "部分可用", planned: "待接入" }[props.anchor.status];
}

function statusType(): "success" | "warning" | "info" {
  return props.anchor.status === "enabled" ? "success" : props.anchor.status === "limited" ? "warning" : "info";
}

function metricLabel(metric: PortraitMetric) {
  return portraitMetricDefinitionByKey.get(metric.key)?.label ?? metric.key;
}

function metricValue(metric: PortraitMetric) {
  return `${metric.value.toLocaleString("zh-CN", { maximumFractionDigits: 2 })} ${metric.unit}`;
}

function metricBasis(metric: PortraitMetric) {
  if (metric.numerator === undefined || metric.denominator === undefined) return "—";
  return `${metric.numerator.toLocaleString("zh-CN")} / ${metric.denominator.toLocaleString("zh-CN")}`;
}
</script>

<template>
  <section class="regional-portrait-boundary" :aria-label="`${anchor.label}能力边界`">
    <header class="regional-portrait-boundary__header">
      <div>
        <h2>{{ anchor.label }}</h2>
        <p>{{ anchor.description }}</p>
      </div>
      <ElTag :type="statusType()" effect="light">{{ statusLabel() }}</ElTag>
    </header>

    <ElAlert
      v-if="anchor.limitation"
      :title="anchor.status === 'planned' ? '当前不发布业务结论' : '当前能力边界'"
      :description="anchor.limitation"
      :type="anchor.status === 'planned' ? 'info' : 'warning'"
      :closable="false"
      show-icon
    />

    <ElTable v-if="availableMetrics.length" :data="availableMetrics" row-key="key" stripe border>
      <ElTableColumn column-key="metric" label="已有数据基础" min-width="220">
        <template #default="{ row }">{{ metricLabel(row) }}</template>
      </ElTableColumn>
      <ElTableColumn column-key="value" label="当前结果" min-width="140">
        <template #default="{ row }">{{ metricValue(row) }}</template>
      </ElTableColumn>
      <ElTableColumn column-key="basis" label="分子 / 分母" min-width="150">
        <template #default="{ row }">{{ metricBasis(row) }}</template>
      </ElTableColumn>
      <ElTableColumn column-key="quality" label="数据覆盖" min-width="130">
        <template #default="{ row }">{{ row.quality.coverageRate }}%</template>
      </ElTableColumn>
    </ElTable>

    <section v-if="anchor.missingRequirements?.length" class="regional-portrait-boundary__requirements">
      <h3>正式启用前还需要</h3>
      <ul>
        <li v-for="requirement in anchor.missingRequirements" :key="requirement">{{ requirement }}</li>
      </ul>
    </section>

    <footer>
      <p><strong>质量门槛：</strong>{{ anchor.qualityGate }}</p>
      <p><strong>区域端边界：</strong>{{ anchor.permissionBoundary }}</p>
    </footer>
  </section>
</template>

<style scoped>
.regional-portrait-boundary { display: grid; min-width: 0; gap: var(--spacing-16); padding: var(--spacing-20); border-radius: var(--radius-md); background: var(--color-white); }
.regional-portrait-boundary__header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--spacing-16); }
.regional-portrait-boundary__header h2 { color: var(--color-title); font-size: 20px; line-height: 30px; }
.regional-portrait-boundary__header p, .regional-portrait-boundary footer { margin-top: var(--spacing-4); color: var(--color-secondary); }
.regional-portrait-boundary__requirements { padding-top: var(--spacing-4); }
.regional-portrait-boundary__requirements h3 { color: var(--color-title); font-size: var(--font-size-lg); line-height: var(--line-height-lg); }
.regional-portrait-boundary__requirements ul { display: flex; flex-wrap: wrap; gap: var(--spacing-8); margin-top: var(--spacing-12); padding: 0; list-style: none; }
.regional-portrait-boundary__requirements li { padding: var(--spacing-4) var(--spacing-8); border: 1px solid var(--color-border); border-radius: var(--radius-md); color: var(--color-body); font-size: var(--font-size-xs); }
.regional-portrait-boundary footer { display: grid; gap: var(--spacing-6); padding-top: var(--spacing-12); border-top: 1px solid var(--color-border); font-size: var(--font-size-xs); }
.regional-portrait-boundary footer strong { color: var(--color-body); }
</style>
