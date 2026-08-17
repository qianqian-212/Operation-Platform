import { describe, expect, it } from "vitest";
import { projectWorkbenchItemsToMediumGrid } from "@/features/workbench/workbench-responsive-layout";
import type { WorkbenchLayoutItem } from "@/features/workbench/types";

function node(widgetKey: string, x: number, y: number, w: number, h: number): WorkbenchLayoutItem {
  return { widgetKey, x, y, w, h, visible: true, settings: { kind: "none" } };
}

describe("workbench responsive layout", () => {
  it("fills medium rows while keeping the primary panel full width", () => {
    const projected = projectWorkbenchItemsToMediumGrid([
      node("stats-overview", 0, 0, 12, 2),
      node("school.attendance-trend", 0, 2, 8, 4),
      node("school.operational-alerts", 8, 2, 4, 4),
      node("message-todo-center", 0, 6, 4, 3),
      node("school.student-distribution", 4, 6, 4, 3),
      node("quick-links", 8, 6, 4, 3),
    ]);

    expect(projected.map(({ x, y, w }) => ({ x, y, w }))).toEqual([
      { x: 0, y: 0, w: 6 },
      { x: 0, y: 2, w: 6 },
      { x: 0, y: 6, w: 3 },
      { x: 3, y: 6, w: 3 },
      { x: 0, y: 10, w: 3 },
      { x: 3, y: 10, w: 3 },
    ]);
  });

  it("expands the last unpaired card instead of leaving a half row empty", () => {
    const projected = projectWorkbenchItemsToMediumGrid([
      node("school.operational-alerts", 0, 0, 4, 2),
      node("message-todo-center", 4, 0, 4, 2),
      node("school.student-distribution", 8, 0, 4, 2),
    ]);

    expect(projected.map(({ x, y, w }) => ({ x, y, w }))).toEqual([
      { x: 0, y: 0, w: 3 },
      { x: 3, y: 0, w: 3 },
      { x: 0, y: 2, w: 6 },
    ]);
  });

  it("keeps quick applications full width and pairs the following bureau widgets", () => {
    const projected = projectWorkbenchItemsToMediumGrid([
      node("quick-links", 0, 2, 12, 3),
      node("bureau.bureau-news", 0, 5, 6, 4),
      node("bureau.information-disclosure", 6, 5, 6, 4),
    ]);

    expect(projected.map(({ x, y, w }) => ({ x, y, w }))).toEqual([
      { x: 0, y: 0, w: 6 },
      { x: 0, y: 3, w: 3 },
      { x: 3, y: 3, w: 3 },
    ]);
  });

  it("keeps the agent banner and stats strip full width", () => {
    const projected = projectWorkbenchItemsToMediumGrid([
      node("etonedu-agent", 0, 0, 12, 1),
      node("stats-overview", 0, 1, 12, 1),
      node("school.operational-alerts", 0, 2, 4, 1),
      node("message-todo-center", 4, 2, 4, 1),
    ]);

    expect(projected.map(({ x, y, w }) => ({ x, y, w }))).toEqual([
      { x: 0, y: 0, w: 6 },
      { x: 0, y: 1, w: 6 },
      { x: 0, y: 2, w: 3 },
      { x: 3, y: 2, w: 3 },
    ]);
  });
});
