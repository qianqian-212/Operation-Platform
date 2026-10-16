<template>
  <div
    class="rate-track"
    role="meter"
    :aria-label="label"
    :aria-valuenow="clamped"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <div class="rate-fill" :class="`is-${tone}`" :style="{ width: `${clamped}%` }" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { LayeredTrainingBarTone } from "@/features/layered-training-overview/types";

defineOptions({ name: "LayeredTrainingOverviewRateTrack" });

const props = defineProps<{
  /** 当前百分比，0 到 100 */
  percent: number;
  /** 进度条颜色 */
  tone: LayeredTrainingBarTone;
  /** 读屏名称 */
  label: string;
}>();

const clamped = computed(() => Math.min(100, Math.max(0, props.percent)));
</script>

<style scoped>
.rate-track {
  height: 6px;
  overflow: hidden;
  border-radius: var(--radius-full);
  background: var(--color-bg-soft);
}

.rate-fill {
  height: 100%;
  border-radius: inherit;
}

.rate-fill.is-primary {
  background: var(--color-primary);
}

.rate-fill.is-success {
  background: var(--color-success);
}

.rate-fill.is-warning {
  background: var(--color-warning);
}

.rate-fill.is-danger {
  background: var(--color-error);
}
</style>
