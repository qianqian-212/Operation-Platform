<template>
  <div class="discussion-list">
    <article v-for="item in discussions" :key="item.id" class="discussion-card">
      <div class="discussion-icon" aria-hidden="true">
        <el-icon><ChatDotRound /></el-icon>
      </div>
      <div class="discussion-main">
        <h3 class="discussion-title">{{ item.title }}</h3>
        <p class="discussion-meta">
          {{ item.allianceName }} · 发起人：{{ item.initiatorName }}（{{ item.initiatorSchool }}）
          · {{ item.replyCount }}回复 最后回复：{{ item.lastRepliedAt }}
        </p>
      </div>
      <StatusTag :color="DISCUSSION_STATUS_MAP[item.status].tagColor">
        {{ DISCUSSION_STATUS_MAP[item.status].label }}
      </StatusTag>
    </article>
    <el-empty v-if="discussions.length === 0" description="暂无讨论话题" :image-size="72" />
  </div>
</template>

<script setup lang="ts">
import { ChatDotRound } from "@element-plus/icons-vue";
import StatusTag from "@/components/StatusTag.vue";
import {
  DISCUSSION_STATUS_MAP,
  type AllianceSpaceDiscussion,
} from "@/features/teaching-research-alliance/types";

defineOptions({ name: "AllianceSpaceDiscussionList" });

defineProps<{
  /** 讨论区列表 */
  discussions: AllianceSpaceDiscussion[];
}>();
</script>

<style scoped>
.discussion-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
}

.discussion-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-12);
  padding: var(--spacing-16);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.discussion-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.discussion-main {
  min-width: 0;
  flex: 1;
}

.discussion-title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: var(--line-height-md);
}

.discussion-meta {
  margin: var(--spacing-4) 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-secondary);
  line-height: var(--line-height-md);
}
</style>
