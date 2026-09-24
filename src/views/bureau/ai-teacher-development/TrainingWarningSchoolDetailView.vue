<template>
  <div v-loading="loading" class="page-wrapper page-with-breadcrumb">
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: listPath }">预警管理</el-breadcrumb-item>
        <el-breadcrumb-item>{{ schoolDetailName || "学校详情" }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="page-body">
      <h1 class="page-title">{{ schoolDetailName }} · 教师学分详情</h1>

      <section class="stats-row" aria-label="学校学分概览">
        <article class="stat-card">
          <p class="stat-value">{{ schoolStats.teacherCount }}</p>
          <p class="stat-label">教师总数</p>
        </article>
        <article class="stat-card">
          <p class="stat-value text-success">{{ schoolStats.reachedCount }}</p>
          <p class="stat-label">已达标</p>
        </article>
        <article class="stat-card">
          <p class="stat-value text-danger">{{ schoolStats.unreachedCount }}</p>
          <p class="stat-label">未达标</p>
        </article>
        <article class="stat-card">
          <p class="stat-value text-primary">{{ schoolStats.reachRatePercent }}%</p>
          <p class="stat-label">达标率</p>
        </article>
      </section>

      <PageFilterBar
        class="school-filter"
        show-reset
        @search="handleSearch"
        @reset="handleReset"
      >
        <div class="form-item">
          <span class="form-label">状态：</span>
          <el-select v-model="teacherStatus" placeholder="请选择" clearable>
            <el-option label="已达标" value="reached" />
            <el-option label="未达标" value="unreached" />
          </el-select>
        </div>
        <div class="form-item">
          <span class="form-label">学科：</span>
          <el-select v-model="teacherSubject" placeholder="请选择" clearable>
            <el-option label="语文" value="语文" />
            <el-option label="数学" value="数学" />
          </el-select>
        </div>
        <div class="form-item name-item">
          <span class="form-label">教师姓名：</span>
          <el-input
            v-model="teacherName"
            placeholder="请输入"
            :prefix-icon="Search"
            clearable
            @keyup.enter="handleSearch"
          />
        </div>
      </PageFilterBar>

      <div class="table-wrapper">
        <el-table :data="teachers" border>
          <el-table-column label="序号" width="72" align="center">
            <template #default="{ $index }">
              {{ (teacherPage - 1) * teacherPageSize + $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="subject" label="学科" width="100" />
          <el-table-column label="当前学分" width="110">
            <template #default="{ row }: { row: TrainingWarningTeacherRow }">
              {{ row.currentCredits }}分
            </template>
          </el-table-column>
          <el-table-column label="达标线" width="100">
            <template #default="{ row }: { row: TrainingWarningTeacherRow }">
              {{ row.creditLine }}分
            </template>
          </el-table-column>
          <el-table-column label="完成率" min-width="200">
            <template #default="{ row }: { row: TrainingWarningTeacherRow }">
              <div class="rate-cell">
                <el-progress
                  :percentage="row.completionPercent"
                  :stroke-width="8"
                  :color="
                    row.completionPercent >= 60
                      ? 'var(--color-success)'
                      : 'var(--color-warning)'
                  "
                  :show-text="false"
                />
                <span class="rate-text">{{ row.completionPercent }}%</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }: { row: TrainingWarningTeacherRow }">
              <StatusTag :color="row.reached ? 'green' : 'red'">
                {{ row.reached ? "已达标" : "未达标" }}
              </StatusTag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }: { row: TrainingWarningTeacherRow }">
              <span class="action-link" @click="openTeacher(row.id)">查看明细</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="teacherTotal > 10" class="pagination-bar">
        <el-pagination
          v-model:current-page="teacherPage"
          v-model:page-size="teacherPageSize"
          :total="teacherTotal"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="reload"
          @size-change="() => { teacherPage = 1; reload(); }"
        />
      </div>
    </div>

    <TrainingWarningTeacherDrawer
      v-model:visible="drawerVisible"
      :detail="teacherDetail"
      @export="handleExport"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { Search } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import PageFilterBar from "@/components/PageFilterBar.vue";
import StatusTag from "@/components/StatusTag.vue";
import type { TrainingWarningTeacherRow } from "@/features/training-warning/types";
import { useTrainingWarningStore } from "@/stores/training-warning";
import TrainingWarningTeacherDrawer from "./TrainingWarningTeacherDrawer.vue";

defineOptions({ name: "TrainingWarningSchoolDetailView" });

const listPath = "/bureau/ai-teacher-development/teaching-monitoring/warnings";
const route = useRoute();
const warningStore = useTrainingWarningStore();
const {
  loading,
  schoolDetailName,
  schoolStats,
  teachers,
  teacherTotal,
  teacherPage,
  teacherPageSize,
  teacherStatus,
  teacherSubject,
  teacherName,
  teacherDetail,
} = storeToRefs(warningStore);

const drawerVisible = ref(false);

function schoolId() {
  return String(route.params.schoolId ?? "");
}

function reload() {
  void warningStore.loadSchoolDetail(schoolId());
}

onMounted(reload);
watch(() => route.params.schoolId, reload);

function handleSearch() {
  void warningStore.searchTeachers();
}

function handleReset() {
  void warningStore.resetTeacherFilter();
}

async function openTeacher(teacherId: string) {
  await warningStore.loadTeacherDetail(teacherId);
  drawerVisible.value = true;
}

function handleExport() {
  ElMessage.success("已准备导出学分明细");
}
</script>

<style scoped>
.page-wrapper {
  min-height: 0;
}

.page-title {
  margin: 0 0 var(--spacing-16);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 28px;
  flex-shrink: 0;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--spacing-12);
  margin-bottom: var(--spacing-16);
  flex-shrink: 0;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: var(--spacing-4);
  min-height: 88px;
  padding: var(--spacing-16) var(--spacing-24);
  background: var(--color-bg);
  border-radius: var(--radius-lg);
}

.stat-value {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--color-title);
  font-weight: var(--font-weight-semibold);
  line-height: 28px;
}

.stat-label {
  margin: 0;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
}

.text-success {
  color: var(--color-success);
}

.text-danger {
  color: var(--color-error);
}

.text-primary {
  color: var(--color-primary);
}

.page-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin: 0 var(--spacing-24) var(--spacing-24);
  padding: var(--spacing-16) var(--spacing-24) var(--spacing-24);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  overflow: auto;
}

.page-body > :deep(.school-filter.page-filter-bar) {
  padding: 0 0 var(--spacing-16);
  border-bottom: 0;
}

.form-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  height: 32px;
  min-width: 180px;
}

.name-item {
  min-width: 240px;
}

.form-label {
  flex-shrink: 0;
  color: var(--color-title);
  font-size: var(--font-size-md);
}

.form-item :deep(.el-select),
.form-item :deep(.el-input) {
  flex: 1;
  min-width: 0;
}

.table-wrapper {
  flex: 0 1 auto;
  min-height: 0;
  overflow: auto;
}

.table-wrapper :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.rate-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
}

.rate-cell :deep(.el-progress) {
  flex: 1;
  max-width: 120px;
}

.rate-text {
  flex-shrink: 0;
  color: var(--color-title);
  font-size: var(--font-size-md);
}

.action-link {
  color: var(--color-primary);
  cursor: pointer;
}

.action-link:hover {
  color: var(--color-primary-hover);
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  margin-top: var(--spacing-16);
}
</style>
