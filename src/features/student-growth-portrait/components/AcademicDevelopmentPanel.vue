<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { EChartsCoreOption } from "echarts/core";
import type {
  AcademicExamType,
  EducationStage,
  PortraitDataset,
  UnifiedExamSchoolSummary,
  UnifiedExamSummary,
} from "../data-contract";
import StudentGrowthChart from "./StudentGrowthChart.vue";

const props = defineProps<{
  dataset: PortraitDataset;
  schoolNames: Readonly<Record<string, string>>;
}>();

const allValue = "all";
const districtValue = "district";
const selectedStage = ref<EducationStage | typeof allValue>(props.dataset.unifiedExamSummaries[0]?.educationStage ?? allValue);
const selectedGrade = ref(props.dataset.unifiedExamSummaries[0]?.assessmentGrade ?? allValue);
const selectedSubject = ref(props.dataset.unifiedExamSummaries[0]?.subject ?? allValue);
const selectedExamType = ref<AcademicExamType | typeof allValue>(allValue);
const selectedSchool = ref(districtValue);

const stageLabels: Readonly<Record<EducationStage, string>> = { primary: "小学", junior: "初中", senior: "高中" };
const examTypeLabels: Readonly<Record<AcademicExamType, string>> = {
  midterm: "期中",
  final: "期末",
  mock: "模拟",
  diagnostic: "诊断",
  other: "其他",
};
const scoreBandLabels = { excellent: "优秀", good: "良好", pass: "及格", low: "低分" } as const;

function unique<T>(items: readonly T[]) {
  return [...new Set(items)];
}

const stageOptions = computed(() => unique(props.dataset.unifiedExamSummaries.map((item) => item.educationStage)));
const gradeOptions = computed(() => unique(props.dataset.unifiedExamSummaries
  .filter((item) => selectedStage.value === allValue || item.educationStage === selectedStage.value)
  .map((item) => item.assessmentGrade)));
const subjectOptions = computed(() => unique(props.dataset.unifiedExamSummaries
  .filter((item) => selectedStage.value === allValue || item.educationStage === selectedStage.value)
  .filter((item) => selectedGrade.value === allValue || item.assessmentGrade === selectedGrade.value)
  .map((item) => item.subject)));
const examTypeOptions = computed(() => unique(props.dataset.unifiedExamSummaries.map((item) => item.examType)));
const schoolOptions = computed(() => unique(props.dataset.unifiedExamSummaries.flatMap((item) => (
  item.schoolSummaries.map((school) => school.schoolId)
))));

watch([stageOptions, gradeOptions, subjectOptions, schoolOptions], () => {
  if (selectedStage.value !== allValue && !stageOptions.value.includes(selectedStage.value)) selectedStage.value = allValue;
  if (selectedGrade.value !== allValue && !gradeOptions.value.includes(selectedGrade.value)) selectedGrade.value = allValue;
  if (selectedSubject.value !== allValue && !subjectOptions.value.includes(selectedSubject.value)) selectedSubject.value = allValue;
  if (selectedSchool.value !== districtValue && !schoolOptions.value.includes(selectedSchool.value)) selectedSchool.value = districtValue;
}, { immediate: true });

const filteredSummaries = computed(() => props.dataset.unifiedExamSummaries
  .filter((item) => selectedStage.value === allValue || item.educationStage === selectedStage.value)
  .filter((item) => selectedGrade.value === allValue || item.assessmentGrade === selectedGrade.value)
  .filter((item) => selectedSubject.value === allValue || item.subject === selectedSubject.value)
  .filter((item) => selectedExamType.value === allValue || item.examType === selectedExamType.value));
const currentSummary = computed(() => filteredSummaries.value[0]);
const currentSchoolSummary = computed(() => (
  selectedSchool.value === districtValue
    ? undefined
    : currentSummary.value?.schoolSummaries.find((school) => school.schoolId === selectedSchool.value)
));

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(value);
}

