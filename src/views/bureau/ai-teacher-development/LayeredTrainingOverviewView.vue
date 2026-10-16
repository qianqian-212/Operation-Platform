<template>
  <div v-loading="loading" class="page-wrapper">
    <div class="semester-bar">
      <span class="form-label">学期：</span>
      <el-select :model-value="semester" class="semester-select" @change="handleSemester">
        <el-option
          v-for="item in LAYERED_TRAINING_OVERVIEW_SEMESTER_OPTIONS"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>

    <LayeredTrainingOverviewStats :summary="summary" />

    <section class="panel">
      <el-tabs v-model="activeTab" class="overview-tabs">
        <el-tab-pane label="学校维度" name="schools">
          <div class="school-toolbar">
            <PageFilterBar class="dimension-filter" show-reset @search="handleSchoolSearch" @reset="handleSchoolReset">
              <div class="form-item">
                <span class="form-label">学校：</span>
                <el-input v-model="schoolKeywordDraft" placeholder="请输入" clearable>
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>
            </PageFilterBar>
            <el-select :model-value="schoolSort" class="sort-select" @change="handleSchoolSort">
              <el-option
                v-for="item in LAYERED_TRAINING_SCHOOL_SORT_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <LayeredTrainingOverviewSchools v-if="schools.length > 0" :schools="schools" />
          <el-empty v-else-if="!loading" description="未找到匹配的学校" />
        </el-tab-pane>
        <el-tab-pane label="教师维度" name="teachers">
          <PageFilterBar class="dimension-filter" show-reset @search="handleTeacherSearch" @reset="handleTeacherReset">
            <div class="form-item">
              <span class="form-label">学校：</span>
              <el-select v-model="teacherSchoolDraft" placeholder="全部学校" clearable>
                <el-option v-for="school in schoolOptions" :key="school" :label="school" :value="school" />
              </el-select>
            </div>
            <div class="form-item">
              <span class="form-label">学科：</span>
              <el-select v-model="teacherSubjectDraft" placeholder="全部学科" clearable>
                <el-option v-for="subject in subjectOptions" :key="subject" :label="subject" :value="subject" />
              </el-select>
            </div>
          </PageFilterBar>
          <LayeredTrainingOverviewTeachers
            :teachers="teachers"
            :teacher-total="teacherTotal"
            :current-page="currentPage"
            :page-size="pageSize"
            @update:page="setPage"
            @update:page-size="setPageSize"
          />
        </el-tab-pane>
      </el-tabs>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { Search } from "@element-plus/icons-vue";
import PageFilterBar from "@/components/PageFilterBar.vue";
import {
  LAYERED_TRAINING_OVERVIEW_SEMESTER_OPTIONS,
  LAYERED_TRAINING_SCHOOL_SORT_OPTIONS,
  type LayeredTrainingSchoolSort,
} from "@/features/layered-training-overview/types";
import { useLayeredTrainingOverviewStore } from "@/stores/layered-training-overview";
import LayeredTrainingOverviewSchools from "@/views/bureau/ai-teacher-development/LayeredTrainingOverviewSchools.vue";
import LayeredTrainingOverviewStats from "@/views/bureau/ai-teacher-development/LayeredTrainingOverviewStats.vue";
import LayeredTrainingOverviewTeachers from "@/views/bureau/ai-teacher-development/LayeredTrainingOverviewTeachers.vue";

defineOptions({ name: "LayeredTrainingOverviewView" });

const activeTab = ref("schools");
const schoolKeywordDraft = ref("");
const teacherSchoolDraft = ref("");
const teacherSubjectDraft = ref("");
const overviewStore = useLayeredTrainingOverviewStore();
const {
  loading,
  semester,
  schoolSort,
  currentPage,
  pageSize,
  summary,
  schools,
  schoolOptions,
  subjectOptions,
  teachers,
  teacherTotal,
} = storeToRefs(overviewStore);
const { setSchoolKeyword, changeSemester, searchTeachers, setSchoolSort, setPage, setPageSize, load } = overviewStore;

function handleSemester(value: string | number | boolean) {
  if (typeof value !== "string") return;
  schoolKeywordDraft.value = "";
  teacherSchoolDraft.value = "";
  teacherSubjectDraft.value = "";
  void changeSemester(value);
}

function handleSchoolSearch() {
  void setSchoolKeyword(schoolKeywordDraft.value);
}

function handleSchoolReset() {
  schoolKeywordDraft.value = "";
  void setSchoolKeyword("");
}

function handleSchoolSort(value: string | number | boolean) {
  if (!isSchoolSort(value)) return;
  void setSchoolSort(value);
}

function isSchoolSort(value: string | number | boolean): value is LayeredTrainingSchoolSort {
  return LAYERED_TRAINING_SCHOOL_SORT_OPTIONS.some((item) => item.value === value);
}

function handleTeacherSearch() {
  void searchTeachers(teacherSchoolDraft.value, teacherSubjectDraft.value);
}

function handleTeacherReset() {
  teacherSchoolDraft.value = "";
  teacherSubjectDraft.value = "";
  void searchTeachers("", "");
}

onMounted(() => {
  void load();
});
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

.semester-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
}

.form-label {
  flex-shrink: 0;
  color: var(--color-title);
  font-size: var(--font-size-md);
  line-height: var(--line-height-md);
}

.semester-select {
  width: 220px;
}

.panel {
  padding: var(--spacing-16) var(--spacing-24) var(--spacing-24);
  background: var(--color-white);
  border-radius: var(--radius-lg);
}

.overview-tabs :deep(.el-tabs__header) {
  margin-bottom: var(--spacing-16);
}

.overview-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: var(--color-border);
}

.school-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-16);
  margin-bottom: var(--spacing-16);
}

.dimension-filter.page-filter-bar,
.panel :deep(.dimension-filter.page-filter-bar) {
  padding: 0 0 var(--spacing-16);
  border-bottom: 0;
}

.school-toolbar :deep(.dimension-filter.page-filter-bar) {
  flex: 1;
  min-width: 0;
  padding: 0;
}

.sort-select {
  width: 160px;
  flex-shrink: 0;
}

.form-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  height: 32px;
  min-width: 220px;
}

.form-item :deep(.el-input),
.form-item :deep(.el-select) {
  flex: 1;
  min-width: 0;
}

@media (max-width: 720px) {
  .school-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .form-item,
  .semester-select,
  .sort-select {
    width: 100%;
  }
}
</style>
