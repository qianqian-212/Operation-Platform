<script setup lang="ts">
import { computed } from "vue";
import type { EChartsCoreOption } from "echarts/core";
import type {
  PortraitDataset,
  PortraitDistribution,
  PortraitMetric,
} from "../data-contract";
import StudentGrowthChart from "./StudentGrowthChart.vue";

const props = defineProps<{
  dataset: PortraitDataset;
  schoolNames: Readonly<Record<string, string>>;
}>();

function findMetric(key: string) {
  return props.dataset.metrics.find((item) => item.key === key);
}

function isObserved(metric?: PortraitMetric) {
  return Boolean(metric && metric.quality.observedStudentCount > 0);
}

function formatMetric(metric?: PortraitMetric) {
  if (!metric || !isObserved(metric)) return "—";
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(metric.value);
}

function coverageLabel(metric?: PortraitMetric) {
  if (!metric) return "未接入";
  if (metric.quality.observedStudentCount === 0) return "暂无有效记录";
  return `已覆盖 ${formatMetric(metric)}${metric.unit}`;
}

function evaluationDistribution() {
  return props.dataset.distributions.find((item) => item.key === "five-education-evaluation-level-distribution");
}

function createEvaluationOption(distribution?: PortraitDistribution): EChartsCoreOption {
  const labels: Record<string, string> = {
    excellent: "很好",
    average: "一般",
    "needs-effort": "需努力",
  };
  const items = distribution?.items ?? [];
  return {
    color: ["#36d187", "#558bf0", "#ff9c00"],
    animationDuration: 240,
    tooltip: {
      trigger: "item",
      valueFormatter: (value: number | string) => `${value}%`,
    },
    legend: {
      bottom: 0,
      itemWidth: 16,
      itemHeight: 8,
      textStyle: { color: "#575859" },
    },
    graphic: items.length
      ? undefined
      : [{
        type: "text",
        left: "center",
        top: "middle",
        style: { text: "暂无有效成长评价记录", fill: "#898a8c", fontSize: 14 },
      }],
    series: [{
      name: "评价记录构成",
      type: "pie",
      radius: ["46%", "68%"],
      center: ["50%", "46%"],
      avoidLabelOverlap: true,
      label: { formatter: "{b} {c}%", color: "#575859" },
      data: items.map((item) => ({ name: labels[item.key] ?? item.key, value: item.value })),
    }],
  };
}

const enrolledStudents = computed(() => findMetric("enrolled-student-count"));
const evaluationCoverage = computed(() => findMetric("five-education-evaluation-coverage-rate"));
const examCoverage = computed(() => findMetric("academic-exam-coverage-rate"));
const fitnessCoverage = computed(() => findMetric("fitness-test-record-coverage-rate"));
const distribution = computed(evaluationDistribution);
const evaluationOption = computed(() => createEvaluationOption(distribution.value));
const schoolCount = computed(() => props.dataset.schools.length);
const namedSchoolCount = computed(() => props.dataset.schools.filter((school) => props.schoolNames[school.schoolId]).length);
const overviewMetrics = computed(() => [
  { label: "纳入学校", value: schoolCount.value.toLocaleString("zh-CN"), unit: "所", description: `已匹配 ${namedSchoolCount.value} 所学校名称` },
  { label: "在籍学生", value: formatMetric(enrolledStudents.value), unit: "人", description: "有效学籍去重人数" },
  { label: "成长评价覆盖", value: formatMetric(evaluationCoverage.value), unit: "%", description: coverageLabel(evaluationCoverage.value) },
  { label: "考试记录覆盖", value: formatMetric(examCoverage.value), unit: "%", description: coverageLabel(examCoverage.value) },
  { label: "体测记录覆盖", value: formatMetric(fitnessCoverage.value), unit: "%", description: coverageLabel(fitnessCoverage.value) },
]);
</script>

