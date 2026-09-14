<template>
  <section class="space-panel">
    <div class="space-header">
      <h2 class="space-title">联盟专属空间</h2>
      <p class="space-subtitle">{{ space.title }}</p>
    </div>

    <div class="toolbar">
      <WorkbenchSecondaryTabs
        v-model="activeTab"
        :options="tabs"
        aria-label="联盟专属空间分类"
      />
      <el-button type="primary" :icon="Plus" @click="emit('create', activeTab)">
        {{ actionLabel }}
      </el-button>
    </div>

    <div class="space-content">
      <AllianceSpaceDocumentList
        v-if="activeTab === 'documents'"
        :documents="documents"
        @view="emit('view', $event)"
        @download="emit('download', $event)"
      />
      <AllianceSpaceDiscussionList
        v-else-if="activeTab === 'discussions'"
        :discussions="discussions"
      />
      <el-empty v-else description="文件共享即将开放" :image-size="72" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Plus } from "@element-plus/icons-vue";
import type {
  AllianceSpaceDiscussion,
  AllianceSpaceDocument,
  AllianceSpaceSummary,
  AllianceSpaceTab,
} from "@/features/teaching-research-alliance/types";
import WorkbenchSecondaryTabs from "@/features/workbench/components/WorkbenchSecondaryTabs.vue";
import AllianceSpaceDiscussionList from "@/views/bureau/ai-teacher-development/AllianceSpaceDiscussionList.vue";
import AllianceSpaceDocumentList from "@/views/bureau/ai-teacher-development/AllianceSpaceDocumentList.vue";

defineOptions({ name: "AllianceDetailSpacePanel" });

defineProps<{
  /** 专属空间摘要 */
  space: AllianceSpaceSummary;
  /** 在线文档 */
  documents: AllianceSpaceDocument[];
  /** 讨论区 */
  discussions: AllianceSpaceDiscussion[];
}>();

const emit = defineEmits<{
  create: [tab: AllianceSpaceTab];
  view: [title: string];
  download: [title: string];
}>();

const activeTab = ref<AllianceSpaceTab>("documents");

const tabs = [
  { label: "在线文档", value: "documents" },
  { label: "讨论区", value: "discussions" },
  { label: "文件共享", value: "files" },
] as const;

const actionLabel = computed(() => {
  if (activeTab.value === "discussions") return "发起讨论";
  if (activeTab.value === "files") return "上传文件";
  return "新建文档";
});
</script>

<style scoped>
.space-panel {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-24);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
}

.space-header {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-12);
  flex-wrap: wrap;
}

.space-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}

.space-subtitle {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-secondary);
  line-height: var(--line-height-md);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-16);
  flex-wrap: wrap;
}

.space-content {
  min-height: 200px;
}
</style>
