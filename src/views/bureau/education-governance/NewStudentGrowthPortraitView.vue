<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
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
import MetricDefinitionPopover from "@/features/new-student-growth-portrait/MetricDefinitionPopover.vue";
import NewPortraitChart from "@/features/new-student-growth-portrait/NewPortraitChart.vue";
import RegionalQualityDomainSection from "@/features/new-student-growth-portrait/RegionalQualityDomainSection.vue";
import {
  nationalStandardAlignment,
  regionalPortraitNationalDimensions,
} from "@/features/new-student-growth-portrait/national-standard-alignment";
import {
  createCoverageOption,
  createUnifiedExamGradeComparisonOption,
  createUnifiedExamSubjectOption,
} from "@/features/new-student-growth-portrait/chart-options";
import { portraitAnchors } from "@/features/new-student-growth-portrait/data";
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
  virtualPortraitDataMetadata,
  virtualPortraitSchoolNames,
} from "@/features/student-growth-portrait/virtual-portrait-raw-data-source";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();
const activeAnchor = ref<(typeof portraitAnchors)[number]["key"]>("regional-overview");
const stage = ref("全部学段");
const grade = ref("全部年级");
const term = ref("2025—2026上学期");
const academicSubject = ref("");
const nationalAlignmentPanels = ref<string[]>([]);
const comprehensiveDataset = ref<PortraitDataset>();
const yearOverYearDataset = ref<PortraitDataset>();
const regionalPopulationDataset = ref<PortraitDataset>();
const comprehensiveLoading = ref(false);
const comprehensiveError = ref("");
let comprehensiveRequestController: AbortController | null = null;
const smartSportsPage = pageRegistryByKey.get("bureau-smart-sports-cockpit");

function openSmartSportsCockpit() {
  if (!smartSportsPage) return;
  const href = router.resolve({
    path: smartSportsPage.path,
    query: { tenantId: userStore.currentTenant.id },
  }).href;
  window.open(href, "_blank", "noopener,noreferrer");
}

const termPeriods = {
  "2025—2026下学期": {
    current: { academicYear: "2025-2026", term: "second" },
    yearOverYear: { academicYear: "2024-2025", term: "second" },
  },
  "2025—2026上学期": {
    current: { academicYear: "2025-2026", term: "first" },
    yearOverYear: { academicYear: "2024-2025", term: "first" },
  },
  "2024—2025下学期": {
    current: { academicYear: "2024-2025", term: "second" },
    yearOverYear: { academicYear: "2023-2024", term: "second" },
  },
} as const;

type PortraitFilterScope = {
  stage: string;
  grade: string;
  term: keyof typeof termPeriods;
};

const appliedScope = ref<PortraitFilterScope>({
  stage: stage.value,
  grade: grade.value,
  term: term.value as keyof typeof termPeriods,
});

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
    title: "五育评价",
    description: "不同学校可使用不同评价维度与等级，本页统一观察有效评价记录覆盖率，不合成跨校评价等级。",
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
    description: "以图书馆到访和借阅覆盖观察校园学习行为；缺少应考勤次数时不发布异常率。",
    primaryMetricKey: "library-borrower-coverage-rate",
  },
  {
    key: "practice",
    title: "实践活动",
    description: "按已核验活动记录统计区域参与覆盖，活动次数不直接等同于活动质量。",
    primaryMetricKey: "practice-participation-rate",
  },
  {
    key: "daily-evaluation",
    title: "日常评价",
    description: "观察表扬与待改进记录结构；未接入整改闭环前不计算改进完成率。",
    primaryMetricKey: "daily-evaluation-record-coverage-rate",
  },
] as const;

