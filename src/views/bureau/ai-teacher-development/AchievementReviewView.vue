<template>
  <div class="page-wrapper">
    <AchievementReviewStats :stats="stats" />

    <div class="page-body">
      <el-tabs :model-value="filterForm.statusTab" @tab-change="handleTabChange">
        <el-tab-pane :label="`待终审(${tabCounts.pending})`" name="pending" />
        <el-tab-pane :label="`已通过(${tabCounts.approved})`" name="approved" />
        <el-tab-pane :label="`已驳回(${tabCounts.rejected})`" name="rejected" />
        <el-tab-pane label="全部" name="all" />
      </el-tabs>

      <PageFilterBar show-reset @search="handleSearch" @reset="handleReset">
        <div class="form-item">
          <span class="form-label">学校：</span>
          <el-input v-model="filterForm.schoolName" placeholder="请选择" clearable />
        </div>
        <div class="form-item">
          <span class="form-label">类型：</span>
          <el-select v-model="filterForm.type" placeholder="请选择" clearable>
            <el-option
              v-for="item in ACHIEVEMENT_REVIEW_TYPE_OPTIONS"
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
            placeholder="请输入教师姓名或成果标题"
            :prefix-icon="Search"
            clearable
            @keyup.enter="handleSearch"
          />
        </div>
      </PageFilterBar>

      <div class="table-wrapper">
        <el-table v-loading="loading" :data="rows" border height="100%">
          <el-table-column label="序号" width="72" align="center">
            <template #default="{ $index }">
              {{ (currentPage - 1) * pageSize + $index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="title" label="成果标题" min-width="220" show-overflow-tooltip />
          <el-table-column prop="schoolName" label="学校" min-width="100" />
          <el-table-column prop="teacherName" label="教师" width="100" />
          <el-table-column label="研修类型" width="110">
            <template #default="{ row }: { row: AchievementReviewRow }">
              {{ ACHIEVEMENT_REVIEW_TYPE_MAP[row.type].label }}
            </template>
          </el-table-column>
          <el-table-column label="等级/分值" width="120">
            <template #default="{ row }: { row: AchievementReviewRow }">
              {{ row.levelLabel }}/{{ row.scoreLabel }}分
            </template>
          </el-table-column>
          <el-table-column prop="submittedAt" label="时间" width="160" />
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }: { row: AchievementReviewRow }">
              <StatusTag :color="ACHIEVEMENT_REVIEW_STATUS_MAP[row.status].tagColor">
                {{ ACHIEVEMENT_REVIEW_STATUS_MAP[row.status].label }}
              </StatusTag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }: { row: AchievementReviewRow }">
              <span
                v-if="row.status === 'pending'"
                class="action-link"
                @click="openDetail(row.id)"
              >
                审核
              </span>
              <span v-else class="action-link" @click="openDetail(row.id)">查看</span>
              <span
                v-if="row.status === 'approved' && !row.featured"
                class="action-link"
                @click="openFeature(row.id)"
              >
                加精
              </span>
              <span
                v-if="row.status === 'approved' && row.featured"
                class="action-link"
                @click="handleUnfeature(row.id)"
              >
                取消加精
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
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="(page: number) => void reviewStore.setPage(page)"
          @size-change="(size: number) => void reviewStore.setPageSize(size)"
        />
      </div>
    </div>

    <AchievementReviewDetailDrawer
      v-model:visible="drawerVisible"
      :detail="detail"
      :saving="actionSaving"
      @approve="handleApprove"
      @reject="handleReject"
      @preview="notifyFile"
      @download="notifyFile"
    />

    <AchievementFeatureDialog
      v-model:visible="featureVisible"
      :candidates="featureCandidates"
      :default-id="featureDefaultId"
      :saving="actionSaving"
      @confirm="handleFeatureConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { Search } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import PageFilterBar from "@/components/PageFilterBar.vue";
import StatusTag from "@/components/StatusTag.vue";
import {
  ACHIEVEMENT_REVIEW_STATUS_MAP,
  ACHIEVEMENT_REVIEW_TYPE_MAP,
  ACHIEVEMENT_REVIEW_TYPE_OPTIONS,
  type AchievementReviewListQuery,
  type AchievementReviewRow,
} from "@/features/training-achievement-review/types";
import { useTrainingAchievementReviewStore } from "@/stores/training-achievement-review";
import AchievementFeatureDialog from "./AchievementFeatureDialog.vue";
import AchievementReviewDetailDrawer from "./AchievementReviewDetailDrawer.vue";
import AchievementReviewStats from "./AchievementReviewStats.vue";

defineOptions({ name: "AchievementReviewView" });

const reviewStore = useTrainingAchievementReviewStore();
const {
  loading,
  stats,
  rows,
  total,
  tabCounts,
  detail,
  featureCandidates,
  filterForm,
  currentPage,
  pageSize,
} = storeToRefs(reviewStore);

const drawerVisible = ref(false);
const featureVisible = ref(false);
const featureDefaultId = ref("");
const actionSaving = ref(false);

onMounted(() => {
  void reviewStore.loadList();
});

function handleSearch() {
  void reviewStore.search();
}

function handleReset() {
  void reviewStore.resetFilter();
}

function handleTabChange(name: string | number) {
  void reviewStore.setStatusTab(String(name) as AchievementReviewListQuery["statusTab"]);
}

async function openDetail(id: string) {
  await reviewStore.loadDetail(id);
  drawerVisible.value = true;
}

async function openFeature(id: string) {
  featureDefaultId.value = id;
  await reviewStore.loadFeatureCandidates();
  featureVisible.value = true;
}

async function handleApprove(remark: string) {
  if (!detail.value) return;
  actionSaving.value = true;
  try {
    await reviewStore.approve(detail.value.id, remark);
    ElMessage.success("终审已通过");
    drawerVisible.value = false;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "操作失败");
  } finally {
    actionSaving.value = false;
  }
}

async function handleReject(remark: string) {
  if (!detail.value) return;
  actionSaving.value = true;
  try {
    await reviewStore.reject(detail.value.id, remark);
    ElMessage.success("已驳回");
    drawerVisible.value = false;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "操作失败");
  } finally {
    actionSaving.value = false;
  }
}

async function handleFeatureConfirm(id: string, reason: string) {
  actionSaving.value = true;
  try {
    await reviewStore.feature(id, true, reason);
    ElMessage.success("已加精");
    featureVisible.value = false;
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "操作失败");
  } finally {
    actionSaving.value = false;
  }
}

async function handleUnfeature(id: string) {
  try {
    await reviewStore.feature(id, false);
    ElMessage.success("已取消加精");
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "操作失败");
  }
}

function notifyFile(name: string) {
  ElMessage.success(`已准备：${name}`);
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
  gap: var(--spacing-12);
  padding: var(--spacing-16) var(--spacing-24) var(--spacing-24);
  background: var(--color-white);
  border-radius: var(--radius-lg);
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
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.action-link {
  margin-right: var(--spacing-12);
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
}
</style>
