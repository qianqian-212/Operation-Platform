<template>
  <section class="panel-card">
    <div class="panel-header">
      <h2 class="panel-title">任务分工</h2>
    </div>
    <el-table v-if="detail.tasks.length" :data="detail.tasks" stripe border>
      <el-table-column label="序号" width="72" align="center">
        <template #default="{ $index }">{{ $index + 1 }}</template>
      </el-table-column>
      <el-table-column prop="name" label="任务名称" min-width="160" show-overflow-tooltip />
      <el-table-column prop="ownerName" label="负责人" width="120" />
      <el-table-column prop="schoolName" label="所属学校" min-width="140" show-overflow-tooltip />
      <el-table-column prop="resourceLabel" label="资源" min-width="140" show-overflow-tooltip />
    </el-table>
    <el-empty v-else description="暂未设置任务分工" />
    <div v-if="detail.topic" class="field-grid">
      <div class="field-item">
        <span class="field-label">学段</span>
        <span class="field-value">{{ detail.topic.stage }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">学科 / 年级</span>
        <span class="field-value">{{ detail.topic.subject }} · {{ detail.topic.grade }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">课题</span>
        <span class="field-value">{{ detail.topic.title }}{{ periodText }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { CrossSchoolActivityDetail } from "@/features/cross-school-activity/types";

defineOptions({ name: "ActivityDetailTasks" });

const props = defineProps<{
  /** 活动详情 */
  detail: CrossSchoolActivityDetail;
}>();

const periodText = computed(() =>
  props.detail.topic?.period ? `（${props.detail.topic.period}）` : "",
);
</script>

<style scoped src="./activity-detail-view.css"></style>
