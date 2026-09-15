<template>
  <aside id="collective-lesson-prep-tree" class="tree-panel" aria-label="教材目录">
    <el-tree
      :key="`${expandedKeys.join('|')}:${currentNodeKey}`"
      :data="nodes"
      node-key="id"
      :props="{ label: 'label', children: 'children' }"
      :default-expanded-keys="expandedKeys"
      :current-node-key="currentNodeKey"
      highlight-current
      :expand-on-click-node="false"
      @node-click="handleNodeClick"
    >
      <template #default="{ data }">
        <span class="tree-node-label">{{ data.label }}</span>
      </template>
    </el-tree>
  </aside>
</template>

<script setup lang="ts">
import type { CurriculumNode } from "@/features/collective-lesson-prep/types";

defineOptions({ name: "CollectiveLessonPrepTree" });

defineProps<{
  /** 教材目录树 */
  nodes: CurriculumNode[];
  /** 默认展开的节点 */
  expandedKeys: string[];
  /** 当前选中节点 */
  currentNodeKey: string;
}>();

const emit = defineEmits<{
  select: [nodeId: string];
}>();

function handleNodeClick(data: CurriculumNode) {
  emit("select", data.id);
}
</script>

<style scoped>
.tree-panel {
  width: 240px;
  min-width: 200px;
  height: 100%;
  padding: var(--spacing-16) var(--spacing-12) var(--spacing-16) var(--spacing-16);
  overflow: auto;
  border-inline-end: 1px solid var(--color-border);
}

.tree-panel :deep(.el-tree) {
  background: transparent;
  --el-tree-node-hover-bg-color: var(--color-bg-muted);
  --el-tree-text-color: var(--color-body);
}

.tree-panel :deep(.el-tree-node__content) {
  height: 36px;
  border-radius: var(--radius-md);
}

.tree-panel :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: transparent;
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.tree-panel :deep(.el-tree-node__label) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-node-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
