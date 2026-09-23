<template>
  <section class="summary-card">
    <div class="title-row">
      <h1 class="summary-title">{{ detail.title }}</h1>
      <StatusTag :color="TRAINING_ACHIEVEMENT_STATUS_MAP[detail.status].tagColor">
        {{ TRAINING_ACHIEVEMENT_STATUS_MAP[detail.status].label }}
      </StatusTag>
    </div>
    <p class="summary-meta">成果编号：{{ detail.code }}</p>

    <div class="field-grid">
      <div class="field-item">
        <span class="field-label">提交教师</span>
        <span class="field-value">
          {{ detail.teacherName }} · {{ detail.schoolName }} · {{ detail.subject }}
        </span>
      </div>
      <div class="field-item">
        <span class="field-label">研修类型</span>
        <span class="field-value">{{ TRAINING_ACHIEVEMENT_TYPE_MAP[detail.type].label }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">等级 / 申报分值</span>
        <span class="field-value">
          {{ detail.levelLabel }} ·
          <span class="score-text">{{ detail.declaredScore }}分</span>
        </span>
      </div>
      <div class="field-item">
        <span class="field-label">所属学科</span>
        <span class="field-value">{{ detail.subject }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">所属学段</span>
        <span class="field-value">{{ detail.stage }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">提交时间</span>
        <span class="field-value">{{ detail.submittedAt }}</span>
      </div>
    </div>

    <div class="block-item">
      <span class="field-label">摘要</span>
      <p class="summary-desc">{{ detail.abstract }}</p>
    </div>

    <div class="block-item">
      <span class="field-label">附件材料</span>
      <ul v-if="detail.attachments.length" class="attachment-list">
        <li v-for="file in detail.attachments" :key="file.id" class="attachment-item">
          <div class="file-icon" aria-hidden="true">
            <el-icon><Document /></el-icon>
          </div>
          <div class="file-meta">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ file.sizeLabel }}</span>
          </div>
          <span class="action-link" @click="emit('download', file.name)">下载查看</span>
        </li>
      </ul>
      <p v-else class="field-value">暂无附件</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Document } from "@element-plus/icons-vue";
import StatusTag from "@/components/StatusTag.vue";
import {
  TRAINING_ACHIEVEMENT_STATUS_MAP,
  TRAINING_ACHIEVEMENT_TYPE_MAP,
  type TrainingAchievementDetail,
} from "@/features/training-achievement/types";

defineOptions({ name: "AchievementDetailSummaryCard" });

defineProps<{
  /** 成果详情 */
  detail: TrainingAchievementDetail;
}>();

const emit = defineEmits<{
  download: [name: string];
}>();
</script>

<style scoped>
.block-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  min-width: 0;
}

.summary-meta {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-secondary);
  line-height: var(--line-height-md);
}

.score-text {
  color: var(--color-success-dark-text);
  font-weight: var(--font-weight-semibold);
}

.attachment-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-12);
  padding: var(--spacing-12) var(--spacing-16);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
}

.file-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  color: var(--color-primary);
  flex-shrink: 0;
}

.file-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-size: var(--font-size-md);
  color: var(--color-title);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: var(--font-size-sm);
  color: var(--color-secondary);
}

.action-link {
  color: var(--color-primary);
  cursor: pointer;
  font-size: var(--font-size-md);
  flex-shrink: 0;
}

.action-link:hover {
  color: var(--color-primary-hover);
}
</style>

<style scoped src="./achievement-detail-view.css"></style>
