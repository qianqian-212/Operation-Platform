<template>
  <div class="toolbar">
    <button
      class="tree-toggle"
      type="button"
      :aria-label="collapsed ? '展开教材目录' : '收起教材目录'"
      :aria-expanded="!collapsed"
      aria-controls="collective-lesson-prep-tree"
      @click="toggleTree"
    >
      <el-icon :size="18" aria-hidden="true"><Notebook /></el-icon>
    </button>
    <div class="toolbar-filters">
      <div class="filter-item">
        <span>状态</span>
        <el-select v-model="status" placeholder="全部状态" aria-label="状态" clearable>
          <el-option label="全部状态" value="" />
          <el-option
            v-for="(meta, key) in COLLECTIVE_LESSON_PREP_STATUS_MAP"
            :key="key"
            :label="meta.label"
            :value="key"
          />
        </el-select>
      </div>
      <div class="filter-item">
        <span>科目</span>
        <el-select v-model="subject" placeholder="全部科目" aria-label="科目" clearable>
          <el-option label="全部科目" value="" />
          <el-option
            v-for="item in COLLECTIVE_LESSON_PREP_SUBJECT_OPTIONS"
            :key="item"
            :label="item"
            :value="item"
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
      <el-button @click="emit('search')">搜索</el-button>
      <el-button type="primary" :icon="Plus">发起备课</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Notebook, Plus, Search } from "@element-plus/icons-vue";
import {
  COLLECTIVE_LESSON_PREP_STATUS_MAP,
  COLLECTIVE_LESSON_PREP_SUBJECT_OPTIONS,
  type CollectiveLessonPrepStatus,
} from "@/features/collective-lesson-prep/types";

defineOptions({ name: "CollectiveLessonPrepToolbar" });

const collapsed = defineModel<boolean>("collapsed", { required: true });
const status = defineModel<CollectiveLessonPrepStatus | "">("status", { required: true });
const subject = defineModel<string>("subject", { required: true });
const keyword = defineModel<string>("keyword", { required: true });

const emit = defineEmits<{
  search: [];
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
