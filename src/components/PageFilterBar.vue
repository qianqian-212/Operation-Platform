<template>
  <div class="page-filter-bar">
    <div class="filter-fields" :class="{ 'is-four-columns': fourColumns }">
      <slot />
      <div class="filter-actions">
        <slot name="actions">
          <el-button type="primary" :icon="Search" @click="emit('search')">搜索</el-button>
          <el-button v-if="showReset" @click="emit('reset')">重置</el-button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";

defineOptions({ name: "PageFilterBar" });

withDefaults(
  defineProps<{
    showReset?: boolean;
    fourColumns?: boolean;
  }>(),
  { showReset: false, fourColumns: false },
);

const emit = defineEmits<{
  search: [];
  reset: [];
}>();
</script>

<style scoped>
.page-filter-bar {
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-16) var(--spacing-24);
  flex-shrink: 0;
}

.filter-fields {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-16) var(--spacing-24);
  align-items: center;
}

.filter-fields.is-four-columns {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.filter-fields.is-four-columns :slotted(.form-item) {
  width: auto;
  min-width: 0;
}

.filter-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
</style>
