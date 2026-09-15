<template>
  <div class="page-wrapper">
    <PageFilterBar four-columns show-reset @search="handleSearch" @reset="handleReset">
      <div class="form-item">
        <span class="form-label">老师：</span>
        <el-input
          v-model="filterForm.teacherName"
          placeholder="请输入"
          :prefix-icon="Search"
          clearable
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="form-item">
        <span class="form-label">联盟：</span>
        <el-select v-model="filterForm.allianceId" placeholder="请选择" clearable>
          <el-option
            v-for="alliance in allianceOptions"
            :key="alliance.id"
            :label="alliance.name"
            :value="alliance.id"
          />
        </el-select>
      </div>
      <div class="form-item">
        <span class="form-label">学校：</span>
        <el-select v-model="filterForm.schoolId" placeholder="全部" clearable>
          <el-option label="全部" value="" />
          <el-option
            v-for="school in schoolOptions"
            :key="school.id"
            :label="school.name"
            :value="school.id"
          />
        </el-select>
      </div>
      <div class="form-item">
        <span class="form-label">方式：</span>
        <el-select v-model="filterForm.reviewMethod" placeholder="全部" clearable>
          <el-option label="全部" value="" />
          <el-option
            v-for="method in LESSON_OBSERVATION_REVIEW_METHODS"
            :key="method"
            :label="method"
            :value="method"
          />
        </el-select>
      </div>
      <div class="form-item">
        <span class="form-label">时间：</span>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          unlink-panels
        />
      </div>
    </PageFilterBar>

    <div class="page-body">
      <div class="toolbar">
        <h1 class="toolbar-title">跨校听评课</h1>
        <el-button type="primary" :icon="Plus">新增</el-button>
      </div>

      <div class="table-wrapper">
        <el-table v-loading="loading" :data="tableData" stripe border height="100%">
          <el-table-column label="序号" width="72" align="center">
            <template #default="{ $index }">
              {{ formatObservationIndex((currentPage - 1) * pageSize + $index + 1) }}
            </template>
          </el-table-column>
          <el-table-column label="课程名称" min-width="160" show-overflow-tooltip>
            <template #default="{ row }: { row: LessonObservationRow }">
              <button type="button" class="action-link" @click="handleViewDetail(row)">
                {{ row.courseName }}
              </button>
            </template>
          </el-table-column>
          <el-table-column prop="instructorName" label="授课老师" width="100" show-overflow-tooltip />
          <el-table-column prop="schoolName" label="授课学校" width="120" show-overflow-tooltip />
          <el-table-column label="授课时间" width="170" show-overflow-tooltip>
            <template #default="{ row }: { row: LessonObservationRow }">
              {{ formatObservationSchedule(row.lessonDate, row.period) }}
            </template>
          </el-table-column>
          <el-table-column prop="gradeSubject" label="年级/学科" width="120" show-overflow-tooltip />
          <el-table-column label="评课人" min-width="180" show-overflow-tooltip>
            <template #default="{ row }: { row: LessonObservationRow }">
              {{ formatReviewerNames(row.reviewerNames) }}
            </template>
          </el-table-column>
          <el-table-column prop="reviewMethod" label="评课方式" width="110" show-overflow-tooltip />
          <el-table-column
            prop="assessmentTemplate"
            label="评课表"
            min-width="140"
            show-overflow-tooltip
          />
          <el-table-column label="评分" width="80" align="center">
            <template #default="{ row }: { row: LessonObservationRow }">
              {{ formatObservationScore(row.score) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="88">
            <template #default="{ row }: { row: LessonObservationRow }">
              <button type="button" class="action-link" @click="handleViewDetail(row)">详情</button>
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
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { Plus, Search } from "@element-plus/icons-vue";
import PageFilterBar from "@/components/PageFilterBar.vue";
import {
  formatObservationIndex,
  formatObservationSchedule,
  formatObservationScore,
  formatReviewerNames,
  LESSON_OBSERVATION_REVIEW_METHODS,
  type LessonObservationRow,
} from "@/features/lesson-observation/types";
import { useLessonObservationStore } from "@/stores/lesson-observation";

defineOptions({ name: "LessonObservationView" });

const router = useRouter();
const observationStore = useLessonObservationStore();
const {
  loading,
  tableData,
  allianceOptions,
  schoolOptions,
  filterForm,
  currentPage,
  pageSize,
  total,
} = storeToRefs(observationStore);

const dateRange = computed({
  get: () => {
    const { startDate, endDate } = filterForm.value;
    return startDate && endDate ? ([startDate, endDate] as [string, string]) : null;
  },
  set: (value: [string, string] | null) => {
    filterForm.value.startDate = value?.[0] ?? "";
    filterForm.value.endDate = value?.[1] ?? "";
  },
});

onMounted(() => {
  void observationStore.loadOptions();
  void observationStore.loadList();
});

function handleSearch() {
  void observationStore.search();
}

function handleReset() {
  void observationStore.resetFilter();
}

function handleSizeChange(size: number) {
  void observationStore.setPageSize(size);
}

function handlePageChange(page: number) {
  void observationStore.setPage(page);
}

function handleViewDetail(row: LessonObservationRow) {
  void router.push(
    `/bureau/ai-teacher-development/cross-school-research/lesson-observation/${row.id}`,
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
.form-item :deep(.el-input),
.form-item :deep(.el-date-editor) {
  flex: 1;
  min-width: 0;
  --el-input-height: 32px;
}

.form-item :deep(.el-date-editor.el-input),
.form-item :deep(.el-date-editor.el-input__wrapper) {
  width: auto;
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

.table-wrapper {
  flex: 1;
  overflow: hidden;
}

.action-link {
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: var(--font-size-md);
  color: var(--color-primary);
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
}

.action-link:hover {
  color: var(--color-primary-hover);
}

.action-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}
</style>
