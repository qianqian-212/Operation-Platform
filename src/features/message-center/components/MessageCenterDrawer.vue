<template>
  <el-drawer
    v-model="visible"
    class="message-center-drawer"
    title="消息中心"
    size="min(400px, 100vw)"
    append-to-body
    @closed="selectedItem = null"
  >
    <template #header>
      <div class="drawer-heading">
        <h2>消息中心</h2>
        <el-button
          v-if="!selectedItem && messageStore.unreadCount"
          text
          type="primary"
          class="mark-all-read"
          @click="markAllRead"
        >
          全部已读
        </el-button>
      </div>
    </template>

    <div v-loading="messageStore.loading" class="message-center-content" :class="{ 'is-detail': selectedItem }">
      <p v-if="messageStore.errorMessage" class="message-error" role="alert">
        {{ messageStore.errorMessage }}
      </p>

      <template v-else-if="selectedItem">
        <div class="message-detail-view">
          <button type="button" class="detail-back" @click="selectedItem = null">
            <el-icon><ArrowLeft /></el-icon>
            返回消息中心
          </button>
          <article class="message-detail">
            <div class="message-detail-meta">
              <span>{{ selectedItem.category }}</span>
              <time>{{ selectedItem.source }} · {{ selectedItem.meta }}</time>
            </div>
            <h3>{{ selectedItem.title }}</h3>
            <p>{{ selectedItem.summary }}</p>
          </article>
        </div>
      </template>

      <template v-else>
        <div v-if="showCategoryTabs" class="message-category-sticky">
          <WorkbenchSecondaryTabs
            v-model="activeCategory"
            class="message-category-tabs"
            :options="categoryOptions"
            aria-label="消息分类"
          />
        </div>
        <div v-if="!filteredItems.length && !messageStore.loading" class="message-empty">
          <el-empty :description="emptyDescription" :image-size="72" />
        </div>
        <ul v-else class="message-list" aria-label="消息列表">
          <li v-for="item in filteredItems" :key="item.id" :class="{ 'is-unread': item.isUnread }">
            <button type="button" class="message-item" @click="selectMessage(item)">
              <span class="message-item-content">
                <span class="message-item-topline">
                  <span class="message-category">{{ item.category }}</span>
                  <time>{{ item.meta }}</time>
                </span>
                <strong>{{ item.title }}</strong>
                <span class="message-source">{{ item.label ? `${item.label} · ${item.source}` : item.source }}</span>
              </span>
              <span v-if="item.isUnread" class="sr-only">未读</span>
            </button>
          </li>
        </ul>
      </template>
    </div>

    <template v-if="!selectedItem" #footer>
      <el-button
        class="primary-entry-link"
        text
        type="primary"
        @click="openPrimaryEntry"
      >
        {{ primaryEntryLabel }}
      </el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { ArrowLeft } from "@element-plus/icons-vue";
import WorkbenchSecondaryTabs from "@/features/workbench/components/WorkbenchSecondaryTabs.vue";
import {
  messageCenterEmptyDescription,
  supportsMessageCenterFeed,
  type MessageCenterItem,
} from "@/features/message-center/message-center";
import { useMessageCenterStore } from "@/stores/message-center";
import { useNavigationStore } from "@/stores/navigation";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();
const navigationStore = useNavigationStore();
const messageStore = useMessageCenterStore();
const { currentTenant, userInfo } = storeToRefs(userStore);
const { workbenchConfig, defaultEntryPath } = storeToRefs(navigationStore);
const activeCategory = ref<"all" | MessageCenterItem["category"]>("all");
const selectedItem = ref<MessageCenterItem | null>(null);
const categoryOptions = [
  { label: "全部", value: "all" },
  { label: "通知公告", value: "通知公告" },
  { label: "信息公开", value: "信息公开" },
];

const context = computed(() => ({
  tenantId: currentTenant.value.id,
  userId: userInfo.value.id,
  tenantType: currentTenant.value.type,
}));
const contextKey = computed(() => `${context.value.tenantId}:${context.value.userId}`);
const showCategoryTabs = computed(() => supportsMessageCenterFeed(context.value.tenantType));
const emptyDescription = computed(() => messageCenterEmptyDescription(
  context.value.tenantType,
  activeCategory.value,
));
const filteredItems = computed(() => activeCategory.value === "all"
  ? messageStore.items
  : messageStore.items.filter((item) => item.category === activeCategory.value));
const primaryEntryLabel = computed(() =>
  workbenchConfig.value.enabled ? "查看工作台" : "打开首页",
);
const visible = computed({
  get: () => messageStore.isOpen,
  set: (open: boolean) => {
    if (open) messageStore.open(context.value);
    else messageStore.close();
  },
});

watch(contextKey, () => {
  selectedItem.value = null;
  activeCategory.value = "all";
  messageStore.refresh(context.value);
});

onMounted(() => messageStore.refresh(context.value));

function selectMessage(item: MessageCenterItem) {
  messageStore.markRead(context.value, item.id);
  selectedItem.value = messageStore.items.find((candidate) => candidate.id === item.id) ?? item;
}

function markAllRead() {
  messageStore.markAllRead(context.value);
}

async function openPrimaryEntry() {
  messageStore.close();
  if (workbenchConfig.value.enabled) {
    await router.push("/workbench");
    return;
  }
  await router.push(defaultEntryPath.value);
}
</script>

