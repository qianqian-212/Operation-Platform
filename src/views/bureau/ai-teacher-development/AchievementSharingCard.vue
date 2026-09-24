<template>
  <article class="share-card">
    <div class="card-main">
      <div class="title-row">
        <h2 class="card-title">{{ item.title }}</h2>
        <div class="tag-row">
          <span class="visibility-pill">{{ item.visibilityLabel }}</span>
          <span class="type-pill" :class="`is-${item.type}`">{{ typeMeta.label }}</span>
        </div>
      </div>
      <ul class="meta-row">
        <li>
          <el-icon aria-hidden="true"><OfficeBuilding /></el-icon>
          <span>{{ item.schoolName }}</span>
        </li>
        <li>
          <el-icon aria-hidden="true"><User /></el-icon>
          <span>{{ item.teacherName }}</span>
        </li>
        <li>
          <el-icon aria-hidden="true"><Clock /></el-icon>
          <span>{{ item.publishedAt }}</span>
        </li>
        <li>
          <el-icon aria-hidden="true"><Download /></el-icon>
          <span>下载次数：{{ item.downloadCount }}</span>
        </li>
      </ul>
      <p class="summary">{{ item.summary }}</p>
    </div>
    <div class="card-footer">
      <div class="footer-spacer" aria-hidden="true" />
      <div class="card-actions">
        <el-button link :icon="Download" @click="emit('download', item)">下载</el-button>
        <el-button type="primary" :icon="View" @click="emit('preview', item)">预览</el-button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Clock, Download, OfficeBuilding, User, View } from "@element-plus/icons-vue";
import {
  ACHIEVEMENT_SHARING_TYPE_MAP,
  type AchievementSharingItem,
} from "@/features/achievement-sharing/types";

defineOptions({ name: "AchievementSharingCard" });

const props = defineProps<{
  /** 成果卡片数据 */
  item: AchievementSharingItem;
}>();

const emit = defineEmits<{
  download: [item: AchievementSharingItem];
  preview: [item: AchievementSharingItem];
}>();

const typeMeta = computed(() => ACHIEVEMENT_SHARING_TYPE_MAP[props.item.type]);
</script>

<style scoped>
.share-card {
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

.tag-row {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-8);
  flex-shrink: 0;
}

.visibility-pill,
.type-pill {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  line-height: 22px;
}

.visibility-pill {
  background: var(--color-bg-soft);
  color: var(--color-secondary);
}

.type-pill.is-lesson-plan,
.type-pill.is-courseware {
  background: var(--color-warning-light);
  color: var(--color-warning-dark-text);
}

.type-pill.is-paper {
  background: var(--color-success-light);
  color: var(--color-success-dark-text);
}

.type-pill.is-case {
  background: var(--color-primary-light);
  color: var(--color-primary);
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

.meta-row li {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-6);
  min-width: 0;
}

.summary {
  margin: var(--spacing-8) 0 0;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
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

.footer-spacer {
  min-width: 0;
  flex: 1;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  flex-shrink: 0;
}

.card-footer :deep(.el-button) {
  height: 32px;
  min-height: 32px;
  max-height: 32px;
  margin: 0;
  line-height: 32px;
}

.card-footer :deep(.el-button--primary) {
  padding: 0 var(--spacing-16);
}
</style>
