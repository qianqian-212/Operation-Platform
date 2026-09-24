<template>
  <div v-loading="loading" class="page-wrapper">
    <section class="stats-row" aria-label="研修统计概览">
      <article v-for="card in statCards" :key="card.key" class="stat-card">
        <span class="stat-icon" :class="`is-${card.key}`">
          <el-icon :size="20"><component :is="card.icon" /></el-icon>
        </span>
        <div>
          <p class="stat-label">{{ card.label }}</p>
          <p class="stat-value"><strong>{{ card.display }}</strong></p>
        </div>
      </article>
    </section>

    <div class="page-body">
      <div class="toolbar">
        <PageFilterBar show-reset @search="handleSearch" @reset="handleReset">
          <div class="form-item">
            <span class="form-label">学期：</span>
            <el-select v-model="semester" placeholder="请选择">
              <el-option
                v-for="item in SCHOOL_TRAINING_STATISTICS_SEMESTER_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </PageFilterBar>
        <el-button @click="handleExport">导出明细</el-button>
      </div>

      <h2 class="section-title">各学科成果数量分布</h2>

      <div class="table-wrapper">
        <el-table :data="rows" border>
          <el-table-column prop="subject" label="学科" min-width="120" />
          <el-table-column prop="achievementCount" label="成果数量" width="120" align="center" />
          <el-table-column label="占比" width="120" align="center">
            <template #default="{ row }: { row: SchoolTrainingStatisticsSubjectRow }">
              {{ row.sharePercent }}%
            </template>
          </el-table-column>
          <el-table-column prop="averageCredits" label="平均学分" width="120" align="center" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { Collection, PieChart, Trophy } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import PageFilterBar from "@/components/PageFilterBar.vue";
import {
  SCHOOL_TRAINING_STATISTICS_SEMESTER_OPTIONS,
  type SchoolTrainingStatisticsSubjectRow,
} from "@/features/school-training-statistics/types";
import { useSchoolTrainingStatisticsStore } from "@/stores/school-training-statistics";

defineOptions({ name: "SchoolTrainingStatisticsView" });

const statisticsStore = useSchoolTrainingStatisticsStore();
const { loading, stats, rows, semester } = storeToRefs(statisticsStore);

const statCards = computed(() => [
  {
    key: "achievements",
    label: "本年成果总数",
    display: String(stats.value.achievementCount),
    icon: Collection,
  },
  {
    key: "pass",
    label: "审核通过率",
    display: `${stats.value.passRatePercent}%`,
    icon: Trophy,
  },
  {
    key: "credits",
    label: "教师平均学分",
    display: String(stats.value.averageCredits),
    icon: PieChart,
  },
]);

onMounted(() => {
  void statisticsStore.loadList();
});

function handleSearch() {
  void statisticsStore.loadList();
}

function handleReset() {
  semester.value = SCHOOL_TRAINING_STATISTICS_SEMESTER_OPTIONS[0].value;
  void statisticsStore.loadList();
}

function handleExport() {
  ElMessage.success("已准备导出研修统计明细");
}
</script>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
  height: 100%;
  min-height: 0;
  background: var(--color-bg);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-12);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-16);
  min-height: 88px;
  padding: var(--spacing-20) var(--spacing-24);
  background: var(--color-white);
  border-radius: var(--radius-lg);
}

.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
}

.stat-icon.is-achievements {
  background: var(--color-success-light);
  color: var(--color-success);
}
.stat-icon.is-pass {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
.stat-icon.is-credits {
  background: color-mix(in srgb, var(--color-chart-violet) 12%, var(--color-white));
  color: var(--color-chart-violet);
}

.stat-label {
  margin: 0;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.stat-value {
  margin: var(--spacing-4) 0 0;
  font-size: var(--font-size-xl);
  color: var(--color-title);
}

.stat-value strong {
  font-weight: var(--font-weight-semibold);
}

.page-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
  padding: var(--spacing-16) var(--spacing-24) var(--spacing-24);
  background: var(--color-white);
  border-radius: var(--radius-lg);
}

.toolbar {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-16);
}

.toolbar :deep(.page-filter-bar) {
  flex: 1;
  border-bottom: 0;
  padding: 0;
}

.form-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  min-width: 220px;
}

.form-label {
  flex-shrink: 0;
}

.section-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
  flex-shrink: 0;
}

.table-wrapper {
  flex: 0 1 auto;
  min-height: 0;
  overflow: auto;
}

.table-wrapper :deep(.el-table__inner-wrapper::before) {
  display: none;
}
</style>
