<template>
  <ul v-if="detail.tasks.length" class="task-list">
    <li v-for="item in detail.tasks" :key="item.id" class="task-card">
      <div class="task-main">
        <div class="task-title-row">
          <span class="task-kind" :class="item.kind === 'file' ? 'is-file' : 'is-text'">
            {{ ACTIVITY_TASK_KIND_MAP[item.kind] }}
          </span>
          <h3 class="task-name">{{ item.name }}</h3>
        </div>
        <p class="task-meta">负责人：{{ item.ownerName }}（{{ item.schoolName }}）</p>
        <p class="task-meta">最新提交：{{ latestText(item) }}</p>
      </div>
      <StatusTag :color="ACTIVITY_TASK_STATUS_MAP[item.status].tagColor">
        {{ ACTIVITY_TASK_STATUS_MAP[item.status].label }}
      </StatusTag>
    </li>
  </ul>
  <el-empty v-else description="暂未设置任务分工" />
</template>

<script setup lang="ts">
import StatusTag from "@/components/StatusTag.vue";
import {
  ACTIVITY_TASK_KIND_MAP,
  ACTIVITY_TASK_STATUS_MAP,
  type ActivityTask,
  type CrossSchoolActivityDetail,
} from "@/features/cross-school-activity/types";

defineOptions({ name: "ActivityDetailTasks" });

defineProps<{
  /** 活动详情 */
  detail: CrossSchoolActivityDetail;
}>();

function latestText(item: ActivityTask) {
  if (!item.latestFileName) return "暂无提交";
  return item.latestSubmittedAt
    ? `${item.latestFileName} ${item.latestSubmittedAt}`
    : item.latestFileName;
}
</script>

<style scoped src="./activity-detail-view.css"></style>
