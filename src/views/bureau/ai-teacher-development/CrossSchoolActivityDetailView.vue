<template>
  <div class="detail-page">
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: listPath }">活动管理</el-breadcrumb-item>
        <el-breadcrumb-item>活动详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div v-loading="loading" class="detail-body">
      <template v-if="detail">
        <ActivityDetailSummaryCard :detail="detail" />
        <section class="tabs-card">
          <el-tabs v-model="activeTab" class="detail-tabs">
            <el-tab-pane label="任务分工" name="tasks" />
            <el-tab-pane label="听评课设置" name="observation" />
            <el-tab-pane label="讨论投票" name="discussion" />
            <el-tab-pane label="归档管理" name="archive" />
          </el-tabs>
          <ActivityDetailTasks v-if="activeTab === 'tasks'" :detail="detail" />
          <ActivityDetailObservation
            v-else-if="activeTab === 'observation'"
            :detail="detail"
            @updated="detail = $event"
          />
          <ActivityDetailDiscussion v-else-if="activeTab === 'discussion'" :detail="detail" />
          <ActivityDetailArchive v-else-if="activeTab === 'archive'" :detail="detail" />
        </section>
      </template>
      <el-empty v-else-if="!loading" description="未找到该活动" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { CrossSchoolActivityDetail } from "@/features/cross-school-activity/types";
import { useCrossSchoolActivityStore } from "@/stores/cross-school-activity";
import ActivityDetailArchive from "@/views/bureau/ai-teacher-development/ActivityDetailArchive.vue";
import ActivityDetailDiscussion from "@/views/bureau/ai-teacher-development/ActivityDetailDiscussion.vue";
import ActivityDetailObservation from "@/views/bureau/ai-teacher-development/ActivityDetailObservation.vue";
import ActivityDetailSummaryCard from "@/views/bureau/ai-teacher-development/ActivityDetailSummaryCard.vue";
import ActivityDetailTasks from "@/views/bureau/ai-teacher-development/ActivityDetailTasks.vue";

defineOptions({ name: "CrossSchoolActivityDetailView" });

const listPath = "/bureau/ai-teacher-development/cross-school-research/activities";
const route = useRoute();
const activityStore = useCrossSchoolActivityStore();
const loading = ref(false);
const detail = ref<CrossSchoolActivityDetail | null>(null);
const activeTab = ref("tasks");

async function loadDetail() {
  const id = String(route.params.id ?? "");
  if (!id) {
    detail.value = null;
    return;
  }
  loading.value = true;
  try {
    detail.value = (await activityStore.loadDetail(id)) ?? null;
    activeTab.value = "tasks";
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
