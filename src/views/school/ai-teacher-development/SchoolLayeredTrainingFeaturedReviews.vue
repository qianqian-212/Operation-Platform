<template>
  <section class="fd-reviews fd-card">
    <h2 class="fd-review-title">教师评价 ({{ total }})</h2>
    <div class="fd-review-top">
      <div class="fd-score-block">
        <p class="fd-score-number">{{ summary.reviewScore }}</p>
        <div class="fd-stars">
          <el-rate :model-value="summaryStars" disabled />
        </div>
        <p class="fd-review-meta">{{ total }}人评价</p>
      </div>
      <ul class="fd-bars">
        <li v-for="bar in summary.reviewBars" :key="bar.star" class="fd-bar-row">
          <span class="fd-bar-label">{{ bar.star }}星</span>
          <span class="fd-bar"><span class="fd-bar-fill" :style="{ width: `${bar.percent}%` }" /></span>
          <span class="fd-bar-label">{{ bar.percent }}%</span>
        </li>
      </ul>
    </div>
    <div class="fd-sorts">
      <button
        v-for="item in REVIEW_SORTS"
        :key="item.id"
        type="button"
        class="fd-sort"
        :class="{ 'is-active': sort === item.id }"
        @click="sort = item.id"
      >
        {{ item.label }}
      </button>
    </div>
    <article v-for="review in visibleReviews" :key="review.id" class="fd-review">
      <span class="fd-avatar" :class="`is-${review.avatarTone}`">{{ review.avatarText }}</span>
      <div>
        <div class="fd-review-name-row">
          <p class="fd-review-meta">
            <span class="fd-review-name">{{ review.teacherName }}</span>
            <span class="fd-review-time">{{ review.timeLabel }}</span>
          </p>
          <div class="fd-stars">
            <el-rate :model-value="review.rating" disabled />
          </div>
        </div>
        <p class="fd-review-profile">{{ review.meta }}</p>
        <p class="fd-review-content">{{ review.content }}</p>
        <div class="fd-review-actions">
          <button type="button"><MessageSquare class="fd-action-icon" aria-hidden="true" />{{ review.comments }}</button>
          <button type="button"><Heart class="fd-action-icon" aria-hidden="true" />{{ review.likes }}</button>
        </div>
      </div>
    </article>
    <el-empty v-if="!visibleReviews.length" description="暂无评价" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Heart, MessageSquare } from "@lucide/vue";
import type { FeaturedDetailModel } from "@/features/school-layered-training-featured/featured-course-detail";
import type { FeaturedReview } from "@/features/school-layered-training-featured/types";

defineOptions({ name: "SchoolLayeredTrainingFeaturedReviews" });

type ReviewSort = "latest" | "high" | "low";

const REVIEW_SORTS: Array<{ id: ReviewSort; label: string }> = [
  { id: "latest", label: "最新评价" },
  { id: "high", label: "评分最高" },
  { id: "low", label: "评分最低" },
];

const props = defineProps<{
  /** 教师评价列表 */
  reviews: FeaturedReview[];
  /** 评价汇总 */
  summary: FeaturedDetailModel;
}>();

const sort = ref<ReviewSort>("latest");
const total = computed(() => props.summary.reviewTotal || props.reviews.length);
const summaryStars = computed(() => Math.floor(props.summary.reviewScore));
const visibleReviews = computed(() => sortedReviews(props.reviews, sort.value));

function sortedReviews(reviews: FeaturedReview[], mode: ReviewSort) {
  const list = reviews.map((item) => ({ ...item }));
  if (mode === "high") list.sort((left, right) => right.rating - left.rating);
  if (mode === "low") list.sort((left, right) => left.rating - right.rating);
  return list;
}
</script>
