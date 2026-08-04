import { computed, ref } from "vue";
import { defineStore } from "pinia";
import {
  toMessageCenterItems,
  type MessageCenterContext,
  type MessageCenterItem,
} from "@/features/message-center/message-center";

function contextKey(context: MessageCenterContext) {
  return `${context.tenantId}:${context.userId}`;
}

export const useMessageCenterStore = defineStore("message-center", () => {
  const isOpen = ref(false);
  const items = ref<MessageCenterItem[]>([]);
  const loading = ref(false);
  const errorMessage = ref("");
  const unreadCount = computed(() => items.value.filter((item) => item.isUnread).length);
  const readItemIdsByContext = new Map<string, Set<string>>();

  function refresh(context: MessageCenterContext) {
    if (!context.tenantId || !context.userId) {
      items.value = [];
      return;
    }
    loading.value = true;
    errorMessage.value = "";
    const key = contextKey(context);
    const readItemIds = readItemIdsByContext.get(key) ?? new Set<string>();
    items.value = toMessageCenterItems(context.tenantType, readItemIds);
    loading.value = false;
  }

  function open(context: MessageCenterContext) {
    isOpen.value = true;
    refresh(context);
  }

  function close() {
    isOpen.value = false;
  }

  function markRead(context: MessageCenterContext, itemId: string) {
    const item = items.value.find((candidate) => candidate.id === itemId);
    if (!item || !item.isUnread) return;
    const key = contextKey(context);
    const readItemIds = readItemIdsByContext.get(key) ?? new Set<string>();
    readItemIds.add(itemId);
    readItemIdsByContext.set(key, readItemIds);
    items.value = items.value.map((candidate) => candidate.id === itemId
      ? { ...candidate, isUnread: false }
      : candidate);
  }

  function markAllRead(context: MessageCenterContext) {
    const unreadIds = items.value.filter((item) => item.isUnread).map((item) => item.id);
    if (!unreadIds.length) return;
    const key = contextKey(context);
    const readItemIds = readItemIdsByContext.get(key) ?? new Set<string>();
    unreadIds.forEach((itemId) => readItemIds.add(itemId));
    readItemIdsByContext.set(key, readItemIds);
    items.value = items.value.map((item) => ({ ...item, isUnread: false }));
  }

  return {
    isOpen,
    items,
    loading,
    errorMessage,
    unreadCount,
    refresh,
    open,
    close,
    markRead,
    markAllRead,
  };
});
