<script setup lang="ts">
import { CircleHelp } from "@lucide/vue";

export interface PortraitHintItem {
  label: string;
  value: string;
}

const props = withDefaults(defineProps<{
  label: string;
  title: string;
  items: readonly PortraitHintItem[];
  statusLabel?: string;
  statusType?: "success" | "warning" | "info";
}>(), {
  statusType: "success",
});
</script>

<template>
  <ElPopover placement="bottom-start" :width="460" trigger="hover" :show-after="120">
    <template #reference>
      <button
        type="button"
        class="portrait-hint-trigger"
        :aria-label="`${props.title}：${props.label}`"
      >
        <CircleHelp :size="15" />
        <span>{{ props.label }}</span>
      </button>
    </template>
    <div class="portrait-hint">
      <header>
        <strong>{{ props.title }}</strong>
        <ElTag v-if="props.statusLabel" :type="props.statusType" size="small" effect="light">
          {{ props.statusLabel }}
        </ElTag>
      </header>
      <dl>
        <div v-for="item in props.items" :key="item.label">
          <dt>{{ item.label }}</dt>
          <dd>{{ item.value }}</dd>
        </div>
      </dl>
    </div>
  </ElPopover>
</template>

<style scoped>
.portrait-hint-trigger {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: var(--spacing-4);
  padding: 0;
  border: 0;
  color: var(--color-primary);
  background: transparent;
  font: inherit;
  cursor: help;
}

.portrait-hint-trigger span {
  font-size: var(--font-size-xs);
}

.portrait-hint-trigger:focus-visible {
  outline: 2px solid var(--color-primary-line-light);
  outline-offset: 2px;
}

.portrait-hint {
  display: grid;
  gap: var(--spacing-12);
}

.portrait-hint header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-12);
}

.portrait-hint header strong {
  color: var(--color-title);
  font-size: var(--font-size-md);
}

.portrait-hint dl {
  display: grid;
  gap: var(--spacing-12);
}

.portrait-hint dl > div {
  display: grid;
  gap: var(--spacing-4);
}

.portrait-hint dt {
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
}

.portrait-hint dd {
  color: var(--color-body);
  font-size: var(--font-size-sm);
  line-height: 21px;
}
</style>
