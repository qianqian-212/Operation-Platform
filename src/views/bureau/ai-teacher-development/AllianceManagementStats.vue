<template>
  <section class="stats-row" aria-label="联盟统计">
    <article v-for="card in cards" :key="card.key" class="stat-card">
      <span class="stat-icon" :class="`is-${card.key}`" aria-hidden="true">
        <AllianceStatGlyph :name="card.key" />
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
import type { TeachingResearchAllianceStats } from "@/features/teaching-research-alliance/types";
import AllianceStatGlyph from "@/views/bureau/ai-teacher-development/AllianceStatGlyph.vue";

defineOptions({ name: "AllianceManagementStats" });

const props = defineProps<{
  /** 联盟概览统计 */
  stats: TeachingResearchAllianceStats;
}>();

const cards = computed(() => [
  { key: "alliances" as const, label: "教研联盟", value: props.stats.allianceCount },
  { key: "schools" as const, label: "参与学校", value: props.stats.schoolCount },
  { key: "activities" as const, label: "跨校活动", value: props.stats.activityCount },
  { key: "teachers" as const, label: "参与教师", value: props.stats.teacherCount },
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

.stat-icon.is-alliances {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.stat-icon.is-schools {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.stat-icon.is-activities {
  background: var(--color-success-light);
  color: var(--color-success-dark-text);
}

.stat-icon.is-teachers {
  background: var(--color-primary-light);
  color: var(--color-chart-lilac);
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