function formatPercent(value: number) {
  return `${formatNumber(value)}%`;
}

function metricValue(
  districtSelector: (summary: UnifiedExamSummary) => number,
  schoolSelector: (school: UnifiedExamSchoolSummary) => number,
) {
  const summary = currentSummary.value;
  if (!summary) return 0;
  return currentSchoolSummary.value ? schoolSelector(currentSchoolSummary.value) : districtSelector(summary);
}

const coreMetrics = computed(() => {
  const summary = currentSummary.value;
  if (!summary) return [];
  return [
    {
      key: "score-rate",
      label: "平均得分率",
      value: formatPercent(metricValue((item) => item.scoreRate, (school) => school.scoreRate)),
      note: `${summary.examName} · ${summary.assessmentGrade} · ${summary.subject}`,
    },
    {
      key: "standard-score",
      label: "标准分",
      value: formatNumber(currentSchoolSummary.value?.standardScore ?? summary.standardScoreBaseline),
      note: currentSchoolSummary.value ? "学校 T 分数，区域基准为 50" : "区域 T 分数基准值",
    },
    {
      key: "excellent-rate",
      label: "优秀率",
      value: formatPercent(metricValue((item) => item.excellentRate, (school) => school.excellentRate)),
      note: `阈值规则 ${summary.scoreBandPolicyVersion}`,
    },
    {
      key: "good-rate",
      label: "良好及以上率",
      value: formatPercent(metricValue((item) => item.goodOrAboveRate, (school) => school.goodOrAboveRate)),
      note: "累计达到良好阈值的学生占比",
    },
    {
      key: "pass-rate",
      label: "及格率",
      value: formatPercent(metricValue((item) => item.passRate, (school) => school.passRate)),
      note: "累计达到及格阈值的学生占比",
    },
    {
      key: "low-rate",
      label: "低分率",
      value: formatPercent(metricValue((item) => item.lowScoreRate, (school) => school.lowScoreRate)),
      note: "低于及格阈值的学生占比",
    },
  ];
});

const activeDistribution = computed(() => (
  currentSchoolSummary.value?.scoreBandDistribution ?? currentSummary.value?.scoreBandDistribution ?? []
));
const scoreBandOption = computed<EChartsCoreOption>(() => ({
  color: ["#2d55eb"],
  tooltip: { trigger: "axis", valueFormatter: (value: number | string) => `${value}%` },
  grid: { top: 20, right: 20, bottom: 24, left: 40, containLabel: true },
  xAxis: {
    type: "category",
    data: activeDistribution.value.map((item) => scoreBandLabels[item.key]),
    axisTick: { show: false },
    axisLine: { lineStyle: { color: "#e1e2e6" } },
  },
  yAxis: {
    type: "value",
    max: 100,
    axisLabel: { formatter: "{value}%" },
    splitLine: { lineStyle: { color: "#ebecf0", type: "dashed" } },
  },
  series: [{
    type: "bar",
    name: "学生占比",
    data: activeDistribution.value.map((item) => item.rate),
    barMaxWidth: 44,
    itemStyle: { borderRadius: [4, 4, 0, 0] },
  }],
}));

const subjectSummaries = computed(() => {
  const current = currentSummary.value;
  if (!current) return [];
  return props.dataset.unifiedExamSummaries
    .filter((item) => item.examId === current.examId)
    .filter((item) => item.educationStage === current.educationStage && item.assessmentGrade === current.assessmentGrade)
    .sort((left, right) => left.subject.localeCompare(right.subject, "zh-CN"));
});
const subjectQualityOption = computed<EChartsCoreOption>(() => ({
  color: ["#36a269"],
  tooltip: { trigger: "axis", valueFormatter: (value: number | string) => `${value}%` },
  grid: { top: 20, right: 20, bottom: 24, left: 40, containLabel: true },
  xAxis: {
    type: "category",
    data: subjectSummaries.value.map((item) => item.subject),
    axisTick: { show: false },
    axisLine: { lineStyle: { color: "#e1e2e6" } },
  },
  yAxis: {
    type: "value",
    min: 0,
    max: 100,
    axisLabel: { formatter: "{value}%" },
    splitLine: { lineStyle: { color: "#ebecf0", type: "dashed" } },
  },
  series: [{
    type: "bar",
    name: "平均得分率",
    data: subjectSummaries.value.map((item) => item.scoreRate),
    barMaxWidth: 44,
    itemStyle: { borderRadius: [4, 4, 0, 0] },
  }],
}));

