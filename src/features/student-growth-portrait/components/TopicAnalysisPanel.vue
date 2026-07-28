<script setup lang="ts">
import { computed } from "vue";
import type { EChartsCoreOption } from "echarts/core";
import type { PortraitDataset, PortraitMetric } from "../data-contract";
import { portraitMetricDefinitionByKey } from "../metric-registry";
import type { StudentGrowthPageCapability } from "../page-capability-matrix";
import type { StudentGrowthTopicNavigationItem } from "../topic-navigation";
import ChartExplanationTooltip from "./ChartExplanationTooltip.vue";
import StudentGrowthChart from "./StudentGrowthChart.vue";
import UnifiedExamSummaryTable from "./UnifiedExamSummaryTable.vue";

const props = defineProps<{
  dataset: PortraitDataset;
  topic: StudentGrowthTopicNavigationItem;
  capability: StudentGrowthPageCapability;
}>();

const topicMetrics = computed(() => (
  props.dataset.metrics.filter((metric) => props.capability.metricKeys.includes(metric.key))
));
const topicDistribution = computed(() => (
  props.dataset.distributions.find((distribution) => distribution.domain === props.topic.key)
));
const chartOption = computed<EChartsCoreOption | undefined>(() => {
  const distribution = topicDistribution.value;
  if (!distribution) return undefined;
  return {
    color: ["#2d55eb", "#36d187", "#ff9c00"],
    tooltip: { trigger: "axis", valueFormatter: (value: number | string) => `${value}%` },
    grid: { top: 24, right: 24, bottom: 28, left: 42, containLabel: true },
    xAxis: {
      type: "category",
      data: distribution.items.map((item) => levelLabel(item.key)),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: "#e1e2e6" } },
      axisLabel: { color: "#575859" },
    },
    yAxis: {
      type: "value",
      max: 100,
      axisLabel: { formatter: "{value}%", color: "#898a8c" },
      splitLine: { lineStyle: { color: "#ebecf0", type: "dashed" } },
    },
    series: [{
      name: "记录占比",
      type: "bar",
      data: distribution.items.map((item) => item.value),
      barMaxWidth: 48,
      itemStyle: { borderRadius: [4, 4, 0, 0] },
    }],
  };
});

function levelLabel(key: string) {
  return ({ excellent: "很好", average: "一般", "needs-effort": "需努力" } as Record<string, string>)[key] ?? key;
}

function metricLabel(metric: PortraitMetric) {
  return portraitMetricDefinitionByKey.get(metric.key)?.label ?? metric.key;
}

function metricValue(metric: PortraitMetric) {
  return `${metric.value.toLocaleString("zh-CN", { maximumFractionDigits: 2 })} ${metric.unit}`;
}

function metricBasis(metric: PortraitMetric) {
  if (metric.numerator === undefined || metric.denominator === undefined) return "无分子分母";
  return `${metric.numerator.toLocaleString("zh-CN")} / ${metric.denominator.toLocaleString("zh-CN")}`;
}

function qualityLabel(metric: PortraitMetric) {
  const labels = { ready: "数据完整", partial: "数据不完整", insufficient: "数据不足", unavailable: "暂无数据" };
  return `${labels[metric.quality.status]} · 覆盖 ${metric.quality.coverageRate}%`;
}

function qualityType(metric: PortraitMetric): "success" | "warning" | "info" | "danger" {
  if (metric.quality.status === "ready") return "success";
  if (metric.quality.status === "partial") return "warning";
  if (metric.quality.status === "insufficient") return "danger";
  return "info";
}

function comparabilityLabel(metric: PortraitMetric) {
  return {
    "district-comparable": "同口径可聚合",
    "within-school-trend-only": "仅限校内纵向",
    "not-comparable": "不可比较",
  }[metric.comparability];
}
</script>

