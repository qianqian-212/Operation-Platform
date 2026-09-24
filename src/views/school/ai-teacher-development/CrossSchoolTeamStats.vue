<template>
  <section class="stats-row" aria-label="跨校团队统计">
    <article v-for="card in cards" :key="card.key" class="stat-card">
      <span class="stat-icon" :class="`is-${card.key}`" aria-hidden="true">
        <img class="stat-glyph" :src="card.icon" alt="" />
      </span>
      <div class="stat-copy">
        <p class="stat-label">{{ card.label }}</p>
        <p class="stat-value">
          <strong>{{ card.value }}</strong>
          <span>个</span>
        </p>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import bookOpenIcon from "@/assets/teaching-research-alliance/book-open.png";
import peoplesIcon from "@/assets/teaching-research-alliance/peoples.png";
import schoolIcon from "@/assets/teaching-research-alliance/school.png";
import topicDiscussionIcon from "@/assets/teaching-research-alliance/topic-discussion.png";
import type { CrossSchoolTeamStats } from "@/features/cross-school-team/types";

defineOptions({ name: "CrossSchoolTeamStats" });

const props = defineProps<{
  /** 跨校团队概览统计 */
  stats: CrossSchoolTeamStats;
}>();

const cards = computed(() => [
  {
    key: "activities" as const,
    label: "跨校活动",
    value: props.stats.activityCount,
    icon: topicDiscussionIcon,
  },
  {
    key: "teams" as const,
    label: "教研团队",
    value: props.stats.teamCount,
    icon: peoplesIcon,
  },
  {
    key: "teachers" as const,
    label: "参与教师",
    value: props.stats.teacherCount,
    icon: schoolIcon,
  },
  {
    key: "achievements" as const,
    label: "教研成果",
    value: props.stats.achievementCount,
    icon: bookOpenIcon,
  },
]);
</script>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--spacing-12);
  flex-shrink: 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-16);
  min-height: 88px;
  padding: var(--spacing-20) var(--spacing-24);
  background: var(--color-white);
  border-radius: var(--radius-lg);
}

.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.stat-icon.is-activities {
  background: var(--color-success-light);
}

.stat-icon.is-teams {
  background: var(--color-primary-light);
}

.stat-icon.is-teachers {
  background: color-mix(in srgb, var(--color-chart-lilac) 12%, var(--color-white));
}

.stat-icon.is-achievements {
  background: var(--color-warning-light);
}

.stat-glyph {
  width: 20px;
  height: 20px;
  display: block;
}

.stat-copy {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  min-width: 0;
}

.stat-label {
  margin: 0;
  font-size: var(--font-size-md);
  color: var(--color-body);
  line-height: var(--line-height-md);
}

.stat-value {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-4);
  margin: 0;
  color: var(--color-title);
}

.stat-value strong {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: 32px;
}

.stat-value span {
  font-size: var(--font-size-sm);
  color: var(--color-secondary);
}

@media (max-width: 1100px) {
  .stats-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
