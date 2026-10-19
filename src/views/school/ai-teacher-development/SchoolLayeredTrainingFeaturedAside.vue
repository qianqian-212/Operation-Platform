<template>
  <aside class="fd-aside fd-card">
    <section class="fd-aside-block">
      <h2 class="fd-section-title">课程信息</h2>
      <dl class="fd-info">
        <div v-for="row in rows" :key="row.label" class="fd-info-row">
          <dt>{{ row.label }}</dt>
          <dd>{{ row.value }}</dd>
        </div>
      </dl>
    </section>
    <section class="fd-aside-block">
      <h2 class="fd-section-title">课程简介</h2>
      <p class="fd-summary">{{ detail.summary }}</p>
    </section>
    <section class="fd-aside-block">
      <h2 class="fd-section-title">适合人群</h2>
      <div class="fd-audience">
        <span
          v-for="tag in detail.audienceTags"
          :key="tag.label"
          class="fd-audience-tag"
          :class="`is-${tag.tone}`"
        >
          {{ tag.label }}
        </span>
      </div>
    </section>
    <section class="fd-aside-block">
      <h2 class="fd-section-title">学习目标</h2>
      <ul class="fd-goals">
        <li v-for="goal in detail.goals" :key="goal">{{ goal }}</li>
      </ul>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  featuredDetailInfoRows,
  type FeaturedDetailModel,
} from "@/features/school-layered-training-featured/featured-course-detail";

defineOptions({ name: "SchoolLayeredTrainingFeaturedAside" });

const props = defineProps<{
  /** 课程详情展示模型 */
  detail: FeaturedDetailModel;
}>();

const rows = computed(() => featuredDetailInfoRows(props.detail));
</script>
