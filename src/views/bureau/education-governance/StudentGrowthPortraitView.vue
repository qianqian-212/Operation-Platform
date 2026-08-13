<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, type ComponentPublicInstance } from "vue";
import { useRouter } from "vue-router";
import {
  Award,
  BookOpenCheck,
  ChartNoAxesCombined,
  ClipboardCheck,
  Dumbbell,
  LayoutDashboard,
  Search,
  Sparkles,
  Users,
} from "@lucide/vue";
import { ElMessage } from "element-plus";
import PageFilterBar from "@/components/PageFilterBar.vue";
import { pageRegistryByKey } from "@/config/page-registry";
import MetricDefinitionPopover from "@/features/student-growth-portrait/page/MetricDefinitionPopover.vue";
import PortraitChart from "@/features/student-growth-portrait/page/PortraitChart.vue";
import PortraitHintPopover from "@/features/student-growth-portrait/page/PortraitHintPopover.vue";
import RegionalQualityDomainSection from "@/features/student-growth-portrait/page/RegionalQualityDomainSection.vue";
import {
  nationalStandardAlignment,
  regionalPortraitNationalDimensions,
} from "@/features/student-growth-portrait/page/national-standard-alignment";
import {
  createUnifiedExamGradeComparisonOption,
  createUnifiedExamSubjectOption,
} from "@/features/student-growth-portrait/page/chart-options";
import { portraitAnchors } from "@/features/student-growth-portrait/page/data";
import type {
  EducationStage,
  PortraitDataset,
  PortraitMetric,
  PortraitQuery,
} from "@/features/student-growth-portrait/data-contract";
import {
  portraitMetricDefinitionByKey,
} from "@/features/student-growth-portrait/metric-registry";
import { runtimeStudentGrowthPortraitRepository } from "@/features/student-growth-portrait/runtime-student-growth-portrait-repository";
import {
  virtualPortraitSchoolNames,
} from "@/features/student-growth-portrait/virtual-portrait-raw-data-source";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();
const activeAnchor = ref<(typeof portraitAnchors)[number]["key"]>("regional-overview");
const timeGrain = ref<"semester" | "academic-year">("semester");
const periodKey = ref("2025-2026:first");
const stage = ref("全部学段");
const grade = ref("全部年级");
const academicSubject = ref("");
const nationalAlignmentPanels = ref<string[]>([]);
const comprehensiveDataset = ref<PortraitDataset>();
const yearOverYearDataset = ref<PortraitDataset>();
const regionalPopulationDataset = ref<PortraitDataset>();
const comprehensiveLoading = ref(false);
const comprehensiveError = ref("");
const portraitFilter = ref<ComponentPublicInstance | null>(null);
const portraitFilterHeight = ref(64);
const portraitStickyStyle = computed<Record<string, string>>(() => ({
  "--portrait-filter-height": `${portraitFilterHeight.value}px`,
}));
let comprehensiveRequestController: AbortController | null = null;
let portraitFilterResizeObserver: ResizeObserver | null = null;
const smartSportsPage = pageRegistryByKey.get("bureau-smart-sports-cockpit");

function openSmartSportsCockpit() {
  if (!smartSportsPage) return;
  const href = router.resolve({
    path: smartSportsPage.path,
    query: { tenantId: userStore.currentTenant.id },
  }).href;
  window.open(href, "_blank", "noopener,noreferrer");
}

const academicYearOptions = ["2025-2026", "2024-2025"] as const;
const timeGrainOptions = [
  { value: "semester" as const, label: "按学期" },
  { value: "academic-year" as const, label: "按学年" },
];

function formatAcademicYearLabel(year: string) {
  return year.replace("-", "—");
}

function semesterPeriodKey(year: string, term: "first" | "second") {
  return `${year}:${term}` as const;
}

function parseSemesterPeriodKey(key: string): { academicYear: string; term: "first" | "second" } {
  const [academicYear, term] = key.split(":");
  if (!academicYear || (term !== "first" && term !== "second")) {
    return { academicYear: "2025-2026", term: "first" };
  }
  return { academicYear, term };
}

const semesterPeriodOptions = academicYearOptions.flatMap((year) => ([
  {
    value: semesterPeriodKey(year, "first"),
    label: `${formatAcademicYearLabel(year)}学年第一学期`,
  },
  {
    value: semesterPeriodKey(year, "second"),
    label: `${formatAcademicYearLabel(year)}学年第二学期`,
  },
]));

const academicYearPeriodOptions = academicYearOptions.map((year) => ({
  value: year,
  label: `${formatAcademicYearLabel(year)}学年`,
}));

const periodOptions = computed(() => (
  timeGrain.value === "semester" ? semesterPeriodOptions : academicYearPeriodOptions
));

type PortraitFilterScope = {
  timeGrain: "semester" | "academic-year";
  academicYear: string;
  term: "first" | "second";
  stage: string;
  grade: string;
};

function resolvePeriodSelection(
  grain: PortraitFilterScope["timeGrain"],
  key: string,
): Pick<PortraitFilterScope, "academicYear" | "term"> {
  if (grain === "academic-year") {
    return {
      academicYear: academicYearOptions.includes(key as typeof academicYearOptions[number])
        ? key
        : academicYearOptions[0],
      term: "first",
    };
  }
  return parseSemesterPeriodKey(key);
}

const appliedScope = ref<PortraitFilterScope>({
  timeGrain: timeGrain.value,
  ...resolvePeriodSelection(timeGrain.value, periodKey.value),
  stage: stage.value,
  grade: grade.value,
});

