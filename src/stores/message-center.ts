import { computed, ref } from "vue";
import { defineStore } from "pinia";
import {
  toMessageCenterItems,
  type MessageCenterContext,
  type MessageCenterItem,
} from "@/features/message-center/message-center";
import {
  loadMessageCenterReadIds,
  saveMessageCenterReadIds,
} from "@/features/message-center/message-center-read-storage";

function contextKey(context: MessageCenterContext) {
  return `${context.tenantId}:${context.userId}`;
}

export const useMessageCenterStore = defineStore("message-center", () => {
  const isOpen = ref(false);
  const items = ref<MessageCenterItem[]>([]);
  const loading = ref(false);
  const errorMessage = ref("");
  const readIdsByContext = ref<Record<string, string[]>>({});
  const unreadCount = computed(() => items.value.filter((item) => item.isUnread).length);

  function readSetFor(context: MessageCenterContext) {
    const key = contextKey(context);
    if (!(key in readIdsByContext.value)) {
      readIdsByContext.value = {
        ...readIdsByContext.value,
        [key]: [...loadMessageCenterReadIds(key)],
      };
    }
    return new Set(readIdsByContext.value[key] ?? []);
  }

  function ensureReadState(context: MessageCenterContext) {
    if (!context.tenantId || !context.userId) return;
    readSetFor(context);
  }

  function persistReadSet(context: MessageCenterContext, readItemIds: Set<string>) {
    const key = contextKey(context);
    readIdsByContext.value = {
      ...readIdsByContext.value,
      [key]: [...readItemIds],
    };
    saveMessageCenterReadIds(key, readItemIds);
  }

  function refresh(context: MessageCenterContext) {
    if (!context.tenantId || !context.userId) {
      items.value = [];
      return;
    }
    loading.value = true;
    errorMessage.value = "";
    items.value = toMessageCenterItems(context.tenantType, readSetFor(context));
    loading.value = false;
  }

  function open(context: MessageCenterContext) {
    isOpen.value = true;
    refresh(context);
  }

  function close() {
    isOpen.value = false;
  }

  function isRead(context: MessageCenterContext, itemId: string) {
    return readSetFor(context).has(itemId);
  }

  function markRead(context: MessageCenterContext, itemId: string) {
    const readItemIds = readSetFor(context);
    if (readItemIds.has(itemId)) {
      refresh(context);
      return;
    }
    readItemIds.add(itemId);
    persistReadSet(context, readItemIds);
    refresh(context);
  }

  function markAllRead(context: MessageCenterContext) {
    const unreadIds = items.value.filter((item) => item.isUnread).map((item) => item.id);
    if (!unreadIds.length) return;
    const readItemIds = readSetFor(context);
    unreadIds.forEach((itemId) => readItemIds.add(itemId));
    persistReadSet(context, readItemIds);
    refresh(context);
  }

  return {
    isOpen,
    items,
    loading,
    errorMessage,
    unreadCount,
    readIdsByContext,
    refresh,
    open,
    close,
    ensureReadState,
    isRead,
    markRead,
    markAllRead,
  };
});
