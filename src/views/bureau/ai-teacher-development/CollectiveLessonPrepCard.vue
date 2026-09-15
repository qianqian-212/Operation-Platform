<template>
  <article class="prep-card">
    <div class="card-main">
      <div class="title-row">
        <h2 class="card-title">{{ item.title }}</h2>
        <span class="status-pill" :class="`is-${item.status}`">
          {{ COLLECTIVE_LESSON_PREP_STATUS_MAP[item.status].label }}
        </span>
      </div>
      <ul class="meta-row">
        <li>
          <CollectiveLessonPrepMetaIcon name="people" />
          <span>{{ item.allianceName }}</span>
        </li>
        <li>
          <CollectiveLessonPrepMetaIcon name="people" />
          <span>参与教师：{{ item.participantCount }}人</span>
        </li>
        <li>
          <CollectiveLessonPrepMetaIcon name="lead" />
          <span>主备人：{{ item.leadTeacherName }}（{{ item.leadSchoolName }}）</span>
        </li>
      </ul>
      <div class="meta-stack">
        <p class="meta-line">
          <CollectiveLessonPrepMetaIcon name="chapter" />
          <span>章节：{{ item.chapterLabel }}</span>
        </p>
        <p class="meta-line">
          <CollectiveLessonPrepMetaIcon name="activity" />
          <span>关联活动：</span>
          <RouterLink class="activity-link" :to="activityPath">{{ item.activityName }}</RouterLink>
        </p>
      </div>
    </div>
    <div class="card-footer">
      <div class="progress-block">
        <span v-if="isComplete" class="progress-complete">
          备课进度{{ item.progress }}%
          <el-icon aria-hidden="true"><CircleCheckFilled /></el-icon>
        </span>
        <template v-else>
          <span class="progress-label">备课进度</span>
          <div class="progress-track" aria-hidden="true">
            <div class="progress-fill" :style="{ width: `${item.progress}%` }" />
          </div>
          <span class="progress-value">{{ item.progress }}%</span>
        </template>
        <span v-if="item.date" class="progress-extra">{{ item.date }}</span>
        <span v-if="item.outputCount > 0" class="progress-extra">
          已产出{{ item.outputCount }}份成果
        </span>
      </div>
      <el-button type="primary">进入备课</el-button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { CircleCheckFilled } from "@element-plus/icons-vue";
import {
  COLLECTIVE_LESSON_PREP_STATUS_MAP,
  type CollectiveLessonPrepItem,
} from "@/features/collective-lesson-prep/types";
import CollectiveLessonPrepMetaIcon from "./CollectiveLessonPrepMetaIcon.vue";

defineOptions({ name: "CollectiveLessonPrepCard" });

const props = defineProps<{
  /** 备课卡片数据 */
  item: CollectiveLessonPrepItem;
}>();

const isComplete = computed(() => props.item.progress >= 100);

const activityPath = computed(
  () => `/bureau/ai-teacher-development/cross-school-research/activities/${props.item.activityId}`,
);
</script>

<style scoped>
.prep-card {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-white);
}

.card-main {
  padding: var(--spacing-20);
}

.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-12);
}

.card-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: var(--line-height-lg);
}

.status-pill {
  flex-shrink: 0;
  padding: 0 8px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  line-height: 22px;
}

.status-pill.is-ongoing {
  background: var(--color-warning-light);
  color: var(--color-warning-dark-text);
}

.status-pill.is-completed {
  background: var(--color-success-light);
  color: var(--color-success-dark-text);
}

.status-pill.is-pending {
  background: var(--color-bg-soft);
  color: var(--color-secondary);
}

.meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-16);
  margin: var(--spacing-8) 0 0;
  padding: 0;
  list-style: none;
  color: var(--color-body);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
}

.meta-stack {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  margin-top: var(--spacing-8);
}

.meta-row li,
.meta-line {
  display: flex;
  align-items: center;
  gap: var(--spacing-6);
  min-width: 0;
  margin: 0;
  color: var(--color-body);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
}

.activity-link {
  color: var(--color-primary);
  text-decoration: none;
}

.activity-link:hover {
  color: var(--color-primary-hover);
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  gap: var(--spacing-16);
  box-sizing: border-box;
  min-height: calc(32px + 2 * var(--spacing-12));
  padding: var(--spacing-12) var(--spacing-20);
  background: var(--color-bg-subtle);
}

.card-footer :deep(.el-button) {
  height: 32px;
  min-height: 32px;
  max-height: 32px;
  padding: 0 var(--spacing-16);
  margin: 0;
  line-height: 32px;
  flex-shrink: 0;
}

.progress-block {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-8);
  min-width: 0;
  color: var(--color-body);
  font-size: var(--font-size-sm);
}

.progress-label {
  color: var(--color-secondary);
}

.progress-complete {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-8);
  color: var(--color-body);
}

.progress-complete .el-icon {
  color: var(--color-success);
  font-size: 16px;
}

.progress-track {
  width: 120px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-bg-soft);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--color-primary);
}

.progress-value {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-4);
  color: var(--color-title);
  font-variant-numeric: tabular-nums;
}

.progress-extra {
  color: var(--color-secondary);
}

.progress-extra::before {
  content: "";
  display: inline-block;
  width: 1px;
  height: 10px;
  margin-inline-end: var(--spacing-8);
  background: var(--color-border-strong);
  vertical-align: middle;
}
</style>
