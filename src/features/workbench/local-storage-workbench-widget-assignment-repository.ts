import {
  cloneWorkbenchWidgetAssignment,
  createDefaultWorkbenchWidgetAssignment,
  reconcileWorkbenchWidgetAssignment,
} from "@/features/workbench/workbench-widget-assignment";
import type { WorkbenchWidgetAssignment } from "@/features/workbench/types";

const STORAGE_KEY = "operation-platform:workbench-widget-assignment:v1";
const INVALID_STORAGE_PREFIX = "operation-platform:workbench-widget-assignment:invalid:";

export function workbenchWidgetAssignmentStorageKey() {
  return STORAGE_KEY;
}

export class WorkbenchWidgetAssignmentPersistenceError extends Error {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "WorkbenchWidgetAssignmentPersistenceError";
    this.cause = cause;
  }
}

export class LocalStorageWorkbenchWidgetAssignmentRepository {
  constructor(
    private readonly storage: Storage,
    private readonly now: () => number = Date.now,
  ) {}

  list(): { assignment: WorkbenchWidgetAssignment; recoveryNotice: string | null } {
    const raw = this.storage.getItem(STORAGE_KEY);
    if (raw === null) {
      return {
        assignment: createDefaultWorkbenchWidgetAssignment(),
        recoveryNotice: null,
      };
    }
    try {
      const reconciled = reconcileWorkbenchWidgetAssignment(JSON.parse(raw) as unknown);
      if (!reconciled) return this.recoverInvalid(raw);
      return {
        assignment: cloneWorkbenchWidgetAssignment(reconciled),
        recoveryNotice: null,
      };
    } catch (error) {
      if (error instanceof WorkbenchWidgetAssignmentPersistenceError) throw error;
      return this.recoverInvalid(raw);
    }
  }

  replace(assignment: WorkbenchWidgetAssignment) {
    const reconciled = reconcileWorkbenchWidgetAssignment(assignment);
    if (!reconciled) {
      throw new WorkbenchWidgetAssignmentPersistenceError("工作台组件授权不完整，无法保存");
    }
    const cloned = cloneWorkbenchWidgetAssignment({
      ...reconciled,
      revision: assignment.revision,
    });
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(cloned));
    } catch (error) {
      throw new WorkbenchWidgetAssignmentPersistenceError(
        "工作台组件授权保存失败，请检查浏览器存储空间",
        error,
      );
    }
    return cloneWorkbenchWidgetAssignment(cloned);
  }

  reset() {
    try {
      this.storage.removeItem(STORAGE_KEY);
    } catch (error) {
      throw new WorkbenchWidgetAssignmentPersistenceError("恢复默认工作台组件授权失败", error);
    }
    return createDefaultWorkbenchWidgetAssignment();
  }

  private recoverInvalid(raw: string) {
    try {
      this.storage.setItem(`${INVALID_STORAGE_PREFIX}${this.now()}`, raw);
    } catch (error) {
      throw new WorkbenchWidgetAssignmentPersistenceError(
        "工作台组件授权备份失败，无法恢复默认授权",
        error,
      );
    }
    try {
      this.storage.removeItem(STORAGE_KEY);
    } catch (error) {
      throw new WorkbenchWidgetAssignmentPersistenceError(
        "工作台组件授权已备份，但恢复默认授权失败",
        error,
      );
    }
    return {
      assignment: createDefaultWorkbenchWidgetAssignment(),
      recoveryNotice: "检测到无效工作台组件授权，已恢复默认授权",
    };
  }
}

export const workbenchWidgetAssignmentRepository =
  new LocalStorageWorkbenchWidgetAssignmentRepository(window.localStorage);
