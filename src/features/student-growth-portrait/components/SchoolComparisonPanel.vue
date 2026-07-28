<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { InfoFilled } from "@element-plus/icons-vue";
import type { MetricQuality, PortraitDataset, PortraitMetric, SchoolPortraitSummary } from "../data-contract";
import { portraitMetricDefinitionByKey } from "../metric-registry";

type QualityTagType = "success" | "warning" | "danger" | "info";

interface SchoolComparisonRow {
  schoolId: string;
  name: string;
  studentCount: number;
  goalCompletion: number | null;
  evaluationCoverage: number | null;
  exerciseParticipation: number | null;
  practiceParticipation: number | null;
  metrics: SchoolPortraitSummary["metrics"];
}

const props = defineProps<{
  dataset: PortraitDataset;
  schoolNames: Readonly<Record<string, string>>;
}>();

const selectedSchool = ref<SchoolComparisonRow | null>(null);
const drawerVisible = ref(false);
const currentPage = ref(1);
const pageSize = ref(10);

function metricFor(metrics: readonly PortraitMetric[], key: string) {
  return metrics.find((metric) => metric.key === key);
}

function observedMetricValue(metrics: readonly PortraitMetric[], key: string) {
  const metric = metricFor(metrics, key);
  return metric && metric.quality.observedStudentCount > 0 ? metric.value : null;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(value);
}

function formatPercent(value: number | null) {
  return value === null ? "—" : `${formatNumber(value)}%`;
}

function qualityType(quality?: MetricQuality): QualityTagType {
  if (!quality || quality.status === "unavailable") return "info";
  if (quality.status === "ready") return "success";
  if (quality.status === "partial") return "warning";
  return "danger";
}

function qualityLabel(quality?: MetricQuality) {
  if (!quality || quality.status === "unavailable") return "未接入";
  if (quality.status === "ready") return "覆盖完整";
  if (quality.status === "partial") return `覆盖 ${formatNumber(quality.coverageRate)}%`;
  return "有效记录不足";
}

function metricLabel(key: string) {
  return portraitMetricDefinitionByKey.get(key)?.label ?? key;
}

const schoolRows = computed<SchoolComparisonRow[]>(() => props.dataset.schools.map((school) => ({
  schoolId: school.schoolId,
  name: props.schoolNames[school.schoolId] ?? "未匹配学校名称",
  studentCount: school.studentCount,
  goalCompletion: observedMetricValue(school.metrics, "five-education-goal-completion-rate"),
  evaluationCoverage: observedMetricValue(school.metrics, "five-education-evaluation-coverage-rate"),
  exerciseParticipation: observedMetricValue(school.metrics, "ai-exercise-participation-rate"),
  practiceParticipation: observedMetricValue(school.metrics, "practice-participation-rate"),
  metrics: school.metrics,
})));

const enrolledStudentCount = computed(() => {
  const metric = props.dataset.metrics.find((item) => item.key === "enrolled-student-count");
  return metric?.value ?? 0;
});

const pagedRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return schoolRows.value.slice(start, start + pageSize.value);
});

watch(() => props.dataset.generatedAt, () => {
  currentPage.value = 1;
  drawerVisible.value = false;
  selectedSchool.value = null;
});

function openSchool(record: SchoolComparisonRow) {
  selectedSchool.value = record;
  drawerVisible.value = true;
}

function handleSizeChange() {
  currentPage.value = 1;
}
</script>