function previousAcademicYear(year: string) {
  const [start, end] = year.split("-").map(Number);
  if (!start || !end) return year;
  return `${start - 1}-${end - 1}`;
}

function formatPeriodLabel(scope: Pick<PortraitFilterScope, "timeGrain" | "academicYear" | "term">) {
  const yearLabel = formatAcademicYearLabel(scope.academicYear);
  if (scope.timeGrain === "academic-year") return `${yearLabel}学年`;
  return `${yearLabel}学年${scope.term === "first" ? "第一学期" : "第二学期"}`;
}

function syncPeriodKeyForGrain(grain: PortraitFilterScope["timeGrain"]) {
  if (grain === "semester") {
    const year = academicYearOptions.includes(periodKey.value as typeof academicYearOptions[number])
      ? periodKey.value
      : parseSemesterPeriodKey(periodKey.value).academicYear;
    const nextKey = semesterPeriodKey(year, "first");
    periodKey.value = semesterPeriodOptions.some((option) => option.value === nextKey)
      ? nextKey
      : semesterPeriodOptions[0]!.value;
    return;
  }
  const year = academicYearOptions.includes(periodKey.value as typeof academicYearOptions[number])
    ? periodKey.value
    : parseSemesterPeriodKey(periodKey.value).academicYear;
  periodKey.value = academicYearPeriodOptions.some((option) => option.value === year)
    ? year
    : academicYearPeriodOptions[0]!.value;
}

function onTimeGrainChange() {
  syncPeriodKeyForGrain(timeGrain.value);
}

const anchorIcons = {
  "regional-overview": LayoutDashboard,
  "five-education": Sparkles,
  "sports-health": Dumbbell,
  honor: Award,
  behavior: BookOpenCheck,
  practice: Users,
  "daily-evaluation": ClipboardCheck,
  "data-coverage": ChartNoAxesCombined,
};

const regionalQualityTopics = [
  {
    key: "five-education",
    title: "综合评价概览",
    description: "按各学段评价表观察覆盖率与等级构成，不作跨校评分。",
    primaryMetricKey: "five-education-evaluation-coverage-rate",
  },
  {
    key: "sports-health",
    title: "运动健康",
    description: "",
    primaryMetricKey: "ai-exercise-participation-rate",
  },
  {
    key: "honor",
    title: "荣誉发展",
    description: "观察荣誉覆盖与每百名学生荣誉记录数；缺少机会分母时，不作学校公平性判断。",
    primaryMetricKey: "honor-student-coverage-rate",
  },
  {
    key: "behavior",
    title: "行为习惯",
    description: "按数据最新日观察近 7 天或近 30 天到馆与借阅累计值，并保留学期生均泡馆时长。",
    primaryMetricKey: "library-borrower-coverage-rate",
  },
  {
    key: "practice",
    title: "实践活动",
    description: "按已核验活动记录统计参与覆盖、参与强度与七类活动的年级结构，不把活动次数等同于活动质量。",
    primaryMetricKey: "practice-participation-rate",
  },
  {
    key: "daily-evaluation",
    title: "日常评价",
    description: "观察表扬与待改进记录结构；未接入整改闭环前不计算改进完成率。",
    primaryMetricKey: "daily-evaluation-record-coverage-rate",
  },
] as const;

const calculationMetricGroups = [
  {
    domain: "统考学业",
    metricKeys: [
      "academic-unified-exam-record-coverage-rate",
      "academic-unified-exam-average-score-rate",
      "academic-unified-exam-excellent-rate",
      "academic-unified-exam-good-or-above-rate",
      "academic-unified-exam-pass-rate",
      "academic-unified-exam-low-score-rate",
      "academic-unified-exam-score-band-distribution",
    ],
  },
  {
    domain: "综合评价",
    metricKeys: [
      "five-education-evaluation-coverage-rate",
      "five-education-evaluated-student-count",
      "five-education-evaluation-record-count",
      "five-education-evaluation-form-version-count",
    ],
  },
  {
    domain: "荣誉发展",
    metricKeys: [
      "honor-student-coverage-rate",
      "honor-per-100-students",
      "honor-national-count",
      "honor-provincial-count",
      "honor-city-count",
    ],
  },
  {
    domain: "行为习惯",
    metricKeys: [
      "library-borrower-coverage-rate",
      "library-visit-coverage-rate",
      "library-dwell-hours-per-student",
      "library-visit-count-last-7-days",
      "library-visit-count-last-30-days",
      "book-borrow-volume-last-7-days",
      "book-borrow-volume-last-30-days",
      "book-borrow-transaction-count-last-7-days",
      "book-borrow-transaction-count-last-30-days",
    ],
  },
  {
    domain: "实践活动",
    metricKeys: [
      "practice-participation-rate",
      "practice-activity-count-per-student",
      "practice-category-count-per-student",
      "practice-category-coverage-rate",
      "practice-moral-participation-rate",
      "practice-intellectual-participation-rate",
      "practice-physical-participation-rate",
      "practice-aesthetic-participation-rate",
      "practice-labor-participation-rate",
      "practice-club-participation-rate",
      "practice-volunteer-participation-rate",
    ],
  },
  {
    domain: "日常评价",
    metricKeys: [
      "daily-evaluation-record-coverage-rate",
      "daily-evaluation-positive-rate",
      "daily-evaluation-improvement-rate",
    ],
  },
] as const;

