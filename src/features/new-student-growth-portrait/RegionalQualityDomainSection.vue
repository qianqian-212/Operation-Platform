<script setup lang="ts">
import { computed } from "vue";
import type { EChartsCoreOption } from "echarts/core";
import type { PortraitDataset, PortraitMetric } from "@/features/student-growth-portrait/data-contract";
import { portraitMetricDefinitionByKey } from "@/features/student-growth-portrait/metric-registry";
import {
  pageCapabilityForTopic,
  type StudentGrowthTopicKey,
} from "@/features/student-growth-portrait/page-capability-matrix";
import { studentGrowthTopicByKey } from "@/features/student-growth-portrait/topic-navigation";
import NewPortraitChart from "./NewPortraitChart.vue";
import PortraitHintPopover from "./PortraitHintPopover.vue";

type RegionalQualityTopic = Extract<
  StudentGrowthTopicKey,
  "five-education" | "sports-health" | "honor" | "behavior" | "practice" | "daily-evaluation"
>;

const props = defineProps<{
  dataset: PortraitDataset;
  topicKey: RegionalQualityTopic;
}>();

const preferredMetricKeys: Readonly<Record<RegionalQualityTopic, readonly string[]>> = {
  "five-education": [
    "five-education-goal-completion-rate",
    "five-education-evaluation-coverage-rate",
  ],
  "sports-health": [
    "fitness-test-item-pass-rate",
    "ai-exercise-participation-rate",
    "ai-exercise-sessions-per-participant",
    "sunshine-run-participation-rate",
    "sunshine-run-distance-per-participant",
  ],
  honor: ["honor-student-coverage-rate", "honor-per-100-students"],
  behavior: ["library-visit-coverage-rate", "library-borrower-coverage-rate"],
  practice: ["practice-participation-rate"],
  "daily-evaluation": ["daily-evaluation-positive-rate"],
};

const primaryMetricKeys: Readonly<Record<RegionalQualityTopic, string>> = {
  "five-education": "five-education-goal-completion-rate",
  "sports-health": "ai-exercise-participation-rate",
  honor: "honor-student-coverage-rate",
  behavior: "library-borrower-coverage-rate",
  practice: "practice-participation-rate",
  "daily-evaluation": "daily-evaluation-positive-rate",
};

const topicNationalBasis: Readonly<Record<RegionalQualityTopic, string>> = {
  "five-education": "对齐《义务教育质量评价指南》和《普通高中学校办学质量评价指南》的品德、学业、身心、审美、劳动与社会实践维度。",
  "sports-health": "体质健康依据《国家学生体质健康标准（2014年修订）》；基本运动能力依据 GB/T 44099-2024。",
  honor: "荣誉仅作为学生成长事实证据；国家文件没有规定荣誉积分或综合素质加分公式。",
  behavior: "行为记录仅作为过程性事实证据；国家文件没有规定借阅、考勤等行为的统一综合评分。",
  practice: "对齐国家评价指南中的劳动与社会实践维度，参与次数不直接等同于实践质量。",
  "daily-evaluation": "作为品德发展和过程评价的事实来源；不得将表扬次数直接折算为国家统一分值。",
};

const topic = computed(() => {
  const result = studentGrowthTopicByKey.get(props.topicKey);
  if (!result) throw new Error(`未注册学生成长主题：${props.topicKey}`);
  return result;
});

const capability = computed(() => {
  const result = pageCapabilityForTopic(props.topicKey);
  if (!result) throw new Error(`未注册学生成长页面能力：${props.topicKey}`);
  return result;
});

const metrics = computed(() => {
  const metricByKey = new Map(props.dataset.metrics.map((metric) => [metric.key, metric]));
  return preferredMetricKeys[props.topicKey]
    .map((key) => metricByKey.get(key))
    .filter((metric): metric is PortraitMetric => Boolean(metric));
});

