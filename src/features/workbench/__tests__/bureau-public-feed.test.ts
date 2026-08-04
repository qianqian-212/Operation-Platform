import { describe, expect, it } from "vitest";
import { bureauPublicFeedData } from "@/features/workbench/bureau-public-feed";
import { MockWorkbenchDataSource } from "@/features/workbench/mock-workbench-data-source";
import { workbenchWidgetRegistry } from "@/features/workbench/workbench-templates";

describe("bureau public feed", () => {
  it("provides the same announcement feed to the workbench", async () => {
    const data = await new MockWorkbenchDataSource().load(
      workbenchWidgetRegistry.get("bureau.admin.announcements")!,
      { kind: "list", limit: 5 },
      {
        tenant: { id: "bureau-test", name: "测试教育局", shortName: "测试教育局", type: "bureau" },
        userId: "user-test",
        profile: "admin",
      },
      [],
    );

    expect(data).toEqual({ kind: "feed", items: bureauPublicFeedData.announcements });
  });
});
