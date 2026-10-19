<template>
  <section class="fd-player">
    <div class="fd-player-stage">
      <button type="button" class="fd-play" aria-label="播放试看">
        <Play class="fd-play-icon" aria-hidden="true" />
      </button>
      <div class="fd-player-copy">
        <p class="fd-lesson">
          第{{ detail.lessonIndex }}讲：{{ detail.lessonTitle }}
          <span class="fd-preview">试看</span>
        </p>
        <p class="fd-lesson-sub">试看 · 选课后解锁全部 {{ detail.lessonTotal }} 讲</p>
      </div>
    </div>
    <div class="fd-timeline">
      <div class="fd-track-row">
        <div class="fd-track">
          <span class="fd-track-fill" :style="{ width: `${progress}%` }" />
          <span class="fd-knob" :style="{ left: `${progress}%` }" />
        </div>
        <div class="fd-chapter-pills">
          <span v-for="chapter in detail.chapters" :key="chapter.id" class="fd-chapter-pill">
            <Flame v-if="chapter.hot" class="fd-flame" aria-hidden="true" />
            {{ chapter.label }}
          </span>
        </div>
      </div>
      <div class="fd-player-foot">
        <span><span class="fd-played">{{ detail.playedLabel }}</span> / {{ detail.durationLabel }}</span>
        <span v-if="detail.peakCount" class="fd-peak-link">
          <Zap class="fd-peak-icon" aria-hidden="true" />
          {{ detail.peakCount }}处播放峰值 · 标记高频回看知识点
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Flame, Play, Zap } from "@lucide/vue";
import {
  playedPercent,
  type FeaturedDetailModel,
} from "@/features/school-layered-training-featured/featured-course-detail";

defineOptions({ name: "SchoolLayeredTrainingFeaturedPlayer" });

const props = defineProps<{
  /** 课程详情展示模型 */
  detail: FeaturedDetailModel;
}>();

const progress = computed(() => playedPercent(props.detail.playedLabel, props.detail.durationLabel));
</script>