const distributionCalculationRows = [
  {
    key: "five-education-level-distribution",
    domain: "综合评价",
    label: "一级指标评价等级占比",
    calculation: "同一学期、评价表版本和一级指标内，某评价等级的有效评价结果数 ÷ 该一级指标全部有效评价结果数。",
  },
  {
    key: "honor-distributions",
    domain: "荣誉发展",
    label: "奖项类型、级别与等级构成",
    calculation: "对应分类的有效荣誉记录数 ÷ 当前筛选范围全部有效荣誉记录数；同一荣誉记录只进入一个对应分类。",
  },
  {
    key: "book-category-distribution",
    domain: "行为习惯",
    label: "图书借阅类别构成",
    calculation: "对应图书类别的有效借阅册数 ÷ 当前统计周期全部有效借阅册数；未识别类别单列为其他。",
  },
] as const;

const dataSourceNotes = [
  {
    label: "学生成长与综合素质",
    value: "正式接入时，五育评价、荣誉发展、行为习惯、实践活动和日常评价主要来源于各校单个学生的个人档案模块与学生成长数据；当前虚拟数据按同一字段契约模拟。",
  },
  {
    label: "统考学业",
    value: "正式接入时来源于统考计划、考试批次、试卷版本和学生成绩记录；只在同一考试、年级、学科和试卷口径内计算得分率与分数段结构。",
  },
  {
    label: "运动健康",
    value: "正式接入时参照智慧体育大屏现有字段体系，使用体测、运动目标、AI 体锻和阳光长跑数据；本区只核查接入质量，不重复运动健康指标公式。",
  },
  {
    label: "区域汇总",
    value: "所有结果先按页面已应用的学段、年级和学期筛选，再从学生明细聚合为区域结果；缺失记录不自动视为零。",
  },
] as const;

const metricMap = computed(() => new Map(
  comprehensiveDataset.value?.metrics.map((metric) => [metric.key, metric]) ?? [],
));
const yearOverYearMetricMap = computed(() => new Map(
  yearOverYearDataset.value?.metrics.map((metric) => [metric.key, metric]) ?? [],
));
const regionalPopulationMetricMap = computed(() => new Map(
  regionalPopulationDataset.value?.metrics.map((metric) => [metric.key, metric]) ?? [],
));
const calculationRows = computed(() => [
  ...calculationMetricGroups.flatMap((group) => group.metricKeys.flatMap((key) => {
    const definition = portraitMetricDefinitionByKey.get(key);
    if (!definition) return [];
    return [{
      key,
      domain: group.domain,
      label: definition.label,
      calculation: definition.calculation,
    }];
  })),
  ...distributionCalculationRows,
]);
const gradeOptions = computed(() => ({
  全部学段: ["四年级", "五年级", "七年级", "八年级", "高一", "高二"],
  小学: ["四年级", "五年级"],
  初中: ["七年级", "八年级"],
  高中: ["高一", "高二"],
}[stage.value] ?? []));

const metricIcons = [
  Users,
  Sparkles,
  Dumbbell,
  Award,
  BookOpenCheck,
  Users,
  ClipboardCheck,
];
const academicSubjects = computed(() => [
  ...new Set(comprehensiveDataset.value?.unifiedExamSummaries.map((summary) => summary.subject) ?? []),
]);
const trendSummaries = computed(() => (
  (comprehensiveDataset.value?.unifiedExamSummaries ?? [])
    .filter((summary) => summary.subject === academicSubject.value)
));
const gradeComparisonOption = computed(() => createUnifiedExamGradeComparisonOption(
  trendSummaries.value,
  academicSubject.value,
));
const trendOption = computed(() => createUnifiedExamSubjectOption(
  trendSummaries.value,
  academicSubject.value,
));

type ChangeTone = "up" | "down" | "flat" | "unavailable";

function percentagePointChange(
  current: number | undefined,
  previous: number | undefined,
): { text: string; tone: ChangeTone } {
  if (current === undefined || previous === undefined) {
    return { text: "暂无可比", tone: "unavailable" };
  }
  const difference = Number((current - previous).toFixed(2));
  if (difference === 0) {
    return { text: "持平 0.00 个百分点", tone: "flat" };
  }
  const prefix = difference > 0 ? "+" : "";
  return {
    text: `${prefix}${difference.toFixed(2)} 个百分点`,
    tone: difference > 0 ? "up" : "down",
  };
}

function unavailableChange(text: string): { text: string; tone: ChangeTone } {
  return { text, tone: "unavailable" };
}

function metricYearOverYearChange(
  current: PortraitMetric | undefined,
  previous: PortraitMetric | undefined,
) {
  if (
    !current
    || !previous
    || current.quality.status === "insufficient"
    || current.quality.status === "unavailable"
    || previous.quality.status === "insufficient"
    || previous.quality.status === "unavailable"
  ) {
    return unavailableChange("暂无可比");
  }
  return percentagePointChange(current.value, previous.value);
}

function metricCalculationExample(metric: PortraitMetric | undefined) {
  if (!metric) return "当前筛选范围暂无可计算数据。";
  const calculation = portraitMetricDefinitionByKey.get(metric.key)?.calculation
    ?? "当前指标字典未登记计算方式。";
  if (metric.numerator !== undefined && metric.denominator !== undefined && metric.denominator > 0) {
    const output = `${metric.value.toLocaleString("zh-CN")}${metric.unit}`;
    return `${calculation} 当前范围：${metric.numerator.toLocaleString("zh-CN")} ÷ ${metric.denominator.toLocaleString("zh-CN")} = ${output}。`;
  }
  return `${calculation} 当前范围结果为 ${metric.value.toLocaleString("zh-CN")}${metric.unit}。`;
}

