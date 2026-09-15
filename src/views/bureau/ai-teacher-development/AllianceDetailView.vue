<template>
  <div class="detail-page page-with-breadcrumb">
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: listPath }">教研联盟管理</el-breadcrumb-item>
        <el-breadcrumb-item>联盟详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div v-loading="loading" class="detail-body">
      <template v-if="detail">
        <AllianceDetailSummaryCard :detail="detail" @view-schools="schoolsVisible = true" />
        <AllianceDetailActivities :activities="detail.activities" @view="handleViewActivity" />
        <AllianceDetailSpacePanel
          :space="detail.space"
          :documents="detail.documents"
          :discussions="detail.discussions"
          @view="handleSpaceView"
          @download="handleSpaceDownload"
        />
        <AllianceDetailMemberSchools
          v-model:visible="schoolsVisible"
          :schools="detail.memberSchools"
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
const schoolsVisible = ref(false);
const detail = ref<TeachingResearchAllianceDetail | null>(null);

function handleViewActivity(activity: AllianceActivity) {
  void router.push(
    `/bureau/ai-teacher-development/cross-school-research/activities/${activity.id}`,
  );
}

function handleSpaceView(title: string) {
  ElMessage.info(`查看「${title}」即将开放`);
}

function handleSpaceDownload(title: string) {
  ElMessage.info(`下载「${title}」即将开放`);
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
.detail-body {
  flex: 1;
  overflow: auto;
  margin: 0 var(--spacing-24) var(--spacing-24);
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
}
</style>
