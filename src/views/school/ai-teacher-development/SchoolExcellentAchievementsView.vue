<template>
  <div v-loading="loading" class="page-wrapper">
    <div class="page-body">
      <PageFilterBar class="excellent-filter" show-reset @search="handleSearch" @reset="handleReset">
        <div class="form-item">
          <span class="form-label">类型：</span>
          <el-select v-model="type" placeholder="请选择" clearable>
            <el-option
              v-for="item in EXCELLENT_ACHIEVEMENT_TYPE_OPTIONS"
              :key="item.value || 'all-type'"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="form-item">
          <span class="form-label">学段：</span>
          <el-select v-model="stage" placeholder="请选择" clearable>
            <el-option
              v-for="item in EXCELLENT_ACHIEVEMENT_STAGE_OPTIONS"
              :key="item.value || 'all-stage'"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="form-item">
          <span class="form-label">学科：</span>
          <el-select v-model="subject" placeholder="请选择" clearable>
            <el-option
              v-for="item in EXCELLENT_ACHIEVEMENT_SUBJECT_OPTIONS"
              :key="item.value || 'all-subject'"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="form-item">
          <span class="form-label">排序：</span>
          <el-select v-model="sortKey" placeholder="请选择">
            <el-option
              v-for="item in EXCELLENT_ACHIEVEMENT_SORT_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </PageFilterBar>

      <div class="card-grid">
        <SchoolExcellentAchievementCard
          v-for="item in rows"
          :key="item.id"
          :item="item"
          @open="openDetail(item.id)"
        />
      </div>

      <div class="pagination-bar">
        <span class="total-text">共 {{ total }} 条优秀成果</span>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          background
          prev-text="上一页"
          next-text="下一页"
          @current-change="(page: number) => void excellentStore.setPage(page)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import PageFilterBar from "@/components/PageFilterBar.vue";
import {
  EXCELLENT_ACHIEVEMENT_SORT_OPTIONS,
  EXCELLENT_ACHIEVEMENT_STAGE_OPTIONS,
  EXCELLENT_ACHIEVEMENT_SUBJECT_OPTIONS,
  EXCELLENT_ACHIEVEMENT_TYPE_OPTIONS,
} from "@/features/school-excellent-achievements/types";
import { useSchoolExcellentAchievementsStore } from "@/stores/school-excellent-achievements";
import SchoolExcellentAchievementCard from "./SchoolExcellentAchievementCard.vue";

defineOptions({ name: "SchoolExcellentAchievementsView" });

const listBasePath = "/ai-teacher-development/teaching-monitoring/excellent-achievements";
const router = useRouter();
const excellentStore = useSchoolExcellentAchievementsStore();
const { loading, rows, total, type, stage, subject, sortKey, currentPage, pageSize } =
  storeToRefs(excellentStore);

onMounted(() => {
  void excellentStore.loadList();
});

function handleSearch() {
  void excellentStore.search();
}

function handleReset() {
  void excellentStore.resetFilter();
}

function openDetail(id: string) {
  void router.push(`${listBasePath}/${id}`);
}
</script>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
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
  padding: var(--spacing-24);
  background: var(--color-white);
  border-radius: var(--radius-md);
  overflow: auto;
}

.page-body > :deep(.excellent-filter.page-filter-bar) {
  padding: 0 0 var(--spacing-16);
  border-bottom: 0;
  background: transparent;
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

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-16);
  flex: 0 1 auto;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-16);
  flex-shrink: 0;
  margin-top: auto;
  padding-top: var(--spacing-16);
}

.total-text {
  color: var(--color-secondary);
  font-size: var(--font-size-md);
}

@media (max-width: 1100px) {
  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
