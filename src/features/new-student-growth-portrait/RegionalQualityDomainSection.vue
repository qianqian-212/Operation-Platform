<script setup lang="ts">
import { computed, ref } from "vue";
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
  yearOverYearDataset?: PortraitDataset;
  topicKey: RegionalQualityTopic;
  schoolNames: Readonly<Record<string, string>>;
}>();

const preferredMetricKeys: Readonly<Record<RegionalQualityTopic, readonly string[]>> = {
  "five-education": ["five-education-evaluation-coverage-rate"],
  "sports-health": [
    "enrolled-student-count",
    "fitness-test-record-coverage-rate",
    "sports-goal-completion-rate",
  ],
  honor: ["honor-per-100-students"],
  behavior: ["library-visit-coverage-rate", "library-borrower-coverage-rate"],
  practice: ["practice-participation-rate"],
  "daily-evaluation": ["daily-evaluation-record-coverage-rate"],
};

const primaryMetricKeys: Readonly<Record<RegionalQualityTopic, string>> = {
  "five-education": "five-education-evaluation-coverage-rate",
  "sports-health": "fitness-test-record-coverage-rate",
  honor: "honor-student-coverage-rate",
  behavior: "library-borrower-coverage-rate",
  practice: "practice-participation-rate",
  "daily-evaluation": "daily-evaluation-record-coverage-rate",
};

const schoolComparisonTopics = new Set<RegionalQualityTopic>([
  "five-education",
  "sports-health",
  "honor",
  "behavior",
  "practice",
]);
const schoolComparisonDescriptions: Partial<Record<RegionalQualityTopic, string>> = {
  "five-education": "比较各校有效评价记录覆盖率，只反映数据完整度，不代表评价质量。",
  "sports-health": "比较各校体测记录覆盖率，只反映数据完整度，不代表学生健康水平。",
  honor: "比较各校有荣誉记录的学生覆盖率；缺少机会分母，不用于判断荣誉机会是否公平。",
  behavior: "比较各校有借阅记录的学生覆盖率；不用于判断阅读质量或学校资源水平。",
  practice: "比较各校已核验活动参与覆盖率；活动机会和质量不同，不用于学校排名。",
};
const comparisonDimension = ref<"grade" | "school">("grade");

const honorItemLabels: Readonly<Record<string, string>> = {
  "outstanding-student": "优秀学生奖",
  "subject-competition": "学科竞赛奖",
  "academic-innovation": "学术创新奖",
  "social-practice": "优秀社会实践奖",
  "student-leader": "优秀学生干部奖",
  "sports-competition": "体育竞赛奖",
  "artistic-performance": "优秀艺术表演奖",
  "art-work": "优秀美术作品奖",
  "student-scholarship": "优秀学生奖学金",
  "campus-culture-art": "校园文化艺术奖",
  "financial-aid": "助学金",
  "work-study": "勤工助学奖",
  international: "国际级",
  national: "国家级",
  provincial: "省级",
  city: "市级",
  district: "区县级",
  school: "校级",
  special: "特等奖",
  first: "一等奖",
  second: "二等奖",
  third: "三等奖",
  other: "其他",
};
const honorDimensions = ([
  { key: "award-type", label: "奖项类型" },
  { key: "award-level", label: "奖项级别" },
  { key: "award-grade", label: "奖项等级" },
] as const);

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
  props.dataset.metrics.find((metric) => metric.key === primaryMetricKeys[props.topicKey])
  ?? metrics.value[0]
));

const canCompareSchools = computed(() => schoolComparisonTopics.has(props.topicKey));

const chartTitle = computed(() => (
  props.topicKey === "daily-evaluation"
    ? "日常评价结构 · 年级对比"
    : `${metricLabel(primaryMetric.value)} · ${comparisonDimension.value === "grade" ? "年级对比" : "学校对比"}`
));

const chartDescription = computed(() => (
  comparisonDimension.value === "school"
    ? schoolComparisonDescriptions[props.topicKey] ?? "当前指标不支持学校横向比较。"
    : props.topicKey === "daily-evaluation"
      ? "每个年级并列展示表扬与待改进记录占比；只描述评价记录结构，不解释为学生表现差异。"
      : "按同一指标口径比较各年级，缺少有效记录的学生仍保留在分母中。"
));