const coverageDefinitions = [
  { key: "academic-unified-exam-record-coverage-rate", label: "统考成绩记录" },
  { key: "five-education-evaluation-coverage-rate", label: "五育成长评价" },
  { key: "fitness-test-record-coverage-rate", label: "体质测试记录" },
  { key: "honor-student-coverage-rate", label: "荣誉记录" },
  { key: "library-borrower-coverage-rate", label: "图书借阅记录" },
  { key: "practice-participation-rate", label: "实践活动记录" },
  { key: "daily-evaluation-record-coverage-rate", label: "日常评价记录" },
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
const coverageRows = computed(() => coverageDefinitions.map((definition) => {
  const metric = metricMap.value.get(definition.key);
  return {
    ...definition,
    observedStudentCount: metric?.quality.observedStudentCount ?? 0,
    eligibleStudentCount: metric?.quality.eligibleStudentCount ?? 0,
    coverageRate: metric?.quality.coverageRate ?? 0,
    status: metric?.quality.status ?? "unavailable",
    calculation: portraitMetricDefinitionByKey.get(definition.key)?.calculation ?? "当前指标字典未登记计算方式。",
  };
}));
const coverageOption = computed(() => createCoverageOption(coverageRows.value));
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

const filterScopeLabel = computed(() => (
  `${appliedScope.value.stage} · ${appliedScope.value.grade} · ${appliedScope.value.term}`
));
const academicScopeMessage = computed(() => {
  if (!academicSubject.value) return "当前数据源没有可用统考科目。";
  if (!trendSummaries.value.length) {
    return `上方筛选范围（${filterScopeLabel.value}）内暂无${academicSubject.value}统考数据。`;
  }
  if (appliedScope.value.grade === "全部年级") {
    return `当前按${filterScopeLabel.value}展示${academicSubject.value}；各年级分别统计，不跨年级合并。`;
  }
  return `当前按${filterScopeLabel.value}展示${academicSubject.value}，仅比较同年级、同考试类型的区域记录。`;
});
const overviewMetrics = computed(() => {
  const studentMetric = regionalPopulationMetricMap.value.get("enrolled-student-count");
  const metricItem = (label: string, key: string) => {
    const metric = metricMap.value.get(key);
    return {
      label,
      value: metric ? metric.value.toFixed(2) : "—",
      unit: metric ? metric.unit : "",
      yearOverYear: metricYearOverYearChange(metric, yearOverYearMetricMap.value.get(key)),
      explanationKey: "period-comparison" as const,
    };
  };
  return [
    {
      label: "区域学生总数（有效学籍去重）",
      value: studentMetric ? studentMetric.value.toLocaleString("zh-CN") : "—",
      unit: "人",
      yearOverYear: unavailableChange("缺少历史学籍快照"),
      explanationKey: "period-comparison" as const,
    },
    metricItem("五育评价覆盖率", "five-education-evaluation-coverage-rate"),
    metricItem("体测记录覆盖率", "fitness-test-record-coverage-rate"),
    metricItem("荣誉学生覆盖率", "honor-student-coverage-rate"),
    metricItem("图书借阅覆盖率", "library-borrower-coverage-rate"),
    metricItem("有效活动参与率", "practice-participation-rate"),
    metricItem("日常评价记录覆盖率", "daily-evaluation-record-coverage-rate"),
  ];
});

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
  const nextScope: PortraitFilterScope = {
    stage: stage.value,
    grade: grade.value,
    term: term.value as keyof typeof termPeriods,
  };
  if (await loadComprehensiveDataset(nextScope)) {
    ElMessage.success(`已更新统计范围：${nextScope.stage} · ${nextScope.grade}`);
  }
}

async function resetFilters() {
  stage.value = "全部学段";
  grade.value = "全部年级";
  term.value = "2025—2026上学期";
  academicSubject.value = "";
  ElMessage.info("已恢复默认统计范围");
  await loadComprehensiveDataset({
    stage: stage.value,
    grade: grade.value,
    term: term.value as keyof typeof termPeriods,
  });
}

