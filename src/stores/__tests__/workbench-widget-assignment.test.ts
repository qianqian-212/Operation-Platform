import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import {
  createDefaultWorkbenchWidgetAssignment,
  setWorkbenchWidgetTenantEnabled,
} from "@/features/workbench/workbench-widget-assignment";
import { operationPlatformPersistence } from "@/features/persistence/runtime-operation-platform-persistence";
import { useWorkbenchWidgetAssignmentStore } from "@/stores/workbench-widget-assignment";

describe("workbench widget assignment store", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it("edits a draft without writing until save", async () => {
    const store = useWorkbenchWidgetAssignmentStore();
    store.load();
    expect(store.isTenantEnabled("school.attendance-trend", "school")).toBe(true);

    store.setTenantEnabled("school.attendance-trend", "school", false);
    expect(store.dirty).toBe(true);
    expect(store.isTenantEnabled("school.attendance-trend", "school")).toBe(false);
    expect(
      operationPlatformPersistence.loadWorkbenchWidgetAssignment()
        .assignment.widgets["school.attendance-trend"]?.tenantTypes,
    ).toContain("school");

    await store.save();
    expect(store.dirty).toBe(false);
    expect(
      operationPlatformPersistence.loadWorkbenchWidgetAssignment()
        .assignment.widgets["school.attendance-trend"]?.tenantTypes,
    ).not.toContain("school");
  });

  it("restores the template-derived default assignment", async () => {
    const store = useWorkbenchWidgetAssignmentStore();
    await operationPlatformPersistence.saveWorkbenchWidgetAssignment(
      setWorkbenchWidgetTenantEnabled(
        createDefaultWorkbenchWidgetAssignment(),
        "account-panel",
        "org",
        false,
      ),
    );
    store.load();
    expect(store.isTenantEnabled("account-panel", "org")).toBe(false);

    await store.resetToDefault();
    expect(store.isTenantEnabled("account-panel", "org")).toBe(true);
    expect(store.dirty).toBe(false);
  });
});
