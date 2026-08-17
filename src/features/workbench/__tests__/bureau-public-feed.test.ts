import { describe, expect, it } from "vitest";
import { bureauPublicFeedData } from "@/features/workbench/bureau-public-feed";
import { MockWorkbenchDataSource } from "@/features/workbench/mock-workbench-data-source";
import { workbenchWidgetRegistry } from "@/features/workbench/workbench-templates";

describe("bureau public feed", () => {
  it("folds announcements into the shared inbox", async () => {
    const data = await new MockWorkbenchDataSource().load(
      workbenchWidgetRegistry.get("message-todo-center")!,
      { kind: "list", limit: 5 },
      {
        tenant: { id: "bureau-test", name: "测试教育局", shortName: "测试教育局", type: "bureau" },
        userId: "user-test",
        profile: "admin",
      },
      [],
    );

    expect(data.kind).toBe("inbox");
    if (data.kind !== "inbox") return;
    expect(data.items.some((item) =>
      item.title === bureauPublicFeedData.announcements[0]?.title && item.category === "notice",
    )).toBe(true);
  });
});
