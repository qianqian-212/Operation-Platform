<template>
  <div class="page-wrapper">
    <div class="page-body">
      <div class="section-head">
        <h2 class="section-title">通知流水记录</h2>
      </div>

      <PageFilterBar class="review-filter" show-reset @search="handleSearch" @reset="handleReset">
        <div class="form-item">
          <span class="form-label">学校：</span>
          <el-select v-model="filterForm.schoolName" placeholder="全部学校" clearable>
            <el-option v-for="school in schools" :key="school" :label="school" :value="school" />
          </el-select>
        </div>
        <div class="form-item">
          <span class="form-label">类型：</span>
          <el-select v-model="filterForm.noticeType" placeholder="全部类型" clearable>
            <el-option
              v-for="item in LAYERED_TRAINING_NOTICE_TYPE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </PageFilterBar>

      <div class="table-wrapper">
        <el-table v-loading="loading" :data="rows" border>
          <el-table-column prop="notifiedAt" label="通知时间" min-width="160" />
          <el-table-column prop="teacherName" label="教师" width="100" />
          <el-table-column prop="schoolName" label="学校" min-width="120" />
          <el-table-column prop="subject" label="学科" width="90" />
          <el-table-column label="通知类型" width="140">
            <template #default="{ row }: { row: LayeredTrainingNoticeRow }">
              <StatusTag :color="LAYERED_TRAINING_NOTICE_TYPE_MAP[row.noticeType].tagColor">
                {{ LAYERED_TRAINING_NOTICE_TYPE_MAP[row.noticeType].label }}
              </StatusTag>
            </template>
          </el-table-column>
          <el-table-column label="未更新天数" width="120">
            <template #default="{ row }: { row: LayeredTrainingNoticeRow }">
              {{ row.staleDays }}天
            </template>
          </el-table-column>
          <el-table-column label="复查结果" width="120">
            <template #default="{ row }: { row: LayeredTrainingNoticeRow }">
              <span :class="`result-${LAYERED_TRAINING_NOTICE_RESULT_MAP[row.result].tone}`">
                {{ LAYERED_TRAINING_NOTICE_RESULT_MAP[row.result].label }}
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
          @current-change="(page: number) => void noticeStore.setPage(page)"
          @size-change="(size: number) => void noticeStore.setPageSize(size)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import PageFilterBar from "@/components/PageFilterBar.vue";
import StatusTag from "@/components/StatusTag.vue";
import {
  LAYERED_TRAINING_NOTICE_RESULT_MAP,
  LAYERED_TRAINING_NOTICE_TYPE_MAP,
  LAYERED_TRAINING_NOTICE_TYPE_OPTIONS,
  type LayeredTrainingNoticeRow,
} from "@/features/layered-training-notice/types";
import { useLayeredTrainingNoticeStore } from "@/stores/layered-training-notice";

defineOptions({ name: "LayeredTrainingNoticeView" });

const noticeStore = useLayeredTrainingNoticeStore();
const { loading, rows, total, schools, filterForm, currentPage, pageSize } =
  storeToRefs(noticeStore);

onMounted(() => {
  void noticeStore.loadList();
});

function handleSearch() {
  void noticeStore.search();
}

function handleReset() {
  void noticeStore.resetFilter();
}
</script>

<style scoped src="./layered-training-list.css"></style>
