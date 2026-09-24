<template>
  <div class="detail-page page-with-breadcrumb">
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: listPath }">{{ listLabel }}</el-breadcrumb-item>
        <el-breadcrumb-item>听评课详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div v-loading="loading" class="detail-body">
      <template v-if="detail">
        <LessonObservationSummaryCard :detail="detail" />
        <section class="tabs-card">
          <div class="tabs-head">
            <div class="report-tabs" role="tablist" aria-label="听评课详情分区">
              <button
                v-for="tab in detailTabs"
                :key="tab.key"
                type="button"
                role="tab"
                class="report-tab"
                :class="{ 'is-active': activeTab === tab.key }"
                :aria-selected="activeTab === tab.key"
                @click="activeTab = tab.key"
              >
                {{ tab.label }}
              </button>
            </div>
            <el-button
              v-if="activeTab === 'report'"
              class="export-btn"
              type="primary"
              @click="handleExport"
            >
              导出报告
            </el-button>
          </div>
          <LessonObservationReport v-if="activeTab === 'report'" :detail="detail" />
          <LessonObservationReviewers v-else :reviewers="detail.reviewers" />
        </section>
        <LessonObservationArchives :archives="detail.archives" @download="handleDownload" />
      </template>
      <el-empty v-else-if="!loading" description="未找到该听评课记录" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { crossSchoolLessonObservationListPath } from "@/features/cross-school-activity/cross-school-paths";
import type { LessonObservationDetail } from "@/features/lesson-observation/types";
import { useLessonObservationStore } from "@/stores/lesson-observation";
import LessonObservationArchives from "@/views/bureau/ai-teacher-development/LessonObservationArchives.vue";
import LessonObservationReport from "@/views/bureau/ai-teacher-development/LessonObservationReport.vue";
import LessonObservationReviewers from "@/views/bureau/ai-teacher-development/LessonObservationReviewers.vue";
import LessonObservationSummaryCard from "@/views/bureau/ai-teacher-development/LessonObservationSummaryCard.vue";

defineOptions({ name: "LessonObservationDetailView" });

const detailTabs = [
  { key: "report", label: "课程评价报告" },
  { key: "reviewers", label: "评课明细" },
] as const;
const route = useRoute();
const listPath = computed(() => crossSchoolLessonObservationListPath(route.path));
const listLabel = "听评课管理";
const observationStore = useLessonObservationStore();
const loading = ref(false);
const detail = ref<LessonObservationDetail | null>(null);
const activeTab = ref<(typeof detailTabs)[number]["key"]>("report");

function handleExport() {
  ElMessage.success("报告导出已开始");
}

function handleDownload(title: string) {
  ElMessage.success(`开始下载「${title}」`);
}

async function loadDetail() {
  const id = String(route.params.id ?? "");
  if (!id) {
    detail.value = null;
    return;
  }
  loading.value = true;
  try {
    detail.value = (await observationStore.loadDetail(id)) ?? null;
    activeTab.value = "report";
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

<style scoped src="./lesson-observation-detail.css"></style>
