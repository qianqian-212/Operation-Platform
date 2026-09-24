<template>
  <div class="page-wrapper">
    <h1 class="sr-only">{{ pageTitle }}</h1>
    <CollectiveLessonPrepStats :stats="stats" />
    <section class="workspace" aria-label="备课目录与列表">
      <CollectiveLessonPrepTree
        v-if="!treeCollapsed"
        :nodes="curriculumTree"
        :expanded-keys="expandedKeys"
        :current-node-key="selectedNodeId"
        @select="handleSelectNode"
      />
      <div class="list-panel">
        <CollectiveLessonPrepToolbar
          v-model:collapsed="treeCollapsed"
          v-model:status="filterForm.status"
          v-model:subject="filterForm.subject"
          v-model:keyword="filterForm.keyword"
          @search="handleSearch"
        />
        <div v-loading="loading" class="card-list">
          <CollectiveLessonPrepCard
            v-for="item in tableData"
            :key="item.id"
            :item="item"
          />
          <el-empty v-if="!loading && tableData.length === 0" description="暂无备课记录" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useCollectiveLessonPrepStore } from "@/stores/collective-lesson-prep";
import CollectiveLessonPrepCard from "./CollectiveLessonPrepCard.vue";
import CollectiveLessonPrepStats from "./CollectiveLessonPrepStats.vue";
import CollectiveLessonPrepToolbar from "./CollectiveLessonPrepToolbar.vue";
import CollectiveLessonPrepTree from "./CollectiveLessonPrepTree.vue";

defineOptions({ name: "CollectiveLessonPrepView" });

const pageTitle = "集体备课管理";
const treeCollapsed = ref(false);
const prepStore = useCollectiveLessonPrepStore();
const {
  loading,
  tableData,
  curriculumTree,
  expandedKeys,
  selectedNodeId,
  stats,
  filterForm,
} = storeToRefs(prepStore);

onMounted(() => {
  void prepStore.loadCurriculum();
  void prepStore.loadList();
});

function handleSelectNode(nodeId: string) {
  void prepStore.selectCurriculumNode(nodeId);
}

function handleSearch() {
  void prepStore.search();
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
