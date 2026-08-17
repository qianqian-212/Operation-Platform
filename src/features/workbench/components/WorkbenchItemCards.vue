<template>
  <div class="item-cards" :aria-label="ariaLabel">
    <div v-if="!items.length" class="item-cards-empty">
      <slot name="empty">
        <p>{{ emptyText }}</p>
      </slot>
    </div>
    <component
      :is="interactive ? 'button' : 'article'"
      v-for="item in items"
      :key="item.id"
      class="item-card workbench-surface-card"
      :class="{
        'is-interactive': interactive,
        'has-trailing': Boolean($slots.trailing),
        'is-unread': item.unread,
      }"
      :type="interactive ? 'button' : undefined"
      @click="interactive ? emit('select', item.id) : undefined"
    >
      <span v-if="item.unread" class="sr-only">未读</span>
      <div class="item-card-body">
        <span class="item-card-meta">
          <el-tag size="small" :type="workbenchTagType(item.tone)">
            {{ workbenchItemLabel(item) }}
          </el-tag>
          <small>{{ item.meta }}</small>
        </span>
        <strong>{{ item.title }}</strong>
      </div>
      <div v-if="$slots.trailing" class="item-card-trailing">
        <slot name="trailing" :item="item" />
      </div>
    </component>
  </div>
</template>

<script setup lang="ts">
import { workbenchItemLabel, workbenchTagType } from "@/features/workbench/workbench-tag";
import type { WorkbenchListItemData } from "@/features/workbench/types";

defineOptions({ name: "WorkbenchItemCards" });

withDefaults(
  defineProps<{
    /** 卡片展示的列表项。 */
    items: readonly (WorkbenchListItemData & { unread?: boolean })[];
    /** 空状态文案。 */
    emptyText?: string;
    /** 卡片区域无障碍名称。 */
    ariaLabel?: string;
    /** 是否作为可点击按钮渲染。 */
    interactive?: boolean;
  }>(),
  {
    emptyText: "暂无内容",
    interactive: false,
  },
);

defineSlots<{
  empty?: () => unknown;
  trailing?: (props: { item: WorkbenchListItemData & { unread?: boolean } }) => unknown;
}>();

const emit = defineEmits<{
  select: [id: string];
}>();
</script>

<style scoped>
.item-cards {
  display: flex;
  flex-wrap: wrap;
  align-content: start;
  gap: var(--spacing-12);
}

.item-cards-empty {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  gap: var(--spacing-4);
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
  text-align: center;
}

.item-cards-empty p {
  margin: 0;
}

.item-card {
  display: flex;
  min-width: min(100%, var(--workbench-item-card-min-width));
  flex: 1 1 var(--workbench-item-card-min-width);
  flex-direction: column;
  gap: var(--spacing-6);
  padding: var(--spacing-12) var(--spacing-16);
  color: inherit;
  font: inherit;
  text-align: start;
}

.item-card.has-trailing {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-12);
}

.item-card.is-interactive {
  cursor: pointer;
}

.item-card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.item-card.is-unread strong {
  font-weight: var(--font-weight-semibold);
}

.item-card-body {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-6);
}

.item-card-trailing {
  flex-shrink: 0;
}

.item-card-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
}

.item-card small {
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
}

.item-card strong {
  overflow: hidden;
  color: var(--color-title);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
</style>