const trendSummaries = computed(() => props.dataset.unifiedExamSummaries
  .filter((item) => selectedStage.value === allValue || item.educationStage === selectedStage.value)
  .filter((item) => selectedGrade.value === allValue || item.assessmentGrade === selectedGrade.value)
  .filter((item) => selectedSubject.value === allValue || item.subject === selectedSubject.value)
  .sort((left, right) => left.examAt.localeCompare(right.examAt)));
const trendOption = computed<EChartsCoreOption>(() => ({
  color: ["#2d55eb"],
  tooltip: { trigger: "axis", valueFormatter: (value: number | string) => `${value}%` },
  grid: { top: 24, right: 24, bottom: 36, left: 44, containLabel: true },
  xAxis: {
    type: "category",
    data: trendSummaries.value.map((item) => item.examName),
    axisTick: { show: false },
    axisLine: { lineStyle: { color: "#e1e2e6" } },
    axisLabel: { interval: 0, rotate: trendSummaries.value.length > 4 ? 20 : 0 },
  },
  yAxis: {
    type: "value",
    min: 0,
    max: 100,
    axisLabel: { formatter: "{value}%" },
    splitLine: { lineStyle: { color: "#ebecf0", type: "dashed" } },
  },
  series: [{
    type: "line",
    name: selectedSchool.value === districtValue ? "区域得分率" : "学校得分率",
    data: trendSummaries.value.map((item) => (
      selectedSchool.value === districtValue
        ? item.scoreRate
        : item.schoolSummaries.find((school) => school.schoolId === selectedSchool.value)?.scoreRate ?? null
    )),
    smooth: true,
    connectNulls: false,
    symbolSize: 8,
  }],
}));

const schoolRows = computed(() => (currentSummary.value?.schoolSummaries ?? []).map((school) => ({
  ...school,
  schoolName: props.schoolNames[school.schoolId] ?? "未匹配学校名称",
})));
</script>

