<template>
  <el-drawer
    v-model="visible"
    class="message-center-drawer"
    title="消息"
    size="min(400px, 100vw)"
    append-to-body
    @closed="selectedItem = null"
  >
    <template #header>
      <div class="drawer-heading">
        <h2>消息</h2>
        <el-button
          v-if="!selectedItem && messageStore.unreadCount"
          text
          type="primary"
          @click="markAllRead"
        >
          全部已读
        </el-button>
      </div>
    </template>

    <div v-loading="messageStore.loading" class="message-center-content">
      <p v-if="messageStore.errorMessage" class="message-error" role="alert">
        {{ messageStore.errorMessage }}
      </p>

      <template v-else-if="selectedItem">
        <div class="message-detail-view">
          <button type="button" class="detail-back" @click="selectedItem = null">
            <el-icon><ArrowLeft /></el-icon>
            返回消息
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
        <div class="message-category-sticky">
          <WorkbenchSecondaryTabs
            v-model="activeCategory"
            class="message-category-tabs"
            :options="categoryOptions"
            aria-label="消息分类"
          />
        </div>
        <div v-if="!filteredItems.length && !messageStore.loading" class="message-empty">
          <el-empty description="暂无通知公告或公开信息" :image-size="72" />
        </div>
        <ul v-else class="message-list" aria-label="消息列表">
          <li v-for="item in filteredItems" :key="item.id" :class="{ 'is-unread': item.isUnread }">
            <button type="button" class="message-item" @click="selectMessage(item)">
              <span class="message-item-marker" aria-hidden="true" />
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

    <template #footer>
      <el-button
        v-if="!selectedItem"
        class="workbench-link"
        text
        type="primary"
        @click="openWorkbench"
      >
        查看工作台
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
import type { MessageCenterItem } from "@/features/message-center/message-center";
import { useMessageCenterStore } from "@/stores/message-center";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();
const messageStore = useMessageCenterStore();
const { currentTenant, userInfo } = storeToRefs(userStore);
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
const filteredItems = computed(() => activeCategory.value === "all"
  ? messageStore.items
  : messageStore.items.filter((item) => item.category === activeCategory.value));
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

async function openWorkbench() {
  messageStore.close();
  await router.push("/workbench");
}
</script>

<style scoped>
:global(.message-center-drawer .el-drawer__header) {
  padding: var(--spacing-20) var(--spacing-24);
  margin-bottom: 0;
  border-bottom: 1px solid var(--color-border);
}

:global(.message-center-drawer .el-drawer__body) {
  padding: 0;
}

:global(.message-center-drawer .el-drawer__footer) {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-12) var(--spacing-20);
  border-top: 1px solid var(--color-border);
}

.drawer-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-16);
  width: 100%;
  padding-right: var(--spacing-16);
}

.drawer-heading h2 {
  margin: 0;
  color: var(--color-title);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-lg);
}

.message-center-content {
  min-height: 160px;
}

.message-error {
  margin: var(--spacing-16) var(--spacing-24);
  padding: var(--spacing-12);
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
  padding: var(--spacing-8) var(--spacing-24) 0;
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
  gap: var(--spacing-24);
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
  padding: var(--spacing-24);
}

.message-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.message-list li {
  border-bottom: 1px solid var(--color-border);
}

.message-item {
  display: flex;
  align-items: flex-start;
  width: 100%;
  min-height: 82px;
  gap: var(--spacing-10);
  padding: var(--spacing-12) var(--spacing-24);
  color: inherit;
  font: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: background-color 180ms ease;
}

.message-item:hover {
  background: var(--color-bg-page);
}

.message-item:focus-visible,
.detail-back:focus-visible {
  outline: 2px solid var(--color-primary-line-light);
  outline-offset: -2px;
}

.message-item-marker {
  width: 2px;
  height: 32px;
  margin-top: var(--spacing-4);
  flex: 0 0 2px;
  background: transparent;
}

.is-unread .message-item-marker {
  background: var(--color-primary);
}

.message-item-content {
  display: grid;
  min-width: 0;
  flex: 1;
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

.message-category {
  color: var(--color-secondary);
}

.message-item-topline time {
  flex-shrink: 0;
}

.message-item strong {
  margin-top: var(--spacing-2);
  overflow: hidden;
  color: var(--color-body);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-md);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.is-unread .message-item strong {
  color: var(--color-title);
  font-weight: var(--font-weight-semibold);
}

.message-source {
  margin-top: var(--spacing-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-back {
  display: inline-flex;
  align-items: center;
  height: 32px;
  gap: var(--spacing-4);
  padding: 0 var(--spacing-4);
  color: var(--color-body);
  font: inherit;
  font-size: var(--font-size-sm);
  background: transparent;
  border: 0;
  cursor: pointer;
}

.message-detail-view {
  padding: var(--spacing-16) var(--spacing-24) var(--spacing-24);
}

.detail-back:hover {
  color: var(--color-primary);
}

.detail-back :deep(svg) {
  width: 16px;
  height: 16px;
}

.message-detail {
  padding: var(--spacing-16) 0;
}

.message-detail-meta {
  display: flex;
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
  margin: var(--spacing-12) 0 var(--spacing-16);
  color: var(--color-title);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-lg);
}

.message-detail p {
  margin: 0;
  color: var(--color-body);
  font-size: var(--font-size-md);
  line-height: 1.75;
}

.workbench-link {
  margin-left: auto;
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
  .message-item { transition: none; }
}
</style>