const primaryMetric = computed(() => (
  metrics.value.find((metric) => metric.key === primaryMetricKeys[props.topicKey]) ?? metrics.value[0]
));

const topicDistribution = computed(() => (
  props.dataset.distributions.find((distribution) => distribution.domain === props.topicKey)
));

const chartTitle = computed(() => (
  topicDistribution.value ? "评价等级分布" : "指标数据覆盖"
));

const chartDescription = computed(() => (
  topicDistribution.value
    ? "按有效结构化评价记录统计，不合成为学生或学校综合总分。"
    : "展示各项指标覆盖到当前在籍学生的比例，不作校际或学校类型比较。"
));

const observationItems = computed(() => {
  const items = [
    { label: "国家依据", value: topicNationalBasis[props.topicKey] },
    { label: "核心指标计算", value: metricMethod(primaryMetric.value) },
    {
      label: "分子 / 分母",
      value: primaryMetric.value ? metricBasis(primaryMetric.value) : "—",
    },
    { label: "可比范围", value: comparabilityLabel(primaryMetric.value) },
  ];
  if (capability.value.limitation) {
    items.push({ label: "当前边界", value: capability.value.limitation });
  }
  return items;
});

const chartOption = computed<EChartsCoreOption>(() => {
  const axisColor = "#898a8c";
  const axisStyle = {
    axisLine: { lineStyle: { color: axisColor } },
    axisTick: { lineStyle: { color: axisColor } },
    axisLabel: { color: axisColor, fontSize: 11 },
  };
  const distribution = topicDistribution.value;
  const levelLabels: Record<string, string> = {
    excellent: "很好",
    average: "一般",
    "needs-effort": "需努力",
  };
  const categories = distribution
    ? distribution.items.map((item) => levelLabels[item.key] ?? item.key)
    : metrics.value.map((metric) => metricLabel(metric));
  const values = distribution
    ? distribution.items.map((item) => item.value)
    : metrics.value.map((metric) => metric.quality.coverageRate);

  return {
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number | string) => `${value}%`,
    },
    grid: {
      top: 28,
      right: 12,
      bottom: 8,
      left: 8,
      containLabel: true,
    },
    xAxis: {
      ...axisStyle,
      type: "category",
      data: categories,
      axisLabel: {
        color: axisColor,
        fontSize: 11,
        hideOverlap: true,
      },
    },
    yAxis: {
      ...axisStyle,
      type: "value",
      max: 100,
      axisLabel: { color: axisColor, fontSize: 11, formatter: "{value}%" },
      splitLine: { lineStyle: { color: "#ebecf0" } },
    },
    series: [{
      type: "bar",
      barMaxWidth: 48,
      data: values,
      itemStyle: { color: "#2d55eb", borderRadius: [4, 4, 0, 0] },
      label: { show: true, position: "top", formatter: "{c}%", color: "#575859" },
    }],
  };
});

function metricLabel(metric?: PortraitMetric) {
  if (!metric) return "当前指标";
  return portraitMetricDefinitionByKey.get(metric.key)?.label ?? metric.key;
}

function metricValue(metric: PortraitMetric) {
  return `${metric.value.toLocaleString("zh-CN", { maximumFractionDigits: 2 })}${metric.unit === "%" ? "%" : ` ${metric.unit}`}`;
}

function metricBasis(metric: PortraitMetric) {
  if (metric.numerator === undefined || metric.denominator === undefined) return "按有效记录聚合";
  return `${metric.numerator.toLocaleString("zh-CN")} / ${metric.denominator.toLocaleString("zh-CN")}`;
}

function qualityLabel(metric: PortraitMetric) {
  const labels = {
    ready: "数据完整",
    partial: "部分可用",
    insufficient: "样本不足",
    unavailable: "暂无数据",
  };
  return `${labels[metric.quality.status]} · 覆盖 ${metric.quality.coverageRate}%`;
}

