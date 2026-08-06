import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { bureauPublicFeedData } from "@/features/workbench/bureau-public-feed";
import {
  isSourceFeedItemUnread,
  messageCenterEmptyDescription,
  resolvePublicFeedMessageId,
  toMessageCenterItems,
} from "@/features/message-center/message-center";
import {
  loadMessageCenterReadIds,
  saveMessageCenterReadIds,
} from "@/features/message-center/message-center-read-storage";
import { useMessageCenterStore } from "@/stores/message-center";

describe("message center projection", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it("uses the same notification and disclosure source as the bureau workbench", () => {
    const items = toMessageCenterItems("bureau");

    expect(items).toHaveLength(
      bureauPublicFeedData.announcements.length + bureauPublicFeedData["information-disclosure"].length,
    );
    expect(items.slice(0, 2)).toMatchObject([
      { id: "announcements:announcement-1", category: "通知公告", title: "关于报送暑期值班安排的通知", isUnread: true },
      { id: "announcements:announcement-2", category: "通知公告", title: "全区教师信息更新工作提醒", isUnread: true },
    ]);
    expect(items.find((item) => item.id === "information-disclosure:disclosure-1")).toMatchObject({
      category: "信息公开",
      title: bureauPublicFeedData["information-disclosure"][0]?.title,
      isUnread: true,
    });
  });

  it("keeps read state user-scoped and hides bureau-only content elsewhere", () => {
    const readItems = toMessageCenterItems("bureau", new Set(["announcements:announcement-1"]));

    expect(readItems.find((item) => item.id === "announcements:announcement-1")?.isUnread).toBe(false);
    expect(toMessageCenterItems("school")).toEqual([]);
    expect(messageCenterEmptyDescription("school", "all")).toBe("当前机构暂无消息");
    expect(messageCenterEmptyDescription("bureau", "信息公开")).toBe("该分类下暂无消息");
  });

  it("maps workbench public feed items onto the shared message ids", () => {
    expect(resolvePublicFeedMessageId("announcement-1")).toBe("announcements:announcement-1");
    expect(resolvePublicFeedMessageId("disclosure-1")).toBe("information-disclosure:disclosure-1");
    expect(resolvePublicFeedMessageId("news-1")).toBeNull();
    expect(isSourceFeedItemUnread(
      bureauPublicFeedData.announcements[0]!,
      new Set(["announcements:announcement-1"]),
    )).toBe(false);
  });

  it("persists read state across store refresh", () => {
    const store = useMessageCenterStore();
    const context = { tenantId: "bureau-001", userId: "user-1", tenantType: "bureau" as const };

    store.refresh(context);
    expect(store.unreadCount).toBeGreaterThan(0);
    store.markRead(context, "announcements:announcement-1");
    expect(store.isRead(context, "announcements:announcement-1")).toBe(true);
    expect(loadMessageCenterReadIds("bureau-001:user-1").has("announcements:announcement-1")).toBe(true);

    setActivePinia(createPinia());
    const restored = useMessageCenterStore();
    restored.refresh(context);
    expect(restored.isRead(context, "announcements:announcement-1")).toBe(true);
    expect(restored.items.find((item) => item.id === "announcements:announcement-1")?.isUnread).toBe(false);
  });

  it("writes and reads the localStorage read-state document", () => {
    saveMessageCenterReadIds("bureau-001:user-1", new Set(["announcements:announcement-1"]));
    expect([...loadMessageCenterReadIds("bureau-001:user-1")]).toEqual(["announcements:announcement-1"]);
  });
});
