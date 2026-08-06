<template>
  <div
    ref="viewportElement"
    class="secondary-tabs-viewport"
    :class="{ 'is-overflowing': isOverflowing }"
  >
    <div
      class="secondary-tabs"
      role="tablist"
      :aria-label="ariaLabel"
      @keydown="handleTablistKeydown"
    >
      <button
        v-for="(option, index) in options"
        :key="option.value"
        :ref="(element) => setTabRef(index, element)"
        class="secondary-tab"
        :class="{ 'is-active': model === option.value }"
        type="button"
        role="tab"
        :id="tabId(option.value)"
        :tabindex="model === option.value ? 0 : -1"
        :aria-selected="model === option.value"
        :aria-controls="panelId || undefined"
        :data-state="model === option.value ? 'active' : 'inactive'"
        @click="selectTab(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";

export interface WorkbenchSecondaryTabOption {
  label: string;
  value: string;
}

const props = withDefaults(defineProps<{
  options: readonly WorkbenchSecondaryTabOption[];
  ariaLabel?: string;
  panelId?: string;
}>(), {
  ariaLabel: "内容分类",
  panelId: undefined,
});

const model = defineModel<string>({ required: true });
const tabRefs = ref<Array<HTMLButtonElement | null>>([]);
const viewportElement = ref<HTMLElement | null>(null);
const isOverflowing = ref(false);
const instanceId = useId();
let resizeObserver: ResizeObserver | null = null;

function tabId(value: string) {
  return `${instanceId}-${value}`;
}

function setTabRef(index: number, element: unknown) {
  tabRefs.value[index] = element instanceof HTMLButtonElement ? element : null;
}

function selectTab(value: string) {
  model.value = value;
}

function updateOverflow() {
  const viewport = viewportElement.value;
  if (!viewport) {
    isOverflowing.value = false;
    return;
  }
  isOverflowing.value = viewport.scrollWidth > viewport.clientWidth + 1;
}

async function focusTabAt(index: number) {
  const option = props.options[index];
  if (!option) return;
  model.value = option.value;
  await nextTick();
  const tab = tabRefs.value[index];
  tab?.focus();
  tab?.scrollIntoView?.({ inline: "nearest", block: "nearest" });
  updateOverflow();
}

function handleTablistKeydown(event: KeyboardEvent) {
  if (!props.options.length) return;
  const currentIndex = Math.max(
    0,
    props.options.findIndex((option) => option.value === model.value),
  );
  const lastIndex = props.options.length - 1;

  switch (event.key) {
    case "ArrowRight":
    case "ArrowDown":
      event.preventDefault();
      void focusTabAt(currentIndex >= lastIndex ? 0 : currentIndex + 1);
      return;
    case "ArrowLeft":
    case "ArrowUp":
      event.preventDefault();
      void focusTabAt(currentIndex <= 0 ? lastIndex : currentIndex - 1);
      return;
    case "Home":
      event.preventDefault();
      void focusTabAt(0);
      return;
    case "End":
      event.preventDefault();
      void focusTabAt(lastIndex);
  }
}

onMounted(() => {
  updateOverflow();
  if (!viewportElement.value || typeof ResizeObserver === "undefined") return;
  resizeObserver = new ResizeObserver(() => updateOverflow());
  resizeObserver.observe(viewportElement.value);
});

watch(() => props.options, () => void nextTick(updateOverflow), { deep: true });

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
});
</script>

<style scoped>
.secondary-tabs-viewport {
  --secondary-tab-height: 32px;
  position: relative;
  height: calc(var(--secondary-tab-height) + var(--spacing-4));
  min-height: calc(var(--secondary-tab-height) + var(--spacing-4));
  flex: 0 0 calc(var(--secondary-tab-height) + var(--spacing-4));
  max-width: 100%;
  padding: var(--spacing-2);
  margin: calc(-1 * var(--spacing-2));
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
}

.secondary-tabs-viewport.is-overflowing {
  mask-image: linear-gradient(
    to right,
    #000 0,
    #000 calc(100% - 28px),
    transparent 100%
  );
}

.secondary-tabs {
  display: inline-flex;
  align-items: center;
  min-width: max-content;
  gap: var(--spacing-8);
  padding-inline-end: var(--spacing-24);
}

.secondary-tab {
  height: var(--secondary-tab-height);
  flex-shrink: 0;
  padding: var(--spacing-4) var(--spacing-16);
  color: var(--color-title);
  font: inherit;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-md);
  white-space: nowrap;
  background: var(--color-white);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: color 160ms ease, border-color 160ms ease, background-color 160ms ease;
}

.secondary-tab:hover {
  color: var(--color-primary);
  border-color: var(--color-primary-line-light);
  background: var(--color-bg-page);
}

.secondary-tab.is-active {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.secondary-tab:focus-visible {
  outline: 2px solid var(--color-primary-line-light);
  outline-offset: 2px;
  box-shadow: none;
}

@media (prefers-reduced-motion: reduce) {
  .secondary-tab {
    transition: none;
  }
}
</style>