<template>
  <section class="academic-development" aria-label="区域学业质量分析">
    <header class="academic-development__header">
      <div>
        <h2>区域学业质量、结构与变化</h2>
        <p>所有结果均来自同一统考可比批次的学生成绩聚合；默认最低分析粒度为学校、年级、学科和群体。</p>
      </div>
      <ElTag type="warning" effect="light">部分可用</ElTag>
    </header>

    <section class="academic-development__dimensions" aria-label="学业分析维度">
      <label>
        <span>学段</span>
        <ElSelect v-model="selectedStage" aria-label="学业分析学段">
          <ElOption label="全部学段" :value="allValue" />
          <ElOption v-for="item in stageOptions" :key="item" :label="stageLabels[item]" :value="item" />
        </ElSelect>
      </label>
      <label>
        <span>年级</span>
        <ElSelect v-model="selectedGrade" aria-label="学业分析年级">
          <ElOption label="全部年级" :value="allValue" />
          <ElOption v-for="item in gradeOptions" :key="item" :label="item" :value="item" />
        </ElSelect>
      </label>
      <label>
        <span>学科</span>
        <ElSelect v-model="selectedSubject" aria-label="学业分析学科">
          <ElOption label="全部学科" :value="allValue" />
          <ElOption v-for="item in subjectOptions" :key="item" :label="item" :value="item" />
        </ElSelect>
      </label>
      <label>
        <span>考试类型</span>
        <ElSelect v-model="selectedExamType" aria-label="学业分析考试类型">
          <ElOption label="全部考试" :value="allValue" />
          <ElOption v-for="item in examTypeOptions" :key="item" :label="examTypeLabels[item]" :value="item" />
        </ElSelect>
      </label>
      <label>
        <span>学校</span>
        <ElSelect v-model="selectedSchool" aria-label="学业分析学校">
          <ElOption label="区域整体" :value="districtValue" />
          <ElOption v-for="item in schoolOptions" :key="item" :label="schoolNames[item] ?? '未匹配学校名称'" :value="item" />
        </ElSelect>
      </label>
    </section>

    <div class="academic-development__dimension-status">
      <span>已支持：学年、学期、学段、年级、学科、学校、考试类型</span>
      <ElTag type="warning" effect="plain">时间范围：当前单学期</ElTag>
      <ElTag type="info" effect="plain">学校类型、城乡片区：待学校主数据</ElTag>
    </div>

    <template v-if="currentSummary">
      <dl class="academic-development__metrics">
        <div v-for="metric in coreMetrics" :key="metric.key">
          <dt>{{ metric.label }}</dt>
          <dd>{{ metric.value }}</dd>
          <span>{{ metric.note }}</span>
        </div>
      </dl>

      <div class="academic-development__chart-grid">
        <section>
          <header>
            <h3>分数段分布</h3>
            <p>优秀、良好、及格和低分为互斥区间，人数合计等于当前有效成绩人数。</p>
          </header>
          <StudentGrowthChart class="academic-development__chart" :option="scoreBandOption" ariaLabelText="统考分数段学生占比图" />
        </section>
        <section>
          <header>
            <h3>各学科质量水平</h3>
            <p>{{ currentSummary.examName }}同年级各学科平均得分率。</p>
          </header>
          <StudentGrowthChart class="academic-development__chart" :option="subjectQualityOption" ariaLabelText="统考各学科平均得分率图" />
        </section>
      </div>

      <section class="academic-development__trend">
        <header>
          <div>
            <h3>期中—期末得分率变化</h3>
            <p>仅描述同考试计划下的得分率变化，不等同于控制试卷难度和起点差异后的正式增值。</p>
          </div>
        </header>
        <StudentGrowthChart class="academic-development__trend-chart" :option="trendOption" ariaLabelText="统考得分率变化趋势图" />
      </section>

      <section class="academic-development__schools">
        <header>
          <div>
            <h3>校际质量结构</h3>
            <p>同时查看平均得分率与学生分层结构；标准分以区域学生群体为基准，不生成学校综合排名。</p>
          </div>
        </header>
        <ElTable :data="schoolRows" row-key="schoolId" stripe border>
          <ElTableColumn prop="schoolName" column-key="school" label="学校" min-width="190" show-overflow-tooltip />
          <ElTableColumn column-key="score-rate" label="平均得分率" min-width="130">
            <template #default="{ row }">{{ formatPercent(row.scoreRate) }}</template>
          </ElTableColumn>
          <ElTableColumn column-key="standard-score" label="标准分" min-width="110">
            <template #default="{ row }">{{ formatNumber(row.standardScore) }}</template>
          </ElTableColumn>
          <ElTableColumn column-key="excellent-rate" label="优秀率" min-width="110">
            <template #default="{ row }">{{ formatPercent(row.excellentRate) }}</template>
          </ElTableColumn>
          <ElTableColumn column-key="good-rate" label="良好及以上率" min-width="130">
            <template #default="{ row }">{{ formatPercent(row.goodOrAboveRate) }}</template>
          </ElTableColumn>
          <ElTableColumn column-key="pass-rate" label="及格率" min-width="110">
            <template #default="{ row }">{{ formatPercent(row.passRate) }}</template>
          </ElTableColumn>
          <ElTableColumn column-key="low-rate" label="低分率" min-width="110">
            <template #default="{ row }">{{ formatPercent(row.lowScoreRate) }}</template>
          </ElTableColumn>
          <ElTableColumn column-key="coverage" label="成绩覆盖" min-width="120">
            <template #default="{ row }">{{ formatPercent(row.quality.coverageRate) }}</template>
          </ElTableColumn>
        </ElTable>
      </section>

      <ElAlert
        title="尚不能发布的学业分析"
        description="知识模块掌握需要题目—知识点映射；正式学业增值需要起点、终点、稳定匹配群体和模型版本；成绩稳定性至少需要三个可比批次；同类学校和城乡差异需要学校类型与片区主数据。"
        type="info"
        :closable="false"
        show-icon
      />
    </template>
    <ElEmpty v-else description="当前筛选范围暂无同口径统考数据" :image-size="80" />
  </section>
