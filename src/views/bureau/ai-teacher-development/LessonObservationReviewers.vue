<template>
  <el-table :data="reviewers" stripe border>
    <el-table-column label="评课人" min-width="120" show-overflow-tooltip>
      <template #default="{ row }: { row: LessonObservationReviewer }">
        {{ row.name }}
      </template>
    </el-table-column>
    <el-table-column prop="schoolName" label="所属学校" min-width="120" show-overflow-tooltip />
    <el-table-column label="评分" width="88" align="center">
      <template #default="{ row }: { row: LessonObservationReviewer }">
        {{ formatObservationScore(row.score) }}
      </template>
    </el-table-column>
    <el-table-column label="评课时间" width="170" show-overflow-tooltip>
      <template #default="{ row }: { row: LessonObservationReviewer }">
        {{ row.reviewedAt || "-" }}
      </template>
    </el-table-column>
    <el-table-column label="评语" min-width="240" show-overflow-tooltip>
      <template #default="{ row }: { row: LessonObservationReviewer }">
        {{ row.comment || "暂无评语" }}
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import {
  formatObservationScore,
  type LessonObservationReviewer,
} from "@/features/lesson-observation/types";

defineOptions({ name: "LessonObservationReviewers" });

defineProps<{
  /** 评课人明细 */
  reviewers: LessonObservationReviewer[];
}>();
</script>
