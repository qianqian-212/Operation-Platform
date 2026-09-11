<template>
  <section class="panel-card">
    <div class="panel-header">
      <h2 class="panel-title">听评设置</h2>
    </div>
    <div v-if="detail.observation" class="field-grid">
      <div class="field-item">
        <span class="field-label">课程名称</span>
        <span class="field-value">{{ detail.observation.courseName }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">授课教师</span>
        <span class="field-value">{{ detail.observation.instructorName }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">授课时间</span>
        <span class="field-value">{{ detail.observation.scheduledAt }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">授课方式</span>
        <span class="field-value">{{ detail.observation.method }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">年级</span>
        <span class="field-value">{{ detail.observation.grade }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">学科</span>
        <span class="field-value">{{ detail.observation.subject }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">课程类型</span>
        <span class="field-value">{{ detail.observation.courseType }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">评课教师</span>
        <span class="field-value">{{ detail.observation.reviewerName }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">评课方式</span>
        <span class="field-value">{{ detail.observation.reviewMethod }}</span>
      </div>
    </div>
    <el-empty v-else description="暂未填写听评课设置" />
  </section>
</template>

<script setup lang="ts">
import type { CrossSchoolActivityDetail } from "@/features/cross-school-activity/types";

defineOptions({ name: "ActivityDetailObservation" });

defineProps<{
  /** 活动详情 */
  detail: CrossSchoolActivityDetail;
}>();
</script>

<style scoped src="./activity-detail-view.css"></style>
