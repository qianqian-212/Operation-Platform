import { describe, expect, it } from "vitest";
import { workbenchDragScrollDelta } from "@/features/workbench/workbench-drag-auto-scroll";

const viewport = {
  scrollerTop: 100,
  scrollerBottom: 900,
  coveredTop: 80,
};

describe("workbench drag auto-scroll", () => {
  it("scrolls up when the pointer is over the sticky editor toolbar", () => {
    const overToolbar = workbenchDragScrollDelta({ ...viewport, pointerY: 140 });
    const justBelowToolbar = workbenchDragScrollDelta({ ...viewport, pointerY: 200 });
    expect(overToolbar).toBeLessThan(0);
    expect(justBelowToolbar).toBe(0);
    expect(Math.abs(overToolbar)).toBeGreaterThan(0);
  });

  it("does not scroll in the middle of the canvas", () => {
    expect(workbenchDragScrollDelta({ ...viewport, pointerY: 480 })).toBe(0);
  });

  it("scrolls down faster as the pointer approaches the bottom edge", () => {
    const nearBottom = workbenchDragScrollDelta({ ...viewport, pointerY: 840 });
    const atBottom = workbenchDragScrollDelta({ ...viewport, pointerY: 890 });
    expect(nearBottom).toBeGreaterThan(0);
    expect(atBottom).toBeGreaterThan(nearBottom);
  });
});
