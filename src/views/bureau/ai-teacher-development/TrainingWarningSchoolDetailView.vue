<template>
  <div v-loading="loading" class="page-wrapper">
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: listPath }">预警管理</el-breadcrumb-item>
        <el-breadcrumb-item>{{ schoolDetailName || "学校详情" }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <h1 class="page-title">{{ schoolDetailName }} · 教师学分详情</h1>

    <section class="stats-row">
      <article class="stat-card">
        <p class="stat-label">教师总数</p>
        <p class="stat-value">{{ schoolStats.teacherCount }}</p>
      </article>
      <article class="stat-card">
        <p class="stat-label">已达标</p>
        <p class="stat-value text-success">{{ schoolStats.reachedCount }}</p>
      </article>
      <article class="stat-card">
        <p class="stat-label">未达标</p>
        <p class="stat-value text-danger">{{ schoolStats.unreachedCount }}</p>
      </article>
      <article class="stat-card">
        <p class="stat-label">达标率</p>
        <p class="stat-value text-primary">{{ schoolStats.reachRatePercent }}%</p>
      </article>
    </section>

    <div class="page-body">
      <PageFilterBar show-reset @search="handleSearch" @reset="handleReset">
        <div class="form-item">
          <span class="form-label">状态：</span>
          <el-select v-model="teacherStatus" placeholder="全部" clearable>
            <el-option label="已达标" value="reached" />
            <el-option label="未达标" value="unreached" />
          </el-select>
        </div>
        <div class="form-item">
          <span class="form-label">学科：</span>
          <el-select v-model="teacherSubject" placeholder="全部" clearable>
            <el-option label="语文" value="语文" />
            <el-option label="数学" value="数学" />
          </el-select>
        </div>
        <div class="form-item">
          <span class="form-label">教师姓名：</span>
          <el-input v-model="teacherName" placeholder="请输入" clearable />
        </div>
      </PageFilterBar>

      <div class="table-wrapper">
        <el-table :data="teachers" border height="100%">
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
          <el-table-column label="完成率" min-width="180">
            <template #default="{ row }: { row: TrainingWarningTeacherRow }">
              <div class="rate-cell">
                <el-progress
                  :percentage="row.completionPercent"
                  :stroke-width="8"
                  :color="row.reached ? 'var(--color-success)' : 'var(--color-warning)'"
                  :show-text="false"
                />
                <span>{{ row.completionPercent }}%</span>
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

      <div class="pagination-bar">
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

    <TrainingWarningTeacherDrawer v-model:visible="drawerVisible" :detail="teacherDetail" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
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

.breadcrumb-bar,
.page-title {
  flex-shrink: 0;
}

.page-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--spacing-12);
}

.stat-card {
  padding: var(--spacing-20) var(--spacing-24);
  background: var(--color-white);
  border-radius: var(--radius-lg);
}

.stat-label {
  margin: 0;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.stat-value {
  margin: var(--spacing-8) 0 0;
  font-size: var(--font-size-xl);
  color: var(--color-title);
  font-weight: var(--font-weight-semibold);
}

.text-success { color: var(--color-success); }
.text-danger { color: var(--color-error); }
.text-primary { color: var(--color-primary); }

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

.form-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  min-width: 200px;
}

.form-label {
  flex-shrink: 0;
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

.action-link {
  color: var(--color-primary);
  cursor: pointer;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
}
</style>
