<template>
  <div class="bureau-feed">
    <WorkbenchSecondaryTabs
      v-model="activeCategory"
      :options="categoryOptions"
      :panel-id="panelId"
      aria-label="内容分类"
    />

    <div :id="panelId" class="feed-panel" role="tabpanel" aria-label="公开信息列表">
      <WorkbenchItemCards
        :items="filteredItems"
        :empty-text="emptyDescription"
        interactive
        @select="openItemById"
      />
    </div>

    <el-drawer v-model="drawerVisible" title="内容详情" size="min(460px, 90vw)" append-to-body>
      <article v-if="selectedItem" class="feed-detail">
        <div class="feed-detail-meta">
          <el-tag v-if="selectedItem.label" size="small" :type="workbenchTagType(selectedItem.tone)">
            {{ selectedItem.label }}
          </el-tag>
          <span>{{ selectedItem.source }} · {{ selectedItem.meta }}</span>
        </div>
        <h3>{{ selectedItem.title }}</h3>
        <p>{{ selectedItem.summary }}</p>
      </article>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from "vue";
import { storeToRefs } from "pinia";
import WorkbenchItemCards from "@/features/workbench/components/WorkbenchItemCards.vue";
import WorkbenchSecondaryTabs from "@/features/workbench/components/WorkbenchSecondaryTabs.vue";
import {
  isSourceFeedItemUnread,
  resolvePublicFeedMessageId,
} from "@/features/message-center/message-center";
import { workbenchTagType } from "@/features/workbench/workbench-tag";
import type { WorkbenchFeedData, WorkbenchFeedItemData } from "@/features/workbench/types";
import { useMessageCenterStore } from "@/stores/message-center";
import { useUserStore } from "@/stores/user";

const props = defineProps<{ data: WorkbenchFeedData }>();
const userStore = useUserStore();
const messageStore = useMessageCenterStore();
const { currentTenant, userInfo } = storeToRefs(userStore);
const localUnreadOverrides = ref<Record<string, boolean>>({});
const activeCategory = ref("all");
const selectedItemId = ref<string | null>(null);
const drawerVisible = ref(false);
const panelId = useId();

const messageContext = computed(() => ({
  tenantId: currentTenant.value.id,
  userId: userInfo.value.id,
  tenantType: currentTenant.value.type,
}));

const displayItems = computed(() => {
  const key = `${messageContext.value.tenantId}:${messageContext.value.userId}`;
  const hydratedReadIds = new Set(messageStore.readIdsByContext[key] ?? []);
  return props.data.items.map((item) => ({ ...item, unread: isItemUnread(item, hydratedReadIds) }));
});

const categories = computed(() => [...new Set(displayItems.value.flatMap((item) => item.label ?? []))].slice(0, 3));
const categoryOptions = computed(() => [
  { label: "全部", value: "all" },
  ...categories.value.map((category) => ({ label: category, value: category })),
]);
const filteredItems = computed(() => activeCategory.value === "all"
  ? displayItems.value
  : displayItems.value.filter((item) => item.label === activeCategory.value));
const selectedItem = computed(() => displayItems.value.find((item) => item.id === selectedItemId.value) ?? null);
const emptyDescription = computed(() => emptyText(activeCategory.value, props.data.items));

watch(messageContext, (context) => {
  messageStore.ensureReadState(context);
  messageStore.refresh(context);
}, { immediate: true, flush: "post" });

function isItemUnread(item: WorkbenchFeedItemData, hydratedReadIds: Set<string>) {
  const messageId = resolvePublicFeedMessageId(item.id);
  if (messageId) return isSourceFeedItemUnread(item, hydratedReadIds);
  return localUnreadOverrides.value[item.id] ?? Boolean(item.unread);
}

function emptyText(category: string, items: readonly WorkbenchFeedItemData[]) {
  if (category !== "all") return "该分类下暂无内容";
  const messageIds = items.map((item) => resolvePublicFeedMessageId(item.id)).filter(Boolean);
  if (messageIds.length && messageIds.every((id) => id?.startsWith("announcements:"))) return "暂无通知公告";
  if (messageIds.length && messageIds.every((id) => id?.startsWith("information-disclosure:"))) {
    return "暂无公开信息";
  }
  return "暂无内容";
}

function openItemById(id: string) {
  const item = displayItems.value.find((candidate) => candidate.id === id);
  if (!item) return;
  const messageId = resolvePublicFeedMessageId(item.id);
  if (messageId) messageStore.markRead(messageContext.value, messageId);
  else localUnreadOverrides.value = { ...localUnreadOverrides.value, [item.id]: false };
  selectedItemId.value = item.id;
  drawerVisible.value = true;
}
</script>

<style scoped>
.bureau-feed {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: var(--spacing-12);
}

.feed-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.feed-detail-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-8);
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-xs);
}

.feed-detail h3 {
  margin: var(--spacing-16) 0 var(--spacing-12);
  color: var(--color-title);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-lg);
}

.feed-detail p {
  margin: 0;
  color: var(--color-body);
  font-size: var(--font-size-sm);
  line-height: 1.8;
}
</style>
