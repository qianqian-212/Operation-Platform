import { bureauPublicFeedData } from "@/features/workbench/bureau-public-feed";
import type { WorkbenchFeedItemData } from "@/features/workbench/types";
import type { TenantType } from "@/types/user";

export interface MessageCenterContext {
  tenantId: string;
  userId: string;
  tenantType: TenantType;
}

export interface MessageCenterItem {
  id: string;
  category: "通知公告" | "信息公开";
  title: string;
  summary: string;
  meta: string;
  source: string;
  label?: string;
  isUnread: boolean;
}

export type PublicFeedGroupKey = keyof typeof bureauPublicFeedData;

const PUBLIC_FEED_GROUPS: ReadonlyArray<{
  key: PublicFeedGroupKey;
  category: MessageCenterItem["category"];
}> = [
  { key: "announcements", category: "通知公告" },
  { key: "information-disclosure", category: "信息公开" },
];

export function messageCenterItemId(groupKey: PublicFeedGroupKey, itemId: string) {
  return `${groupKey}:${itemId}`;
}

export function resolvePublicFeedMessageId(itemId: string): string | null {
  for (const { key } of PUBLIC_FEED_GROUPS) {
    if (bureauPublicFeedData[key].some((item) => item.id === itemId)) {
      return messageCenterItemId(key, itemId);
    }
  }
  return null;
}

export function supportsMessageCenterFeed(tenantType: TenantType) {
  return tenantType === "bureau";
}

export function messageCenterEmptyDescription(
  tenantType: TenantType,
  activeCategory: "all" | MessageCenterItem["category"],
) {
  if (!supportsMessageCenterFeed(tenantType)) return "当前机构暂无消息";
  if (activeCategory !== "all") return "该分类下暂无消息";
  return "暂无通知公告或公开信息";
}

export function toMessageCenterItems(
  tenantType: TenantType,
  readItemIds: ReadonlySet<string> = new Set(),
): MessageCenterItem[] {
  if (!supportsMessageCenterFeed(tenantType)) return [];
  return PUBLIC_FEED_GROUPS.flatMap(({ key, category }) => bureauPublicFeedData[key].map((item) => {
    const id = messageCenterItemId(key, item.id);
    return {
      id,
      category,
      title: item.title,
      summary: item.summary,
      meta: item.meta,
      source: item.source,
      label: item.label,
      isUnread: Boolean(item.unread) && !readItemIds.has(id),
    };
  }));
}

export function isSourceFeedItemUnread(
  item: WorkbenchFeedItemData,
  readItemIds: ReadonlySet<string>,
) {
  const messageId = resolvePublicFeedMessageId(item.id);
  if (!messageId) return Boolean(item.unread);
  return Boolean(item.unread) && !readItemIds.has(messageId);
}
