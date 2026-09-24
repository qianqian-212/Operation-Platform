<template>
  <div class="page-wrapper">
    <PageFilterBar four-columns show-reset @search="handleSearch" @reset="handleReset">
      <div class="form-item">
        <span class="form-label">状态：</span>
        <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
          <el-option label="全部状态" value="" />
          <el-option
            v-for="(meta, key) in TRAINING_ACHIEVEMENT_STATUS_MAP"
            :key="key"
            :label="meta.label"
            :value="key"
          />
        </el-select>
      </div>
      <div class="form-item">
        <span class="form-label">类型：</span>
        <el-select v-model="filterForm.type" placeholder="全部类型" clearable>
          <el-option label="全部类型" value="" />
          <el-option
            v-for="(meta, key) in TRAINING_ACHIEVEMENT_TYPE_MAP"
            :key="key"
            :label="meta.label"
            :value="key"
          />
        </el-select>
      </div>
      <div class="form-item">
        <span class="form-label">学期：</span>
        <el-select v-model="filterForm.semester" placeholder="全部学期" clearable>
          <el-option label="全部学期" value="" />
          <el-option
            v-for="item in TRAINING_ACHIEVEMENT_SEMESTER_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="form-item">
        <span class="form-label">成果标题：</span>
        <el-input
          v-model="filterForm.title"
          placeholder="搜索成果标题"
          :prefix-icon="Search"
          clearable
          @keyup.enter="handleSearch"
        />
      </div>
    </PageFilterBar>

    <div class="page-body">
      <div class="toolbar">
        <h1 class="toolbar-title">我的成果列表</h1>
        <div class="toolbar-right">
          <el-button type="primary" :icon="Plus" @click="handleCreate">新建研修成果</el-button>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table v-loading="loading" :data="tableData" stripe border>
          <el-table-column label="序号" width="72" align="center">
            <template #default="{ $index }">
              {{ (currentPage - 1) * pageSize + $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="成果标题" min-width="240" show-overflow-tooltip>
            <template #default="{ row }: { row: TrainingAchievementRow }">
              <span
                class="action-link"
                :class="{ 'is-rejected': isRejectedStatus(row.status) }"
                @click="handleViewDetail(row)"
              >
                {{ row.title }}{{ isRejectedStatus(row.status) ? "（已驳回）" : "" }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="bureauName" label="教育局" min-width="120" show-overflow-tooltip />
          <el-table-column label="学期" width="110" show-overflow-tooltip>
            <template #default="{ row }: { row: TrainingAchievementRow }">
              {{ semesterDisplayLabel(row.semester) }}
            </template>
          </el-table-column>
          <el-table-column label="研修类型" width="110" show-overflow-tooltip>
            <template #default="{ row }: { row: TrainingAchievementRow }">
              {{ TRAINING_ACHIEVEMENT_TYPE_MAP[row.type].label }}
            </template>
          </el-table-column>
          <el-table-column prop="levelLabel" label="等级" width="120" show-overflow-tooltip />
          <el-table-column prop="submittedAt" label="提交时间" width="120" />
          <el-table-column label="审核状态" width="120" align="center">
            <template #default="{ row }: { row: TrainingAchievementRow }">
              <StatusTag :color="TRAINING_ACHIEVEMENT_STATUS_MAP[row.status].tagColor">
                {{ TRAINING_ACHIEVEMENT_STATUS_MAP[row.status].label }}
              </StatusTag>
            </template>
          </el-table-column>
          <el-table-column label="获得学分" width="100" align="center">
            <template #default="{ row }: { row: TrainingAchievementRow }">
              <span :class="{ 'credit-earned': row.earnedCredits !== null }">
                {{ formatEarnedCredits(row.earnedCredits) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="140">
            <template #default="{ row }: { row: TrainingAchievementRow }">
              <span
                v-if="isRejectedStatus(row.status)"
                class="action-link"
                @click="handleResubmit(row)"
                >修改重提</span
              >
              <span class="action-link" @click="handleViewDetail(row)">查看</span>
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
  formatEarnedCredits,
  isRejectedStatus,
  semesterDisplayLabel,
  TRAINING_ACHIEVEMENT_SEMESTER_OPTIONS,
  TRAINING_ACHIEVEMENT_STATUS_MAP,
  TRAINING_ACHIEVEMENT_TYPE_MAP,
  type TrainingAchievementRow,
} from "@/features/training-achievement/types";
import { useTrainingAchievementStore } from "@/stores/training-achievement";

defineOptions({ name: "MyTrainingAchievementView" });

const listBasePath = "/ai-teacher-development/teaching-monitoring/achievements";
const router = useRouter();
const achievementStore = useTrainingAchievementStore();
const { loading, tableData, filterForm, currentPage, pageSize, total } =
  storeToRefs(achievementStore);

onMounted(() => {
  void achievementStore.loadList();
});

function handleSearch() {
  void achievementStore.search();
}

function handleReset() {
  void achievementStore.resetFilter();
}

function handleSizeChange(size: number) {
  void achievementStore.setPageSize(size);
}

function handlePageChange(page: number) {
  void achievementStore.setPage(page);
}

function handleCreate() {
  void router.push(`${listBasePath}/submit`);
}

function handleViewDetail(row: TrainingAchievementRow) {
  void router.push(`${listBasePath}/${row.id}`);
}

function handleResubmit(row: TrainingAchievementRow) {
  void router.push({ path: `${listBasePath}/submit`, query: { id: row.id } });
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
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  gap: var(--spacing-16);
}

.toolbar-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.table-wrapper {
  flex: 0 1 auto;
  min-height: 0;
  overflow: auto;
}

.table-wrapper :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.is-rejected {
  color: var(--color-error);
}

.credit-earned {
  color: var(--color-success-dark-text);
  font-weight: var(--font-weight-medium);
}

.action-link {
  margin-right: var(--spacing-12);
  font-size: var(--font-size-md);
  color: var(--color-primary);
  cursor: pointer;
  white-space: nowrap;
}

.action-link:last-child {
  margin-right: 0;
}

.action-link:hover {
  color: var(--color-primary-hover);
}

.action-link.is-rejected:hover {
  color: var(--color-error);
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}
</style>
