<template>
  <section class="panel-card">
    <div class="overview-head">
      <h2 class="panel-title is-accent">{{ detail.name }}</h2>
      <StatusTag :color="ACTIVITY_STATUS_MAP[detail.status].tagColor">
        {{ ACTIVITY_STATUS_MAP[detail.status].label }}
      </StatusTag>
    </div>
    <div class="field-grid">
      <div class="field-item">
        <span class="field-label">活动类型</span>
        <span class="field-value">{{ ACTIVITY_TYPE_MAP[detail.type].label }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">活动时间</span>
        <span class="field-value">{{ detail.scheduledAt }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">活动地点</span>
        <span class="field-value">{{ detail.location || "待补充" }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">牵头学校</span>
        <span class="field-value">{{ detail.leadSchoolName }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">发起人</span>
        <span class="field-value">{{ detail.initiatorName }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">所属联盟</span>
        <span class="field-value">{{ detail.allianceName }}</span>
      </div>
    </div>
  </section>

  <section class="panel-card">
    <div class="panel-header">
      <el-icon :size="18"><Document /></el-icon>
      <h2 class="panel-title">活动描述</h2>
    </div>
    <p class="panel-text">{{ detail.description || "暂无活动说明" }}</p>
  </section>

  <section class="panel-card">
    <div class="panel-header">
      <el-icon :size="18"><User /></el-icon>
      <h2 class="panel-title">参与教师（跨校）</h2>
    </div>
    <ul v-if="detail.participants.length" class="teacher-list">
      <li v-for="teacher in detail.participants" :key="teacher.id" class="teacher-chip">
        <span class="teacher-avatar" aria-hidden="true">{{ teacher.name.slice(0, 1) }}</span>
        <span class="teacher-meta">
          <span class="teacher-name">{{ teacher.name }}</span>
          <span class="teacher-school">{{ teacher.schoolName }}</span>
        </span>
      </li>
    </ul>
    <el-empty v-else description="暂无参与教师" />
  </section>
</template>

<script setup lang="ts">
import { Document, User } from "@element-plus/icons-vue";
import StatusTag from "@/components/StatusTag.vue";
import {
  ACTIVITY_STATUS_MAP,
  ACTIVITY_TYPE_MAP,
  type CrossSchoolActivityDetail,
} from "@/features/cross-school-activity/types";

defineOptions({ name: "ActivityDetailOverview" });

defineProps<{
  /** 活动详情 */
  detail: CrossSchoolActivityDetail;
}>();
</script>

<style scoped src="./activity-detail-view.css"></style>
