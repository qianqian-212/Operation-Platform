<template>
  <div class="report-panel">
    <div class="meta-table" role="table" aria-label="课程评价摘要">
      <span class="meta-label" role="rowheader">授课老师</span>
      <span class="meta-value" role="cell">{{ detail.instructorName }}</span>
      <span class="meta-label" role="rowheader">课程主题</span>
      <span class="meta-value" role="cell">{{ detail.courseName }}</span>
      <span class="meta-label" role="rowheader">评课老师</span>
      <span class="meta-value" role="cell">{{ formatReviewerNames(detail.reviewerNames) }}</span>
      <span class="meta-label" role="rowheader">授课时间</span>
      <span class="meta-value" role="cell">{{ detail.lessonDate }}</span>
    </div>

    <el-table
      class="report-table"
      :data="detail.evaluations"
      :span-method="spanMethod"
      :summary-method="summaryMethod"
      show-summary
      border
    >
      <el-table-column prop="category" label="评价项目" width="140" />
      <el-table-column prop="standard" label="评价标准" min-width="360" />
      <el-table-column label="得分(总分/评价人数)" width="180" align="center">
        <template #default="{ row }: { row: LessonObservationEvaluationItem }">
          {{ row.score }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  evaluationCategorySpans,
  formatReviewerNames,
  type LessonObservationDetail,
  type LessonObservationEvaluationItem,
} from "@/features/lesson-observation/types";

defineOptions({ name: "LessonObservationReport" });

const props = defineProps<{
  /** 听评课详情 */
  detail: LessonObservationDetail;
}>();

const categorySpans = computed(() => evaluationCategorySpans(props.detail.evaluations));

function spanMethod(args: { rowIndex: number; columnIndex: number }) {
  if (args.columnIndex !== 0) return [1, 1];
  const span = categorySpans.value[args.rowIndex] ?? 0;
  return span > 0 ? [span, 1] : [0, 0];
}

function summaryMethod(param: { columns: readonly unknown[] }) {
  return param.columns.map((_, index) => {
    if (index === 0) return "总得分";
    if (index === param.columns.length - 1) return String(props.detail.score ?? 0);
    return "";
  });
}
</script>

<style scoped src="./lesson-observation-detail.css"></style>
