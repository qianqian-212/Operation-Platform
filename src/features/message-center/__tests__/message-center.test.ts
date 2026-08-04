import { describe, expect, it } from "vitest";
import { bureauPublicFeedData } from "@/features/workbench/bureau-public-feed";
import { toMessageCenterItems } from "@/features/message-center/message-center";

describe("message center projection", () => {
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
  });
});