const filterScopeLabel = computed(() => (
  `${formatPeriodLabel(appliedScope.value)} · ${appliedScope.value.stage} · ${appliedScope.value.grade}`
));
const academicCoverageWarning = computed(() => {
  const latestByGrade = new Map<string, (typeof trendSummaries.value)[number]>();
  trendSummaries.value.forEach((summary) => {
    const latest = latestByGrade.get(summary.assessmentGrade);
    if (!latest || summary.examAt > latest.examAt) {
      latestByGrade.set(summary.assessmentGrade, summary);
    }
  });
  const coverageRates = [...latestByGrade.values()]
    .map((summary) => summary.quality.coverageRate);
  if (!coverageRates.length) return "";
  const minimumCoverageRate = Math.min(...coverageRates);
  return minimumCoverageRate < 100
    ? `；最低成绩记录覆盖率 ${minimumCoverageRate.toFixed(2)}%，解读时需关注缺失记录`
    : "";
});
const academicScopeMessage = computed(() => {
  if (!academicSubject.value) return "当前数据源没有可用统考科目。";
  if (!trendSummaries.value.length) {
    return `上方筛选范围（${filterScopeLabel.value}）内暂无${academicSubject.value}统考数据。`;
  }
  if (appliedScope.value.grade === "全部年级") {
    return `当前按${filterScopeLabel.value}展示${academicSubject.value}；各年级分别统计，不跨年级合并${academicCoverageWarning.value}。`;
  }
  return `当前按${filterScopeLabel.value}展示${academicSubject.value}，仅比较同年级、同考试类型的区域记录${academicCoverageWarning.value}。`;
});
const overviewMetrics = computed(() => {
  const studentMetric = regionalPopulationMetricMap.value.get("enrolled-student-count");
  const metricItem = (key: string) => {
    const metric = metricMap.value.get(key);
    return {
      key,
      label: portraitMetricDefinitionByKey.get(key)?.label ?? key,
      value: metric ? metric.value.toFixed(2) : "—",
      unit: metric ? metric.unit : "",
      yearOverYear: metricYearOverYearChange(metric, yearOverYearMetricMap.value.get(key)),
    };
  };
  return [
    {
      key: "enrolled-student-count",
      label: "区域学生总数",
      value: studentMetric ? studentMetric.value.toLocaleString("zh-CN") : "—",
      unit: "人",
      yearOverYear: unavailableChange("缺少历史学籍快照"),
    },
    metricItem("five-education-evaluation-coverage-rate"),
    metricItem("fitness-test-record-coverage-rate"),
    metricItem("honor-student-coverage-rate"),
    metricItem("library-borrower-coverage-rate"),
    metricItem("practice-participation-rate"),
    metricItem("daily-evaluation-record-coverage-rate"),
  ];
});
const overviewCalculationItems = computed(() => overviewMetrics.value.map((item) => ({
  label: item.label,
  value: metricCalculationExample(
    item.key === "enrolled-student-count"
      ? regionalPopulationMetricMap.value.get(item.key)
      : metricMap.value.get(item.key),
  ),
})));

watch(academicSubjects, (subjects) => {
  if (!subjects.includes(academicSubject.value)) academicSubject.value = subjects[0] ?? "";
});

let observer: IntersectionObserver | null = null;

function goToAnchor(anchor: (typeof portraitAnchors)[number]["key"]) {
  activeAnchor.value = anchor;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(anchor)?.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
}

async function applyFilters() {
  const period = resolvePeriodSelection(timeGrain.value, periodKey.value);
  const nextScope: PortraitFilterScope = {
    timeGrain: timeGrain.value,
    academicYear: period.academicYear,
    term: period.term,
    stage: stage.value,
    grade: grade.value,
  };
  if (await loadComprehensiveDataset(nextScope)) {
    ElMessage.success(`已更新统计范围：${formatPeriodLabel(nextScope)} · ${nextScope.stage} · ${nextScope.grade}`);
  }
}

async function resetFilters() {
  timeGrain.value = "semester";
  periodKey.value = "2025-2026:first";
  stage.value = "全部学段";
  grade.value = "全部年级";
  academicSubject.value = "";
  ElMessage.info("已恢复默认统计范围");
  const period = resolvePeriodSelection(timeGrain.value, periodKey.value);
  await loadComprehensiveDataset({
    timeGrain: timeGrain.value,
    academicYear: period.academicYear,
    term: period.term,
    stage: stage.value,
    grade: grade.value,
  });
}

function comprehensiveQuery(
  scope: PortraitFilterScope,
  period: { academicYear: string; term?: "first" | "second" },
  includeStudentScope = true,
): PortraitQuery {
  const stageMap: Record<string, EducationStage> = {
    小学: "primary",
    初中: "junior",
    高中: "senior",
  };
  const query: PortraitQuery = {
    tenantId: "bureau-local-demo",
    academicYears: [period.academicYear],
    domains: ["academic", ...regionalQualityTopics.map((topic) => topic.key)],
  };
  if (scope.timeGrain === "semester" && period.term) {
    query.terms = [period.term];
  }
  const selectedStage = stageMap[scope.stage];
  if (includeStudentScope && selectedStage) query.educationStages = [selectedStage];
  if (includeStudentScope && scope.grade !== "全部年级") query.grades = [scope.grade];
  return query;
}

