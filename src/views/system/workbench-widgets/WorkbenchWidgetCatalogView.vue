<template>
  <div class="platform-admin-page">
    <PageFilterBar>
      <div class="filter-item">
        <span class="filter-label">组件范围</span>
        <el-select v-model="scopeFilter" clearable placeholder="全部范围" aria-label="组件范围">
          <el-option
            v-for="option in scopeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>
      <div class="filter-item">
        <span class="filter-label">组织类型</span>
        <el-select v-model="typeFilter" clearable placeholder="全部类型" aria-label="组织类型">
          <el-option
            v-for="option in TENANT_TYPE_OPTIONS"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>
      <div class="filter-item filter-item--wide">
        <span class="filter-label">组件名称</span>
        <el-input v-model="keyword" clearable placeholder="搜索名称或说明" aria-label="组件名称" />
      </div>
      <template #actions></template>
    </PageFilterBar>

    <el-alert
      v-if="recoveryNotice"
      class="page-alert"
      :title="recoveryNotice"
      type="warning"
      show-icon
      :closable="false"
    />

    <section class="table-card">
      <div class="table-toolbar">
        <div>
          <strong>工作台组件管理</strong>
          <span class="record-count">共 {{ filteredRows.length }} 个组件</span>
        </div>
        <div class="toolbar-actions">
          <el-button :icon="RefreshLeft" :disabled="saving" @click="handleReset">
            恢复默认授权
          </el-button>
          <el-button
            type="primary"
            :icon="Check"
            :disabled="!dirty || saving"
            :loading="saving"
            @click="handleSave"
          >
            保存授权
          </el-button>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table :data="filteredRows" row-key="key" stripe border>
          <el-table-column label="组件" min-width="240" fixed="left" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="primary-cell">
                <strong>{{ row.title }}</strong>
                <span>{{ row.description }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="范围" width="120">
            <template #default="{ row }: { row: WorkbenchWidgetDefinition }">
              <el-tag :type="row.scope === 'common' ? 'primary' : 'warning'" effect="plain">
                {{ WORKBENCH_WIDGET_SCOPE_LABEL[row.scope] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="组件类型" width="120">
            <template #default="{ row }: { row: WorkbenchWidgetDefinition }">
              {{ WORKBENCH_WIDGET_KIND_LABEL[row.kind] }}
            </template>
          </el-table-column>
          <el-table-column label="适用角色" min-width="140" show-overflow-tooltip>
            <template #default="{ row }">
              {{ workbenchProfileHint(row.compatibleProfiles) }}
            </template>
          </el-table-column>
          <el-table-column label="授权组织类型" min-width="360">
            <template #default="{ row }">
              <div class="tenant-toggles">
                <el-checkbox
                  v-for="option in TENANT_TYPE_OPTIONS"
                  :key="option.value"
                  :model-value="isTenantEnabled(row.key, option.value)"
                  :disabled="!row.compatibleTenantTypes.includes(option.value)"
                  :aria-label="`${row.title}授权给${option.label}`"
                  @change="(value: boolean) => handleToggle(row.key, option.value, value)"
                >
                  {{ option.label }}
                </el-checkbox>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { ElMessage, ElMessageBox } from "element-plus";
import { Check, RefreshLeft } from "@element-plus/icons-vue";
import PageFilterBar from "@/components/PageFilterBar.vue";
import { TENANT_TYPE_OPTIONS } from "@/config/tenant";
import {
  WORKBENCH_WIDGET_KIND_LABEL,
  WORKBENCH_WIDGET_SCOPE_LABEL,
  workbenchProfileHint,
} from "@/features/workbench/workbench-widget-labels";
import { workbenchWidgetCatalog } from "@/features/workbench/workbench-widget-catalog";
import { useWorkbenchWidgetAssignmentStore } from "@/stores/workbench-widget-assignment";
import type { WorkbenchWidgetDefinition, WorkbenchWidgetScope } from "@/features/workbench/types";
import type { TenantType } from "@/types/user";

defineOptions({ name: "WorkbenchWidgetCatalogView" });

const store = useWorkbenchWidgetAssignmentStore();
const { dirty, saving, recoveryNotice } = storeToRefs(store);
store.load();

const keyword = ref("");
const scopeFilter = ref<WorkbenchWidgetScope | "">("");
const typeFilter = ref<TenantType | "">("");
const scopeOptions = [
  { value: "common" as const, label: WORKBENCH_WIDGET_SCOPE_LABEL.common },
  { value: "domain" as const, label: WORKBENCH_WIDGET_SCOPE_LABEL.domain },
];

const filteredRows = computed(() => {
  const query = keyword.value.trim().toLowerCase();
  return workbenchWidgetCatalog.filter((row) => {
    if (scopeFilter.value && row.scope !== scopeFilter.value) return false;
    if (typeFilter.value && !row.compatibleTenantTypes.includes(typeFilter.value)) return false;
    if (!query) return true;
    return `${row.title}${row.description}${row.key}`.toLowerCase().includes(query);
  });
});

function isTenantEnabled(widgetKey: string, tenantType: TenantType) {
  return store.isTenantEnabled(widgetKey, tenantType);
}

function handleToggle(widgetKey: string, tenantType: TenantType, enabled: boolean) {
  try {
    store.setTenantEnabled(widgetKey, tenantType, enabled);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "组件授权更新失败");
  }
}

async function handleSave() {
  try {
    await store.save();
    ElMessage.success("工作台组件授权已保存");
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "工作台组件授权保存失败");
  }
}

async function handleReset() {
  try {
    await ElMessageBox.confirm(
      "确认恢复代码模板中的默认授权？当前未保存的修改会丢失。",
      "恢复默认授权",
      { type: "warning", confirmButtonText: "恢复", cancelButtonText: "取消" },
    );
  } catch {
    return;
  }
  try {
    await store.resetToDefault();
    ElMessage.success("已恢复默认工作台组件授权");
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "恢复默认授权失败");
  }
}
</script>

<style scoped>
.platform-admin-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  width: 240px;
  min-width: 0;
}

.filter-item--wide {
  width: 320px;
}

.filter-label {
  flex-shrink: 0;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.filter-item :deep(.el-select),
.filter-item :deep(.el-input) {
  flex: 1;
  min-width: 0;
}

.table-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: var(--spacing-24);
  background: var(--color-white);
}

.table-toolbar {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-16);
  margin-bottom: var(--spacing-16);
}

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-8);
}

.table-wrapper {
  flex: 0 1 auto;
  min-height: 0;
  overflow: auto;
}

.table-wrapper :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.record-count {
  margin-left: var(--spacing-12);
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.primary-cell {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.primary-cell span {
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.tenant-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-8) var(--spacing-16);
}

.page-alert {
  flex-shrink: 0;
  margin: var(--spacing-16) var(--spacing-24) 0;
}

@media (max-width: 767px) {
  .filter-item,
  .filter-item--wide {
    width: 100%;
  }

  .table-card {
    padding: var(--spacing-16);
  }

  .table-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