function comparabilityLabel(metric?: PortraitMetric) {
  if (!metric) return "暂无可比较指标";
  return {
    "district-comparable": "可在区域与学校同口径聚合",
    "within-school-trend-only": "仅用于学校内部纵向观察",
    "not-comparable": "不用于横向比较",
  }[metric.comparability];
}

function metricMethod(metric?: PortraitMetric) {
  if (!metric) return "当前筛选范围暂无可计算指标。";
  return portraitMetricDefinitionByKey.get(metric.key)?.calculation ?? "按已注册口径计算。";
}
</script>

<template>
  <div class="regional-quality-domain">
    <div
      class="regional-quality-domain__metrics"
      :class="`has-${Math.min(metrics.length, 5)}-items`"
    >
      <article v-for="metric in metrics" :key="metric.key">
        <span>{{ metricLabel(metric) }}</span>
        <strong>{{ metricValue(metric) }}</strong>
        <small>{{ qualityLabel(metric) }}</small>
      </article>
    </div>

    <article class="regional-quality-domain__panel">
      <header>
        <div>
          <h3>{{ chartTitle }}</h3>
          <p>{{ chartDescription }}</p>
        </div>
        <div class="regional-quality-domain__actions">
          <PortraitHintPopover
            label="观察口径"
            :title="`${topic.label}观察口径`"
            :items="observationItems"
            :status-label="capability.status === 'limited' ? '部分可用' : '具备计算条件'"
            :status-type="capability.status === 'limited' ? 'warning' : 'success'"
          />
          <ElTag v-if="capability.status === 'limited'" type="warning" effect="light">部分可用</ElTag>
        </div>
      </header>
      <div class="regional-quality-domain__chart">
        <NewPortraitChart
          :option="chartOption"
          :ariaLabelText="`${topic.label}${chartTitle}`"
        />
      </div>
    </article>
  </div>
</template>

<style scoped>
.regional-quality-domain {
  display: grid;
  min-width: 0;
  gap: var(--spacing-16);
}

.regional-quality-domain__metrics {
  display: grid;
  min-width: 0;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--spacing-12);
}

.regional-quality-domain__metrics.has-1-items { grid-template-columns: minmax(220px, 360px); }
.regional-quality-domain__metrics.has-2-items { grid-template-columns: repeat(2, minmax(220px, 360px)); }

.regional-quality-domain__metrics article,
.regional-quality-domain__panel {
  min-width: 0;
  border-radius: var(--radius-md);
  background: var(--color-white);
}

.regional-quality-domain__metrics article {
  display: grid;
  gap: var(--spacing-6);
  padding: var(--spacing-16);
}

.regional-quality-domain__metrics span,
.regional-quality-domain__metrics small,
.regional-quality-domain__panel p {
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
}

.regional-quality-domain__metrics strong {
  font-size: 22px;
  line-height: 30px;
  font-weight: 600;
}

.regional-quality-domain__panel {
  display: grid;
  gap: var(--spacing-16);
  padding: var(--spacing-16);
  overflow: hidden;
}

.regional-quality-domain__panel > header {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-12);
}

.regional-quality-domain__panel > header > div { min-width: 0; }
.regional-quality-domain__actions {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-8);
}
.regional-quality-domain__panel h3 { font-size: var(--font-size-lg); line-height: var(--line-height-lg); font-weight: 600; }
.regional-quality-domain__panel p { margin-top: var(--spacing-4); line-height: 18px; }
.regional-quality-domain__chart {
  width: 100%;
  min-width: 0;
  height: 280px;
  overflow: hidden;
}

@media (max-width: 1380px) {
  .regional-quality-domain__metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .regional-quality-domain__metrics.has-1-items,
  .regional-quality-domain__metrics.has-2-items { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 760px) {
  .regional-quality-domain__metrics,
  .regional-quality-domain__metrics.has-1-items,
  .regional-quality-domain__metrics.has-2-items { grid-template-columns: 1fr; }
}
</style>