<template>
  <section class="topic-analysis" :aria-label="`${topic.label}专题分析`">
    <header class="topic-analysis__header">
      <div>
        <h2>{{ topic.label }}</h2>
        <p>{{ topic.description }}</p>
      </div>
      <ElTag v-if="capability.status !== 'enabled'" :type="capability.status === 'limited' ? 'warning' : 'info'" effect="light">
        {{ capability.status === 'limited' ? '部分可用' : '受限' }}
      </ElTag>
    </header>

    <ElAlert
      v-if="topic.restricted"
      :title="`${topic.label}为受限数据域`"
      :description="topic.key === 'life' ? '消费、用餐和就诊数据须完成独立授权、最小样本隐藏与审计后，才可展示匿名汇总结果。' : '当前未接入心理健康数据，不生成风险人数、诊断结论或学生标签。'"
      type="info"
      :closable="false"
      show-icon
    />

    <ElAlert
      v-else-if="capability.status === 'limited'"
      :title="`${topic.label}当前为部分可用`"
      :description="capability.limitation"
      type="warning"
      :closable="false"
      show-icon
    />

    <template v-if="!topic.restricted">
      <dl v-if="topicMetrics.length" class="topic-analysis__metrics">
        <div v-for="metric in topicMetrics.slice(0, 3)" :key="metric.key">
          <dt>{{ metricLabel(metric) }}</dt>
          <dd>{{ metricValue(metric) }}</dd>
          <span>{{ qualityLabel(metric) }}</span>
        </div>
      </dl>

      <section v-if="chartOption && topicDistribution" class="topic-analysis__chart-panel">
        <header class="topic-analysis__chart-header">
          <h3>评价记录分布</h3>
          <ChartExplanationTooltip
            label="查看评价记录分布说明"
            content="仅统计当前筛选范围内的有效结构化评价记录；结果用于观察分布，不构成学生或学校的综合评分。"
          />
        </header>
        <div class="topic-analysis__chart">
          <StudentGrowthChart :option="chartOption" :ariaLabelText="`${topic.label}记录分布图`" />
        </div>
      </section>

      <section v-if="topic.key === 'academic'" class="topic-analysis__details" aria-label="期中与期末统考成绩">
        <header>
          <div>
            <h3>期中、期末统考成绩</h3>
            <p>只比较相同考试批次、学科、年级和试卷版本；不据此生成跨校排名或学生标签。</p>
          </div>
        </header>
        <UnifiedExamSummaryTable :summaries="dataset.unifiedExamSummaries" />
      </section>

      <section class="topic-analysis__details">
        <header>
          <div>
            <h3>可追溯指标</h3>
            <p>每项均显示覆盖率与分子/分母；没有正式口径的指标不会展示。</p>
          </div>
        </header>
        <ElEmpty v-if="!topicMetrics.length" description="当前筛选范围暂无可计算指标" :image-size="80" />
        <ElTable v-else :data="topicMetrics" row-key="key" stripe border>
          <ElTableColumn column-key="metric" label="指标" min-width="200">
            <template #default="{ row }">{{ metricLabel(row) }}</template>
          </ElTableColumn>
          <ElTableColumn column-key="result" label="当前结果" min-width="150">
            <template #default="{ row }">{{ metricValue(row) }}</template>
          </ElTableColumn>
          <ElTableColumn column-key="basis" label="分子 / 分母" min-width="160">
            <template #default="{ row }">{{ metricBasis(row) }}</template>
          </ElTableColumn>
          <ElTableColumn column-key="quality" label="数据质量" min-width="160">
            <template #default="{ row }"><ElTag :type="qualityType(row)" effect="light">{{ qualityLabel(row) }}</ElTag></template>
          </ElTableColumn>
          <ElTableColumn column-key="comparability" label="可比范围" min-width="150">
            <template #default="{ row }">{{ comparabilityLabel(row) }}</template>
          </ElTableColumn>
        </ElTable>
      </section>
    </template>
  </section>
</template>

<style scoped>
.topic-analysis { display: grid; min-width: 0; gap: var(--spacing-16); }
.topic-analysis__header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--spacing-16); }
.topic-analysis__header h2 { color: var(--color-title); font-size: 20px; line-height: 30px; }
.topic-analysis__header p { margin-top: var(--spacing-4); color: var(--color-secondary); }
.topic-analysis__metrics { display: grid; overflow: hidden; grid-template-columns: repeat(3, minmax(0, 1fr)); border-radius: var(--radius-md); background: var(--color-white); }
.topic-analysis__metrics > div { padding: var(--spacing-20) var(--spacing-24); border-left: 1px solid var(--color-border); }
.topic-analysis__metrics > div:first-child { border-left: 0; }
.topic-analysis__metrics dt, .topic-analysis__metrics span, .topic-analysis__details p { color: var(--color-secondary); }
.topic-analysis__metrics dd { margin-top: var(--spacing-8); color: var(--color-title); font-size: 28px; font-weight: var(--font-weight-semibold); line-height: 36px; }
.topic-analysis__metrics span, .topic-analysis__details p { font-size: var(--font-size-xs); }
.topic-analysis__chart-panel, .topic-analysis__details { min-width: 0; padding: var(--spacing-20); border-radius: var(--radius-md); background: var(--color-white); }
.topic-analysis h3 { font-size: var(--font-size-lg); line-height: var(--line-height-lg); }
.topic-analysis__chart-header { display: flex; align-items: center; gap: var(--spacing-6); }
.topic-analysis__chart { height: 330px; margin-top: var(--spacing-8); }
.topic-analysis__details > header { margin-bottom: var(--spacing-12); }
@media (max-width: 1180px) { .topic-analysis__metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } .topic-analysis__metrics > div:nth-child(3) { grid-column: 1 / -1; border-top: 1px solid var(--color-border); border-left: 0; } }
@media (max-width: 760px) { .topic-analysis__metrics { grid-template-columns: 1fr; } .topic-analysis__metrics > div { grid-column: auto; border-top: 1px solid var(--color-border); border-left: 0; } .topic-analysis__metrics > div:first-child { border-top: 0; } }
</style>