async function loadComprehensiveDataset(scope: PortraitFilterScope): Promise<boolean> {
  comprehensiveRequestController?.abort();
  const controller = new AbortController();
  comprehensiveRequestController = controller;
  comprehensiveLoading.value = true;
  comprehensiveError.value = "";
  try {
    const currentPeriod = scope.timeGrain === "semester"
      ? { academicYear: scope.academicYear, term: scope.term }
      : { academicYear: scope.academicYear };
    const yearOverYearPeriod = scope.timeGrain === "semester"
      ? { academicYear: previousAcademicYear(scope.academicYear), term: scope.term }
      : { academicYear: previousAcademicYear(scope.academicYear) };
    const [currentDataset, yearAgoDataset, populationDataset] = await Promise.all([
      runtimeStudentGrowthPortraitRepository.query(
        comprehensiveQuery(scope, currentPeriod),
        controller.signal,
      ),
      runtimeStudentGrowthPortraitRepository.query(
        comprehensiveQuery(scope, yearOverYearPeriod),
        controller.signal,
      ),
      runtimeStudentGrowthPortraitRepository.query(
        comprehensiveQuery(scope, currentPeriod, false),
        controller.signal,
      ),
    ]);
    comprehensiveDataset.value = currentDataset;
    yearOverYearDataset.value = yearAgoDataset;
    regionalPopulationDataset.value = populationDataset;
    appliedScope.value = { ...scope };
    return true;
  } catch (error) {
    if (controller.signal.aborted) return false;
    comprehensiveError.value = error instanceof Error ? error.message : "学生发展数据加载失败";
    return false;
  } finally {
    if (comprehensiveRequestController === controller) {
      comprehensiveLoading.value = false;
      comprehensiveRequestController = null;
    }
  }
}

onMounted(() => {
  void loadComprehensiveDataset(appliedScope.value);
  const portraitFilterElement = portraitFilter.value?.$el;
  if (portraitFilterElement instanceof HTMLElement) {
    portraitFilterHeight.value = Math.ceil(portraitFilterElement.getBoundingClientRect().height);
    portraitFilterResizeObserver = new ResizeObserver(([entry]) => {
      if (entry) portraitFilterHeight.value = Math.ceil(entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height);
    });
    portraitFilterResizeObserver.observe(portraitFilterElement);
  }
  observer = new IntersectionObserver((entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visibleEntry) {
      activeAnchor.value = visibleEntry.target.id as (typeof portraitAnchors)[number]["key"];
    }
  }, {
    rootMargin: "-96px 0px -58% 0px",
    threshold: [0.08, 0.25, 0.5],
  });
  portraitAnchors.forEach(({ key }) => {
    const section = document.getElementById(key);
    if (section) observer?.observe(section);
  });
});

onBeforeUnmount(() => {
  comprehensiveRequestController?.abort();
  comprehensiveRequestController = null;
  observer?.disconnect();
  observer = null;
  portraitFilterResizeObserver?.disconnect();
  portraitFilterResizeObserver = null;
});
</script>

