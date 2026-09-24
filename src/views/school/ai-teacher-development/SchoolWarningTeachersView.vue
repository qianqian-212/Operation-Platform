<template>
  <div v-loading="loading" class="page-wrapper">
    <div v-if="banner && bannerVisible" class="warning-banner" role="status">
      <el-icon class="banner-icon" :size="18"><WarningFilled /></el-icon>
      <p class="banner-title">本校共 {{ banner.unreachedTeacherCount }} 名教师学分未达标</p>
      <div class="banner-meta">
        <span>达标线：{{ banner.creditLine }}学分/年</span>
        <span class="banner-divider" aria-hidden="true" />
        <span>预警阈值：完成率低于{{ banner.triggerPercent }}%</span>
      </div>
      <button
        type="button"
        class="banner-close"
        aria-label="关闭预警提示"
        @click="bannerVisible = false"
      >
        <el-icon :size="16"><Close /></el-icon>
      </button>
    </div>

    <div class="page-body">
      <h1 class="page-title">预警教师名单</h1>

      <section class="stats-row" aria-label="学校学分概览">
        <article class="stat-card">
          <p class="stat-value">{{ stats.teacherCount }}</p>
          <p class="stat-label">教师总数</p>
        </article>
        <article class="stat-card">
          <p class="stat-value text-success">{{ stats.reachedCount }}</p>
          <p class="stat-label">已达标</p>
        </article>
        <article class="stat-card">
          <p class="stat-value text-danger">{{ stats.unreachedCount }}</p>
          <p class="stat-label">未达标</p>
        </article>
        <article class="stat-card">
          <p class="stat-value text-primary">{{ stats.reachRatePercent }}%</p>
          <p class="stat-label">达标率</p>
        </article>
      </section>

      <PageFilterBar class="school-filter" show-reset @search="handleSearch" @reset="handleReset">
        <div class="form-item">
          <span class="form-label">学期：</span>
          <el-select v-model="semester" placeholder="全部学期" clearable>
            <el-option
              v-for="item in SCHOOL_WARNING_SEMESTER_OPTIONS"
              :key="item.value || 'all'"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </PageFilterBar>

      <div class="table-wrapper">
        <el-table :data="teachers" border>
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="subject" label="学科" width="100" />
          <el-table-column label="当前学分" width="110">
            <template #default="{ row }: { row: SchoolWarningTeacherRow }">
              {{ row.currentCredits }} 分
            </template>
          </el-table-column>
          <el-table-column label="达标线" width="100">
            <template #default="{ row }: { row: SchoolWarningTeacherRow }">
              {{ row.creditLine }}分
            </template>
          </el-table-column>
          <el-table-column label="完成率" min-width="200">
            <template #default="{ row }: { row: SchoolWarningTeacherRow }">
              <div class="rate-cell">
                <el-progress
                  :percentage="Math.min(row.completionPercent, 100)"
                  :stroke-width="8"
                  :color="
                    row.status === 'reached' ? 'var(--color-success)' : 'var(--color-error)'
                  "
                  :show-text="false"
                />
                <span class="rate-text">{{ row.completionPercent }}%</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="110" align="center">
            <template #default="{ row }: { row: SchoolWarningTeacherRow }">
              <StatusTag :color="SCHOOL_WARNING_TEACHER_STATUS_MAP[row.status].tagColor">
                {{ SCHOOL_WARNING_TEACHER_STATUS_MAP[row.status].label }}
              </StatusTag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }: { row: SchoolWarningTeacherRow }">
              <span class="action-link" @click="openTeacher(row.id)">查看明细</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="total > 10" class="pagination-bar">
        <el-pagination
          v-model:current-page="teacherPage"
          v-model:page-size="teacherPageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="() => void warningStore.loadList()"
          @size-change="
            () => {
              teacherPage = 1;
              void warningStore.loadList();
            }
          "
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
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { Close, WarningFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import PageFilterBar from "@/components/PageFilterBar.vue";
import StatusTag from "@/components/StatusTag.vue";
import {
  SCHOOL_WARNING_SEMESTER_OPTIONS,
  SCHOOL_WARNING_TEACHER_STATUS_MAP,
  type SchoolWarningTeacherRow,
} from "@/features/school-training-warning-teachers/types";
import { useSchoolTrainingWarningTeachersStore } from "@/stores/school-training-warning-teachers";
import TrainingWarningTeacherDrawer from "@/views/bureau/ai-teacher-development/TrainingWarningTeacherDrawer.vue";

defineOptions({ name: "SchoolWarningTeachersView" });

const warningStore = useSchoolTrainingWarningTeachersStore();
const bannerVisible = ref(true);
const drawerVisible = ref(false);
const {
  loading,
  banner,
  stats,
  teachers,
  total,
  teacherPage,
  teacherPageSize,
  semester,
  teacherDetail,
} = storeToRefs(warningStore);

onMounted(() => {
  void warningStore.loadList();
});

function handleSearch() {
  void warningStore.search();
}

function handleReset() {
  void warningStore.resetFilter();
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
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
  height: 100%;
  min-height: 0;
  background: var(--color-bg);
}

.warning-banner {
  display: flex;
  align-items: center;
  gap: var(--spacing-12);
  flex-shrink: 0;
  min-height: 48px;
  padding: var(--spacing-12) var(--spacing-16);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-md);
  background: var(--color-warning-light);
}

.banner-icon {
  color: var(--color-warning);
  flex-shrink: 0;
}

.banner-title {
  margin: 0;
  flex-shrink: 0;
  color: var(--color-warning-dark-text, var(--color-warning));
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-md);
}

.banner-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-12);
  min-width: 0;
  color: var(--color-title);
  font-size: var(--font-size-md);
  line-height: var(--line-height-md);
}

.banner-divider {
  width: 1px;
  height: 12px;
  background: var(--color-border-strong, var(--color-border));
  flex-shrink: 0;
}

.banner-close {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-secondary);
  cursor: pointer;
  flex-shrink: 0;
}

.banner-close:hover {
  color: var(--color-title);
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
  padding: var(--spacing-16) var(--spacing-24) var(--spacing-24);
  background: var(--color-white);
  border-radius: var(--radius-md);
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
  min-width: 200px;
}

.form-label {
  flex-shrink: 0;
  color: var(--color-title);
  font-size: var(--font-size-md);
}

.form-item :deep(.el-select) {
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
