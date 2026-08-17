import { describe, expect, it } from "vitest";
import { getWorkbenchTemplate } from "@/features/workbench/workbench-templates";
import {
  createDefaultWorkbenchWidgetAssignment,
  reconcileWorkbenchWidgetAssignment,
  resolveWorkbenchTemplate,
  setWorkbenchWidgetTenantEnabled,
} from "@/features/workbench/workbench-widget-assignment";

describe("workbench widget assignment", () => {
  it("defaults to the widgets actually placed in code templates", () => {
    const assignment = createDefaultWorkbenchWidgetAssignment();
    for (const tenantType of ["school", "bureau", "org", "platform"] as const) {
      for (const profile of ["admin", "business"] as const) {
        const template = getWorkbenchTemplate(tenantType, profile);
        const resolved = resolveWorkbenchTemplate(tenantType, profile, assignment);
        expect(resolved.widgets.map((item) => item.widgetKey)).toEqual(
          template.widgets.map((item) => item.widgetKey),
        );
      }
    }
  });

  it("rejects enabling a widget for an incompatible tenant type", () => {
    const assignment = createDefaultWorkbenchWidgetAssignment();
    expect(() =>
      setWorkbenchWidgetTenantEnabled(assignment, "school.attendance-trend", "bureau", true),
    ).toThrow("该组件不兼容所选组织类型");
  });

  it("removes unauthorized widgets and restores them from the code template", () => {
    const assignment = createDefaultWorkbenchWidgetAssignment();
    const disabled = setWorkbenchWidgetTenantEnabled(
      assignment,
      "school.attendance-trend",
      "school",
      false,
    );
    const without = resolveWorkbenchTemplate("school", "admin", disabled);
    expect(without.widgets.some((item) => item.widgetKey === "school.attendance-trend")).toBe(false);

    const enabled = setWorkbenchWidgetTenantEnabled(
      disabled,
      "school.attendance-trend",
      "school",
      true,
    );
    const restored = resolveWorkbenchTemplate("school", "admin", enabled);
    expect(restored.widgets.some((item) => item.widgetKey === "school.attendance-trend")).toBe(true);
  });

  it("fills compatible profiles when enabling a widget that has none stored", () => {
    const assignment = createDefaultWorkbenchWidgetAssignment();
    assignment.widgets["account-panel"] = { tenantTypes: [], profiles: [] };
    const enabled = setWorkbenchWidgetTenantEnabled(assignment, "account-panel", "school", true);
    expect(enabled.widgets["account-panel"]?.tenantTypes).toEqual(["school"]);
    expect(enabled.widgets["account-panel"]?.profiles).toEqual(["admin", "business"]);
  });

  it("reconciles unknown catalog keys back to template defaults", () => {
    const stored = {
      version: 1,
      revision: 4,
      widgets: {
        "account-panel": { tenantTypes: ["school"], profiles: ["admin"] },
        "unknown-widget": { tenantTypes: ["school"], profiles: ["admin"] },
      },
    };
    const reconciled = reconcileWorkbenchWidgetAssignment(stored);
    expect(reconciled?.revision).toBe(4);
    expect(reconciled?.widgets["unknown-widget"]).toBeUndefined();
    expect(reconciled?.widgets["account-panel"]).toEqual({
      tenantTypes: ["school"],
      profiles: ["admin"],
    });
    expect(reconciled?.widgets["quick-links"]?.tenantTypes.length).toBeGreaterThan(0);
  });
});
