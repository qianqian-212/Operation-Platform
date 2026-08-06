<template>
  <div class="activity-rank">
    <div>
      <strong>{{ data.rank }}</strong>
      <span>当前排名</span>
    </div>
    <div class="activity-change" :class="{ 'is-down': isDown }">
      <span>{{ data.summary }}</span>
      <strong>
        <span class="change-direction">{{ isDown ? "下降" : "上升" }}</span>
        {{ Math.abs(data.change) }}
      </strong>
      <span class="change-glyph" aria-hidden="true">{{ isDown ? "↓" : "↑" }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { WorkbenchActivityRankData } from "@/features/workbench/types";

const props = defineProps<{ data: WorkbenchActivityRankData }>();
const isDown = computed(() => props.data.change < 0);
</script>

<style scoped>
.activity-rank {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  min-height: 80px;
  gap: var(--spacing-24);
  padding: var(--spacing-8) var(--spacing-24);
  color: var(--color-warning-dark-text);
  background: var(--color-warning-light);
  border-radius: var(--radius-lg);
}

.activity-rank > div {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-8);
}

.activity-rank > div:first-child {
  align-items: flex-start;
  flex-direction: column;
  gap: var(--spacing-2);
}

.activity-rank strong {
  color: var(--color-warning-dark-text);
  font-size: 30px;
  line-height: 36px;
}

.activity-rank span {
  font-size: var(--font-size-md);
}

.activity-change strong {
  display: inline-flex;
  align-items: baseline;
  gap: var(--spacing-4);
  font-size: 24px;
}

.change-direction {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-md);
}

.change-glyph {
  font-size: var(--font-size-lg);
  line-height: 1;
}

.activity-change.is-down {
  color: var(--color-error-dark-text);
}

.activity-change.is-down strong,
.activity-change.is-down .change-direction {
  color: var(--color-error-dark-text);
}
</style>