<style scoped>
:global(.message-center-drawer.el-drawer) {
  --message-drawer-inline: var(--spacing-24);
  --message-drawer-stack: var(--spacing-16);
}

:global(.message-center-drawer .el-drawer__header) {
  padding:
    max(var(--spacing-20), env(safe-area-inset-top, 0px))
    calc(var(--message-drawer-inline) + 40px)
    var(--spacing-16)
    var(--message-drawer-inline);
  margin-bottom: 0;
  border-bottom: 1px solid var(--color-border);
}

:global(.message-center-drawer .el-drawer__body) {
  display: flex;
  flex-direction: column;
  padding: 0;
  overscroll-behavior: contain;
}

:global(.message-center-drawer .el-drawer__footer) {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-8);
  padding:
    var(--spacing-12)
    var(--message-drawer-inline)
    max(var(--spacing-16), env(safe-area-inset-bottom, 0px));
  border-top: 1px solid var(--color-border);
}

.drawer-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-12);
  width: 100%;
  min-width: 0;
}

.drawer-heading h2 {
  margin: 0;
  min-width: 0;
  overflow: hidden;
  color: var(--color-title);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-lg);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mark-all-read {
  flex-shrink: 0;
}

.message-center-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.message-center-content.is-detail {
  min-height: 240px;
}

.message-error {
  margin: var(--message-drawer-stack) var(--message-drawer-inline);
  padding: var(--spacing-12) var(--spacing-16);
  color: var(--color-error-dark-text);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-lg);
  background: var(--color-error-light);
  border-radius: var(--radius-md);
}

.message-category-sticky {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: var(--spacing-8) var(--message-drawer-inline) 0;
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border);
}

.message-category-tabs {
  margin: 0;
}

.message-category-tabs :deep(.secondary-tabs-viewport) {
  --secondary-tab-height: 40px;
  height: 40px;
  min-height: 40px;
  padding: 0;
  margin: 0;
}

.message-category-tabs :deep(.secondary-tabs) {
  height: 100%;
  gap: var(--spacing-20);
}

.message-category-tabs :deep(.secondary-tab) {
  position: relative;
  height: 100%;
  padding: 0;
  color: var(--color-secondary);
  background: transparent;
  border: 0;
  border-radius: 0;
}

.message-category-tabs :deep(.secondary-tab:hover) {
  color: var(--color-title);
  background: transparent;
}

.message-category-tabs :deep(.secondary-tab.is-active) {
  color: var(--color-primary);
  background: transparent;
}

.message-category-tabs :deep(.secondary-tab.is-active::after) {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  background: var(--color-primary);
  content: "";
}

.message-category-tabs :deep(.secondary-tab:focus-visible) {
  outline: 2px solid var(--color-primary-line-light);
  outline-offset: -2px;
  box-shadow: none;
}

.message-empty {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  padding: var(--spacing-32) var(--message-drawer-inline);
}

.message-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.message-list li + li {
  border-top: 1px solid var(--color-border);
}

.message-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  width: 100%;
  min-height: 76px;
  gap: var(--spacing-12);
  padding: var(--spacing-14) var(--message-drawer-inline);
  color: inherit;
  font: inherit;
  text-align: start;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: background-color 160ms ease;
}

.message-item::before {
  position: absolute;
  top: var(--spacing-16);
  bottom: var(--spacing-16);
  inset-inline-start: calc(var(--message-drawer-inline) - var(--spacing-12));
  width: 2px;
  background: transparent;
  border-radius: var(--radius-full);
  content: "";
}

.is-unread .message-item::before {
  background: var(--color-primary);
}

.message-item:hover {
  background: var(--color-bg-page);
}

.message-item:focus-visible,
.detail-back:focus-visible {
  outline: 2px solid var(--color-primary-line-light);
  outline-offset: -2px;
}

.message-item-content {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: var(--spacing-2);
}

.message-item-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  gap: var(--spacing-12);
}

.message-category,
.message-item-topline time,
.message-source {
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-xs);
}

.message-item-topline time {
  flex-shrink: 0;
}

.message-item strong {
  display: -webkit-box;
  overflow: hidden;
  color: var(--color-body);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-md);
  text-wrap: pretty;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.is-unread .message-item strong {
  color: var(--color-title);
  font-weight: var(--font-weight-semibold);
}

.message-source {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-detail-view {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-8);
  padding: var(--message-drawer-stack) var(--message-drawer-inline) var(--spacing-24);
}

.detail-back {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 36px;
  gap: var(--spacing-4);
  padding: var(--spacing-4) var(--spacing-8);
  margin-inline-start: calc(-1 * var(--spacing-8));
  color: var(--color-body);
  font: inherit;
  font-size: var(--font-size-sm);
  background: transparent;
  border: 0;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.detail-back:hover {
  color: var(--color-primary);
  background: var(--color-bg-page);
}

.detail-back :deep(svg) {
  width: 16px;
  height: 16px;
}

.message-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
  padding-block: var(--spacing-8);
}

.message-detail-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-8);
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-xs);
}

.message-detail-meta > span {
  color: var(--color-primary-dark-text);
}

.message-detail h3 {
  margin: 0;
  color: var(--color-title);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-lg);
  text-wrap: balance;
}

.message-detail p {
  margin: 0;
  color: var(--color-body);
  font-size: var(--font-size-md);
  line-height: 1.75;
  text-wrap: pretty;
}

.primary-entry-link {
  margin-inline-start: auto;
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
  .message-item {
    transition: none;
  }
}
</style>
