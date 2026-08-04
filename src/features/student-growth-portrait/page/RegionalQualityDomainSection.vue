<script setup lang="ts">
import { computed, ref } from "vue";
import type { EChartsCoreOption } from "echarts/core";
import type {
  PortraitDataset,
  PortraitDistribution,
  PortraitMetric,
} from "@/features/student-growth-portrait/data-contract";
import { portraitMetricDefinitionByKey } from "@/features/student-growth-portrait/metric-registry";
import {
  pageCapabilityForTopic,
  type StudentGrowthTopicKey,
} from "@/features/student-growth-portrait/page-capability-matrix";
import { studentGrowthTopicByKey } from "@/features/student-growth-portrait/topic-navigation";
import PortraitChart from "./PortraitChart.vue";
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
  "five-education": [
    "five-education-evaluation-coverage-rate",
    "five-education-evaluated-student-count",
    "five-education-evaluation-record-count",
    "five-education-evaluation-form-version-count",
  ],
  "sports-health": [
    "fitness-test-record-coverage-rate",
    "sports-goal-completion-rate",
  ],
  honor: [
    "honor-per-100-students",
    "honor-national-count",
    "honor-provincial-count",
    "honor-city-count",
  ],
  behavior: [
    "library-visit-count-last-30-days",
    "library-dwell-hours-per-student",
    "book-borrow-volume-last-30-days",
    "book-borrow-transaction-count-last-30-days",
  ],
  practice: [
    "practice-participation-rate",
    "practice-activity-count-per-student",
    "practice-category-count-per-student",
    "practice-category-coverage-rate",
  ],
  "daily-evaluation": [
    "daily-evaluation-record-coverage-rate",
    "daily-evaluation-positive-rate",
    "daily-evaluation-improvement-rate",
  ],
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
  "five-education": "比较各校评价数据覆盖率，不代表评价质量。",
  "sports-health": "比较各校体测覆盖率，只反映数据完整度，不代表学生健康水平。",
  honor: "比较各校有荣誉记录的学生覆盖率；缺少机会分母，不用于判断荣誉机会是否公平。",
  behavior: "比较各校有借阅记录的学生覆盖率；不用于判断阅读质量或学校资源水平。",
  practice: "比较各校已核验活动参与覆盖率；活动机会和质量不同，不用于学校排名。",
};
const comparisonDimension = ref<"grade" | "school">("grade");
const behaviorWindowDays = ref<7 | 30>(30);

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
const practiceDimensions = ([
  { key: "moral", label: "德育活动" },
  { key: "intellectual", label: "智育活动" },
  { key: "physical", label: "体育活动" },
  { key: "aesthetic", label: "美育活动" },
  { key: "labor", label: "劳动实践" },
  { key: "club", label: "社团活动" },
  { key: "volunteer", label: "志愿活动" },
] as const);
const topicChartColors: Readonly<Record<RegionalQualityTopic, string>> = {
  "five-education": "#2d55eb",
  "sports-health": "#13a889",
  honor: "#7a5af8",
  behavior: "#f5a623",
  practice: "#36b37e",
  "daily-evaluation": "#2d55eb",
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
  const metricKeys = props.topicKey === "behavior"
    ? [
        `library-visit-count-last-${behaviorWindowDays.value}-days`,
        "library-dwell-hours-per-student",
        `book-borrow-volume-last-${behaviorWindowDays.value}-days`,
        `book-borrow-transaction-count-last-${behaviorWindowDays.value}-days`,
      ]
    : preferredMetricKeys[props.topicKey];
  return metricKeys
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
    ? dailyEvaluationRows.value.length === 1
      ? `${dailyEvaluationRows.value[0]?.label ?? "当前年级"}日常评价构成`
      : "日常评价构成 · 年级对比"
    : `${metricLabel(primaryMetric.value)} · ${comparisonDimension.value === "grade" ? "年级分布" : "学校分布"}`
));
const chartAriaLabel = computed(() => (
  props.topicKey === "daily-evaluation" && dailyEvaluationRows.value.length === 1
    ? `${dailyEvaluationRows.value[0]?.label ?? "当前年级"}日常评价构成`
    : `${topic.value.label}${comparisonDimension.value === "grade" ? "年级" : "学校"}对比`
));

