<template>
  <div class="detail-page">
    <div class="detail-header">
      <h1 class="detail-title">{{ headerTitle }}</h1>
      <el-button @click="goBack">返回</el-button>
    </div>

    <el-tabs v-model="activeTab" class="detail-tabs">
      <el-tab-pane label="概览" name="overview" />
      <el-tab-pane
        v-if="detail?.type === 'lesson-prep'"
        label="任务分工"
        name="tasks"
      />
      <el-tab-pane
        v-if="detail?.type === 'lesson-observation'"
        label="听评设置"
        name="observation"
      />
      <el-tab-pane label="讨论投票" name="discussion" />
      <el-tab-pane label="归档管理" name="archive" />
    </el-tabs>

    <div v-loading="loading" class="detail-body">
      <template v-if="detail">
        <ActivityDetailOverview v-if="activeTab === 'overview'" :detail="detail" />
        <ActivityDetailTasks v-else-if="activeTab === 'tasks'" :detail="detail" />
        <ActivityDetailObservation v-else-if="activeTab === 'observation'" :detail="detail" />
        <ActivityDetailDiscussion v-else-if="activeTab === 'discussion'" :detail="detail" />
        <ActivityDetailArchive v-else-if="activeTab === 'archive'" :detail="detail" />
      </template>
      <el-empty v-else-if="!loading" description="未找到该活动" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { CrossSchoolActivityDetail } from "@/features/cross-school-activity/types";
import { useCrossSchoolActivityStore } from "@/stores/cross-school-activity";
import ActivityDetailArchive from "@/views/bureau/ai-teacher-development/ActivityDetailArchive.vue";
import ActivityDetailDiscussion from "@/views/bureau/ai-teacher-development/ActivityDetailDiscussion.vue";
import ActivityDetailObservation from "@/views/bureau/ai-teacher-development/ActivityDetailObservation.vue";
import ActivityDetailOverview from "@/views/bureau/ai-teacher-development/ActivityDetailOverview.vue";
import ActivityDetailTasks from "@/views/bureau/ai-teacher-development/ActivityDetailTasks.vue";

defineOptions({ name: "CrossSchoolActivityDetailView" });

const listPath = "/bureau/ai-teacher-development/cross-school-research/activities";
const route = useRoute();
const router = useRouter();
const activityStore = useCrossSchoolActivityStore();
const loading = ref(false);
const detail = ref<CrossSchoolActivityDetail | null>(null);
const activeTab = ref("overview");

const headerTitle = computed(() => detail.value?.name ?? "跨校教研活动详情");

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
    detail.value = (await activityStore.loadDetail(id)) ?? null;
    activeTab.value = "overview";
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

<style scoped src="./activity-detail-view.css"></style>