<template>
  <section class="school-comparison" aria-label="学校聚合指标对照">
    <header class="school-comparison__header">
      <div>
        <h2>学校聚合指标对照</h2>
        <p>仅展示有明确分子、分母且支持区域比较的已接入指标；不生成学校综合排名或趋势判断。</p>
      </div>
      <div class="school-comparison__benchmark" aria-label="当前筛选范围">
        <span>当前范围</span>
        <span><strong>{{ schoolRows.length }}</strong><small>所学校</small></span>
        <span><strong>{{ formatNumber(enrolledStudentCount) }}</strong><small>名在籍学生</small></span>
      </div>
    </header>

    <div class="school-comparison__body">
      <div class="school-comparison__table-wrapper">
        <ElTable
          :data="pagedRecords"
          height="100%"
          stripe
          border
          highlight-current-row
          row-key="schoolId"
          empty-text="当前筛选范围内暂无学校聚合数据"
          @row-click="openSchool"
        >
          <ElTableColumn column-key="index" label="序号" width="60" align="center" fixed="left">
            <template #default="{ $index }">
              {{ String((currentPage - 1) * pageSize + $index + 1).padStart(2, "0") }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="name" column-key="name" label="学校" min-width="190" fixed="left" show-overflow-tooltip>
            <template #default="{ row }">
              <button
                class="school-comparison__school-button"
                type="button"
                :aria-label="`查看${row.name}的聚合指标详情`"
                @click.stop="openSchool(row)"
              >
                {{ row.name }}
              </button>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="studentCount" column-key="studentCount" label="在籍学生" width="112" sortable>
            <template #default="{ row }">{{ formatNumber(row.studentCount) }}</template>
          </ElTableColumn>
          <ElTableColumn prop="goalCompletion" column-key="goalCompletion" min-width="154" sortable>
            <template #header>
              <span>
                成长目标完成率
                <ElTooltip content="有效记录的已获学分总和 ÷ 目标学分总和">
                  <ElIcon><InfoFilled /></ElIcon>
                </ElTooltip>
              </span>
            </template>
            <template #default="{ row }">
              <span>{{ formatPercent(row.goalCompletion) }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="evaluationCoverage" column-key="evaluationCoverage" min-width="154" sortable>
            <template #header>
              <span>
                成长评价覆盖
                <ElTooltip content="至少有一条有效成长评价的学生数 ÷ 在籍学生数">
                  <ElIcon><InfoFilled /></ElIcon>
                </ElTooltip>
              </span>
            </template>
            <template #default="{ row }">
              <span>{{ formatPercent(row.evaluationCoverage) }}</span>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="exerciseParticipation" column-key="exerciseParticipation" label="AI 体锻参与" min-width="134" sortable>
            <template #default="{ row }">{{ formatPercent(row.exerciseParticipation) }}</template>
          </ElTableColumn>
          <ElTableColumn prop="practiceParticipation" column-key="practiceParticipation" label="实践活动参与" min-width="138" sortable>
            <template #default="{ row }">{{ formatPercent(row.practiceParticipation) }}</template>
          </ElTableColumn>
          <ElTableColumn column-key="actions" label="操作" width="96" fixed="right">
            <template #default="{ row }">
              <button
                class="school-comparison__action-link"
                type="button"
                @click.stop="openSchool(row)"
              >
                查看详情
              </button>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
      <div class="school-comparison__pagination">
        <ElPagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="schoolRows.length"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </section>

  <ElDrawer v-model="drawerVisible" :title="selectedSchool?.name ?? '学校聚合指标'" size="420px">
    <template v-if="selectedSchool">
      <ElAlert title="仅展示学校匿名聚合数据，不包含个人学生信息" type="info" :closable="false" show-icon />
      <div class="school-drawer__meta">
        <span>在籍学生 {{ formatNumber(selectedSchool.studentCount) }} 人</span>
        <span>统计规则 {{ dataset.metrics[0]?.calculationVersion ?? "—" }}</span>
      </div>
      <dl class="school-drawer__metrics">
        <div v-for="metric in selectedSchool.metrics" :key="metric.key">
          <dt>
            <span>{{ metricLabel(metric.key) }}</span>
            <small>覆盖 {{ formatNumber(metric.quality.coverageRate) }}%</small>
          </dt>
          <dd>
            <span v-if="metric.quality.observedStudentCount > 0">{{ formatNumber(metric.value) }}{{ metric.unit }}</span>
            <span v-else>—</span>
            <ElTag :type="qualityType(metric.quality)" size="small" effect="light">
              {{ qualityLabel(metric.quality) }}
            </ElTag>
          </dd>
        </div>
      </dl>
    </template>
  </ElDrawer>
</template>

<style scoped>
.school-comparison {
  display: grid;
  gap: var(--spacing-16);
}

.school-comparison__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--spacing-24);
}

.school-comparison__header h2 {
  font-size: 20px;
  line-height: 30px;
}

.school-comparison__header p {
  margin-top: var(--spacing-4);
  color: var(--color-secondary);
}

.school-comparison__benchmark {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-12);
  color: var(--color-secondary);
}

.school-comparison__benchmark > span {
  white-space: nowrap;
}

.school-comparison__benchmark > span:not(:first-child) {
  display: inline-flex;
  align-items: baseline;
  gap: var(--spacing-4);
}

.school-comparison__benchmark strong {
  color: var(--color-title);
  font-size: 18px;
}

.school-comparison__benchmark small {
  font-size: var(--font-size-xs);
}

.school-comparison__body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
  min-width: 0;
  padding: var(--spacing-24);
  background: var(--color-white);
}

.school-comparison__table-wrapper {
  height: 540px;
  min-width: 0;
  overflow: hidden;
}

.school-comparison__school-button {
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-primary);
  cursor: pointer;
  font: inherit;
  font-weight: var(--font-weight-medium);
  text-align: left;
}

.school-comparison__school-button:hover,
.school-comparison__action-link:hover {
  color: var(--color-primary-hover);
}

.school-comparison__school-button:focus-visible,
.school-comparison__action-link:focus-visible {
  border-radius: var(--radius-sm);
  outline: 2px solid var(--color-primary-line-light);
  outline-offset: 2px;
}

.school-comparison__action-link {
  padding: 0;
  color: var(--color-primary);
  font: inherit;
  background: transparent;
  border: 0;
  cursor: pointer;
  white-space: nowrap;
}

.school-comparison__pagination {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.school-drawer__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-12);
  margin: var(--spacing-20) 0;
  color: var(--color-secondary);
}

.school-drawer__metrics {
  display: grid;
}

.school-drawer__metrics div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-12);
  padding: var(--spacing-16) 0;
  border-bottom: 1px solid var(--color-border);
}

.school-drawer__metrics dt {
  display: grid;
  gap: var(--spacing-4);
  color: var(--color-body);
}

.school-drawer__metrics dt small {
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-regular);
}

.school-drawer__metrics dd {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-8);
  color: var(--color-title);
  font-size: 18px;
  font-weight: var(--font-weight-semibold);
  text-align: right;
}

:deep(.el-table__row) {
  cursor: pointer;
}

@media (max-width: 900px) {
  .school-comparison__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .school-comparison__benchmark {
    flex-wrap: wrap;
  }

  .school-comparison__body {
    padding: var(--spacing-16);
  }

  .school-comparison__pagination {
    overflow-x: auto;
  }
}
</style>