<template>
  <div class="student-growth-portrait-page" :style="portraitStickyStyle">
    <PageFilterBar ref="portraitFilter" class="portrait-filter" aria-label="学生成长概览统计范围">
      <label class="portrait-filter__field">
        <span>统计周期：</span>
        <ElSelect
          v-model="timeGrain"
          aria-label="统计周期"
          class="portrait-filter__select"
          @change="onTimeGrainChange"
        >
          <ElOption
            v-for="option in timeGrainOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
      </label>
      <label class="portrait-filter__field portrait-filter__field--period">
        <span>{{ timeGrain === "semester" ? "学期：" : "学年：" }}</span>
        <ElSelect
          v-model="periodKey"
          :aria-label="timeGrain === 'semester' ? '学期' : '学年'"
          class="portrait-filter__select"
        >
          <ElOption
            v-for="option in periodOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </ElSelect>
      </label>
      <label class="portrait-filter__field">
        <span>学段：</span>
        <ElSelect
          v-model="stage"
          aria-label="学段"
          class="portrait-filter__select"
          @change="grade = '全部年级'"
        >
          <ElOption label="全部学段" value="全部学段" />
          <ElOption label="小学" value="小学" />
          <ElOption label="初中" value="初中" />
          <ElOption label="高中" value="高中" />
        </ElSelect>
      </label>
      <label class="portrait-filter__field">
        <span>年级：</span>
        <ElSelect v-model="grade" aria-label="年级" class="portrait-filter__select">
          <ElOption label="全部年级" value="全部年级" />
          <ElOption v-for="option in gradeOptions" :key="option" :label="option" :value="option" />
        </ElSelect>
      </label>
      <template #actions>
        <ElButton
          type="primary"
          :icon="Search"
          :loading="comprehensiveLoading"
          @click="applyFilters"
        >
          查询
        </ElButton>
        <ElButton :disabled="comprehensiveLoading" @click="resetFilters">重置</ElButton>
      </template>
    </PageFilterBar>

    <div class="student-growth-portrait-page__workspace">
      <nav class="portrait-anchor-nav" aria-label="学生成长概览内容锚点">
        <a
          v-for="anchor in portraitAnchors"
          :key="anchor.key"
          :href="`#${anchor.key}`"
          :aria-current="activeAnchor === anchor.key ? 'location' : undefined"
          :class="{ 'is-active': activeAnchor === anchor.key }"
          @click.prevent="goToAnchor(anchor.key)"
        >
          <span class="portrait-anchor-nav__icon">
            <component :is="anchorIcons[anchor.key]" :size="16" :stroke-width="1.8" />
          </span>
          <span class="portrait-anchor-nav__copy">
            <strong>{{ anchor.label }}</strong>
          </span>
        </a>
      </nav>

      <main class="student-growth-portrait-page__content">
        <section id="regional-overview" class="portrait-section" aria-labelledby="regional-overview-title">
          <div class="portrait-section__heading">
            <div>
              <h2 id="regional-overview-title">区域发展总览</h2>
              <p>先看区域学生与各类数据覆盖，再进入统考质量、综合素质与数据完整度的结构对比。</p>
            </div>
            <div class="portrait-section__actions">
              <PortraitHintPopover
                label="指标口径"
                title="区域发展总览指标口径"
                :items="overviewCalculationItems"
              />
              <MetricDefinitionPopover metric-key="period-comparison" label="同比说明" />
            </div>
          </div>

          <div class="portrait-metrics">
            <article
              v-for="(metric, index) in overviewMetrics"
              :key="metric.label"
              class="portrait-metric"
            >
              <div class="portrait-metric__top">
                <span>{{ metric.label }}</span>
                <span class="portrait-metric__icon">
                  <component :is="metricIcons[index]" :size="18" />
                </span>
              </div>
              <strong>{{ metric.value }}<small>{{ metric.unit }}</small></strong>
              <div class="portrait-metric__bottom">
                <span class="portrait-metric__changes" :class="`is-${metric.yearOverYear.tone}`">
                  同比 {{ metric.yearOverYear.text }}
                </span>
              </div>
            </article>
          </div>

          <article class="portrait-panel portrait-national-alignment">
            <ElCollapse v-model="nationalAlignmentPanels">
              <ElCollapseItem name="national-framework">
                <template #title>
                  <div class="portrait-national-alignment__title">
                    <div>
                      <h3>国家评价框架对齐</h3>
                      <p>默认收起；展开查看评价维度、适用边界与政策来源。</p>
                    </div>
                    <ElTag size="small" type="success" effect="light">
                      核对至 {{ nationalStandardAlignment.checkedAt }}
                    </ElTag>
                  </div>
                </template>
                <div class="portrait-national-alignment__body">
                  <div class="portrait-national-dimensions">
                    <article v-for="dimension in regionalPortraitNationalDimensions" :key="dimension.key">
                      <strong>{{ dimension.label }}</strong>
                      <p>{{ dimension.evidence }}</p>
                    </article>
                  </div>
                  <div class="portrait-national-references">
                    <a
                      v-for="reference in nationalStandardAlignment.references"
                      :key="reference.key"
                      :href="reference.url"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{{ reference.documentNumber ?? reference.title }}</span>
                      <small>{{ reference.status }} · {{ reference.appliesTo }}</small>
                    </a>
                  </div>
                </div>
              </ElCollapseItem>
            </ElCollapse>
          </article>

          <article class="portrait-panel">
            <header class="portrait-panel__header">
              <div>
                <h3>统考学业质量对比</h3>
                <p>柱形比较各年级最新一场统考平均得分率；成绩记录覆盖不足时在下方单独提示。</p>
              </div>
              <div class="portrait-panel__actions">
                <label class="portrait-academic-scope__field">
                  <span>科目</span>
                  <ElSelect
                    v-model="academicSubject"
                    aria-label="统考分析科目"
                    style="width: 120px"
                    :disabled="academicSubjects.length === 0"
                  >
                    <ElOption
                      v-for="subject in academicSubjects"
                      :key="subject"
                      :label="subject"
                      :value="subject"
                    />
                  </ElSelect>
                </label>
                <MetricDefinitionPopover metric-key="academic-quality-rate" label="得分率口径" />
              </div>
            </header>
            <div class="portrait-scope-notice" :class="{ 'is-ready': trendSummaries.length > 0 }">
              <strong>{{ academicSubject || "科目" }}</strong>
              <span>{{ academicScopeMessage }}</span>
            </div>
            <div class="portrait-panel__chart">
              <PortraitChart
                :option="gradeComparisonOption"
                :ariaLabelText="`${academicSubject}统考年级质量对比`"
              />
            </div>
          </article>

          <article class="portrait-panel">
            <header class="portrait-panel__header">
              <div>
                <h3>统考学业质量阶段对比</h3>
                <p>横轴按年级排列，每个年级并列展示期中、期末得分率；期末柱同时标注相对期中的变化百分点。</p>
              </div>
              <div class="portrait-panel__actions">
                <MetricDefinitionPopover metric-key="academic-quality-rate" label="得分率口径" />
              </div>
            </header>
            <div class="portrait-panel__chart">
              <PortraitChart :option="trendOption" :ariaLabelText="`${academicSubject}统考学业质量阶段对比`" />
            </div>
          </article>
        </section>

        <section
          v-for="topic in regionalQualityTopics"
          :id="topic.key"
          :key="topic.key"
          class="portrait-section"
          :aria-labelledby="`${topic.key}-title`"
        >
          <div class="portrait-section__heading">
            <div>
              <h2 :id="`${topic.key}-title`">{{ topic.title }}</h2>
              <p v-if="topic.key !== 'sports-health'">{{ topic.description }}</p>
            </div>
            <ElButton
              v-if="topic.key === 'sports-health'"
              type="primary"
              plain
              @click="openSmartSportsCockpit"
            >
              查看更多
            </ElButton>
          </div>
          <ElSkeleton v-if="comprehensiveLoading && !comprehensiveDataset" :rows="5" animated />
          <ElEmpty
            v-else-if="comprehensiveError || !comprehensiveDataset"
            :description="comprehensiveError || '当前范围暂无可计算数据'"
            :image-size="72"
          />
          <RegionalQualityDomainSection
            v-else
            :dataset="comprehensiveDataset"
            :school-names="virtualPortraitSchoolNames"
            :topic-key="topic.key"
            :year-over-year-dataset="yearOverYearDataset"
          />
        </section>

        <section id="data-coverage" class="portrait-section" aria-labelledby="data-coverage-title">
          <div class="portrait-section__heading">
            <div>
              <h2 id="data-coverage-title">区域数据覆盖</h2>
              <p>集中说明数据来源、接入质量和当前页面实际使用的统计口径。</p>
            </div>
          </div>
          <article class="portrait-panel">
            <header class="portrait-panel__header">
              <div>
                <h3>数据来源说明</h3>
                <p>区域结果由学校侧学生记录汇总，不直接展示学生个人明细。</p>
              </div>
            </header>
            <dl class="portrait-data-sources">
              <div v-for="item in dataSourceNotes" :key="item.label">
                <dt>{{ item.label }}</dt>
                <dd>{{ item.value }}</dd>
              </div>
            </dl>
          </article>
          <article class="portrait-panel">
            <header class="portrait-panel__header">
              <div>
                <h3>各领域指标计算口径</h3>
                <p>仅列出当前页面已经使用的统计指标；运动健康沿用智慧体育字段口径，不在此重复。</p>
              </div>
            </header>
            <ElTable :data="calculationRows" row-key="key" stripe aria-label="学生成长概览指标计算口径">
              <ElTableColumn prop="domain" column-key="domain" label="数据领域" width="120" />
              <ElTableColumn prop="label" column-key="metric" label="指标" min-width="190" />
              <ElTableColumn prop="calculation" column-key="calculation" label="计算方式" min-width="520" />
            </ElTable>
          </article>
        </section>

      </main>
    </div>
  </div>