const comparisonRows = computed(() => {
  const metricKey = primaryMetricKeys[props.topicKey];
  if (comparisonDimension.value === "school" && canCompareSchools.value) {
    return props.dataset.schools
      .map((school) => ({
        label: props.schoolNames[school.schoolId] ?? "未匹配学校名称",
        metric: school.metrics.find((item) => item.key === metricKey),
      }))
      .filter((row): row is { label: string; metric: PortraitMetric } => Boolean(row.metric));
  }
  return props.dataset.grades
    .map((grade) => ({
      label: grade.grade,
      metric: grade.metrics.find((item) => item.key === metricKey),
    }))
    .filter((row): row is { label: string; metric: PortraitMetric } => Boolean(row.metric));
});

const comparisonValues = computed(() => comparisonRows.value.map(({ metric }) => metric.value));

function stageFitnessMetrics(dataset: PortraitDataset | undefined) {
  if (!dataset) return [];
  const stageLabels = {
    primary: "小学达标率",
    junior: "初中达标率",
    senior: "高中达标率",
  } as const;
  return (["primary", "junior", "senior"] as const).flatMap((educationStage) => {
    const stageMetrics = dataset.grades
      .filter((grade) => grade.educationStage === educationStage)
      .map((grade) => grade.metrics.find((metric) => metric.key === "fitness-standard-pass-rate"))
      .filter((metric): metric is PortraitMetric => Boolean(metric));
    const numerator = stageMetrics.reduce((total, metric) => total + (metric.numerator ?? 0), 0);
    const denominator = stageMetrics.reduce((total, metric) => total + (metric.denominator ?? 0), 0);
    if (denominator === 0) return [];
    return [{
      key: `fitness-pass-${educationStage}`,
      label: stageLabels[educationStage],
      value: Number(((numerator / denominator) * 100).toFixed(2)),
    }];
  });
}

const stageFitnessCards = computed(() => {
  if (props.topicKey !== "sports-health") return [];
  const previousByKey = new Map(
    stageFitnessMetrics(props.yearOverYearDataset).map((metric) => [metric.key, metric]),
  );
  return stageFitnessMetrics(props.dataset).map((metric) => ({
    ...metric,
    value: `${metric.value}%`,
    detail: yearOverYearText(metric.value, previousByKey.get(metric.key)?.value, true),
    tone: yearOverYearTone(metric.value, previousByKey.get(metric.key)?.value),
  }));
});

const displayMetricCards = computed(() => {
  const previousMetricByKey = new Map(
    props.yearOverYearDataset?.metrics.map((metric) => [metric.key, metric]) ?? [],
  );
  return [
    ...metrics.value.map((metric) => ({
      key: metric.key,
      label: metric.key === "enrolled-student-count" ? "学生总数" : metricLabel(metric),
      value: metricValue(metric),
      detail: metric.key === "enrolled-student-count"
        ? "同比 暂无可比"
        : metricYearOverYearText(metric, previousMetricByKey.get(metric.key)),
      tone: metric.key === "enrolled-student-count"
        ? "unavailable"
        : metricYearOverYearTone(metric, previousMetricByKey.get(metric.key)),
    })),
    ...stageFitnessCards.value,
  ];
});

