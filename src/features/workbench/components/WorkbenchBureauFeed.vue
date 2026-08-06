<template>
  <div class="bureau-feed">
    <WorkbenchSecondaryTabs
      v-model="activeCategory"
      :options="categoryOptions"
      :panel-id="panelId"
      aria-label="内容分类"
    />

    <div :id="panelId" class="feed-panel" role="tabpanel" aria-label="公开信息列表">
      <el-empty
        v-if="!filteredItems.length"
        :description="emptyDescription"
        :image-size="52"
      />
      <ul v-else class="feed-list">
        <li v-for="item in filteredItems" :key="item.id" :class="{ 'is-unread': item.unread }">
          <button type="button" class="feed-item" @click="openItem(item)">
            <span class="feed-main">
              <span class="feed-heading">
                <span class="feed-unread-dot" aria-hidden="true" />
                <strong :title="item.title">{{ item.title }}</strong>
                <time class="feed-date">{{ item.meta }}</time>
              </span>
              <span class="feed-subline">
                <span v-if="item.label" class="feed-label">{{ item.label }}</span>
                <span v-if="item.source" class="feed-source">{{ item.source }}</span>
              </span>
            </span>
            <span v-if="item.unread" class="sr-only">未读</span>
          </button>
        </li>
      </ul>
    </div>

    <el-drawer v-model="drawerVisible" title="内容详情" size="min(460px, 90vw)" append-to-body>
      <article v-if="selectedItem" class="feed-detail">
        <div class="feed-detail-meta">
          <span v-if="selectedItem.label" class="feed-detail-label">{{ selectedItem.label }}</span>
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
import WorkbenchSecondaryTabs from "@/features/workbench/components/WorkbenchSecondaryTabs.vue";
import {
  isSourceFeedItemUnread,
  resolvePublicFeedMessageId,
} from "@/features/message-center/message-center";
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

  return props.data.items.map((item) => {
    const messageId = resolvePublicFeedMessageId(item.id);
    const unread = messageId
      ? isSourceFeedItemUnread(item, hydratedReadIds)
      : localUnreadOverrides.value[item.id] ?? Boolean(item.unread);
    return { ...item, unread };
  });
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
const emptyDescription = computed(() => {
  if (activeCategory.value !== "all") return "该分类下暂无内容";
  const messageIds = props.data.items
    .map((item) => resolvePublicFeedMessageId(item.id))
    .filter((id): id is string => Boolean(id));
  if (messageIds.length && messageIds.every((id) => id.startsWith("announcements:"))) {
    return "暂无通知公告";
  }
  if (messageIds.length && messageIds.every((id) => id.startsWith("information-disclosure:"))) {
    return "暂无公开信息";
  }
  return "暂无内容";
});

watch(
  messageContext,
  (context) => {
    messageStore.ensureReadState(context);
    messageStore.refresh(context);
  },
  { immediate: true },
);

function openItem(item: WorkbenchFeedItemData) {
  const messageId = resolvePublicFeedMessageId(item.id);
  if (messageId) {
    messageStore.markRead(messageContext.value, messageId);
  } else {
    localUnreadOverrides.value = {
      ...localUnreadOverrides.value,
      [item.id]: false,
    };
  }
  selectedItemId.value = item.id;
  drawerVisible.value = true;
}
</script>

<style scoped>
.bureau-feed {
  --feed-marker-size: 6px;
  --feed-marker-gap: var(--spacing-8);
  --feed-gutter: calc(var(--feed-marker-size) + var(--feed-marker-gap));

  container-type: inline-size;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: var(--spacing-10);
}

.feed-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.feed-list {
  display: grid;
  padding: 0;
  margin: 0;
  gap: var(--spacing-2);
  overflow: auto;
  list-style: none;
}

.feed-item {
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding: var(--spacing-10) var(--spacing-12);
  color: inherit;
  font: inherit;
  text-align: start;
  background: transparent;
  border: 0;
  /* Widget card is radius-lg; inset rows use the next step down for concentric corners. */
  border-radius: var(--radius-md);
  cursor: pointer;
  transition-property: background-color, box-shadow;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}

.feed-item:hover {
  background: var(--color-bg-page);
  box-shadow: var(--shadow-s);
}

.feed-item:active {
  background: color-mix(in srgb, var(--color-bg-page) 70%, var(--color-border));
  box-shadow: none;
}

.feed-item:focus-visible {
  outline: 2px solid var(--color-primary-line-light);
  outline-offset: -2px;
}

.feed-main {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: var(--spacing-4);
}

.feed-heading {
  display: grid;
  grid-template-columns: var(--feed-marker-size) minmax(0, 1fr) auto;
  align-items: start;
  column-gap: var(--feed-marker-gap);
  min-width: 0;
}

.feed-unread-dot {
  width: var(--feed-marker-size);
  height: var(--feed-marker-size);
  margin-block-start: calc((var(--line-height-md) - var(--feed-marker-size)) / 2);
  background: var(--color-primary);
  border-radius: var(--radius-full);
  opacity: 0;
  filter: blur(4px);
  transform: scale(0.25);
  transition-property: opacity, filter, transform;
  transition-duration: 220ms;
  transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
}

.is-unread .feed-unread-dot {
  opacity: 1;
  filter: blur(0);
  transform: scale(1);
}

.feed-heading strong {
  display: -webkit-box;
  min-width: 0;
  overflow: hidden;
  color: var(--color-body);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-md);
  text-wrap: pretty;
  transition-property: color;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.is-unread .feed-heading strong {
  color: var(--color-title);
  font-weight: var(--font-weight-medium);
}

.feed-date {
  flex-shrink: 0;
  margin-block-start: 1px;
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-xs);
  font-variant-numeric: tabular-nums;
}

.feed-subline {
  display: flex;
  align-items: center;
  min-width: 0;
  padding-inline-start: var(--feed-gutter);
  gap: var(--spacing-6);
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-xs);
}

.feed-label {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.feed-label + .feed-source::before {
  margin-inline-end: var(--spacing-6);
  content: "·";
}

.feed-source {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip: rect(0, 0, 0, 0);
}

@media (prefers-reduced-motion: reduce) {
  .feed-item,
  .feed-unread-dot,
  .feed-heading strong {
    transition: none;
  }
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

.feed-detail-label {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.feed-detail h3 {
  margin: var(--spacing-16) 0 var(--spacing-12);
  color: var(--color-title);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-lg);
  text-wrap: balance;
}

.feed-detail p {
  margin: 0;
  color: var(--color-body);
  font-size: var(--font-size-sm);
  line-height: 1.8;
  text-wrap: pretty;
}

@container (max-width: 360px) {
  .feed-heading {
    grid-template-columns: var(--feed-marker-size) minmax(0, 1fr);
    row-gap: var(--spacing-2);
  }

  .feed-date {
    grid-column: 2;
  }
}
</style>
