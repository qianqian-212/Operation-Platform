<template>
  <div class="toolbar">
    <button
      class="tree-toggle"
      type="button"
      :aria-label="collapsed ? '展开教材目录' : '收起教材目录'"
      :aria-expanded="!collapsed"
      aria-controls="achievement-sharing-tree"
      @click="toggleTree"
    >
      <el-icon :size="18" aria-hidden="true"><Notebook /></el-icon>
    </button>
    <div class="toolbar-filters">
      <div class="filter-item">
        <span>类型</span>
        <el-select v-model="type" placeholder="全部类型" aria-label="类型" clearable>
          <el-option label="全部类型" value="" />
          <el-option
            v-for="item in ACHIEVEMENT_SHARING_TYPE_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <el-input
        v-model="keyword"
        class="keyword-input"
        placeholder="请输入关键词"
        aria-label="请输入关键词"
        :prefix-icon="Search"
        clearable
        @keyup.enter="emit('search')"
      />
      <el-button type="primary" @click="emit('search')">搜索</el-button>
      <el-button type="primary" :icon="Plus" @click="emit('upload')">上传成果</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Notebook, Plus, Search } from "@element-plus/icons-vue";
import {
  ACHIEVEMENT_SHARING_TYPE_OPTIONS,
  type AchievementSharingType,
} from "@/features/achievement-sharing/types";

defineOptions({ name: "AchievementSharingToolbar" });

const collapsed = defineModel<boolean>("collapsed", { required: true });
const type = defineModel<AchievementSharingType | "">("type", { required: true });
const keyword = defineModel<string>("keyword", { required: true });

const emit = defineEmits<{
  search: [];
  upload: [];
}>();

function toggleTree() {
  collapsed.value = !collapsed.value;
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-16);
  flex-shrink: 0;
  padding-bottom: var(--spacing-16);
}

.tree-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-secondary);
  cursor: pointer;
  flex-shrink: 0;
}

.tree-toggle:hover {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.toolbar-filters {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: var(--spacing-12);
  min-width: 0;
}

.filter-item {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-8);
  min-width: 0;
}

.filter-item span {
  font-size: var(--font-size-md);
  color: var(--color-title);
  white-space: nowrap;
}

.filter-item :deep(.el-select) {
  width: 140px;
  --el-input-height: 32px;
}

.keyword-input {
  width: 200px;
  --el-input-height: 32px;
}
</style>
