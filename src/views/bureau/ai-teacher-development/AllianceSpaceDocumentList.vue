<template>
  <div class="doc-list">
    <article v-for="document in documents" :key="document.id" class="doc-card">
      <div class="doc-icon" aria-hidden="true">
        <el-icon><Document /></el-icon>
      </div>
      <div class="doc-main">
        <h3 class="doc-title">{{ document.title }}</h3>
        <p class="doc-meta">
          {{ document.allianceName }} · 最后编辑：{{ document.lastEditedAt }}
        </p>
      </div>
      <div class="doc-side">
        <div v-if="document.editors.length" class="avatar-stack">
          <span v-for="editor in document.editors" :key="editor" class="avatar">
            {{ editor }}
          </span>
        </div>
        <StatusTag :color="DOCUMENT_STATUS_MAP[document.status].tagColor">
          {{ DOCUMENT_STATUS_MAP[document.status].label }}
        </StatusTag>
        <div class="doc-actions">
          <el-button
            class="doc-action"
            link
            :icon="Download"
            aria-label="下载"
            title="下载"
            @click="emit('download', document.title)"
          />
          <el-button
            class="doc-action"
            link
            :icon="View"
            aria-label="查看"
            title="查看"
            @click="emit('view', document.title)"
          />
        </div>
      </div>
    </article>
    <el-empty v-if="documents.length === 0" description="暂无在线文档" :image-size="72" />
  </div>
</template>

<script setup lang="ts">
import { Document, Download, View } from "@element-plus/icons-vue";
import StatusTag from "@/components/StatusTag.vue";
import {
  DOCUMENT_STATUS_MAP,
  type AllianceSpaceDocument,
} from "@/features/teaching-research-alliance/types";

defineOptions({ name: "AllianceSpaceDocumentList" });

defineProps<{
  /** 在线文档列表 */
  documents: AllianceSpaceDocument[];
}>();

const emit = defineEmits<{
  view: [title: string];
  download: [title: string];
}>();
</script>

<style scoped>
.doc-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
}

.doc-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-12);
  padding: var(--spacing-16);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.doc-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.doc-main {
  min-width: 0;
  flex: 1;
}

.doc-title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: var(--line-height-md);
}

.doc-meta {
  margin: var(--spacing-4) 0 0;
  font-size: var(--font-size-sm);
  color: var(--color-secondary);
  line-height: var(--line-height-md);
}

.doc-side {
  display: flex;
  align-items: center;
  gap: var(--spacing-12);
  flex-shrink: 0;
}

.avatar-stack {
  display: flex;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--color-success-dark-text);
  color: var(--color-white);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  border: 2px solid var(--color-white);
  margin-left: -6px;
}

.avatar:first-child {
  margin-left: 0;
}

.doc-actions {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-4);
}

.doc-action {
  margin: 0;
  min-width: auto;
  padding: var(--spacing-4);
  color: var(--color-secondary);
  --el-button-text-color: var(--color-secondary);
  --el-button-hover-text-color: var(--color-primary);
}

.doc-action + .doc-action {
  margin-left: 0;
}

.doc-action:hover {
  color: var(--color-primary);
}
</style>