</template>

<style scoped>
.student-growth-portrait-page {
  --portrait-anchor-sticky-height: 0px;

  display: grid;
  min-width: 0;
  gap: var(--spacing-16);
  color: var(--color-title);
}

.portrait-filter,
.portrait-panel,
.portrait-metric {
  border: 0;
  background: var(--color-white);
}

.portrait-filter {
  position: sticky;
  top: 0;
  z-index: 5;
  border: 0;
  border-radius: var(--radius-md);
}

.portrait-filter__field {
  display: flex;
  width: 200px;
  height: 32px;
  flex: none;
  align-items: center;
  color: var(--color-title);
  font-size: var(--font-size-md);
}

.portrait-filter__field--term { width: 230px; }
.portrait-filter__field--period { width: 320px; }
.portrait-filter__field > span { flex: none; white-space: nowrap; }
.portrait-filter__select { min-width: 0; flex: 1; }

.student-growth-portrait-page__workspace {
  display: grid;
  grid-template-columns: 188px minmax(0, 1fr);
  align-items: start;
  gap: var(--spacing-16);
  min-width: 0;
}

.portrait-anchor-nav {
  position: sticky;
  top: calc(var(--spacing-16) + var(--portrait-filter-height, 64px));
  display: grid;
  max-height: calc(100vh - var(--portrait-filter-height, 64px) - var(--spacing-32));
  overflow-y: auto;
  gap: var(--spacing-4);
  padding: var(--spacing-12);
  border: 0;
  border-radius: var(--radius-md);
  background: var(--color-white);
}

.portrait-anchor-nav a {
  display: flex;
  align-items: center;
  gap: var(--spacing-10);
  min-height: 48px;
  padding: var(--spacing-8);
  border-radius: var(--radius-md);
  color: var(--color-body);
  text-decoration: none;
  transition: background-color .16s ease, color .16s ease;
}

.portrait-anchor-nav a:hover,
.portrait-anchor-nav a.is-active {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.portrait-anchor-nav a:focus-visible {
  outline: 2px solid var(--color-primary-line-light);
  outline-offset: 1px;
}

.portrait-anchor-nav__icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-md);
  background: var(--color-bg-muted);
}

.portrait-anchor-nav a.is-active .portrait-anchor-nav__icon {
  background: var(--color-white);
}

.portrait-anchor-nav__copy {
  line-height: 1.2;
}

.portrait-anchor-nav__copy strong {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.student-growth-portrait-page__content {
  display: grid;
  min-width: 0;
  gap: var(--spacing-24);
}

.portrait-section {
  display: grid;
  min-width: 0;
  gap: var(--spacing-16);
  scroll-margin-top: calc(
    var(--portrait-filter-height, 64px)
    + var(--portrait-anchor-sticky-height)
    + var(--spacing-16)
  );
}

.portrait-section + .portrait-section {
  padding-top: var(--spacing-24);
}

.portrait-section__heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--spacing-16);
}

.portrait-section__actions {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--spacing-12);
}

.portrait-section__heading h2 {
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
}

.portrait-section__heading p,
.portrait-panel__header p {
  margin-top: var(--spacing-4);
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
}

.portrait-academic-scope {
  display: flex;
  flex: none;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-12);
}

.portrait-academic-scope__field {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
}

.portrait-scope-notice {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: var(--spacing-12);
  padding: var(--spacing-12) var(--spacing-16);
  border-radius: var(--radius-md);
  color: var(--color-warning-dark-text);
  background: var(--color-warning-light);
  font-size: var(--font-size-xs);
}

.portrait-scope-notice.is-ready {
  color: var(--color-success-dark-text);
  background: var(--color-success-light);
}

.portrait-scope-notice strong { flex: none; font-size: var(--font-size-sm); }
.portrait-scope-notice span { min-width: 0; flex: 1; }

.portrait-metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--spacing-16);
}

.portrait-metric {
  padding: var(--spacing-16);
  border-radius: var(--radius-md);
}

.portrait-metric__top,
.portrait-metric__bottom {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-8);
}

.portrait-metric__top {
  color: var(--color-body);
  font-size: var(--font-size-sm);
  line-height: 20px;
}