const sunshineRunCards = computed(() => {
  if (props.topicKey !== "sports-health") return [];
  const metricByKey = new Map(props.dataset.metrics.map((metric) => [metric.key, metric]));
  const previousMetricByKey = new Map(
    props.yearOverYearDataset?.metrics.map((metric) => [metric.key, metric]) ?? [],
  );
  const totalDistance = metricByKey.get("sunshine-run-total-distance");
  const participation = metricByKey.get("sunshine-run-participation-rate");
  const sessions = metricByKey.get("sunshine-run-session-count");
  const distancePerParticipant = metricByKey.get("sunshine-run-distance-per-participant");
  const durationPerParticipant = metricByKey.get("sunshine-run-duration-per-participant");
  return [
    {
      key: "total-distance",
      label: "累计运动路程",
      value: totalDistance ? metricValue(totalDistance) : "—",
      detail: metricYearOverYearText(
        totalDistance,
        previousMetricByKey.get("sunshine-run-total-distance"),
      ),
      tone: metricYearOverYearTone(
        totalDistance,
        previousMetricByKey.get("sunshine-run-total-distance"),
      ),
    },
    {
      key: "participant-count",
      label: "累计运动人数",
      value: participation?.numerator !== undefined
        ? `${participation.numerator.toLocaleString("zh-CN")} 人`
        : "—",
      detail: yearOverYearText(
        participation?.numerator,
        previousMetricByKey.get("sunshine-run-participation-rate")?.numerator,
      ),
      tone: metricYearOverYearTone(
        participation,
        previousMetricByKey.get("sunshine-run-participation-rate"),
        true,
      ),
    },
    {
      key: "session-count",
      label: "累计运动人次",
      value: sessions ? metricValue(sessions) : "—",
      detail: metricYearOverYearText(
        sessions,
        previousMetricByKey.get("sunshine-run-session-count"),
      ),
      tone: metricYearOverYearTone(
        sessions,
        previousMetricByKey.get("sunshine-run-session-count"),
      ),
    },
    {
      key: "distance-per-participant",
      label: "人均运动路程",
      value: distancePerParticipant ? metricValue(distancePerParticipant) : "—",
      detail: metricYearOverYearText(
        distancePerParticipant,
        previousMetricByKey.get("sunshine-run-distance-per-participant"),
      ),
      tone: metricYearOverYearTone(
        distancePerParticipant,
        previousMetricByKey.get("sunshine-run-distance-per-participant"),
      ),
    },
    {
      key: "duration-per-participant",
      label: "人均运动时长",
      value: durationPerParticipant ? metricValue(durationPerParticipant) : "—",
      detail: metricYearOverYearText(
        durationPerParticipant,
        previousMetricByKey.get("sunshine-run-duration-per-participant"),
      ),
      tone: metricYearOverYearTone(
        durationPerParticipant,
        previousMetricByKey.get("sunshine-run-duration-per-participant"),
      ),
    },
  ];
});

const honorCharts = computed(() => honorDimensions.map((dimension) => {
  const distribution = props.dataset.distributions.find(
    (item) => item.key === `honor-${dimension.key}-distribution`,
  );
  const data = distribution?.items
    .filter((item) => item.studentCount && item.studentCount > 0)
    .map((item) => ({
      name: honorItemLabels[item.key] ?? item.key,
      value: item.studentCount ?? 0,
    })) ?? [];
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const option: EChartsCoreOption = {
    color: ["#2d55eb", "#21a179", "#5b8ff9", "#f5a623", "#7a5af8", "#36b37e", "#f36f56"],
    tooltip: {
      trigger: "item",
      formatter: "{b}<br/>{c} 项（{d}%）",
    },
    legend: {
      type: "scroll",
      bottom: 0,
      left: "center",
      width: "92%",
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: "#575859",
        fontSize: 11,
        width: 92,
        overflow: "truncate",
      },
    },
    title: {
      text: total.toLocaleString("zh-CN"),
      subtext: "总计（项）",
      left: "center",
      top: "31%",
      textAlign: "center",
      textStyle: {
        color: "#1f2329",
        fontSize: 20,
        fontWeight: 600,
      },
      subtextStyle: {
        color: "#898a8c",
        fontSize: 11,
        lineHeight: 18,
      },
    },
    series: [{
      name: dimension.label,
      type: "pie",
      radius: ["42%", "68%"],
      center: ["50%", "42%"],
      minAngle: 4,
      avoidLabelOverlap: true,
      itemStyle: { borderColor: "#ffffff", borderWidth: 2, borderRadius: 4 },
      label: { show: false },
      labelLine: { show: false },
      emphasis: { label: { show: false }, labelLine: { show: false } },
      data,
    }],
  };
  return { ...dimension, option, total };
}));

