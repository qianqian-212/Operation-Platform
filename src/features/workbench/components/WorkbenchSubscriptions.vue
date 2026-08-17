<template>
  <WorkbenchItemCards
    :items="items"
    empty-text="暂无订阅栏目"
    aria-label="订阅列表"
  >
    <template #trailing="{ item }">
      <el-switch
        :model-value="isSubscribed(item.id)"
        :aria-label="`订阅${item.title}`"
        @change="(value: boolean) => toggle(item.id, value)"
      />
    </template>
  </WorkbenchItemCards>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import WorkbenchItemCards from "@/features/workbench/components/WorkbenchItemCards.vue";
import type { WorkbenchSubscriptionsData } from "@/features/workbench/types";

defineOptions({ name: "WorkbenchSubscriptions" });

const props = defineProps<{ data: WorkbenchSubscriptionsData }>();
const items = ref(props.data.items.map((item) => ({ ...item })));

function isSubscribed(id: string) {
  return items.value.find((item) => item.id === id)?.subscribed ?? false;
}

function toggle(id: string, subscribed: boolean) {
  const item = items.value.find((candidate) => candidate.id === id);
  if (!item) return;
  item.subscribed = subscribed;
  ElMessage.success(subscribed ? `已订阅“${item.title}”` : `已取消订阅“${item.title}”`);
}
</script>
