<template>
  <div class="summary-panel" aria-label="量化结果">
    <div class="summary-heading">
      <span class="summary-icon" aria-hidden="true">
        <el-icon :size="16"><Document /></el-icon>
      </span>
      <h3 class="summary-title">{{ summary.title }}</h3>
    </div>
    <div class="summary-copy">
      <p v-for="(paragraph, index) in summary.paragraphs" :key="index">{{ paragraph }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document } from "@element-plus/icons-vue";
import type { EffectEvaluationSummary } from "@/features/effect-evaluation/types";

defineOptions({ name: "EffectEvaluationSummary" });

defineProps<{
  /** 量化结果文案 */
  summary: EffectEvaluationSummary;
}>();
</script>

<style scoped>
.summary-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  padding: var(--spacing-16) var(--spacing-20);
  background: var(--color-primary-light);
  border-radius: var(--radius-lg);
}

.summary-heading {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
}

.summary-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.summary-title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  line-height: var(--line-height-md);
}

.summary-copy {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  min-width: 0;
}

.summary-copy p {
  margin: 0;
  color: var(--color-title);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
}
</style>