<template>
  <section class="regional-overview" aria-label="区域学生发展画像总览">
    <div class="regional-overview__summary">
      <div class="regional-overview__reading">
        <span class="regional-overview__eyebrow">区域数据观察</span>
        <h2>先确认统计范围与数据覆盖，再解读区域发展事实</h2>
        <p>学校差异和专题分析均使用下方同一筛选范围；覆盖不足时只生成待核查信号，不生成综合评分或原因判断。</p>
      </div>
      <dl class="regional-overview__metrics">
        <div v-for="metric in overviewMetrics" :key="metric.label">
          <dt>{{ metric.label }}</dt>
          <dd>{{ metric.value }}<small>{{ metric.unit }}</small></dd>
          <span>{{ metric.description }}</span>
        </div>
      </dl>
    </div>

    <div class="regional-overview__main">
      <section class="portrait-panel regional-overview__chart-panel" aria-labelledby="evaluation-distribution-title">
        <header class="portrait-panel__header">
          <div>
            <h3 id="evaluation-distribution-title">成长评价等级构成</h3>
            <p>按有效评价记录统计；评价覆盖 {{ distribution?.quality.coverageRate ?? 0 }}%，不作为综合发展得分。</p>
          </div>
        </header>
        <div class="regional-overview__chart">
          <StudentGrowthChart
            :option="evaluationOption"
            ariaLabelText="区域成长评价等级构成图"
          />
        </div>
      </section>

    </div>
  </section>
</template>

<style scoped>
.regional-overview {
  display: grid;
  gap: var(--spacing-16);
}

.regional-overview__summary {
  display: grid;
  min-width: 0;
  align-items: center;
  grid-template-columns: minmax(280px, 1fr) minmax(0, 1.8fr);
  gap: var(--spacing-24);
  padding: var(--spacing-24);
  border-radius: var(--radius-md);
  background: var(--color-white);
}

.regional-overview__eyebrow {
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.regional-overview__reading h2 {
  margin-top: var(--spacing-8);
  color: var(--color-title);
  font-size: 20px;
  line-height: 30px;
}

.regional-overview__reading p,
.portrait-panel__header p {
  margin-top: var(--spacing-6);
  color: var(--color-secondary);
  line-height: var(--line-height-md);
}

.regional-overview__metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.regional-overview__metrics > div {
  padding: 0 var(--spacing-20);
  border-left: 1px solid var(--color-border);
}

.regional-overview__metrics dt {
  color: var(--color-body);
  font-size: var(--font-size-sm);
}

.regional-overview__metrics dd {
  margin-top: var(--spacing-8);
  color: var(--color-title);
  font-size: 28px;
  font-weight: var(--font-weight-semibold);
  line-height: 36px;
}

.regional-overview__metrics dd small,
.regional-overview__metrics span {
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-regular);
}

.regional-overview__main {
  display: grid;
  min-height: 440px;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--spacing-16);
}

.portrait-panel {
  min-width: 0;
  padding: var(--spacing-20);
  border-radius: var(--radius-md);
  background: var(--color-white);
}

.portrait-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-16);
}

.portrait-panel__header h3 {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-lg);
}

.portrait-panel__header p {
  font-size: var(--font-size-xs);
}

.regional-overview__chart {
  height: 360px;
  margin-top: var(--spacing-16);
}

@media (max-width: 1180px) {
  .regional-overview__summary {
    grid-template-columns: 1fr;
  }

  .regional-overview__main {
    grid-template-columns: 1fr;
  }

  .regional-overview__metrics > div:first-child {
    border-left: 0;
  }

  .regional-overview__metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .regional-overview__metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .regional-overview__metrics > div:nth-child(4) {
    border-top: 1px solid var(--color-border);
    border-left: 0;
  }
}

@media (min-width: 1181px) and (max-width: 1400px) {
  .regional-overview__summary {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .regional-overview__reading {
    grid-column: 1 / -1;
  }
}
</style>
