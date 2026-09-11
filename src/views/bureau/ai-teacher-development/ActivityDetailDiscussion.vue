<template>
  <section class="panel-card">
    <div class="panel-header">
      <h2 class="panel-title">讨论</h2>
    </div>
    <ul v-if="detail.discussions.length" class="discussion-list">
      <li v-for="item in detail.discussions" :key="item.id" class="discussion-item">
        <div class="overview-head">
          <h3 class="discussion-title">{{ item.title }}</h3>
          <StatusTag :color="DISCUSSION_STATUS_MAP[item.status].tagColor">
            {{ DISCUSSION_STATUS_MAP[item.status].label }}
          </StatusTag>
        </div>
        <p class="meta-line">
          <span>{{ item.initiatorName }} · {{ item.initiatorSchool }}</span>
          <span>{{ item.replyCount }} 条回复</span>
          <span>最近回复 {{ item.lastRepliedAt }}</span>
        </p>
      </li>
    </ul>
    <el-empty v-else description="暂无跨校讨论" />
  </section>

  <section class="panel-card">
    <div class="panel-header">
      <h2 class="panel-title">投票</h2>
    </div>
    <ul v-if="detail.votes.length" class="vote-list">
      <li v-for="vote in detail.votes" :key="vote.id" class="vote-item">
        <h3 class="vote-title">{{ vote.title }}</h3>
        <div v-for="option in vote.options" :key="option.id" class="vote-option">
          <span>{{ option.label }}</span>
          <span>{{ option.count }} 票</span>
        </div>
      </li>
    </ul>
    <el-empty v-else description="暂无投票" />
  </section>
</template>

<script setup lang="ts">
import StatusTag from "@/components/StatusTag.vue";
import {
  DISCUSSION_STATUS_MAP,
  type CrossSchoolActivityDetail,
} from "@/features/cross-school-activity/types";

defineOptions({ name: "ActivityDetailDiscussion" });

defineProps<{
  /** 活动详情 */
  detail: CrossSchoolActivityDetail;
}>();
</script>

<style scoped src="./activity-detail-view.css"></style>
