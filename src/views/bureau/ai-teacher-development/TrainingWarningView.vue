<template>
  <div v-loading="loading" class="page-wrapper">
    <el-alert
      v-if="banner"
      class="warning-banner"
      type="warning"
      show-icon
      :closable="true"
      :title="`全区共有${banner.unreachedTeacherCount}名教师学分未达标`"
      :description="`共涉及${banner.schoolCount}所学校｜达标线：${banner.creditLine}学分/学期｜预警阈值：低于${banner.triggerPercent}%`"
    />

    <section class="stats-row" aria-label="预警概览">
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
            <span class="form-label">学校：</span>
            <el-input v-model="schoolKeyword" placeholder="请输入" clearable />
          </div>
        </PageFilterBar>
        <el-select v-model="sortKey" class="sort-select" @change="handleSearch">
          <el-option label="按达标率升序" value="reach-asc" />
          <el-option label="按达标率降序" value="reach-desc" />
          <el-option label="按学校名称" value="name" />
        </el-select>
      </div>

      <div class="table-wrapper">
        <el-table :data="schoolRows" border height="100%">
          <el-table-column label="序号" width="72" align="center">
            <template #default="{ $index }">
              {{ (schoolPage - 1) * schoolPageSize + $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="schoolName" label="学校" min-width="140" />
          <el-table-column prop="teacherCount" label="教师总数" width="110" align="center" />
          <el-table-column label="已达标" width="100" align="center">
            <template #default="{ row }: { row: TrainingWarningSchoolRow }">
              <span class="text-success">{{ row.reachedCount }}</span>
            </template>
          </el-table-column>
          <el-table-column label="未达标" width="100" align="center">
            <template #default="{ row }: { row: TrainingWarningSchoolRow }">
              <span class="text-danger">{{ row.unreachedCount }}</span>
            </template>
          </el-table-column>
          <el-table-column label="达标率" min-width="180">
            <template #default="{ row }: { row: TrainingWarningSchoolRow }">
              <div class="rate-cell">
                <el-progress
                  :percentage="row.reachRatePercent"
                  :stroke-width="8"
                  :color="row.reachRatePercent >= 60 ? 'var(--color-success)' : 'var(--color-warning)'"
                  :show-text="false"
                />
                <span>{{ row.reachRatePercent }}%</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="88" fixed="right">
            <template #default="{ row }: { row: TrainingWarningSchoolRow }">
              <span class="action-link" @click="openSchool(row.id)">详情</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-bar">
        <el-pagination
          v-model:current-page="schoolPage"
          v-model:page-size="schoolPageSize"
          :total="schoolTotal"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="() => void warningStore.loadSchools()"
          @size-change="() => { schoolPage = 1; void warningStore.loadSchools(); }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { CircleCheck, CircleClose, Clock, User } from "@element-plus/icons-vue";
import PageFilterBar from "@/components/PageFilterBar.vue";
import type { TrainingWarningSchoolRow } from "@/features/training-warning/types";
import { useTrainingWarningStore } from "@/stores/training-warning";

defineOptions({ name: "TrainingWarningView" });

const router = useRouter();
const warningStore = useTrainingWarningStore();
const {
  loading,
  banner,
  stats,
  schoolRows,
  schoolTotal,
  schoolKeyword,
  sortKey,
  schoolPage,
  schoolPageSize,
} = storeToRefs(warningStore);

const statCards = computed(() => [
  { key: "total", label: "教师总数", display: String(stats.value.teacherCount), icon: User },
  {
    key: "reached",
    label: "已达标",
    display: String(stats.value.reachedCount),
    icon: CircleCheck,
  },
  {
    key: "unreached",
    label: "未达标",
    display: String(stats.value.unreachedCount),
    icon: CircleClose,
  },
  {
    key: "rate",
    label: "整体达标率",
    display: `${stats.value.reachRatePercent}%`,
    icon: Clock,
  },
]);

onMounted(() => {
  void warningStore.loadSchools();
});

function handleSearch() {
  void warningStore.searchSchools();
}

function handleReset() {
  void warningStore.resetSchoolFilter();
}

function openSchool(schoolId: string) {
  void router.push(`/bureau/ai-teacher-development/teaching-monitoring/warnings/${schoolId}`);
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

.warning-banner {
  flex-shrink: 0;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

.stat-icon.is-total {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
.stat-icon.is-reached {
  background: var(--color-success-light);
  color: var(--color-success);
}
.stat-icon.is-unreached {
  background: var(--color-error-light);
  color: var(--color-error);
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

.sort-select {
  width: 160px;
  flex-shrink: 0;
}

.form-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  min-width: 220px;
}

.form-label {
  flex-shrink: 0;
  color: var(--color-title);
}

.table-wrapper {
  flex: 1;
  min-height: 0;
}

.rate-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
}

.rate-cell :deep(.el-progress) {
  flex: 1;
}

.text-success {
  color: var(--color-success);
}
.text-danger {
  color: var(--color-error);
}

.action-link {
  color: var(--color-primary);
  cursor: pointer;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
}
</style>
