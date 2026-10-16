<template>
  <el-table :data="schools" border>
    <el-table-column label="序号" width="72" align="center">
      <template #default="{ $index }">{{ $index + 1 }}</template>
    </el-table-column>
    <el-table-column prop="name" label="学校" min-width="140" />
    <el-table-column prop="teacherCount" label="教师总数" width="110" align="center" />
    <el-table-column prop="participantCount" label="已参与" width="100" align="center" />
    <el-table-column label="参与率" min-width="160">
      <template #default="{ row }: { row: LayeredTrainingOverviewSchool }">
        <div class="rate-cell">
          <LayeredTrainingOverviewRateTrack
            :percent="row.participationRate"
            :tone="row.participationTone"
            label="参与率"
          />
          <span>{{ row.participationRate }}%</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="完成率" min-width="160">
      <template #default="{ row }: { row: LayeredTrainingOverviewSchool }">
        <div class="rate-cell">
          <LayeredTrainingOverviewRateTrack
            :percent="row.completionRate"
            :tone="row.completionTone"
            label="完成率"
          />
          <span>{{ row.completionRate }}%</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="达标率" min-width="160">
      <template #default="{ row }: { row: LayeredTrainingOverviewSchool }">
        <div class="rate-cell">
          <LayeredTrainingOverviewRateTrack
            :percent="row.reachRate"
            :tone="row.reachTone"
            label="达标率"
          />
          <span>{{ row.reachRate }}%</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="88" align="center">
      <template #default>
        <span class="action-link">详情</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import type { LayeredTrainingOverviewSchool } from "@/features/layered-training-overview/types";
import LayeredTrainingOverviewRateTrack from "@/views/bureau/ai-teacher-development/LayeredTrainingOverviewRateTrack.vue";

defineOptions({ name: "LayeredTrainingOverviewSchools" });

defineProps<{
  /** 当前筛选和排序后的学校 */
  schools: LayeredTrainingOverviewSchool[];
}>();

</script>

<style scoped>
.rate-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
}

.rate-cell :deep(.rate-track) {
  flex: 1;
  min-width: 72px;
}

.rate-cell span {
  flex-shrink: 0;
  min-width: 40px;
  color: var(--color-title);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-xs);
}

.action-link {
  color: var(--color-primary);
  font-size: var(--font-size-md);
}
</style>
