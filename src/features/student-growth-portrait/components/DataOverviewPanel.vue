<script setup lang="ts">
import { computed } from "vue";
import type { PortraitDataset, PortraitMetric } from "../data-contract";
import { portraitMetricDefinitionByKey } from "../metric-registry";
import { studentGrowthPageCapabilityByKey } from "../page-capability-matrix";
import UnifiedExamSummaryTable from "./UnifiedExamSummaryTable.vue";

const props = defineProps<{
  dataset: PortraitDataset;
}>();

const dataOverviewCapability = studentGrowthPageCapabilityByKey.get("overview-data-summary");

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(value);
}

function qualityLabel(metric: PortraitMetric) {
  const labels = { ready: "数据完整", partial: "数据不完整", insufficient: "数据不足", unavailable: "暂无数据" };
  return `${labels[metric.quality.status]} · 覆盖 ${formatNumber(metric.quality.coverageRate)}%`;
}

function qualityType(metric: PortraitMetric): "success" | "warning" | "danger" | "info" {
  if (metric.quality.status === "ready") return "success";
  if (metric.quality.status === "partial") return "warning";
  if (metric.quality.status === "insufficient") return "danger";
  return "info";
}

function comparabilityLabel(metric: PortraitMetric) {
  return {
    "district-comparable": "同口径可聚合",
    "within-school-trend-only": "仅校内纵向",
    "not-comparable": "不可比较",
  }[metric.comparability];
}

const rows = computed(() => props.dataset.metrics
  .filter((metric) => dataOverviewCapability?.metricKeys.includes(metric.key))
  .map((metric) => ({
    key: metric.key,
    domain: ({
      "five-education": "五育评价",
      academic: "学业发展",
      "sports-health": "运动健康",
      honor: "荣誉发展",
      behavior: "行为习惯",
      practice: "实践活动",
    } as Record<string, string>)[metric.domain] ?? metric.domain,
    label: portraitMetricDefinitionByKey.get(metric.key)?.label ?? metric.key,
    value: `${formatNumber(metric.value)} ${metric.unit}`,
    basis: metric.numerator === undefined || metric.denominator === undefined
      ? "—"
      : `${formatNumber(metric.numerator)} / ${formatNumber(metric.denominator)}`,
    metric,
  })));

const summary = computed(() => ({
  total: rows.value.length,
  ready: rows.value.filter((row) => row.metric.quality.status === "ready").length,
  attention: rows.value.filter((row) => row.metric.quality.status === "partial" || row.metric.quality.status === "insufficient").length,
}));
</script>

<template>
  <section class="data-overview" aria-label="数据总览">
    <header class="data-overview__header">
      <div>
        <h2>数据总览</h2>
        <p>将跨专题可比较的记录覆盖与学生参与事实统一展示；不把它们加权为综合发展指数。</p>
      </div>
      <dl class="data-overview__summary" aria-label="数据总览摘要">
        <div><dt>已展示指标</dt><dd>{{ summary.total }}</dd></div>
        <div><dt>数据完整</dt><dd>{{ summary.ready }}</dd></div>
        <div><dt>待核查</dt><dd>{{ summary.attention }}</dd></div>
      </dl>
    </header>

    <ElTable :data="rows" row-key="key" stripe border empty-text="当前筛选范围暂无可汇总的数据指标">
      <ElTableColumn prop="domain" column-key="domain" label="数据领域" min-width="130" show-overflow-tooltip />
      <ElTableColumn prop="label" column-key="label" label="统一指标" min-width="180" show-overflow-tooltip />
      <ElTableColumn prop="value" column-key="value" label="当前结果" min-width="150" />
      <ElTableColumn prop="basis" column-key="basis" label="分子 / 分母" min-width="150" />
      <ElTableColumn column-key="quality" label="数据质量" min-width="160">
        <template #default="{ row }"><ElTag :type="qualityType(row.metric)" effect="light">{{ qualityLabel(row.metric) }}</ElTag></template>
      </ElTableColumn>
      <ElTableColumn column-key="comparability" label="可比范围" min-width="150">
        <template #default="{ row }">{{ comparabilityLabel(row.metric) }}</template>
      </ElTableColumn>
    </ElTable>

    <section class="data-overview__unified-exams" aria-label="统考数据">
      <header>
        <div>
          <h3>统考数据</h3>
          <p>仅汇总同一考试批次、学科、年级及试卷版本内的成绩；得分率为成绩总和 ÷ 满分总和。</p>
        </div>
      </header>
      <UnifiedExamSummaryTable :summaries="dataset.unifiedExamSummaries" />
    </section>
  </section>
</template>

<style scoped>
.data-overview { display: grid; min-width: 0; gap: var(--spacing-16); padding: var(--spacing-20); border-radius: var(--radius-md); background: var(--color-white); }
.data-overview__header { display: flex; align-items: flex-end; justify-content: space-between; gap: var(--spacing-24); }
.data-overview__header h2 { color: var(--color-title); font-size: 20px; line-height: 30px; }
.data-overview__header p { margin-top: var(--spacing-4); color: var(--color-secondary); }
.data-overview__summary { display: flex; align-items: baseline; gap: var(--spacing-20); }
.data-overview__summary div { display: grid; gap: var(--spacing-4); white-space: nowrap; }
.data-overview__summary dt { color: var(--color-secondary); font-size: var(--font-size-xs); }
.data-overview__summary dd { color: var(--color-title); font-size: 18px; font-weight: var(--font-weight-semibold); }
.data-overview__unified-exams { display: grid; gap: var(--spacing-12); padding-top: var(--spacing-4); }
.data-overview__unified-exams h3 { color: var(--color-title); font-size: var(--font-size-lg); line-height: var(--line-height-lg); }
.data-overview__unified-exams p { margin-top: var(--spacing-4); color: var(--color-secondary); font-size: var(--font-size-xs); }
@media (max-width: 900px) { .data-overview__header { align-items: flex-start; flex-direction: column; } .data-overview__summary { flex-wrap: wrap; } }
</style>
