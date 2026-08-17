import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { operationPlatformPersistence } from "@/features/persistence/runtime-operation-platform-persistence";
import {
  assignmentsEqual,
  cloneWorkbenchWidgetAssignment,
  createDefaultWorkbenchWidgetAssignment,
  isWorkbenchWidgetAssigned,
  setWorkbenchWidgetTenantEnabled,
} from "@/features/workbench/workbench-widget-assignment";
import type { WorkbenchWidgetAssignment } from "@/features/workbench/types";
import type { TenantType } from "@/types/user";

export const useWorkbenchWidgetAssignmentStore = defineStore(
  "workbench-widget-assignment",
  () => {
    const saved = ref<WorkbenchWidgetAssignment>(createDefaultWorkbenchWidgetAssignment());
    const draft = ref<WorkbenchWidgetAssignment>(createDefaultWorkbenchWidgetAssignment());
    const recoveryNotice = ref<string | null>(null);
    const saving = ref(false);
    const dirty = computed(() => !assignmentsEqual(draft.value, saved.value));

    function load() {
      const result = operationPlatformPersistence.loadWorkbenchWidgetAssignment();
      saved.value = cloneWorkbenchWidgetAssignment(result.assignment);
      draft.value = cloneWorkbenchWidgetAssignment(result.assignment);
      recoveryNotice.value = result.recoveryNotice;
    }

    function isTenantEnabled(widgetKey: string, tenantType: TenantType) {
      return isWorkbenchWidgetAssigned(draft.value, widgetKey, tenantType);
    }

    function setTenantEnabled(widgetKey: string, tenantType: TenantType, enabled: boolean) {
      draft.value = setWorkbenchWidgetTenantEnabled(
        draft.value,
        widgetKey,
        tenantType,
        enabled,
      );
    }

    async function save() {
      saving.value = true;
      try {
        const next = cloneWorkbenchWidgetAssignment(draft.value);
        next.revision = saved.value.revision + 1;
        const stored = await operationPlatformPersistence.saveWorkbenchWidgetAssignment(next);
        saved.value = cloneWorkbenchWidgetAssignment(stored);
        draft.value = cloneWorkbenchWidgetAssignment(stored);
      } finally {
        saving.value = false;
      }
    }

    async function resetToDefault() {
      saving.value = true;
      try {
        const stored = await operationPlatformPersistence.resetWorkbenchWidgetAssignment();
        saved.value = cloneWorkbenchWidgetAssignment(stored);
        draft.value = cloneWorkbenchWidgetAssignment(stored);
        recoveryNotice.value = null;
      } finally {
        saving.value = false;
      }
    }

    return {
      draft,
      saved,
      recoveryNotice,
      saving,
      dirty,
      load,
      isTenantEnabled,
      setTenantEnabled,
      save,
      resetToDefault,
    };
  },
);