</template>

<style scoped>
.academic-development { display: grid; min-width: 0; gap: var(--spacing-16); }
.academic-development__header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--spacing-16); }
.academic-development__header h2 { color: var(--color-title); font-size: 20px; line-height: 30px; }
.academic-development__header p, .academic-development h3 + p { margin-top: var(--spacing-4); color: var(--color-secondary); }
.academic-development__dimensions { display: grid; grid-template-columns: repeat(5, minmax(130px, 1fr)); gap: var(--spacing-12); padding: var(--spacing-16); border-radius: var(--radius-md); background: var(--color-white); }
.academic-development__dimensions label { display: grid; min-width: 0; gap: var(--spacing-6); color: var(--color-secondary); font-size: var(--font-size-xs); }
.academic-development__dimension-status { display: flex; flex-wrap: wrap; align-items: center; gap: var(--spacing-8); color: var(--color-secondary); font-size: var(--font-size-xs); }
.academic-development__metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); overflow: hidden; border-radius: var(--radius-md); background: var(--color-white); }
.academic-development__metrics > div { padding: var(--spacing-20); border-left: 1px solid var(--color-border); border-top: 1px solid var(--color-border); }
.academic-development__metrics > div:nth-child(-n + 3) { border-top: 0; }
.academic-development__metrics > div:nth-child(3n + 1) { border-left: 0; }
.academic-development__metrics dt, .academic-development__metrics span { color: var(--color-secondary); }
.academic-development__metrics dd { margin-top: var(--spacing-8); color: var(--color-title); font-size: 28px; font-weight: var(--font-weight-semibold); line-height: 36px; }
.academic-development__metrics span { display: block; margin-top: var(--spacing-4); font-size: var(--font-size-xs); }
.academic-development__chart-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--spacing-16); }
.academic-development__chart-grid > section, .academic-development__trend, .academic-development__schools { min-width: 0; padding: var(--spacing-20); border-radius: var(--radius-md); background: var(--color-white); }
.academic-development h3 { color: var(--color-title); font-size: var(--font-size-lg); line-height: var(--line-height-lg); }
.academic-development h3 + p { font-size: var(--font-size-xs); }
.academic-development__chart { height: 300px; margin-top: var(--spacing-8); }
.academic-development__trend-chart { height: 320px; margin-top: var(--spacing-8); }
.academic-development__schools header { margin-bottom: var(--spacing-12); }
@media (max-width: 1180px) { .academic-development__dimensions { grid-template-columns: repeat(3, minmax(130px, 1fr)); } }
@media (max-width: 900px) { .academic-development__chart-grid { grid-template-columns: 1fr; } .academic-development__metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); } .academic-development__metrics > div { border-top: 1px solid var(--color-border); border-left: 1px solid var(--color-border); } .academic-development__metrics > div:nth-child(-n + 2) { border-top: 0; } .academic-development__metrics > div:nth-child(2n + 1) { border-left: 0; } }
@media (max-width: 720px) { .academic-development__dimensions, .academic-development__metrics { grid-template-columns: 1fr; } .academic-development__metrics > div { border-top: 1px solid var(--color-border); border-left: 0; } .academic-development__metrics > div:first-child { border-top: 0; } }
</style>
