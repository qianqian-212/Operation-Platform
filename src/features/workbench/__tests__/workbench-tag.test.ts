import { describe, expect, it } from "vitest";
import { workbenchItemLabel, workbenchTagType } from "@/features/workbench/workbench-tag";

describe("workbench tags", () => {
  it("maps tones onto the shared tag colors and fills missing labels", () => {
    expect(workbenchTagType("danger")).toBe("danger");
    expect(workbenchTagType()).toBe("info");
    expect(workbenchItemLabel({ label: "待办", tone: "warning" })).toBe("待办");
    expect(workbenchItemLabel({ tone: "danger" })).toBe("告警");
    expect(workbenchItemLabel({})).toBe("事项");
  });
});
