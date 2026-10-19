<template>
  <div v-loading="loading" class="page-with-breadcrumb">
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: listPath }">精品课程</el-breadcrumb-item>
        <el-breadcrumb-item>课程详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div v-if="model" class="fd-body">
      <header class="fd-head fd-card">
        <div>
          <h1 class="fd-title">{{ model.title }}</h1>
          <div class="fd-tags">
            <span v-for="tag in model.tags" :key="tag.label" class="fd-tag" :class="`is-${tag.tone}`">
              {{ tag.label }}
            </span>
          </div>
          <p class="fd-meta">
            <span class="fd-meta-item"><Star class="fd-meta-icon" aria-hidden="true" />{{ model.score }}分</span>
            <span class="fd-meta-item">
              <Users class="fd-meta-icon is-muted" aria-hidden="true" />{{ model.studyCount }}人学习
            </span>
          </p>
        </div>
        <p class="fd-progress">
          <strong>{{ progressPercent }}%</strong>
          <span class="fd-progress-label">学习进度</span>
          <span class="fd-progress-bar">
            <span class="fd-progress-fill" :style="{ width: `${progressPercent}%` }" />
          </span>
        </p>
      </header>
      <div class="fd-stack">
        <SchoolLayeredTrainingFeaturedPlayer :detail="model" />
        <p v-if="model.peakHint" class="fd-peak">{{ model.peakHint }}</p>
        <SchoolLayeredTrainingFeaturedRatePanel />
        <SchoolLayeredTrainingFeaturedReviews :reviews="reviews" :summary="model" />
      </div>
      <SchoolLayeredTrainingFeaturedAside :detail="model" />
    </div>
    <el-empty v-else-if="!loading" description="课程不存在" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { Star, Users } from "@lucide/vue";
import { presentFeaturedDetail } from "@/features/school-layered-training-featured/featured-course-detail";
import { useSchoolFeaturedCourseStore } from "@/stores/school-layered-training-featured";
import SchoolLayeredTrainingFeaturedAside from "@/views/school/ai-teacher-development/SchoolLayeredTrainingFeaturedAside.vue";
import SchoolLayeredTrainingFeaturedPlayer from "@/views/school/ai-teacher-development/SchoolLayeredTrainingFeaturedPlayer.vue";
import SchoolLayeredTrainingFeaturedRatePanel from "@/views/school/ai-teacher-development/SchoolLayeredTrainingFeaturedRatePanel.vue";
import SchoolLayeredTrainingFeaturedReviews from "@/views/school/ai-teacher-development/SchoolLayeredTrainingFeaturedReviews.vue";

defineOptions({ name: "SchoolLayeredTrainingFeaturedDetailView" });

const listPath = "/ai-teacher-development/layered-training/featured";
const route = useRoute();
const store = useSchoolFeaturedCourseStore();
const { loading, detail, reviews, learningProgress } = storeToRefs(store);
const courseId = computed(() => (typeof route.params.id === "string" ? route.params.id : ""));
const model = computed(() => (detail.value ? presentFeaturedDetail(detail.value) : null));
const progressPercent = computed(() => learningProgress.value?.progress ?? 0);

function load() {
  if (courseId.value) void store.loadDetail(courseId.value);
}

onMounted(load);

watch(() => route.params.id, load, { flush: "post" });
</script>

<style src="./school-layered-training-featured-detail.css"></style>
