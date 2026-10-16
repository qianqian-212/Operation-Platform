<template>
  <div class="standard-slider">
    <el-slider
      v-model="model"
      :min="min"
      :max="max"
      :step="1"
      :show-tooltip="false"
      :aria-label="label"
      :format-value-text="formatValue"
    />
    <div class="stepper">
      <button
        type="button"
        class="stepper-btn"
        :aria-label="`减少${label}`"
        :disabled="atMin"
        @click="stepBy(-1)"
      >
        −
      </button>
      <span class="stepper-value">{{ model }}{{ unit }}</span>
      <button
        type="button"
        class="stepper-btn"
        :aria-label="`增加${label}`"
        :disabled="atMax"
        @click="stepBy(1)"
      >
        +
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

defineOptions({ name: "SupervisionStandardSlider" });

const model = defineModel<number>({ required: true });

const props = defineProps<{
  /** 滑块最小值 */
  min: number;
  /** 滑块最大值 */
  max: number;
  /** 步进器中显示的单位 */
  unit: string;
  /** 字段名称，用于无障碍名称 */
  label: string;
}>();

const atMin = computed(() => model.value <= props.min);
const atMax = computed(() => model.value >= props.max);

function stepBy(delta: number) {
  const next = model.value + delta;
  if (next < props.min || next > props.max) return;
  model.value = next;
}

function formatValue(value: number) {
  return `${value}${props.unit}`;
}
</script>

<style scoped>
.standard-slider {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 9.25rem;
  align-items: center;
  gap: var(--spacing-16);
  min-width: 0;
}

@container (max-width: 22rem) {
  .standard-slider {
    grid-template-columns: minmax(0, 1fr);
  }
}

.standard-slider :deep(.el-slider) {
  --el-slider-height: 4px;
  --el-slider-button-size: 16px;
  --el-slider-button-wrapper-size: 32px;
  height: 32px;
}

.standard-slider :deep(.el-slider__button) {
  border: 2px solid var(--color-primary);
  background: var(--color-white);
}

.standard-slider :deep(.el-slider__button:focus-visible) {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.stepper {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr) 2rem;
  height: 32px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-white);
  overflow: hidden;
}

.stepper-btn {
  border: 0;
  background: transparent;
  color: var(--color-body);
  cursor: pointer;
  font-size: var(--font-size-lg);
  line-height: 1;
}

.stepper-btn:disabled {
  color: var(--color-placeholder);
  cursor: not-allowed;
}

.stepper-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.stepper-value {
  display: flex;
  align-items: center;
  justify-content: center;
  border-inline: 1px solid var(--color-border);
  font-size: var(--font-size-md);
  color: var(--color-title);
}
</style>
