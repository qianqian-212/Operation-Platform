import { describe, expect, it } from "vitest";
import {
  createDefaultWorkbenchLayout,
  reconcileStoredWorkbenchLayout,
  validateWorkbenchLayout,
} from "@/features/workbench/workbench-layout";
import { getWorkbenchTemplate } from "@/features/workbench/workbench-templates";
import {
  isWorkbenchWidgetCompatible,
  listCompatibleWorkbenchWidgets,
  migrateLegacyWorkbenchWidgetKey,
  workbenchWidgetCatalog,
  workbenchWidgetRegistry,
} from "@/features/workbench/workbench-widget-catalog";
import type { TenantInfo } from "@/types/user";

const school: TenantInfo = {
  id: "school-catalog",
  name: "目录测试学校",
  shortName: "测试学校",
  type: "school",
  enabled: true,
};

describe("workbench widget catalog", () => {
  it("registers every widget once with a stable key", () => {
    const keys = workbenchWidgetCatalog.map((item) => item.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(workbenchWidgetRegistry.get("account-panel")?.scope).toBe("common");
    expect(workbenchWidgetRegistry.get("quick-links")?.scope).toBe("common");
    expect(workbenchWidgetRegistry.get("etonedu-agent")?.scope).toBe("common");
    expect(workbenchWidgetRegistry.get("stats-overview")?.scope).toBe("common");
    expect(workbenchWidgetRegistry.get("message-todo-center")?.scope).toBe("common");
    expect(workbenchWidgetRegistry.has("school.admin.account-panel")).toBe(false);
    expect(workbenchWidgetRegistry.has("bureau.business.quick-apps")).toBe(false);
  });

  it("lets common widgets serve every tenant type and profile", () => {
    const accountPanel = workbenchWidgetRegistry.get("account-panel")!;
    const quickLinks = workbenchWidgetRegistry.get("quick-links")!;
    const agent = workbenchWidgetRegistry.get("etonedu-agent")!;
    const stats = workbenchWidgetRegistry.get("stats-overview")!;
    for (const tenantType of ["school", "bureau", "org", "platform"] as const) {
      for (const profile of ["admin", "business"] as const) {
        expect(isWorkbenchWidgetCompatible(accountPanel, tenantType, profile)).toBe(true);
        expect(isWorkbenchWidgetCompatible(quickLinks, tenantType, profile)).toBe(true);
        expect(isWorkbenchWidgetCompatible(agent, tenantType, profile)).toBe(true);
        expect(isWorkbenchWidgetCompatible(stats, tenantType, profile)).toBe(true);
      }
    }
    const inbox = workbenchWidgetRegistry.get("message-todo-center")!;
    expect(isWorkbenchWidgetCompatible(inbox, "school", "admin")).toBe(true);
    expect(isWorkbenchWidgetCompatible(inbox, "bureau", "business")).toBe(true);
    expect(isWorkbenchWidgetCompatible(inbox, "org", "admin")).toBe(true);
    expect(isWorkbenchWidgetCompatible(inbox, "platform", "admin")).toBe(false);
  });

  it("keeps domain widgets inside their compatible tenant types", () => {
    const studentTrend = workbenchWidgetRegistry.get("school.attendance-trend")!;
    const allianceOverview = workbenchWidgetRegistry.get("school.alliance-overview")!;
    const calendar = workbenchWidgetRegistry.get("bureau.calendar-tasks")!;
    expect(studentTrend.scope).toBe("domain");
    expect(allianceOverview.scope).toBe("domain");
    expect(allianceOverview.kind).toBe("alliance-overview");
    expect(isWorkbenchWidgetCompatible(studentTrend, "school", "admin")).toBe(true);
    expect(isWorkbenchWidgetCompatible(allianceOverview, "school", "business")).toBe(true);
    expect(isWorkbenchWidgetCompatible(allianceOverview, "bureau", "admin")).toBe(false);
    expect(isWorkbenchWidgetCompatible(studentTrend, "bureau", "admin")).toBe(false);
    expect(isWorkbenchWidgetCompatible(calendar, "bureau", "business")).toBe(true);
    expect(isWorkbenchWidgetCompatible(calendar, "school", "business")).toBe(false);
    expect(
      listCompatibleWorkbenchWidgets("school", "admin").every((item) =>
        isWorkbenchWidgetCompatible(item, "school", "admin"),
      ),
    ).toBe(true);
  });

  it("maps legacy tenant-profile keys onto the shared catalog", () => {
    expect(migrateLegacyWorkbenchWidgetKey("school.admin.account-panel", "school", "admin"))
      .toBe("account-panel");
    expect(migrateLegacyWorkbenchWidgetKey("school.admin.quick-links", "school", "admin"))
      .toBe("quick-links");
    expect(migrateLegacyWorkbenchWidgetKey("bureau.business.quick-apps", "bureau", "business"))
      .toBe("quick-links");
    expect(migrateLegacyWorkbenchWidgetKey("school.admin.student-count", "school", "admin"))
      .toBe("stats-overview");
    expect(migrateLegacyWorkbenchWidgetKey("school.student-count", "school", "admin"))
      .toBe("stats-overview");
    expect(migrateLegacyWorkbenchWidgetKey("school.notices", "school", "admin"))
      .toBe("message-todo-center");
    expect(migrateLegacyWorkbenchWidgetKey("bureau.message-todo-center", "bureau", "admin"))
      .toBe("message-todo-center");
    expect(migrateLegacyWorkbenchWidgetKey("account-panel", "school", "admin"))
      .toBe("account-panel");
  });

  it("reconciles a stored layout that still uses legacy widget keys", () => {
    const template = getWorkbenchTemplate("school", "admin");
    const context = { tenant: school, userId: "user-a", profile: "admin" as const };
    const current = createDefaultWorkbenchLayout(context, template);
    const toLegacyKey = (widgetKey: string) => {
      if (widgetKey === "account-panel" || widgetKey === "quick-links") {
        return `school.admin.${widgetKey}`;
      }
      return widgetKey.replace(/^school\./, "school.admin.");
    };
    const legacy = {
      ...current,
      items: current.items.map((item) => ({ ...item, widgetKey: toLegacyKey(item.widgetKey) })),
      simpleItems: current.simpleItems.map((item) => ({
        ...item,
        widgetKey: toLegacyKey(item.widgetKey),
      })),
    };

    const reconciled = reconcileStoredWorkbenchLayout(legacy, context, template);
    expect(reconciled).not.toBeNull();
    expect(reconciled?.items.map((item) => item.widgetKey)).toEqual(
      current.items.map((item) => item.widgetKey),
    );
    expect(validateWorkbenchLayout(reconciled!, context, template)).toBe(true);
  });

  it("merges legacy metric and inbox widgets onto the shared catalog keys", () => {
    const template = getWorkbenchTemplate("school", "admin");
    const context = { tenant: school, userId: "user-a", profile: "admin" as const };
    const current = createDefaultWorkbenchLayout(context, template);
    const noticesY = current.items.find((item) => item.widgetKey === "message-todo-center")?.y ?? 4;
    const extraMetrics = [
      { widgetKey: "school.student-count", visible: true, x: 0, y: 1, w: 3, h: 1, settings: { kind: "none" as const } },
      { widgetKey: "school.arrival-rate", visible: true, x: 3, y: 1, w: 3, h: 1, settings: { kind: "none" as const } },
      { widgetKey: "school.notices", visible: true, x: 0, y: noticesY, w: 4, h: 1, settings: { kind: "list" as const, limit: 5 as const } },
    ];
    const legacy = {
      ...current,
      items: [...extraMetrics, ...current.items.filter((item) => item.widgetKey !== "stats-overview" && item.widgetKey !== "message-todo-center")],
      simpleItems: [
        { widgetKey: "school.student-count", visible: true, settings: { kind: "none" as const }, order: 0, columnOrder: 0, span: 3 as const, column: "primary" as const },
        ...current.simpleItems.filter((item) => item.widgetKey !== "stats-overview"),
      ],
    };

    const reconciled = reconcileStoredWorkbenchLayout(legacy, context, template);
    expect(reconciled).not.toBeNull();
    expect(reconciled?.items.filter((item) => item.widgetKey === "stats-overview")).toHaveLength(1);
    expect(reconciled?.items.filter((item) => item.widgetKey === "message-todo-center")).toHaveLength(1);
    expect(reconciled?.items.find((item) => item.widgetKey === "stats-overview")).toMatchObject({
      x: 0,
      w: 12,
    });
    expect(validateWorkbenchLayout(reconciled!, context, template)).toBe(true);
  });
});
