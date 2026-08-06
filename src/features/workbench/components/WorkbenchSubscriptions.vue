<template>
  <el-empty
    v-if="!items.length"
    description="暂无订阅栏目"
    :image-size="52"
  />
  <ul v-else class="subscription-list" aria-label="订阅列表">
    <li v-for="item in items" :key="item.id">
      <div class="subscription-copy">
        <span class="subscription-meta">
          <el-tag v-if="item.label" size="small" effect="plain">{{ item.label }}</el-tag>
          <small>{{ item.meta }}</small>
        </span>
        <strong :title="item.title">{{ item.title }}</strong>
      </div>
      <el-switch
        v-model="item.subscribed"
        :aria-label="`订阅${item.title}`"
        @change="notifyChange(item.title, item.subscribed)"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import type { WorkbenchSubscriptionsData } from "@/features/workbench/types";

const props = defineProps<{ data: WorkbenchSubscriptionsData }>();
const items = ref(props.data.items.map((item) => ({ ...item })));

function notifyChange(title: string, subscribed: boolean) {
  ElMessage.success(subscribed ? `已订阅“${title}”` : `已取消订阅“${title}”`);
}
</script>

<style scoped>
.subscription-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.subscription-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
  gap: var(--spacing-12);
  padding-block: var(--spacing-4);
  border-bottom: 1px solid var(--color-border);
}

.subscription-list li:last-child {
  border-bottom: 0;
}

.subscription-copy,
.subscription-meta {
  display: flex;
  min-width: 0;
}

.subscription-copy {
  flex-direction: column;
  gap: var(--spacing-4);
}

.subscription-meta {
  align-items: center;
  gap: var(--spacing-8);
}

.subscription-list small {
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
}

.subscription-list strong {
  overflow: hidden;
  color: var(--color-body);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
