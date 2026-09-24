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
                v-for="item in TRAINING_STATISTICS_SEMESTER_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="form-item">
            <span class="form-label">学校：</span>
            <el-input v-model="schoolKeyword" placeholder="请输入" clearable />
          </div>
        </PageFilterBar>
        <el-button @click="handleExport">导出明细</el-button>
      </div>

      <div class="table-wrapper">
        <el-table :data="rows" border height="100%">
          <el-table-column label="序号" width="72" align="center">
            <template #default="{ $index }">
              {{ (currentPage - 1) * pageSize + $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="schoolName" label="学校" min-width="140" />
          <el-table-column prop="teacherCount" label="教师数" width="100" align="center" />
          <el-table-column prop="reachedCount" label="已达标" width="100" align="center" />
          <el-table-column prop="unreachedCount" label="未达标" width="100" align="center" />
          <el-table-column label="达标率" width="100" align="center">
            <template #default="{ row }: { row: TrainingStatisticsSchoolRow }">
              {{ row.reachRatePercent }}%
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-bar">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="() => void statisticsStore.loadList()"
          @size-change="() => { currentPage = 1; void statisticsStore.loadList(); }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { Collection, PieChart, User } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import PageFilterBar from "@/components/PageFilterBar.vue";
import {
  TRAINING_STATISTICS_SEMESTER_OPTIONS,
  type TrainingStatisticsSchoolRow,
} from "@/features/training-statistics/types";
import { useTrainingStatisticsStore } from "@/stores/training-statistics";

defineOptions({ name: "TrainingStatisticsView" });

const statisticsStore = useTrainingStatisticsStore();
const {
  loading,
  stats,
  rows,
  total,
  semester,
  schoolKeyword,
  currentPage,
  pageSize,
} = storeToRefs(statisticsStore);

const statCards = computed(() => [
  {
    key: "achievements",
    label: "本年成果总数",
    display: String(stats.value.achievementCount),
    icon: Collection,
  },
  {
    key: "teachers",
    label: "教师总数",
    display: String(stats.value.teacherCount),
    icon: User,
  },
  {
    key: "rate",
    label: "整体达标率",
    display: `${stats.value.reachRatePercent}%`,
    icon: PieChart,
  },
]);

onMounted(() => {
  void statisticsStore.loadList();
});

function handleSearch() {
  void statisticsStore.search();
}

function handleReset() {
  void statisticsStore.resetFilter();
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
.stat-icon.is-teachers {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
.stat-icon.is-rate {
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

.table-wrapper {
  flex: 1;
  min-height: 0;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
}
</style>
