<template>
  <div class="detail-page">
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: listPath }">教研联盟管理</el-breadcrumb-item>
        <el-breadcrumb-item>联盟详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div v-loading="loading" class="detail-body">
      <template v-if="detail">
        <AllianceDetailSummaryCard :detail="detail" />
        <AllianceDetailMemberSchools :schools="detail.memberSchools" />
        <AllianceDetailActivities :activities="detail.activities" @view="handleViewActivity" />
        <AllianceDetailSpacePanel
          :space="detail.space"
          :documents="detail.documents"
          :discussions="detail.discussions"
          @create="handleSpaceCreate"
        />
      </template>
      <el-empty v-else-if="!loading" description="未找到该联盟" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import type {
  AllianceActivity,
  AllianceSpaceTab,
  TeachingResearchAllianceDetail,
} from "@/features/teaching-research-alliance/types";
import { useTeachingResearchAllianceStore } from "@/stores/teaching-research-alliance";
import AllianceDetailActivities from "@/views/bureau/ai-teacher-development/AllianceDetailActivities.vue";
import AllianceDetailMemberSchools from "@/views/bureau/ai-teacher-development/AllianceDetailMemberSchools.vue";
import AllianceDetailSpacePanel from "@/views/bureau/ai-teacher-development/AllianceDetailSpacePanel.vue";
import AllianceDetailSummaryCard from "@/views/bureau/ai-teacher-development/AllianceDetailSummaryCard.vue";

defineOptions({ name: "AllianceDetailView" });

const listPath = "/bureau/ai-teacher-development/cross-school-research/alliance";
const route = useRoute();
const router = useRouter();
const allianceStore = useTeachingResearchAllianceStore();
const loading = ref(false);
const detail = ref<TeachingResearchAllianceDetail | null>(null);

function handleViewActivity(activity: AllianceActivity) {
  void router.push(
    `/bureau/ai-teacher-development/cross-school-research/activities/${activity.id}`,
  );
}

function handleSpaceCreate(tab: AllianceSpaceTab) {
  const label =
    tab === "discussions" ? "发起讨论" : tab === "files" ? "上传文件" : "新建文档";
  ElMessage.info(`「${label}」即将开放`);
}

async function loadDetail() {
  const id = String(route.params.id ?? "");
  if (!id) {
    detail.value = null;
    return;
  }
  loading.value = true;
  try {
    detail.value = (await allianceStore.loadDetail(id)) ?? null;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadDetail();
});

watch(
  () => route.params.id,
  () => {
    void loadDetail();
  },
  { flush: "post" },
);
</script>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg);
}

.breadcrumb-bar {
  padding: var(--spacing-16) var(--spacing-24);
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.detail-body {
  flex: 1;
  overflow: auto;
  padding: var(--spacing-24);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
}
</style>