const chartDescription = computed(() => (
  comparisonDimension.value === "school"
    ? `${schoolComparisonDescriptions[props.topicKey] ?? "当前指标不支持学校横向比较。"} 圆点表示单校结果，虚线表示当前范围均值。`
    : props.topicKey === "daily-evaluation"
      ? dailyEvaluationRows.value.length === 1
        ? "环图展示当前年级表扬与待改进记录构成，只描述评价记录结构，不代表学生表现优劣。"
        : "色带展示各年级表扬与待改进记录的百分比构成，只描述横截面结构，不代表同一学生的成长轨迹。"
      : "圆点按同一指标口径展示各年级结果，虚线为当前范围均值；缺少有效记录的学生仍保留在分母中。"
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
      label: metricLabel(metric),
      value: metricValue(metric),
      detail: metricYearOverYearText(metric, previousMetricByKey.get(metric.key)),
      tone: metricYearOverYearTone(metric, previousMetricByKey.get(metric.key)),
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
    },
    legend: {
      type: "scroll",
      data: data.map((item) => item.name),
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
    series: [{
      name: dimension.label,
      type: "pie",
      radius: ["40%", "70%"],
      center: ["50%", "43%"],
      avoidLabelOverlap: false,
      padAngle: 2,
      itemStyle: {
        borderRadius: 4,
      },
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: false,
      },
      data,
    }],
  };
  return { ...dimension, option, total };
}));

const behaviorBookChart = computed(() => {
  const distribution = props.dataset.distributions.find(
    (item) => item.key === "behavior-book-category-distribution",
  );
  const data = distribution?.items
    .filter((item) => item.studentCount && item.studentCount > 0)
    .map((item) => ({
      name: item.key,
      value: item.studentCount ?? 0,
    })) ?? [];
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const option: EChartsCoreOption = {
    color: ["#2d55eb", "#21a179", "#f5a623", "#7a5af8", "#f36f56", "#5b8ff9"],
    tooltip: {
      trigger: "item",
    },
    legend: {
      type: "scroll",
      data: data.map((item) => item.name),
      orient: "vertical",
      top: "middle",
      right: "8%",
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: "#575859",
        fontSize: 11,
      },
    },
    series: [{
      name: "借阅类别",
      type: "pie",
      radius: ["40%", "70%"],
      center: ["32%", "50%"],
      avoidLabelOverlap: false,
      padAngle: 2,
      itemStyle: {
        borderRadius: 4,
      },
      label: {
        show: false,
        position: "center",
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: false,
      },
      data,
    }],
  };
  return { option, total };
});

const fiveEducationDimensionDistributions = computed(() => (
  props.dataset.distributions.filter((distribution) => (
    distribution.key.startsWith("five-education-dimension-")
    && distribution.key.endsWith("-level-distribution")
  ))
));

const fiveEducationDistributionExplanationItems = [
  {
    label: "数据来源",
    value: "来自评价表管理；当前学期每张已发布且适用的表对应一张热力图。",
  },
  {
    label: "表内结构",
    value: "横轴为一级指标，纵轴为评价等级，格子汇总最底层评价项结果。",
  },
  {
    label: "学期切换",
    value: "切换学期后重新读取该学期的评价表和结果；表数量与结构可以变化。",
  },
  {
    label: "计算方式",
    value: "某等级占比 = 该等级评价数 ÷ 本指标全部评价数。",
  },
  {
    label: "学校横评",
    value: "仅比较同学期、同评价表、同一级指标和同等级，且在籍学生不少于 10 人、数据覆盖率不低于 80% 的学校；悬浮时显示最高、最低学校名称。",
  },
  {
    label: "计算示例",
    value: "同一格子中，A校 72÷120=60%，B校 45÷100=45%，C校 44÷80=55%；A校最高、B校最低，区域占比为 161÷300=53.67%。",
  },
  {
    label: "解读边界",
    value: "区域值按评价数汇总，不是各校占比的平均值；学校名称只标记当前格子的两端，不代表学校综合排名。",
  },
] as const;

