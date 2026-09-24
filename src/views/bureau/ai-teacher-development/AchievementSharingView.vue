<template>
  <div class="page-wrapper">
    <h1 class="sr-only">成果共享</h1>
    <AchievementSharingStats :stats="stats" />
    <section class="workspace" aria-label="教材目录与成果列表">
      <CollectiveLessonPrepTree
        v-if="!treeCollapsed"
        panel-id="achievement-sharing-tree"
        :nodes="curriculumTree"
        :expanded-keys="expandedKeys"
        :current-node-key="selectedNodeId"
        @select="handleSelectNode"
      />
      <div class="list-panel">
        <AchievementSharingToolbar
          v-model:collapsed="treeCollapsed"
          v-model:type="filterForm.type"
          v-model:keyword="filterForm.keyword"
          @search="handleSearch"
          @upload="handleUpload"
        />
        <div v-loading="loading" class="card-list">
          <AchievementSharingCard
            v-for="item in tableData"
            :key="item.id"
            :item="item"
            @download="handleDownload"
            @preview="handlePreview"
          />
          <el-empty v-if="!loading && tableData.length === 0" description="暂无成果" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import type { AchievementSharingItem } from "@/features/achievement-sharing/types";
import { useAchievementSharingStore } from "@/stores/achievement-sharing";
import AchievementSharingCard from "./AchievementSharingCard.vue";
import AchievementSharingStats from "./AchievementSharingStats.vue";
import AchievementSharingToolbar from "./AchievementSharingToolbar.vue";
import CollectiveLessonPrepTree from "./CollectiveLessonPrepTree.vue";

defineOptions({ name: "AchievementSharingView" });

const treeCollapsed = ref(false);
const sharingStore = useAchievementSharingStore();
const {
  loading,
  tableData,
  curriculumTree,
  expandedKeys,
  selectedNodeId,
  stats,
  filterForm,
} = storeToRefs(sharingStore);

onMounted(() => {
  void sharingStore.loadCurriculum();
  void sharingStore.loadList();
});

function handleSelectNode(nodeId: string) {
  void sharingStore.selectCurriculumNode(nodeId);
}

function handleSearch() {
  void sharingStore.search();
}

function handleUpload() {
  ElMessage.info("上传成果功能即将开放");
}

function handleDownload(item: AchievementSharingItem) {
  ElMessage.success(`已准备下载：${item.title}`);
}

function handlePreview(item: AchievementSharingItem) {
  ElMessage.info(`预览：${item.title}`);
}
</script>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
  height: calc(100vh - var(--header-height) - 2 * var(--content-padding));
  min-height: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.workspace {
  display: flex;
  flex: 1;
  min-height: 0;
  background: var(--color-white);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.list-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  padding: var(--spacing-16) var(--spacing-20);
}

.card-list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-16);
  min-height: 0;
  overflow: auto;
  padding-inline-end: var(--spacing-4);
  padding-bottom: var(--spacing-12);
}
</style>
