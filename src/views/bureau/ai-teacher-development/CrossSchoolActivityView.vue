<template>
  <div class="page-wrapper">
    <PageFilterBar four-columns show-reset @search="handleSearch" @reset="handleReset">
      <div class="form-item">
        <span class="form-label">类型：</span>
        <el-select v-model="filterForm.type" placeholder="全部类型" clearable>
          <el-option label="全部类型" value="" />
          <el-option label="集体备课" value="lesson-prep" />
          <el-option label="听评课" value="lesson-observation" />
        </el-select>
      </div>
      <div class="form-item">
        <span class="form-label">状态：</span>
        <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
          <el-option label="全部状态" value="" />
          <el-option label="进行中" value="ongoing" />
          <el-option label="已归档" value="archived" />
        </el-select>
      </div>
      <div class="form-item">
        <span class="form-label">联盟：</span>
        <el-select v-model="filterForm.allianceId" placeholder="全部联盟" clearable>
          <el-option label="全部联盟" value="" />
          <el-option
            v-for="alliance in allianceOptions"
            :key="alliance.id"
            :label="alliance.name"
            :value="alliance.id"
          />
        </el-select>
      </div>
      <div class="form-item">
        <span class="form-label">活动名称：</span>
        <el-input
          v-model="filterForm.name"
          placeholder="搜索活动名称"
          :prefix-icon="Search"
          clearable
          @keyup.enter="handleSearch"
        />
      </div>
    </PageFilterBar>

    <div class="page-body">
      <div class="toolbar">
        <div class="toolbar-heading">
          <h1 class="toolbar-title">活动管理</h1>
          <p class="toolbar-subtitle">牵头学校统筹组织跨校教研活动</p>
        </div>
        <div class="toolbar-right">
          <el-button type="primary" :icon="Plus" @click="handleCreate">创建活动</el-button>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table v-loading="loading" :data="tableData" stripe border height="100%">
          <el-table-column label="序号" width="72" align="center">
            <template #default="{ $index }">
              {{ (currentPage - 1) * pageSize + $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="活动名称" min-width="280" show-overflow-tooltip>
            <template #default="{ row }: { row: CrossSchoolActivityRow }">
              <span class="action-link" @click="handleViewDetail(row)">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="110" align="center">
            <template #default="{ row }: { row: CrossSchoolActivityRow }">
              <StatusTag :color="ACTIVITY_TYPE_MAP[row.type].tagColor">
                {{ ACTIVITY_TYPE_MAP[row.type].label }}
              </StatusTag>
            </template>
          </el-table-column>
          <el-table-column prop="scheduledAt" label="时间" width="160" show-overflow-tooltip />
          <el-table-column
            prop="leadSchoolName"
            label="牵头学校"
            min-width="120"
            show-overflow-tooltip
          />
          <el-table-column label="参与人数/校数" width="130" align="center">
            <template #default="{ row }: { row: CrossSchoolActivityRow }">
              {{ row.participantCount }}人/{{ row.schoolCount }}校
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }: { row: CrossSchoolActivityRow }">
              <StatusTag :color="ACTIVITY_STATUS_MAP[row.status].tagColor">
                {{ ACTIVITY_STATUS_MAP[row.status].label }}
              </StatusTag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="88">
            <template #default="{ row }: { row: CrossSchoolActivityRow }">
              <span class="action-link" @click="handleViewDetail(row)">详情</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-bar">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { Plus, Search } from "@element-plus/icons-vue";
import PageFilterBar from "@/components/PageFilterBar.vue";
import StatusTag from "@/components/StatusTag.vue";
import {
  ACTIVITY_STATUS_MAP,
  ACTIVITY_TYPE_MAP,
  type CrossSchoolActivityRow,
} from "@/features/cross-school-activity/types";
import { useCrossSchoolActivityStore } from "@/stores/cross-school-activity";

defineOptions({ name: "CrossSchoolActivityView" });

const listCreatePath = "/bureau/ai-teacher-development/cross-school-research/activities/create";
const router = useRouter();
const activityStore = useCrossSchoolActivityStore();
const {
  loading,
  tableData,
  allianceOptions,
  filterForm,
  currentPage,
  pageSize,
  total,
} = storeToRefs(activityStore);

onMounted(() => {
  void activityStore.loadAlliances();
  void activityStore.loadList();
});

function handleSearch() {
  void activityStore.search();
}

function handleReset() {
  void activityStore.resetFilter();
}

function handleSizeChange(size: number) {
  void activityStore.setPageSize(size);
}

function handlePageChange(page: number) {
  void activityStore.setPage(page);
}

function handleCreate() {
  void router.push(listCreatePath);
}

function handleViewDetail(row: CrossSchoolActivityRow) {
  void router.push(
    `/bureau/ai-teacher-development/cross-school-research/activities/${row.id}`,
  );
}
</script>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg);
}

.page-body {
  flex: 1;
  overflow: hidden;
  padding: var(--spacing-24);
  background: var(--color-white);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
}

.form-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  height: 32px;
  min-width: 0;
}

.form-label {
  font-size: var(--font-size-md);
  color: var(--color-title);
  line-height: var(--line-height-md);
  white-space: nowrap;
  flex-shrink: 0;
}

.form-item :deep(.el-select),
.form-item :deep(.el-input) {
  flex: 1;
  min-width: 0;
  --el-input-height: 32px;
}

.toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-shrink: 0;
  gap: var(--spacing-16);
}

.toolbar-heading {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.toolbar-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}

.toolbar-subtitle {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-secondary);
  line-height: var(--line-height-md);
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.table-wrapper {
  flex: 1;
  overflow: hidden;
}

.action-link {
  font-size: var(--font-size-md);
  color: var(--color-primary);
  cursor: pointer;
  white-space: nowrap;
}

.action-link:hover {
  color: var(--color-primary-hover);
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}
</style>