interface FiveEducationSchoolComparison {
  highest: number;
  highestSchoolNames: string[];
  lowest: number;
  lowestSchoolNames: string[];
  schoolCount: number;
}

interface FiveEducationHeatmapDatum {
  value: [number, number, number];
  dimensionLabel: string;
  levelLabel: string;
  count: number;
  total: number;
  schoolComparison?: FiveEducationSchoolComparison;
}

function heatmapDatumFrom(params: unknown) {
  if (!params || typeof params !== "object" || !("data" in params)) return undefined;
  const data = (params as { data?: unknown }).data;
  if (!data || typeof data !== "object" || !("value" in data)) return undefined;
  return data as FiveEducationHeatmapDatum;
}

function createFiveEducationHeatmapOption(
  distributions: readonly PortraitDistribution[],
  schools: readonly {
    schoolId: string;
    distributions: readonly PortraitDistribution[];
  }[],
  schoolNames: Readonly<Record<string, string>>,
): EChartsCoreOption {
  const axisColor = "#898a8c";
  const sortedDistributions = [...distributions].sort((left, right) => (
    (left.order ?? Number.MAX_SAFE_INTEGER) - (right.order ?? Number.MAX_SAFE_INTEGER)
    || (left.label ?? left.key).localeCompare(right.label ?? right.key, "zh-CN")
  ));
  const levelMap = new Map<string, { key: string; label: string; order: number }>();
  sortedDistributions.forEach((distribution) => {
    distribution.items.forEach((item) => {
      const current = levelMap.get(item.key);
      if (!current || (item.order ?? Number.MAX_SAFE_INTEGER) < current.order) {
        levelMap.set(item.key, {
          key: item.key,
          label: item.label ?? item.key,
          order: item.order ?? Number.MAX_SAFE_INTEGER,
        });
      }
    });
  });
  const levels = [...levelMap.values()].sort((left, right) => (
    left.order - right.order || left.label.localeCompare(right.label, "zh-CN")
  ));
  const schoolComparisonFor = (
    distributionKey: string,
    levelKey: string,
  ): FiveEducationSchoolComparison | undefined => {
    const values = schools
      .flatMap((school) => school.distributions
        .filter((distribution) => distribution.key === distributionKey)
        .flatMap((distribution) => {
        const item = distribution.items.find((candidate) => candidate.key === levelKey);
          return item
            ? [{
                schoolName: schoolNames[school.schoolId] ?? school.schoolId,
                value: item.value,
              }]
            : [];
        }))
      .sort((left, right) => left.value - right.value);
    if (values.length === 0) return undefined;
    const highest = values[values.length - 1]?.value ?? 0;
    const lowest = values[0]?.value ?? 0;
    return {
      highest,
      highestSchoolNames: values
        .filter((item) => item.value === highest)
        .map((item) => item.schoolName),
      lowest,
      lowestSchoolNames: values
        .filter((item) => item.value === lowest)
        .map((item) => item.schoolName),
      schoolCount: values.length,
    };
  };
  const data = sortedDistributions.flatMap((distribution, dimensionIndex) => {
    const total = distribution.items.reduce((sum, item) => sum + (item.studentCount ?? 0), 0);
    return levels.flatMap((level, levelIndex) => {
      const item = distribution.items.find((candidate) => candidate.key === level.key);
      if (!item) return [];
      return [{
        value: [dimensionIndex, levelIndex, item.value],
        dimensionLabel: distribution.label ?? distribution.key,
        levelLabel: level.label,
        count: item.studentCount ?? 0,
        total,
        schoolComparison: schoolComparisonFor(distribution.key, level.key),
      } satisfies FiveEducationHeatmapDatum];
    });
  });
  const hasDataZoom = sortedDistributions.length > 6;
  return {
    tooltip: {
      formatter: (params: unknown) => {
        const datum = heatmapDatumFrom(params);
        if (!datum) return "";
        return [
          `${datum.dimensionLabel} · ${datum.levelLabel}`,
          `区域占比 ${datum.value[2].toFixed(2)}%`,
          `评价数 ${datum.count} / ${datum.total}`,
          ...(datum.schoolComparison
            ? datum.schoolComparison.schoolCount === 1
              ? [
                  `${datum.schoolComparison.highestSchoolNames.join("、")} 占比 ${datum.schoolComparison.highest.toFixed(2)}%`,
                ]
              : [
                  `${datum.schoolComparison.highestSchoolNames.join("、")} 占比 ${datum.schoolComparison.highest.toFixed(2)}% 最高`,
                  `${datum.schoolComparison.lowestSchoolNames.join("、")} 占比 ${datum.schoolComparison.lowest.toFixed(2)}% 最低`,
                ]
            : ["学校横评 暂无足够可比学校"]),
        ].join("<br/>");
      },
    },
    grid: {
      top: 8,
      right: 12,
      bottom: hasDataZoom ? 78 : 52,
      left: 8,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: sortedDistributions.map((distribution) => distribution.label ?? distribution.key),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: axisColor,
        fontSize: 11,
        interval: 0,
        width: 72,
        overflow: "truncate",
      },
      splitArea: { show: false },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: levels.map((level) => level.label),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: axisColor, fontSize: 11 },
      splitArea: { show: false },
    },
    visualMap: {
      dimension: 2,
      seriesIndex: 0,
      min: 0,
      max: 100,
      calculable: false,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      itemWidth: 8,
      itemHeight: 120,
      text: ["100%", "0%"],
      textGap: 8,
      textStyle: { color: axisColor, fontSize: 11 },
      inRange: {
        color: ["#eef4ff", "#b8cdfd", "#7398f6", "#2d55eb"],
      },
    },
    dataZoom: hasDataZoom
      ? [
          {
            type: "inside",
            xAxisIndex: 0,
            startValue: 0,
            endValue: 5,
            zoomOnMouseWheel: false,
            moveOnMouseMove: true,
          },
          {
            type: "slider",
            xAxisIndex: 0,
            startValue: 0,
            endValue: 5,
            bottom: 26,
            height: 14,
            showDetail: false,
            brushSelect: false,
            borderColor: "#ebecf0",
            fillerColor: "rgba(45, 85, 235, 0.14)",
            handleStyle: { color: "#2d55eb" },
            moveHandleStyle: { color: "#2d55eb" },
          },
        ]
      : undefined,
    series: [{
      name: "评价结果占比",
      type: "heatmap",
      data,
      label: {
        show: true,
        fontSize: 11,
        formatter: (params: unknown) => {
          const datum = heatmapDatumFrom(params);
          if (!datum) return "";
          const style = datum.value[2] >= 55 ? "inverse" : "default";
          return `{${style}|${datum.value[2]}%}`;
        },
        rich: {
          default: {
            color: "#242526",
          },
          inverse: {
            color: "#ffffff",
            fontWeight: 600,
          },
        },
      },
      itemStyle: {
        borderColor: "#ffffff",
        borderWidth: 2,
        borderRadius: 4,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: "rgba(45, 85, 235, 0.28)",
        },
      },
    }],
  };
}

