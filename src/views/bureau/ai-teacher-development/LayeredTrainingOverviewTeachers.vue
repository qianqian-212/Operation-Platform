<template>
  <div class="teachers">
    <el-table :data="teachers" border>
      <el-table-column prop="name" label="教师姓名" min-width="120" />
      <el-table-column prop="schoolName" label="学校" min-width="140" />
      <el-table-column prop="subject" label="学科" width="120" />
      <el-table-column prop="hoursLabel" label="已修学时" width="120" />
      <el-table-column prop="creditsLabel" label="已获学分" width="120" />
      <el-table-column label="完成率" min-width="180">
        <template #default="{ row }: { row: LayeredTrainingOverviewTeacher }">
          <div class="completion">
            <LayeredTrainingOverviewRateTrack
              :percent="row.completionRate"
              :tone="row.completionTone"
              label="完成率"
            />
            <span class="completion-value" :class="`is-${row.completionTone}`">
              {{ row.completionRate }}%
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template #default="{ row }: { row: LayeredTrainingOverviewTeacher }">
          <StatusTag :color="LAYERED_TRAINING_TEACHER_STATUS_MAP[row.status].tagColor">
            {{ LAYERED_TRAINING_TEACHER_STATUS_MAP[row.status].label }}
          </StatusTag>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="teacherTotal > 10" class="pagination-bar">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="teacherTotal"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="emit('update:page', $event)"
        @size-change="emit('update:pageSize', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import StatusTag from "@/components/StatusTag.vue";
import {
  LAYERED_TRAINING_TEACHER_STATUS_MAP,
  type LayeredTrainingOverviewTeacher,
} from "@/features/layered-training-overview/types";
import LayeredTrainingOverviewRateTrack from "@/views/bureau/ai-teacher-development/LayeredTrainingOverviewRateTrack.vue";

defineOptions({ name: "LayeredTrainingOverviewTeachers" });

defineProps<{
  /** 当前页教师记录 */
  teachers: LayeredTrainingOverviewTeacher[];
  /** 筛选后的教师总数 */
  teacherTotal: number;
  /** 当前页码 */
  currentPage: number;
  /** 每页条数 */
  pageSize: number;
}>();

const emit = defineEmits<{
  "update:page": [value: number];
  "update:pageSize": [value: number];
}>();
</script>

<style scoped>
.completion {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
}

.completion :deep(.rate-track) {
  flex: 1;
  min-width: 72px;
}

.completion-value {
  flex-shrink: 0;
  min-width: 40px;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-xs);
}

.completion-value.is-success {
  color: var(--color-success-dark-text);
}

.completion-value.is-warning {
  color: var(--color-warning-dark-text);
}

.completion-value.is-danger {
  color: var(--color-error);
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--spacing-16);
}
</style>
