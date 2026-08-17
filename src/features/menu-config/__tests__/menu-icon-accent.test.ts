import { describe, expect, it } from "vitest";
import { resolveMenuIconAccent } from "@/features/menu-config/menu-icon-accent";

describe("resolveMenuIconAccent", () => {
  it("uses an explicit accent when provided", () => {
    expect(resolveMenuIconAccent({ accent: "red", name: "课后服务数据", icon: "calendar" }))
      .toBe("red");
  });

  it("maps menu names and icons onto semantic accent colors", () => {
    expect(resolveMenuIconAccent({ name: "校园安全", icon: "shield" })).toBe("red");
    expect(resolveMenuIconAccent({ name: "缴费管理", icon: "money" })).toBe("yellow");
    expect(resolveMenuIconAccent({ name: "智慧操场", icon: "grid" })).toBe("green");
    expect(resolveMenuIconAccent({ name: "课后服务数据", icon: "calendar" })).toBe("cyan");
    expect(resolveMenuIconAccent({ name: "教务管理", icon: "notebook" })).toBe("blue");
  });
});
