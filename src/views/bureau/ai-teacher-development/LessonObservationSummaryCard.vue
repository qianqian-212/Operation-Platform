<template>
  <section class="summary-card">
    <div class="summary-main">
      <h1 class="summary-title">{{ detail.courseName }}</h1>
      <div class="field-grid">
        <div class="field-item">
          <span class="field-label">授课老师</span>
          <span class="field-value">
            {{ formatInstructorSchool(detail.instructorName, detail.schoolName) }}
          </span>
        </div>
        <div class="field-item">
          <span class="field-label">年级/学科</span>
          <span class="field-value">{{ detail.gradeSubject }}</span>
        </div>
        <div class="field-item">
          <span class="field-label">授课时间</span>
          <span class="field-value">
            {{ formatObservationSchedule(detail.lessonDate, detail.period) }}
          </span>
        </div>
        <div class="field-item">
          <span class="field-label">所属联盟</span>
          <span class="field-value">{{ detail.allianceName }}</span>
        </div>
        <div class="field-item">
          <span class="field-label">评课模板</span>
          <span class="field-value">{{ detail.assessmentTemplate }}</span>
        </div>
        <div class="field-item">
          <span class="field-label">评课人</span>
          <span class="field-value">{{ formatReviewerNames(detail.reviewerNames) }}</span>
        </div>
      </div>
    </div>
    <aside class="score-panel" aria-label="评课得分">
      <div class="score-value">
        <span class="score-number">{{ formatObservationScore(detail.score) }}</span>
        <span class="score-unit">分</span>
      </div>
      <div class="score-meta">
        <span class="score-chip">总分{{ detail.totalScore }}分</span>
        <span class="score-chip">{{ detail.reviewedCount }}人已评</span>
      </div>
    </aside>
  </section>
</template>

<script setup lang="ts">
import {
  formatInstructorSchool,
  formatObservationSchedule,
  formatObservationScore,
  formatReviewerNames,
  type LessonObservationDetail,
} from "@/features/lesson-observation/types";

defineOptions({ name: "LessonObservationSummaryCard" });

defineProps<{
  /** 听评课详情 */
  detail: LessonObservationDetail;
}>();
</script>

<style scoped src="./lesson-observation-detail.css"></style>
