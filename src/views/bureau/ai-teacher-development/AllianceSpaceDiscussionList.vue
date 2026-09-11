<template>
  <div class="discussion-list">
    <article v-for="item in discussions" :key="item.id" class="discussion-card">
      <div class="discussion-main">
        <div class="discussion-title-row">
          <h3 class="discussion-title">{{ item.title }}</h3>
          <StatusTag :color="DISCUSSION_STATUS_MAP[item.status].tagColor">
            {{ DISCUSSION_STATUS_MAP[item.status].label }}
          </StatusTag>
        </div>
        <p class="discussion-meta">
          {{ item.allianceName }} · 发起人：{{ item.initiatorName }}（{{ item.initiatorSchool }}）
          · {{ item.replyCount }}回复 · 最后回复：{{ item.lastRepliedAt }}
        </p>
      </div>
    </article>
    <el-empty v-if="discussions.length === 0" description="暂无讨论话题" :image-size="72" />
  </div>
</template>

<script setup lang="ts">
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
  padding: var(--spacing-16);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.discussion-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-12);
}

.discussion-title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: var(--line-height-md);
}

.discussion-meta {
  margin: var(--spacing-8) 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-secondary);
  line-height: var(--line-height-md);
}
</style>
