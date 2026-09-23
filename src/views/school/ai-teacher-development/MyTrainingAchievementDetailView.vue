<template>
  <div class="detail-page page-with-breadcrumb">
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: listPath }">我的成果列表</el-breadcrumb-item>
        <el-breadcrumb-item>成果详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div v-loading="loading" class="detail-body">
      <template v-if="detail">
        <AchievementDetailSummaryCard :detail="detail" @download="handleDownload" />
        <AchievementAuditPanel :records="detail.auditRecords" />
        <div class="footer-actions">
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>
      <el-empty v-else-if="!loading" description="未找到该成果" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import type { TrainingAchievementDetail } from "@/features/training-achievement/types";
import { useTrainingAchievementStore } from "@/stores/training-achievement";
import AchievementAuditPanel from "@/views/school/ai-teacher-development/AchievementAuditPanel.vue";
import AchievementDetailSummaryCard from "@/views/school/ai-teacher-development/AchievementDetailSummaryCard.vue";

defineOptions({ name: "MyTrainingAchievementDetailView" });

const listPath = "/ai-teacher-development/teaching-monitoring/achievements";
const route = useRoute();
const router = useRouter();
const achievementStore = useTrainingAchievementStore();
const loading = ref(false);
const detail = ref<TrainingAchievementDetail | null>(null);

function handleDownload(name: string) {
  ElMessage.success(`已准备下载：${name}`);
}

function goBack() {
  void router.push(listPath);
}

async function loadDetail() {
  const id = String(route.params.id ?? "");
  if (!id) {
    detail.value = null;
    return;
  }
  loading.value = true;
  try {
    detail.value = (await achievementStore.loadDetail(id)) ?? null;
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

<style scoped src="./achievement-detail-view.css"></style>
