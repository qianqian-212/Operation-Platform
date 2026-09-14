<template>
  <section class="stats-overview" :aria-labelledby="titleId">
    <h2 :id="titleId">{{ data.title }}</h2>
    <ul class="stats-items">
      <li v-for="item in data.items" :key="item.id">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <small :class="`trend-${item.trendTone}`">{{ item.trend }}</small>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { WorkbenchStatsData } from "@/features/workbench/types";

defineOptions({ name: "WorkbenchStatsOverview" });

withDefaults(defineProps<{
  data: WorkbenchStatsData;
  titleId?: string;
}>(), {
  titleId: "stats-overview-title",
});
</script>

<style scoped>
.stats-overview {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
}

.stats-overview h2 {
  margin: 0;
  color: var(--color-title);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-lg);
}

.stats-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: var(--spacing-16);
  padding: 0;
  margin: 0;
  list-style: none;
}

.stats-items li {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--spacing-4);
}

.stats-items span,
.stats-items small {
  color: var(--color-body);
  font-size: var(--font-size-sm);
}

.stats-items strong {
  color: var(--color-title);
  font-size: var(--font-size-2xl);
  font-variant-numeric: tabular-nums;
  font-weight: var(--font-weight-semibold);
  line-height: 1.2;
}

.stats-items .trend-up {
  color: color-mix(in srgb, var(--color-success-dark-text) 77%, black);
}
.stats-items .trend-down { color: var(--color-error-dark-text); }
.stats-items .trend-neutral { color: var(--color-body); }
</style>
