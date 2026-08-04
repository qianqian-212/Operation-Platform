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

const PUBLIC_FEED_GROUPS: ReadonlyArray<{
  key: keyof typeof bureauPublicFeedData;
  category: MessageCenterItem["category"];
}> = [
  { key: "announcements", category: "通知公告" },
  { key: "information-disclosure", category: "信息公开" },
];

function itemId(groupKey: keyof typeof bureauPublicFeedData, item: WorkbenchFeedItemData) {
  return `${groupKey}:${item.id}`;
}

export function toMessageCenterItems(
  tenantType: TenantType,
  readItemIds: ReadonlySet<string> = new Set(),
): MessageCenterItem[] {
  if (tenantType !== "bureau") return [];
  return PUBLIC_FEED_GROUPS.flatMap(({ key, category }) => bureauPublicFeedData[key].map((item) => {
    const id = itemId(key, item);
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