const dailyEvaluationRows = computed(() => props.dataset.grades
  .map((grade) => {
    const praise = grade.metrics.find((item) => item.key === "daily-evaluation-positive-rate");
    const improvement = grade.metrics.find((item) => item.key === "daily-evaluation-improvement-rate");
    return { label: grade.grade, praise, improvement };
  })
  .filter((row): row is {
    label: string;
    praise: PortraitMetric;
    improvement: PortraitMetric;
  } => Boolean(
    row.praise
    && row.improvement
    && row.praise.denominator
    && row.praise.denominator > 0,
  )));

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
  const isDailyEvaluation = props.topicKey === "daily-evaluation";
  const isSchoolComparison = comparisonDimension.value === "school";
  const categories = isDailyEvaluation
    ? dailyEvaluationRows.value.map((row) => row.label)
    : comparisonRows.value.map((row) => row.label);
  const hasSchoolDataZoom = isSchoolComparison && categories.length > 4;
  const values = comparisonValues.value;

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value: number | string) => `${value}%`,
    },
    legend: isDailyEvaluation
      ? {
          top: 0,
          right: 12,
          textStyle: { color: axisColor, fontSize: 11 },
        }
      : undefined,
    grid: {
      top: isDailyEvaluation ? 36 : 28,
      right: 12,
      bottom: hasSchoolDataZoom ? 48 : 8,
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
        rotate: 0,
        width: isSchoolComparison ? 104 : undefined,
        overflow: isSchoolComparison ? "truncate" : undefined,
      },
    },
    yAxis: {
      ...axisStyle,
      type: "value",
      max: 100,
      axisLabel: { color: axisColor, fontSize: 11, formatter: "{value}%" },
      splitLine: { lineStyle: { color: "#ebecf0" } },
    },
    dataZoom: hasSchoolDataZoom
      ? [
          {
            type: "inside",
            xAxisIndex: 0,
            startValue: 0,
            endValue: 3,
            zoomOnMouseWheel: false,
            moveOnMouseMove: true,
          },
          {
            type: "slider",
            xAxisIndex: 0,
            startValue: 0,
            endValue: 3,
            bottom: 4,
            height: 16,
            showDetail: false,
            brushSelect: false,
            borderColor: "#ebecf0",
            fillerColor: "rgba(45, 85, 235, 0.14)",
            handleStyle: { color: "#2d55eb" },
            moveHandleStyle: { color: "#2d55eb" },
          },
        ]
      : undefined,
    series: isDailyEvaluation
      ? [
          {
            name: "表扬",
            type: "bar",
            barMaxWidth: 32,
            data: dailyEvaluationRows.value.map((row) => row.praise.value),
            itemStyle: { color: "#2d55eb", borderRadius: [4, 4, 0, 0] },
            label: { show: true, position: "top", formatter: "{c}%", color: "#575859" },
          },
          {
            name: "待改进",
            type: "bar",
            barMaxWidth: 32,
            data: dailyEvaluationRows.value.map((row) => row.improvement.value),
            itemStyle: { color: "#f59f00", borderRadius: [4, 4, 0, 0] },
            label: { show: true, position: "top", formatter: "{c}%", color: "#575859" },
          },
        ]
      : [{
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

function yearOverYearText(
  current: number | undefined,
  previous: number | undefined,
  percentagePoint = false,
) {
  if (current === undefined || previous === undefined) return "同比 暂无可比";
  if (percentagePoint) {
    const difference = Number((current - previous).toFixed(2));
    const prefix = difference > 0 ? "+" : "";
    return `同比 ${prefix}${difference.toFixed(2)} 个百分点`;
  }
  if (previous === 0) return "同比 暂无可比";
  const rate = Number((((current - previous) / previous) * 100).toFixed(2));
  const prefix = rate > 0 ? "+" : "";
  return `同比 ${prefix}${rate.toFixed(2)}%`;
}

function yearOverYearTone(current: number | undefined, previous: number | undefined) {
  if (current === undefined || previous === undefined || previous === 0) return "unavailable";
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "flat";
}

function metricYearOverYearText(
  metric: PortraitMetric | undefined,
  previous: PortraitMetric | undefined,
) {
  if (
    !metric
    || !previous
    || ["insufficient", "unavailable"].includes(metric.quality.status)
    || ["insufficient", "unavailable"].includes(previous.quality.status)
  ) {
    return "同比 暂无可比";
  }
  return yearOverYearText(metric.value, previous.value, metric.unit === "%");
}

function metricYearOverYearTone(
  metric: PortraitMetric | undefined,
  previous: PortraitMetric | undefined,
  compareNumerator = false,
) {
  if (
    !metric
    || !previous
    || ["insufficient", "unavailable"].includes(metric.quality.status)
    || ["insufficient", "unavailable"].includes(previous.quality.status)
  ) {
    return "unavailable";
  }
  return yearOverYearTone(
    compareNumerator ? metric.numerator : metric.value,
    compareNumerator ? previous.numerator : previous.value,
  );
}

function metricBasis(metric: PortraitMetric) {
  if (metric.numerator === undefined || metric.denominator === undefined) return "按有效记录聚合";
  return `${metric.numerator.toLocaleString("zh-CN")} / ${metric.denominator.toLocaleString("zh-CN")}`;
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
    <div>
      <section
        class="regional-quality-domain__metric-group"
        :class="{ 'is-sports': topicKey === 'sports-health' }"
      >
        <h3 v-if="topicKey === 'sports-health'">体测与运动参与</h3>
        <div
          class="regional-quality-domain__metrics"
          :class="`has-${Math.min(displayMetricCards.length, 5)}-items`"
        >
          <article v-for="metric in displayMetricCards" :key="metric.key">
            <span>{{ metric.label }}</span>
            <strong>{{ metric.value }}</strong>
            <small :class="`is-${metric.tone}`">{{ metric.detail }}</small>
          </article>
        </div>
      </section>
    </div>

    <section v-if="topicKey === 'honor'" class="regional-quality-domain__honor-charts">
      <article
        v-for="chart in honorCharts"
        :key="chart.key"
        class="regional-quality-domain__panel regional-quality-domain__honor-chart"
      >
        <header>
          <div>
            <h3>{{ chart.label }}统计</h3>
          </div>
        </header>
        <div class="regional-quality-domain__honor-chart-canvas">
          <NewPortraitChart
            :option="chart.option"
            :ariaLabelText="`荣誉发展${chart.label}数量统计，共 ${chart.total} 项`"
          />
        </div>
      </article>
    </section>

    <section v-if="sunshineRunCards.length" class="regional-quality-domain__metric-group is-sports">
      <h3>阳光长跑</h3>
      <div class="regional-quality-domain__metrics has-5-items">
        <article v-for="metric in sunshineRunCards" :key="metric.key">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <small :class="`is-${metric.tone}`">{{ metric.detail }}</small>
        </article>
      </div>
    </section>

    <article class="regional-quality-domain__panel">
      <header>
        <div>
          <h3>{{ chartTitle }}</h3>
          <p>{{ chartDescription }}</p>
        </div>
        <div class="regional-quality-domain__actions">
          <ElRadioGroup
            v-if="canCompareSchools"
            v-model="comparisonDimension"
            size="small"
            :aria-label="`${topic.label}对比维度`"
          >
            <ElRadioButton value="grade">按年级</ElRadioButton>
            <ElRadioButton value="school">按学校</ElRadioButton>
          </ElRadioGroup>
          <ElTag v-else effect="plain">仅按年级</ElTag>
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
          :ariaLabelText="`${topic.label}${comparisonDimension === 'grade' ? '年级' : '学校'}对比`"
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
  gap: var(--spacing-16);
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

.regional-quality-domain__metric-group.is-sports {
  display: grid;
  gap: var(--spacing-12);
}

.regional-quality-domain__metric-group > h3 {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-lg);
  font-weight: 600;
}

.regional-quality-domain__metrics small.is-up {
  color: var(--color-success-dark-text);
}

.regional-quality-domain__metrics small.is-down {
  color: var(--color-error-dark-text);
}

.regional-quality-domain__metrics small.is-flat,
.regional-quality-domain__metrics small.is-unavailable {
  color: var(--color-secondary);
}

.regional-quality-domain__honor-charts {
  display: grid;
  min-width: 0;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-16);
}

.regional-quality-domain__honor-chart-canvas {
  min-width: 0;
  height: 250px;
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
  .regional-quality-domain__honor-charts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 760px) {
  .regional-quality-domain__metrics,
  .regional-quality-domain__metrics.has-1-items,
  .regional-quality-domain__metrics.has-2-items { grid-template-columns: 1fr; }
  .regional-quality-domain__honor-charts { grid-template-columns: 1fr; }
}
</style>
