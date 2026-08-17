import { describe, expect, it } from "vitest";
import { attachWorkbenchDragPreview, releaseWorkbenchDragPreview } from "@/features/workbench/workbench-drag-preview";

describe("workbench drag preview", () => {
  it("creates a title and subtitle preview without an icon", () => {
    const event = {
      dataTransfer: { setDragImage: () => undefined },
    };
    attachWorkbenchDragPreview(event, {
      title: "Etonedu Agent",
      subtitle: "输入任务或教务问题，由 AI 解析并解答。",
    });
    const preview = document.querySelector(".workbench-drag-preview");
    expect(preview?.querySelector("strong")?.textContent).toBe("Etonedu Agent");
    expect(preview?.querySelector("span")?.textContent).toContain("输入任务或教务问题");
    expect(preview?.querySelector("svg, img")).toBeNull();
    releaseWorkbenchDragPreview();
  });
});
