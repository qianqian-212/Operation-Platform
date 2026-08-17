<template>
  <div class="accent-select" :class="{ 'is-compact': compact }" role="radiogroup" :aria-label="ariaLabel">
    <button
      type="button"
      role="radio"
      class="accent-swatch is-auto"
      :aria-checked="model === null"
      aria-label="自动"
      @click="model = null"
    />
    <button
      v-for="option in MENU_ICON_ACCENT_OPTIONS"
      :key="option.value"
      type="button"
      role="radio"
      class="accent-swatch"
      :class="`is-${option.value}`"
      :aria-checked="model === option.value"
      :aria-label="option.label"
      @click="model = option.value"
    />
  </div>
</template>

<script setup lang="ts">
import {
  MENU_ICON_ACCENT_OPTIONS,
  type MenuIconAccent,
} from "@/features/menu-config/menu-icon-accent";

defineOptions({ name: "MenuIconAccentSelect" });

withDefaults(
  defineProps<{
    /** 选择器无障碍标签 */
    ariaLabel?: string;
    /** 列表行内使用更小的色块 */
    compact?: boolean;
  }>(),
  { ariaLabel: "图标背景色", compact: false },
);

const model = defineModel<MenuIconAccent | null>({ required: true });
</script>

<style scoped>
.accent-select {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-8);
}

.accent-swatch {
  width: 28px;
  height: 28px;
  padding: 0;
  background: var(--menu-icon-accent-blue);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
}

.accent-swatch.is-auto {
  background:
    conic-gradient(
      var(--menu-icon-accent-blue) 0 72deg,
      var(--menu-icon-accent-red) 72deg 144deg,
      var(--menu-icon-accent-yellow) 144deg 216deg,
      var(--menu-icon-accent-cyan) 216deg 288deg,
      var(--menu-icon-accent-green) 288deg 360deg
    );
}

.accent-swatch.is-blue { background: var(--menu-icon-accent-blue); }
.accent-swatch.is-red { background: var(--menu-icon-accent-red); }
.accent-swatch.is-yellow { background: var(--menu-icon-accent-yellow); }
.accent-swatch.is-cyan { background: var(--menu-icon-accent-cyan); }
.accent-swatch.is-green { background: var(--menu-icon-accent-green); }

.accent-swatch[aria-checked="true"] {
  box-shadow: 0 0 0 2px var(--color-white), 0 0 0 4px var(--color-primary);
}

.accent-select.is-compact {
  flex-wrap: nowrap;
  gap: var(--spacing-4);
}

.accent-select.is-compact .accent-swatch {
  width: 20px;
  height: 20px;
}

.accent-select.is-compact .accent-swatch[aria-checked="true"] {
  box-shadow: 0 0 0 1px var(--color-white), 0 0 0 3px var(--color-primary);
}

.accent-swatch:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