.portrait-metric__top > span:first-child {
  min-width: 0;
}

.portrait-metric__icon {
  display: grid;
  flex: none;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.portrait-metric > strong {
  display: block;
  margin-top: var(--spacing-12);
  font-size: 26px;
  line-height: 32px;
  font-weight: 600;
}

.portrait-metric > strong small {
  margin-left: var(--spacing-4);
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  font-weight: 400;
}

.portrait-metric__bottom {
  margin-top: var(--spacing-10);
  align-items: center;
  font-size: var(--font-size-xs);
}

.portrait-metric__changes {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-4);
  line-height: 18px;
}

.portrait-metric__changes.is-up {
  color: var(--color-success-dark-text);
}

.portrait-metric__changes.is-down {
  color: var(--color-error-dark-text);
}

.portrait-metric__changes.is-flat,
.portrait-metric__changes.is-unavailable {
  color: var(--color-secondary);
}

.portrait-national-alignment :deep(.el-collapse),
.portrait-national-alignment :deep(.el-collapse-item__header),
.portrait-national-alignment :deep(.el-collapse-item__wrap) {
  border: 0;
}

.portrait-national-alignment :deep(.el-collapse-item__header) {
  height: auto;
  min-height: 48px;
  padding: 0;
  line-height: normal;
}

.portrait-national-alignment :deep(.el-collapse-item__content) {
  padding: var(--spacing-16) 0 0;
}

.portrait-national-alignment__title {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-16);
  padding-right: var(--spacing-12);
}

.portrait-national-alignment__title > div {
  min-width: 0;
}

.portrait-national-alignment__title h3 {
  color: var(--color-title);
  font-size: var(--font-size-lg);
  line-height: var(--line-height-lg);
  font-weight: 600;
}

.portrait-national-alignment__title p {
  margin-top: var(--spacing-4);
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
}

.portrait-national-alignment__body {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 3fr) minmax(320px, 2fr);
  gap: var(--spacing-16);
}

.portrait-national-dimensions {
  display: grid;
  min-width: 0;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--spacing-12);
}

.portrait-national-dimensions article {
  display: grid;
  min-width: 0;
  align-content: start;
  gap: var(--spacing-6);
  padding: var(--spacing-14);
  border-radius: var(--radius-md);
  background: var(--color-bg-muted);
}

.portrait-national-dimensions strong {
  color: var(--color-title);
  font-size: var(--font-size-sm);
}

.portrait-national-dimensions p,
.portrait-national-references small {
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  line-height: 18px;
}

.portrait-national-references {
  display: grid;
  min-width: 0;
  align-content: start;
  gap: var(--spacing-8);
}

.portrait-national-references a {
  display: grid;
  min-width: 0;
  gap: var(--spacing-2);
  padding: var(--spacing-8) var(--spacing-12);
  border-radius: var(--radius-md);
  color: var(--color-primary);
  background: var(--color-primary-light);
  text-decoration: none;
}

.portrait-national-references a:hover {
  color: var(--color-primary-dark-text);
}

.portrait-national-references a:focus-visible {
  outline: 2px solid var(--color-primary-line-light);
  outline-offset: 1px;
}

.portrait-national-references span {
  overflow: hidden;
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.portrait-grid {
  display: grid;
  min-width: 0;
  gap: var(--spacing-16);
}
.portrait-panel {
  display: grid;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  gap: var(--spacing-16);
  padding: var(--spacing-16);
  border-radius: var(--radius-md);
}
.portrait-panel__header {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-16);
}
.portrait-panel__header > div:first-child { min-width: 0; flex: 1; }
.portrait-panel__header h3 { font-size: var(--font-size-lg); line-height: var(--line-height-lg); font-weight: 600; }
.portrait-panel__actions {
  display: flex;
  min-width: 0;
  flex: none;
  align-items: center;
  gap: var(--spacing-12);
}
.portrait-panel__chart {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  height: 300px;
  min-height: 0;
}
.portrait-data-sources {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-16) var(--spacing-24);
}

.portrait-data-sources > div {
  display: grid;
  gap: var(--spacing-6);
}

.portrait-data-sources dt {
  color: var(--color-title);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.portrait-data-sources dd {
  margin: 0;
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  line-height: 20px;
}

@media (max-width: 1380px) {
  .portrait-metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .portrait-national-alignment__body { grid-template-columns: 1fr; }
}

@media (max-width: 1120px) {
  .student-growth-portrait-page { --portrait-anchor-sticky-height: 56px; }
  .student-growth-portrait-page__workspace { grid-template-columns: 1fr; }
  .portrait-anchor-nav {
    z-index: 4;
    display: flex;
    max-height: none;
    overflow-x: auto;
    overflow-y: hidden;
    padding: var(--spacing-8);
  }
  .portrait-anchor-nav a { min-width: max-content; min-height: 40px; }
  .portrait-anchor-nav__copy { display: block; }
  .portrait-data-sources { grid-template-columns: 1fr; }
  .portrait-national-dimensions { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 760px) {
  .portrait-filter,
  .portrait-section__heading { align-items: flex-start; flex-direction: column; }
  .portrait-panel__header,
  .portrait-panel__actions { align-items: flex-start; flex-direction: column; }
  .portrait-metrics,
  .portrait-national-dimensions { grid-template-columns: 1fr; }
  .portrait-national-alignment__title { align-items: flex-start; flex-direction: column; }
  .portrait-filter__field,
  .portrait-filter__field--term,
  .portrait-filter__field--period { width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .portrait-anchor-nav a { transition: none; }
}
</style>
