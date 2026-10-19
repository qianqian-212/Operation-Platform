<template>
  <div v-loading="loading" class="recommend">
    <section class="surface-card filter-card">
    <PageFilterBar class="recommend-filter" four-columns show-reset @search="handleSearch" @reset="handleReset">
      <div class="form-item">
        <span class="form-label">学期：</span>
        <el-select v-model="recommendQuery.semester" placeholder="请选择" clearable>
          <el-option v-for="item in FEATURED_SEMESTER_OPTIONS" :key="item" :label="item" :value="item" />
        </el-select>
      </div>
      <div class="form-item">
        <span class="form-label">教育局：</span>
        <el-select v-model="recommendQuery.bureau" placeholder="请选择" clearable>
          <el-option v-for="item in FEATURED_BUREAU_OPTIONS" :key="item" :label="item" :value="item" />
        </el-select>
      </div>
      <div class="form-item">
        <span class="form-label">学科：</span>
        <el-select v-model="recommendQuery.subject" placeholder="请选择" clearable>
          <el-option v-for="item in FEATURED_SUBJECT_OPTIONS" :key="item" :label="item" :value="item" />
        </el-select>
      </div>
      <div class="form-item">
        <span class="form-label">发展阶段：</span>
        <el-select v-model="recommendQuery.developmentStage" placeholder="请选择" clearable>
          <el-option v-for="item in FEATURED_DEVELOPMENT_OPTIONS" :key="item" :label="item" :value="item" />
        </el-select>
      </div>
      <div class="form-item">
        <span class="form-label">学段：</span>
        <el-select v-model="recommendQuery.stage" placeholder="请选择" clearable>
          <el-option v-for="item in FEATURED_STAGE_OPTIONS" :key="item" :label="item" :value="item" />
        </el-select>
      </div>
      <div class="form-item">
        <span class="form-label">学分范围：</span>
        <el-select v-model="recommendQuery.creditBand" placeholder="请选择" clearable>
          <el-option v-for="item in creditOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
    </PageFilterBar>
      <div v-if="recommendations.length" class="card-grid">
        <button
          v-for="card in recommendations"
          :key="card.id"
          type="button"
          class="course-card"
          @click="openCourse(card.id)"
        >
          <span class="card-cover" :class="toneClass(card.recommendTone)">
            <span class="card-badge">{{ card.recommendLabel }}</span>
            <FeaturedCourseCover :tone="card.recommendTone" />
          </span>
          <span class="card-body">
            <span class="card-title">{{ card.title }}</span>
            <span class="card-line">
              <el-icon><Clock /></el-icon>
              {{ featuredHoursText(card.hours) }} · {{ featuredCreditText(card.credit) }}
            </span>
            <span class="card-stats">
              <span class="card-line">
                <el-icon class="star-icon"><StarFilled /></el-icon>
                {{ card.rating }}
              </span>
              <span class="card-line">
                <el-icon><User /></el-icon>
                {{ card.learnerCount }}人学习
              </span>
            </span>
          </span>
        </button>
      </div>
      <el-empty v-else description="当前条件下暂无推荐课程" />
    </section>

    <div class="split">
      <section class="rank-panel">
        <div class="section-head">
          <h2 class="section-title">排行榜Top10</h2>
          <span class="section-hint">按评分均值排序</span>
        </div>
        <ol class="rank-list">
          <li v-for="(row, index) in ranking" :key="row.id">
            <button type="button" class="rank-item" :class="rankClass(index)" @click="openCourse(row.id)">
            <span class="rank-no">{{ index + 1 }}</span>
            <div class="rank-main">
              <div class="rank-title-row">
                <span class="rank-title">{{ row.title }}</span>
                <span class="rank-tag">
                  <StatusTag :color="row.eligible ? 'green' : 'gray'">{{ featuredEligibleLabel(row.eligible) }}</StatusTag>
                </span>
              </div>
              <p class="rank-meta">
                <span><el-icon><Clock /></el-icon>{{ featuredHoursText(row.hours) }} · {{ featuredCreditText(row.credit) }}</span>
                <span><el-icon><User /></el-icon>{{ row.learnerCount }}人学习</span>
                <span><el-icon><CircleCheck /></el-icon>完成率{{ row.completionRate }}%</span>
              </p>
            </div>
            <div class="rank-score">
              <strong>{{ row.rating }}</strong>
              <span>综合评分</span>
            </div>
            </button>
          </li>
        </ol>
      </section>
      <div class="side">
        <section class="side-panel">
          <h2 class="section-title">本月新增精品</h2>
          <ul class="fresh-list">
            <li v-for="item in fresh" :key="item.id">
              <button type="button" class="fresh-row" @click="openCourse(item.courseId)">
                <span class="fresh-mark"><el-icon><Reading /></el-icon></span>
                <span class="fresh-copy">
                  <strong>{{ item.title }}</strong>
                  <span class="fresh-meta">
                    <span><el-icon><Document /></el-icon>评分{{ item.ratingText }}</span>
                    <span><el-icon><User /></el-icon>{{ item.reviewText }}</span>
                    <span><el-icon><TrendCharts /></el-icon>{{ item.trendText }}</span>
                  </span>
                </span>
              </button>
            </li>
          </ul>
        </section>
        <section class="side-panel">
          <h2 class="section-title">学科分类导航</h2>
          <div class="subject-grid">
            <button
              v-for="item in FEATURED_SUBJECT_NAV"
              :key="item.subject"
              type="button"
              class="subject-chip"
              @click="openSubject(item.subject)"
            >
              {{ item.subject }} ({{ item.count }})
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { CircleCheck, Clock, Document, Reading, StarFilled, TrendCharts, User } from "@element-plus/icons-vue";
import PageFilterBar from "@/components/PageFilterBar.vue";
import StatusTag from "@/components/StatusTag.vue";
import {
  FEATURED_BUREAU_OPTIONS,
  FEATURED_CREDIT_OPTIONS,
  FEATURED_DEVELOPMENT_OPTIONS,
  FEATURED_SEMESTER_OPTIONS,
  FEATURED_STAGE_OPTIONS,
  FEATURED_SUBJECT_NAV,
  FEATURED_SUBJECT_OPTIONS,
  featuredCreditText,
  featuredEligibleLabel,
  featuredHoursText,
  type FeaturedCourse,
} from "@/features/school-layered-training-featured/types";
import { useSchoolFeaturedCourseStore } from "@/stores/school-layered-training-featured";
import FeaturedCourseCover from "./FeaturedCourseCover.vue";

defineOptions({ name: "SchoolLayeredTrainingFeaturedRecommend" });

const detailPath = "/ai-teacher-development/layered-training/featured";
const router = useRouter();
const store = useSchoolFeaturedCourseStore();
const { loading, recommendQuery, recommendations, ranking, fresh } = storeToRefs(store);
const creditOptions = FEATURED_CREDIT_OPTIONS.filter((item) => item.value);

function toneClass(tone: FeaturedCourse["recommendTone"]) {
  if (!tone) return "tone-violet";
  return `tone-${tone}`;
}

function rankClass(index: number) {
  if (index === 0) return "is-top is-first";
  if (index === 1) return "is-top is-second";
  if (index === 2) return "is-top is-third";
  return "";
}

function openCourse(id: string) {
  void router.push(`${detailPath}/${id}`);
}

function openSubject(subject: string) {
  void store.openSubject(subject);
}

function handleSearch() {
  void store.searchRecommend();
}

function handleReset() {
  void store.resetRecommend();
}
</script>

<style scoped src="./school-layered-training.css"></style>
<style scoped src="./featured-recommend.css"></style>
