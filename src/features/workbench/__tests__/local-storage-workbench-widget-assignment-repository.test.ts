import { beforeEach, describe, expect, it } from "vitest";
import {
  LocalStorageWorkbenchWidgetAssignmentRepository,
  WorkbenchWidgetAssignmentPersistenceError,
  workbenchWidgetAssignmentStorageKey,
} from "@/features/workbench/local-storage-workbench-widget-assignment-repository";
import {
  createDefaultWorkbenchWidgetAssignment,
  setWorkbenchWidgetTenantEnabled,
} from "@/features/workbench/workbench-widget-assignment";

describe("workbench widget assignment repository", () => {
  beforeEach(() => localStorage.clear());

  it("returns the template-derived default without writing storage", () => {
    const repository = new LocalStorageWorkbenchWidgetAssignmentRepository(localStorage);
    const result = repository.list();

    expect(result.recoveryNotice).toBeNull();
    expect(result.assignment).toEqual(createDefaultWorkbenchWidgetAssignment());
    expect(localStorage.getItem(workbenchWidgetAssignmentStorageKey())).toBeNull();
  });

  it("persists an edited assignment and restores a defensive copy", () => {
    const repository = new LocalStorageWorkbenchWidgetAssignmentRepository(localStorage);
    const saved = repository.replace(
      setWorkbenchWidgetTenantEnabled(
        createDefaultWorkbenchWidgetAssignment(),
        "school.attendance-trend",
        "school",
        false,
      ),
    );

    const loaded = repository.list();
    expect(loaded.assignment.widgets["school.attendance-trend"]?.tenantTypes).not.toContain("school");
    loaded.assignment.widgets["school.attendance-trend"] = {
      tenantTypes: ["school"],
      profiles: ["admin"],
    };
    expect(repository.list().assignment.widgets["school.attendance-trend"]?.tenantTypes)
      .toEqual(saved.widgets["school.attendance-trend"]?.tenantTypes);
  });

  it("backs up invalid data and restores the default assignment", () => {
    const raw = JSON.stringify({ version: 99, widgets: {} });
    localStorage.setItem(workbenchWidgetAssignmentStorageKey(), raw);
    const repository = new LocalStorageWorkbenchWidgetAssignmentRepository(localStorage, () => 42);

    const result = repository.list();
    expect(result.recoveryNotice).toContain("已恢复默认授权");
    expect(result.assignment).toEqual(createDefaultWorkbenchWidgetAssignment());
    expect(localStorage.getItem("operation-platform:workbench-widget-assignment:invalid:42"))
      .toBe(raw);
  });

  it("throws a typed error when persistence fails", () => {
    const storage: Storage = {
      length: 0,
      clear() {},
      getItem() {
        return null;
      },
      key() {
        return null;
      },
      removeItem() {},
      setItem() {
        throw new DOMException("quota", "QuotaExceededError");
      },
    };
    const repository = new LocalStorageWorkbenchWidgetAssignmentRepository(storage);

    expect(() => repository.replace(createDefaultWorkbenchWidgetAssignment()))
      .toThrow(WorkbenchWidgetAssignmentPersistenceError);
  });
});
