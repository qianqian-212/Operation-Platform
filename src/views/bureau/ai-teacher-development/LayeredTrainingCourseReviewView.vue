<template>
  <div class="page-wrapper">
    <div class="page-body">
      <el-tabs class="review-tabs" :model-value="filterForm.statusTab" @tab-change="handleTabChange">
        <el-tab-pane
          v-for="tab in LAYERED_TRAINING_COURSE_STATUS_TABS"
          :key="tab"
          :label="`${LAYERED_TRAINING_COURSE_STATUS_MAP[tab].label} (${tabCounts[tab]})`"
          :name="tab"
        />
      </el-tabs>

      <PageFilterBar class="review-filter" show-reset @search="handleSearch" @reset="handleReset">
        <div class="form-item">
          <span class="form-label">学校：</span>
          <el-select v-model="filterForm.schoolName" placeholder="全部学校" clearable>
            <el-option v-for="school in schools" :key="school" :label="school" :value="school" />
          </el-select>
        </div>
        <div class="form-item">
          <span class="form-label">类型：</span>
          <el-select v-model="filterForm.kind" placeholder="全部类型" clearable>
            <el-option
              v-for="item in LAYERED_TRAINING_COURSE_KIND_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </PageFilterBar>

      <div class="table-wrapper">
        <el-table v-loading="loading" :data="rows" border>
          <el-table-column prop="title" label="课程名称" min-width="220" show-overflow-tooltip />
          <el-table-column label="类型" width="120">
            <template #default="{ row }: { row: LayeredTrainingCourseRow }">
              {{ LAYERED_TRAINING_COURSE_KIND_MAP[row.kind].label }}
            </template>
          </el-table-column>
          <el-table-column prop="lessonCountLabel" label="课时" width="90" />
          <el-table-column prop="subject" label="学科" width="90" />
          <el-table-column prop="schoolName" label="上传单位" min-width="120" />
          <el-table-column prop="uploaderName" label="上传人" width="100" />
          <el-table-column prop="uploadedAt" label="上传时间" width="130" />
          <el-table-column label="操作" width="88" fixed="right">
            <template #default="{ row }: { row: LayeredTrainingCourseRow }">
              <button
                v-if="row.status === 'pending'"
                type="button"
                class="action-link"
                @click="openDetail(row.id)"
              >
                审核
              </button>
              <button v-else type="button" class="action-link" @click="openDetail(row.id)">
                查看
              </button>
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
          @current-change="(page: number) => void reviewStore.setPage(page)"
          @size-change="(size: number) => void reviewStore.setPageSize(size)"
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
  LAYERED_TRAINING_COURSE_KIND_MAP,
  LAYERED_TRAINING_COURSE_KIND_OPTIONS,
  LAYERED_TRAINING_COURSE_STATUS_MAP,
  LAYERED_TRAINING_COURSE_STATUS_TABS,
  type LayeredTrainingCourseRow,
  type LayeredTrainingCourseStatus,
} from "@/features/layered-training-course-review/types";
import { useLayeredTrainingCourseReviewStore } from "@/stores/layered-training-course-review";

defineOptions({ name: "LayeredTrainingCourseReviewView" });

const listPath = "/bureau/ai-teacher-development/layered-training/course-review";

const router = useRouter();
const reviewStore = useLayeredTrainingCourseReviewStore();
const { loading, rows, total, tabCounts, schools, filterForm, currentPage, pageSize } =
  storeToRefs(reviewStore);

onMounted(() => {
  void reviewStore.loadList();
});

function handleSearch() {
  void reviewStore.search();
}

function handleReset() {
  void reviewStore.resetFilter();
}

function isCourseStatus(value: string): value is LayeredTrainingCourseStatus {
  return value === "pending" || value === "approved" || value === "rejected";
}

function handleTabChange(name: string | number) {
  const tab = String(name);
  if (!isCourseStatus(tab)) return;
  void reviewStore.setStatusTab(tab);
}

function openDetail(id: string) {
  void router.push(`${listPath}/${id}`);
}
</script>

<style scoped src="./layered-training-list.css"></style>

<style scoped>
.review-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.review-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: var(--color-border);
}
</style>