const fiveEducationHeatmaps = computed(() => {
  const groups = new Map<string, {
    key: string;
    label: string;
    distributions: PortraitDistribution[];
  }>();
  fiveEducationDimensionDistributions.value.forEach((distribution) => {
    const group = distribution.group ?? { key: "current-form", label: "当前" };
    const current = groups.get(group.key) ?? {
      key: group.key,
      label: group.label,
      distributions: [],
    };
    current.distributions.push(distribution);
    groups.set(group.key, current);
  });
  return [...groups.values()].map((group) => ({
    ...group,
    option: createFiveEducationHeatmapOption(
      group.distributions,
      props.dataset.schools,
      props.schoolNames,
    ),
  }));
});

const fiveEducationFormNames = computed(() => (
  fiveEducationHeatmaps.value.map((heatmap) => `${heatmap.label}评价表`)
));

const practiceChartOption = computed<EChartsCoreOption>(() => {
  const axisColor = "#898a8c";
  const grades = props.dataset.grades;
  const data = practiceDimensions.flatMap((dimension, dimensionIndex) => (
    grades.map((grade, gradeIndex) => {
      const metric = grade.metrics.find(
        (item) => item.key === `practice-${dimension.key}-participation-rate`,
      );
      return [
        gradeIndex,
        dimensionIndex,
        metric?.value ?? 0,
        metric?.numerator ?? 0,
        metric?.denominator ?? 0,
      ] as const;
    })
  ));
  return {
    tooltip: {
      trigger: "item",
      formatter: (params: { data: readonly [number, number, number, number, number] }) => {
        const [gradeIndex, dimensionIndex, value, numerator, denominator] = params.data;
        return [
          grades[gradeIndex]?.grade ?? "",
          `${practiceDimensions[dimensionIndex]?.label ?? ""}参与率：${value}%`,
          `参与学生：${numerator} / ${denominator} 人`,
        ].join("<br/>");
      },
    },
    grid: {
      top: 8,
      right: 12,
      bottom: 52,
      left: 8,
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: grades.map((grade) => grade.grade),
      axisLine: { lineStyle: { color: axisColor } },
      axisTick: { lineStyle: { color: axisColor } },
      axisLabel: { color: axisColor, fontSize: 11 },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: practiceDimensions.map((dimension) => dimension.label),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: axisColor, fontSize: 11 },
    },
    visualMap: {
      dimension: 2,
      seriesIndex: 0,
      min: 0,
      max: 100,
      calculable: false,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      itemWidth: 8,
      itemHeight: 120,
      text: ["100%", "0%"],
      textGap: 8,
      textStyle: { color: axisColor, fontSize: 11 },
      inRange: {
        color: ["#eef4ff", "#b8cdfd", "#7398f6", "#2d55eb"],
      },
    },
    series: [{
      name: "参与率",
      type: "heatmap",
      data,
      label: {
        show: true,
        formatter: (params: { data: readonly [number, number, number] }) => (
          params.data[2] >= 55
            ? `{inverse|${params.data[2]}%}`
            : `{default|${params.data[2]}%}`
        ),
        fontSize: 11,
        rich: {
          default: { color: "#252526" },
          inverse: { color: "#ffffff", fontWeight: 600 },
        },
      },
      itemStyle: {
        borderColor: "#ffffff",
        borderWidth: 2,
        borderRadius: 4,
      },
      emphasis: {
        itemStyle: {
          borderColor: "#2d55eb",
          borderWidth: 2,
        },
      },
    }],
  };
});

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
  if (props.topicKey !== "sports-health") {
    const calculationMetrics = [...new Map(
      [primaryMetric.value, ...metrics.value]
        .filter((metric): metric is PortraitMetric => Boolean(metric))
        .map((metric) => [metric.key, metric]),
    ).values()];
    const items = [
      { label: "国家依据", value: topicNationalBasis[props.topicKey] },
      ...calculationMetrics.map((metric) => ({
        label: metricLabel(metric),
        value: metricCalculationDetail(metric),
      })),
      { label: "可比范围", value: comparabilityLabel(primaryMetric.value) },
    ];
    if (capability.value.limitation) {
      items.push({ label: "当前边界", value: capability.value.limitation });
    }
    return items;
  }
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
  const chartColor = topicChartColors[props.topicKey];
  const currentRangeValue = primaryMetric.value?.value;

  if (isDailyEvaluation && dailyEvaluationRows.value.length === 1) {
    const row = dailyEvaluationRows.value[0];
    return {
      color: ["#2d55eb", "#f59f00"],
      tooltip: {
        trigger: "item",
        valueFormatter: (value: number | string) => `${value}%`,
      },
      legend: {
        top: 0,
        right: 12,
        textStyle: { color: axisColor, fontSize: 11 },
      },
      series: [{
        name: `${row?.label ?? "当前年级"}日常评价构成`,
        type: "pie",
        radius: ["46%", "70%"],
        center: ["50%", "55%"],
        padAngle: 2,
        itemStyle: { borderRadius: 4 },
        label: {
          show: true,
          formatter: "{b}\n{c}%",
          color: "#575859",
          fontSize: 11,
          lineHeight: 18,
        },
        labelLine: {
          length: 12,
          length2: 8,
        },
        data: [
          { name: "表扬", value: row?.praise.value ?? 0 },
          { name: "待改进", value: row?.improvement.value ?? 0 },
        ],
      }],
    };
  }

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "line" },
      valueFormatter: (value: number | string) => `${value}%`,
    },
    legend: isDailyEvaluation
      ? {
          top: 0,
          right: 12,
          icon: "roundRect",
          itemWidth: 10,
          itemHeight: 10,
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
            type: "line",
            stack: "评价构成",
            symbol: "none",
            data: dailyEvaluationRows.value.map((row) => row.praise.value),
            lineStyle: { width: 2, color: "#2d55eb" },
            itemStyle: { color: "#2d55eb" },
            areaStyle: { color: "rgba(45, 85, 235, 0.42)" },
          },
          {
            name: "待改进",
            type: "line",
            stack: "评价构成",
            symbol: "none",
            data: dailyEvaluationRows.value.map((row) => row.improvement.value),
            lineStyle: { width: 0, color: "#f59f00" },
            itemStyle: { color: "#f59f00" },
            areaStyle: { color: "rgba(245, 159, 0, 0.38)" },
          },
        ]
      : [{
          name: metricLabel(primaryMetric.value),
          type: "scatter",
          symbol: "circle",
          symbolSize: 16,
          data: values,
          itemStyle: {
            color: chartColor,
            borderColor: "#ffffff",
            borderWidth: 2,
          },
          label: {
            show: true,
            position: "top",
            formatter: "{c}%",
            color: "#575859",
            fontSize: 11,
          },
          markLine: {
            silent: true,
            symbol: ["none", "none"],
            lineStyle: {
              color: chartColor,
              type: "dashed",
              width: 1,
              opacity: 0.72,
            },
            label: {
              color: chartColor,
              fontSize: 11,
              position: "insideEndBottom",
              distance: 6,
              formatter: `均值 ${currentRangeValue ?? 0}%`,
            },
            data: currentRangeValue === undefined
              ? []
              : [{ yAxis: currentRangeValue, name: "当前范围均值" }],
          },
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

function metricCalculationDetail(metric: PortraitMetric) {
  const calculation = metricMethod(metric);
  if (metric.numerator !== undefined && metric.denominator !== undefined && metric.denominator > 0) {
    return `${calculation} 当前范围：${metric.numerator.toLocaleString("zh-CN")} ÷ ${metric.denominator.toLocaleString("zh-CN")} = ${metricValue(metric)}。`;
  }
  return `${calculation} 当前范围结果为 ${metricValue(metric)}。`;
}
</script>

<template>
  <div class="regional-quality-domain">
    <div>
      <section
        class="regional-quality-domain__metric-group"
        :class="{ 'has-heading': ['sports-health', 'behavior', 'practice'].includes(topicKey) }"
      >
        <div
          v-if="['sports-health', 'behavior', 'practice'].includes(topicKey)"
          class="regional-quality-domain__metric-heading"
        >
          <h3 v-if="topicKey === 'sports-health'">体测与运动参与</h3>
          <h3 v-else-if="topicKey === 'behavior'">阅读行为概览</h3>
          <h3 v-else>实践参与概览</h3>
          <ElRadioGroup
            v-if="topicKey === 'behavior'"
            v-model="behaviorWindowDays"
            size="small"
            aria-label="行为习惯统计周期"
          >
            <ElRadioButton :value="30">近 30 天</ElRadioButton>
            <ElRadioButton :value="7">近 7 天</ElRadioButton>
          </ElRadioGroup>
        </div>
        <div
          class="regional-quality-domain__metrics"
          :class="`has-${Math.min(displayMetricCards.length, 5)}-items`"
        >
          <article v-for="metric in displayMetricCards" :key="metric.key">
            <span>{{ metric.label }}</span>
            <strong>{{ metric.value }}</strong>
            <div class="regional-quality-domain__metric-detail">
              <small :class="`is-${metric.tone}`">{{ metric.detail }}</small>
              <ElPopover
                v-if="metric.key === 'five-education-evaluation-form-version-count'"
                placement="bottom-start"
                trigger="hover"
                :show-after="120"
              >
                <template #reference>
                  <button
                    type="button"
                    class="regional-quality-domain__form-trigger"
                    aria-label="查看当前学期评价表"
                  >
                    查看评价表
                  </button>
                </template>
                <div class="regional-quality-domain__form-list">
                  <strong>当前学期评价表</strong>
                  <span v-for="formName in fiveEducationFormNames" :key="formName">
                    {{ formName }}
                  </span>
                </div>
              </ElPopover>
            </div>
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
          <PortraitChart
            :option="chart.option"
            :ariaLabelText="`荣誉发展${chart.label}数量统计，共 ${chart.total} 项`"
          />
        </div>
      </article>
    </section>

    <article
      v-if="topicKey === 'five-education'"
      class="regional-quality-domain__panel regional-quality-domain__five-education-chart"
    >
      <header>
        <div>
          <h3>一级指标评价等级构成</h3>
          <p>颜色越深，占比越高；空白表示暂无结果。</p>
        </div>
        <div class="regional-quality-domain__actions">
          <PortraitHintPopover
            label="统计说明"
            title="一级指标评价等级构成说明"
            :items="fiveEducationDistributionExplanationItems"
            status-label="具备计算条件"
            status-type="success"
          />
        </div>
      </header>
      <div
        class="regional-quality-domain__five-education-heatmaps"
        :class="{ 'is-single': fiveEducationHeatmaps.length === 1 }"
      >
        <section
          v-for="heatmap in fiveEducationHeatmaps"
          :key="heatmap.key"
          class="regional-quality-domain__five-education-heatmap"
        >
          <div class="regional-quality-domain__five-education-heatmap-heading">
            <strong>{{ heatmap.label }}评价表</strong>
          </div>
          <div class="regional-quality-domain__five-education-heatmap-canvas">
            <PortraitChart
              :option="heatmap.option"
              :ariaLabelText="`五育评价${heatmap.label}评价表一级指标评价等级热力图`"
            />
          </div>
        </section>
      </div>
    </article>

    <article
      v-if="topicKey === 'behavior'"
      class="regional-quality-domain__panel regional-quality-domain__behavior-chart"
    >
      <header>
        <div>
          <h3>图书借阅类别构成</h3>
        </div>
      </header>
      <div class="regional-quality-domain__behavior-chart-canvas">
        <PortraitChart
          :option="behaviorBookChart.option"
          :ariaLabelText="`行为习惯图书借阅类别统计，共 ${behaviorBookChart.total} 册`"
        />
      </div>
    </article>

    <article
      v-if="topicKey === 'practice'"
      class="regional-quality-domain__panel regional-quality-domain__practice-chart"
    >
      <header>
        <div>
          <h3>实践活动参与结构 · 年级热力图</h3>
          <p>颜色越深表示参与率越高；参与率 = 至少参加一次该类已核验活动的去重学生数 ÷ 该年级有效在籍学生数。</p>
        </div>
      </header>
      <div class="regional-quality-domain__practice-chart-canvas">
        <PortraitChart
          :option="practiceChartOption"
          ariaLabelText="实践活动七类参与率年级热力图"
        />
      </div>
    </article>

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
        <PortraitChart
          :option="chartOption"
          :ariaLabelText="chartAriaLabel"
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
.regional-quality-domain__metrics.has-3-items { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.regional-quality-domain__metrics.has-4-items { grid-template-columns: repeat(4, minmax(0, 1fr)); }

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

.regional-quality-domain__metric-group.is-sports,
.regional-quality-domain__metric-group.has-heading {
  display: grid;
  gap: var(--spacing-12);
}

.regional-quality-domain__metric-group > h3,
.regional-quality-domain__metric-heading h3 {
  font-size: var(--font-size-lg);
  line-height: var(--line-height-lg);
  font-weight: 600;
}

.regional-quality-domain__metric-heading {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-12);
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

.regional-quality-domain__metric-detail {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-8);
}

.regional-quality-domain__form-trigger {
  flex: none;
  padding: 0;
  border: 0;
  color: var(--color-primary);
  background: transparent;
  font: inherit;
  font-size: var(--font-size-xs);
  cursor: pointer;
}

.regional-quality-domain__form-trigger:focus-visible {
  outline: 2px solid var(--color-primary-line-light);
  outline-offset: 2px;
}

.regional-quality-domain__form-list {
  display: grid;
  gap: var(--spacing-8);
  color: var(--color-body);
  font-size: var(--font-size-sm);
}

.regional-quality-domain__form-list strong {
  color: var(--color-title);
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

.regional-quality-domain__behavior-chart-canvas {
  min-width: 0;
  height: 260px;
}

.regional-quality-domain__practice-chart-canvas {
  min-width: 0;
  height: 300px;
}

.regional-quality-domain__five-education-heatmaps {
  display: grid;
  min-width: 0;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: var(--spacing-16);
}

.regional-quality-domain__five-education-heatmaps.is-single {
  grid-template-columns: minmax(0, 1fr);
}

.regional-quality-domain__five-education-heatmap {
  display: grid;
  min-width: 0;
  gap: var(--spacing-8);
}

.regional-quality-domain__five-education-heatmap-heading {
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-12);
  text-align: center;
}

.regional-quality-domain__five-education-heatmap-heading strong {
  color: var(--color-title);
  font-size: var(--font-size-sm);
}

.regional-quality-domain__five-education-heatmap-canvas {
  min-width: 0;
  height: 270px;
}

.regional-quality-domain__panel {
  display: grid;
  gap: var(--spacing-16);
  padding: var(--spacing-16);
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
}

@media (max-width: 1380px) {
  .regional-quality-domain__metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .regional-quality-domain__metrics.has-1-items,
  .regional-quality-domain__metrics.has-2-items,
  .regional-quality-domain__metrics.has-3-items,
  .regional-quality-domain__metrics.has-4-items { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .regional-quality-domain__honor-charts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 760px) {
  .regional-quality-domain__metrics,
  .regional-quality-domain__metrics.has-1-items,
  .regional-quality-domain__metrics.has-2-items,
  .regional-quality-domain__metrics.has-3-items,
  .regional-quality-domain__metrics.has-4-items { grid-template-columns: 1fr; }
  .regional-quality-domain__honor-charts { grid-template-columns: 1fr; }
  .regional-quality-domain__five-education-heatmaps { grid-template-columns: 1fr; }
  .regional-quality-domain__metric-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
