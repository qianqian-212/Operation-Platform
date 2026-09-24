<template>
  <div class="page-wrapper">
    <SchoolAchievementAuditStats :stats="stats" />

    <div class="page-body">
      <el-tabs
        class="review-tabs"
        :model-value="filterForm.statusTab"
        @tab-change="handleTabChange"
      >
        <el-tab-pane :label="`待审核(${tabCounts.pending})`" name="pending" />
        <el-tab-pane
          :label="`待区级终审(${tabCounts['district-reviewing']})`"
          name="district-reviewing"
        />
        <el-tab-pane :label="`已通过(${tabCounts.approved})`" name="approved" />
        <el-tab-pane :label="`已驳回(${tabCounts.rejected})`" name="rejected" />
        <el-tab-pane label="全部" name="all" />
      </el-tabs>

      <PageFilterBar class="review-filter" show-reset @search="handleSearch" @reset="handleReset">
        <div class="form-item">
          <span class="form-label">学期：</span>
          <el-select v-model="filterForm.semester" placeholder="全部学期" clearable>
            <el-option
              v-for="item in SCHOOL_ACHIEVEMENT_AUDIT_SEMESTER_OPTIONS"
              :key="item.value || 'all'"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="form-item">
          <span class="form-label">类型：</span>
          <el-select v-model="filterForm.type" placeholder="全部类型" clearable>
            <el-option
              v-for="item in SCHOOL_ACHIEVEMENT_AUDIT_TYPE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="form-item keyword-item">
          <span class="form-label">关键词：</span>
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索教师姓名/成果标题..."
            :prefix-icon="Search"
            clearable
            @keyup.enter="handleSearch"
          />
        </div>
      </PageFilterBar>

      <div class="table-wrapper">
        <el-table v-loading="loading" :data="rows" border>
          <el-table-column prop="title" label="成果标题" min-width="220" show-overflow-tooltip />
          <el-table-column label="提交教师" width="140">
            <template #default="{ row }: { row: SchoolAchievementAuditRow }">
              {{ row.teacherName }} · {{ row.subject }}
            </template>
          </el-table-column>
          <el-table-column label="研修类型" width="110">
            <template #default="{ row }: { row: SchoolAchievementAuditRow }">
              {{ SCHOOL_ACHIEVEMENT_AUDIT_TYPE_MAP[row.type].label }}
            </template>
          </el-table-column>
          <el-table-column prop="levelLabel" label="等级" min-width="120" />
          <el-table-column label="申报学分" width="100">
            <template #default="{ row }: { row: SchoolAchievementAuditRow }">
              {{ row.declaredScore }}分
            </template>
          </el-table-column>
          <el-table-column prop="submittedAt" label="提交时间" width="160" />
          <el-table-column label="状态" width="110" align="center">
            <template #default="{ row }: { row: SchoolAchievementAuditRow }">
              <StatusTag :color="SCHOOL_ACHIEVEMENT_AUDIT_STATUS_MAP[row.status].tagColor">
                {{ SCHOOL_ACHIEVEMENT_AUDIT_STATUS_MAP[row.status].label }}
              </StatusTag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="88" fixed="right">
            <template #default="{ row }: { row: SchoolAchievementAuditRow }">
              <span class="action-link" @click="openDetail(row.id)">
                {{ row.status === "pending" ? "审核" : "查看" }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="total > 10" class="pagination-bar">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="(page: number) => void auditStore.setPage(page)"
          @size-change="(size: number) => void auditStore.setPageSize(size)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { Search } from "@element-plus/icons-vue";
import PageFilterBar from "@/components/PageFilterBar.vue";
import StatusTag from "@/components/StatusTag.vue";
import {
  SCHOOL_ACHIEVEMENT_AUDIT_SEMESTER_OPTIONS,
  SCHOOL_ACHIEVEMENT_AUDIT_STATUS_MAP,
  SCHOOL_ACHIEVEMENT_AUDIT_TYPE_MAP,
  SCHOOL_ACHIEVEMENT_AUDIT_TYPE_OPTIONS,
  type SchoolAchievementAuditListQuery,
  type SchoolAchievementAuditRow,
} from "@/features/school-training-achievement-audit/types";
import { useSchoolTrainingAchievementAuditStore } from "@/stores/school-training-achievement-audit";
import SchoolAchievementAuditStats from "./SchoolAchievementAuditStats.vue";

defineOptions({ name: "SchoolAchievementAuditView" });

const router = useRouter();
const auditStore = useSchoolTrainingAchievementAuditStore();
const { loading, stats, rows, total, tabCounts, filterForm, currentPage, pageSize } =
  storeToRefs(auditStore);

onMounted(() => {
  void auditStore.loadList();
});

function handleSearch() {
  void auditStore.search();
}

function handleReset() {
  void auditStore.resetFilter();
}

function handleTabChange(name: string | number) {
  void auditStore.setStatusTab(String(name) as SchoolAchievementAuditListQuery["statusTab"]);
}

function openDetail(id: string) {
  void router.push(`/ai-teacher-development/teaching-monitoring/achievement-audit/${id}`);
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

.page-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: var(--spacing-16) var(--spacing-24) var(--spacing-24);
  background: var(--color-white);
  border-radius: var(--radius-lg);
}

.review-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.review-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: var(--color-border);
}

.review-filter.page-filter-bar,
.page-body > :deep(.review-filter.page-filter-bar) {
  padding: var(--spacing-16) 0;
  border-bottom: 0;
}

.form-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  height: 32px;
  min-width: 200px;
}

.keyword-item {
  min-width: 280px;
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