function comprehensiveQuery(
  period: { academicYear: string; term: "first" | "second" },
  scope: PortraitFilterScope,
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
    terms: [period.term],
    domains: ["academic", ...regionalQualityTopics.map((topic) => topic.key)],
  };
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
    const selectedPeriod = termPeriods[scope.term];
    const [currentDataset, yearAgoDataset, populationDataset] = await Promise.all([
      runtimeStudentGrowthPortraitRepository.query(
        comprehensiveQuery(selectedPeriod.current, scope),
        controller.signal,
      ),
      runtimeStudentGrowthPortraitRepository.query(
        comprehensiveQuery(selectedPeriod.yearOverYear, scope),
        controller.signal,
      ),
      runtimeStudentGrowthPortraitRepository.query(
        comprehensiveQuery(selectedPeriod.current, scope, false),
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

function coverageStatusLabel(status: string) {
  if (status === "ready") return "完整";
  if (status === "partial") return "部分覆盖";
  if (status === "insufficient") return "数据不足";
  return "未接入";
}

function coverageStatusType(status: string) {
  if (status === "ready") return "success";
  if (status === "partial") return "warning";
  return "info";
}

onMounted(() => {
  void loadComprehensiveDataset(appliedScope.value);
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
});
</script>

<template>
  <div class="new-student-portrait">
    <header class="new-student-portrait__intro">
      <div>
        <div class="new-student-portrait__eyebrow">
          <ElTag size="small" effect="plain">新页面</ElTag>
          <span>区域学生发展治理视角</span>
        </div>
        <h1>新学生成长画像</h1>
        <p>从区域整体质量出发，连续观察德智体美劳、运动健康、荣誉、行为、实践、日常评价及学业发展结构。</p>
      </div>
      <div class="new-student-portrait__coverage">
        <span class="new-student-portrait__coverage-label">当前演示数据</span>
        <strong>{{ virtualPortraitDataMetadata.schoolCount }} 所学校 · {{ virtualPortraitDataMetadata.studentCount }} 名学生</strong>
        <small>{{ virtualPortraitDataMetadata.notice }}</small>
      </div>
    </header>

    <PageFilterBar class="portrait-filter" aria-label="学生发展画像统计范围">
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
      <label class="portrait-filter__field portrait-filter__field--term">
        <span>学期：</span>
        <ElSelect v-model="term" aria-label="学期" class="portrait-filter__select portrait-filter__select--term">
          <ElOption label="2025—2026下学期" value="2025—2026下学期" />
          <ElOption label="2025—2026上学期" value="2025—2026上学期" />
          <ElOption label="2024—2025下学期" value="2024—2025下学期" />
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

    <div class="new-student-portrait__workspace">
      <nav class="portrait-anchor-nav" aria-label="新学生成长画像内容锚点">
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

      <main class="new-student-portrait__content">
        <section id="regional-overview" class="portrait-section" aria-labelledby="regional-overview-title">
          <div class="portrait-section__heading">
            <div>
              <h2 id="regional-overview-title">区域发展总览</h2>
              <p>先看区域学生与各类数据覆盖，再进入统考质量、综合素质与数据完整度的结构对比。</p>
            </div>
            <MetricDefinitionPopover metric-key="period-comparison" label="同比说明" />
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
                <p>柱形为各年级最新一场统考平均得分率，折线为同场考试成绩覆盖率；两者同为百分比，但不互相推导。</p>
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
              <NewPortraitChart
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
              <NewPortraitChart :option="trendOption" :ariaLabelText="`${academicSubject}统考学业质量阶段对比`" />
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
              <p>按当前在籍学生分母检查各数据源的学生覆盖情况；不使用缺失的城乡、片区或学校类型字段推断区域均衡。</p>
            </div>
          </div>
          <div class="portrait-grid portrait-grid--2-1">
            <article class="portrait-panel">
              <header class="portrait-panel__header">
                <div>
                  <h3>各领域数据覆盖率</h3>
                  <p>覆盖率只说明数据是否接入，不代表学生发展质量或学校工作成效。</p>
                </div>
              </header>
              <div class="portrait-panel__chart portrait-panel__chart--tall">
                <NewPortraitChart :option="coverageOption" ariaLabelText="区域各学生发展领域数据覆盖率" />
              </div>
            </article>
            <article class="portrait-panel">
              <header class="portrait-panel__header">
                <div>
                  <h3>发布边界</h3>
                  <p>缺少稳定主数据时，页面主动收缩比较维度。</p>
                </div>
              </header>
              <div class="portrait-coverage-boundaries">
                <div><span>当前可用</span><strong>学段、年级、学期、学科</strong></div>
                <div><span>当前缺失</span><strong>城乡、片区、学校类型</strong></div>
                <div><span>处理方式</span><strong>不计算分类差异与均衡指数</strong></div>
              </div>
            </article>
          </div>
          <article class="portrait-panel">
            <header class="portrait-panel__header">
              <div>
                <h3>数据源覆盖明细</h3>
                <p>每项同时展示有效学生数、在籍分母、覆盖率和指标字典中的计算方式。</p>
              </div>
            </header>
            <ElTable :data="coverageRows" row-key="key" stripe aria-label="区域数据源覆盖明细">
              <ElTableColumn prop="label" column-key="label" label="数据领域" min-width="150" />
              <ElTableColumn prop="observedStudentCount" column-key="observed" label="有效学生数" width="120" />
              <ElTableColumn prop="eligibleStudentCount" column-key="eligible" label="在籍分母" width="110" />
              <ElTableColumn prop="coverageRate" column-key="coverage" label="覆盖率" width="110">
                <template #default="{ row }">{{ row.coverageRate }}%</template>
              </ElTableColumn>
              <ElTableColumn prop="status" column-key="status" label="数据状态" width="120">
                <template #default="{ row }">
                  <ElTag :type="coverageStatusType(row.status)" size="small">{{ coverageStatusLabel(row.status) }}</ElTag>
                </template>
              </ElTableColumn>
              <ElTableColumn prop="calculation" column-key="calculation" label="计算方式" min-width="320" show-overflow-tooltip />
            </ElTable>
          </article>
        </section>

      </main>
    </div>
  </div>
</template>

<style scoped>
.new-student-portrait {
  display: grid;
  min-width: 0;
  gap: var(--spacing-16);
  color: var(--color-title);
}

.new-student-portrait__intro,
.portrait-filter,
.portrait-panel,
.portrait-metric {
  border: 0;
  background: var(--color-white);
}

.new-student-portrait__intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-24);
  padding: var(--spacing-20) var(--spacing-24);
  border-radius: var(--radius-md);
}

.new-student-portrait__eyebrow {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
}

.new-student-portrait__intro h1 {
  margin-top: var(--spacing-8);
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
}

.new-student-portrait__intro p {
  margin-top: var(--spacing-6);
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.new-student-portrait__coverage {
  width: 280px;
  padding-left: var(--spacing-24);
}

.new-student-portrait__coverage-label {
  display: block;
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
}

.new-student-portrait__coverage strong {
  display: block;
  margin: var(--spacing-6) 0 var(--spacing-8);
  font-size: var(--font-size-md);
}

.new-student-portrait__coverage small {
  display: block;
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  line-height: 18px;
}

.portrait-filter {
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
.portrait-filter__field > span { flex: none; white-space: nowrap; }
.portrait-filter__select { min-width: 0; flex: 1; }

.new-student-portrait__workspace {
  display: grid;
  grid-template-columns: 188px minmax(0, 1fr);
  align-items: start;
  gap: var(--spacing-16);
  min-width: 0;
}

.portrait-anchor-nav {
  position: sticky;
  top: var(--spacing-16);
  display: grid;
  max-height: calc(100vh - var(--spacing-32));
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

.new-student-portrait__content {
  display: grid;
  min-width: 0;
  gap: var(--spacing-24);
}

.portrait-section {
  display: grid;
  min-width: 0;
  gap: var(--spacing-16);
  scroll-margin-top: var(--spacing-16);
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
.portrait-grid--2-1 { grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr); }

.portrait-panel {
  display: grid;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  gap: var(--spacing-16);
  padding: var(--spacing-16);
  border-radius: var(--radius-md);
  overflow: hidden;
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
  overflow: hidden;
}
.portrait-panel__chart--tall { height: 340px; }

.portrait-coverage-boundaries {
  display: grid;
  gap: var(--spacing-12);
}

.portrait-coverage-boundaries > div {
  display: grid;
  gap: var(--spacing-6);
  padding: var(--spacing-14);
  border-radius: var(--radius-md);
  background: var(--color-bg-muted);
}

.portrait-coverage-boundaries span {
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
}

.portrait-coverage-boundaries strong {
  color: var(--color-title);
  font-size: var(--font-size-sm);
  font-weight: 600;
}

@media (max-width: 1380px) {
  .portrait-metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .portrait-national-alignment__body { grid-template-columns: 1fr; }
  .portrait-grid--2-1 { grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr); }
}

@media (max-width: 1120px) {
  .new-student-portrait__workspace { grid-template-columns: 1fr; }
  .portrait-anchor-nav {
    top: 0;
    z-index: 4;
    display: flex;
    max-height: none;
    overflow-x: auto;
    overflow-y: hidden;
    padding: var(--spacing-8);
  }
  .portrait-anchor-nav a { min-width: max-content; min-height: 40px; }
  .portrait-anchor-nav__copy { display: block; }
  .portrait-grid--2-1 { grid-template-columns: 1fr; }
  .portrait-national-dimensions { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .portrait-section { scroll-margin-top: 64px; }
}

@media (max-width: 760px) {
  .new-student-portrait__intro,
  .portrait-filter,
  .portrait-section__heading { align-items: flex-start; flex-direction: column; }
  .portrait-panel__header,
  .portrait-panel__actions { align-items: flex-start; flex-direction: column; }
  .new-student-portrait__coverage { width: 100%; padding: var(--spacing-16) 0 0; }
  .portrait-metrics,
  .portrait-national-dimensions { grid-template-columns: 1fr; }
  .portrait-national-alignment__title { align-items: flex-start; flex-direction: column; }
  .portrait-filter__field,
  .portrait-filter__field--term { width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .portrait-anchor-nav a { transition: none; }
}
</style>
