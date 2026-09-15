<template>
  <div class="page-wrapper">
    <AllianceManagementStats :stats="stats" />
    <div class="page-main">
      <PageFilterBar four-columns show-reset @search="handleSearch" @reset="handleReset">
      <div class="form-item">
        <span class="form-label">联盟名称：</span>
        <el-input
          v-model="filterForm.name"
          placeholder="搜索联盟名称"
          :prefix-icon="Search"
          clearable
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="form-item">
        <span class="form-label">状态：</span>
        <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
          <el-option label="全部状态" value="" />
          <el-option label="使用中" value="active" />
          <el-option label="已停用" value="disabled" />
        </el-select>
      </div>
    </PageFilterBar>

    <div class="page-body">
      <div class="toolbar">
        <div class="toolbar-heading">
          <h1 class="toolbar-title">教研联盟管理</h1>
          <p class="toolbar-subtitle">教育局创建和管理跨校教研联盟</p>
        </div>
        <div class="toolbar-right">
          <el-button type="primary" :icon="DocumentAdd" @click="handleCreate">创建联盟</el-button>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table v-loading="loading" :data="tableData" stripe border height="100%">
          <el-table-column label="序号" width="72" align="center">
            <template #default="{ $index }">
              {{ (currentPage - 1) * pageSize + $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="联盟名称" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="action-link" @click="handleViewDetail(row)">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="leadSchoolName"
            label="牵头学校"
            min-width="140"
            show-overflow-tooltip
          />
          <el-table-column prop="memberSchoolCount" label="成员校数" width="100" align="center" />
          <el-table-column prop="activityCount" label="活动数" width="90" align="center" />
          <el-table-column prop="teacherCount" label="教师数" width="90" align="center" />
          <el-table-column prop="adminName" label="管理员" width="100" show-overflow-tooltip />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }: { row: TeachingResearchAllianceRow }">
              <StatusTag :color="statusMeta(row.status).tagColor">
                {{ statusMeta(row.status).label }}
              </StatusTag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="140">
            <template #default="{ row }: { row: TeachingResearchAllianceRow }">
              <span class="action-link" @click="handleViewDetail(row)">详情</span>
              <span
                class="action-link"
                :class="row.status === 'active' ? 'action-danger' : undefined"
                @click="handleToggleStatus(row)"
              >
                {{ row.status === "active" ? "停用" : "启用" }}
              </span>
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
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { DocumentAdd, Search } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import PageFilterBar from "@/components/PageFilterBar.vue";
import StatusTag from "@/components/StatusTag.vue";
import {
  ALLIANCE_STATUS_MAP,
  type AllianceStatus,
  type TeachingResearchAllianceRow,
} from "@/features/teaching-research-alliance/types";
import { useTeachingResearchAllianceStore } from "@/stores/teaching-research-alliance";
import AllianceManagementStats from "@/views/bureau/ai-teacher-development/AllianceManagementStats.vue";

defineOptions({ name: "AllianceManagementView" });

const router = useRouter();
const allianceStore = useTeachingResearchAllianceStore();
const {
  loading,
  tableData,
  filterForm,
  currentPage,
  pageSize,
  total,
  stats,
} = storeToRefs(allianceStore);

function statusMeta(status: AllianceStatus) {
  return ALLIANCE_STATUS_MAP[status];
}

onMounted(() => {
  void allianceStore.loadList();
});

function handleSearch() {
  void allianceStore.search();
}

function handleReset() {
  void allianceStore.resetFilter();
}

function handleSizeChange(size: number) {
  void allianceStore.setPageSize(size);
}

function handlePageChange(page: number) {
  void allianceStore.setPage(page);
}

function handleCreate() {
  void router.push("/bureau/ai-teacher-development/cross-school-research/alliance/create");
}

function handleViewDetail(row: TeachingResearchAllianceRow) {
  void router.push(
    `/bureau/ai-teacher-development/cross-school-research/alliance/${row.id}`,
  );
}

async function handleToggleStatus(row: TeachingResearchAllianceRow) {
  const nextStatus = row.status === "active" ? "disabled" : "active";
  const actionLabel = nextStatus === "disabled" ? "停用" : "启用";
  try {
    await ElMessageBox.confirm(
      `确认${actionLabel}联盟「${row.name}」吗？`,
      `${actionLabel}联盟`,
      { type: "warning" },
    );
  } catch {
    return;
  }
  try {
    await allianceStore.setStatus(row.id, nextStatus);
    ElMessage.success(`已${actionLabel}`);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : `${actionLabel}失败`);
  }
}
</script>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: var(--spacing-16);
  background: var(--color-bg);
}

.page-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-white);
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

.action-link + .action-link {
  margin-left: var(--spacing-12);
}

.action-link:hover {
  color: var(--color-primary-hover);
}

.action-danger {
  color: var(--color-error);
}

.action-danger:hover {
  color: var(--color-error-dark-text);
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}
</style>
