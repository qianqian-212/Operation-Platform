<template>
  <div class="detail-page page-with-breadcrumb">
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: listPath }">课程审核</el-breadcrumb-item>
        <el-breadcrumb-item>审核详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div v-loading="loading" class="detail-body">
      <template v-if="detail">
        <section class="summary-card">
          <div class="title-row">
            <h1 class="summary-title">{{ detail.title }}</h1>
            <StatusTag :color="statusMeta.tagColor">{{ statusMeta.label }}</StatusTag>
          </div>
          <div class="intro-block">
            <p class="field-label">课程简介</p>
            <p class="summary-desc">{{ detail.summary }}</p>
          </div>
          <dl class="meta-list">
            <div v-for="field in metaFields" :key="field.label" class="meta-item">
              <dt class="field-label">{{ field.label }}</dt>
              <dd class="field-value">{{ field.value }}</dd>
            </div>
          </dl>
        </section>

        <section class="panel-card">
          <h2 class="panel-title">{{ lessonHeading }}</h2>
          <el-table :data="detail.lessons" border>
            <el-table-column prop="indexLabel" label="课时" width="100" />
            <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
            <el-table-column prop="durationLabel" label="时长" width="110" />
            <el-table-column label="文件" width="120">
              <template #default="{ row }: { row: LayeredTrainingCourseLesson }">
                <span v-if="row.uploaded" class="file-status">
                  <el-icon><CircleCheck /></el-icon>
                  已上传
                </span>
                <span v-else>未上传</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="130">
              <template #default="{ row }: { row: LayeredTrainingCourseLesson }">
                <button type="button" class="lesson-action" @click="openLesson(row)">
                  <el-icon><VideoPlay /></el-icon>
                  在线查看
                </button>
              </template>
            </el-table-column>
          </el-table>
        </section>

        <section class="panel-card">
          <h2 class="panel-title">审核意见</h2>
          <template v-if="canReview">
            <label class="sr-only" for="layered-training-review-comment">审核意见</label>
            <el-input
              id="layered-training-review-comment"
              v-model="remark"
              type="textarea"
              :rows="4"
              maxlength="200"
              show-word-limit
              placeholder="如驳回，请填写驳回原因（必填）"
            />
          </template>
          <p v-else class="comment-text">{{ detail.reviewComment || "暂无审核意见" }}</p>
          <div class="footer-actions">
            <el-button v-if="canReview" type="success" :loading="saving" @click="handleApprove">
              通过
            </el-button>
            <el-button v-if="canReview" type="danger" :loading="saving" @click="handleReject">
              驳回
            </el-button>
            <el-button @click="goBack">返回列表</el-button>
          </div>
        </section>
      </template>
      <el-empty v-else-if="!loading" description="未找到该课程" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { CircleCheck, VideoPlay } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import StatusTag from "@/components/StatusTag.vue";
import {
  LAYERED_TRAINING_COURSE_KIND_MAP,
  LAYERED_TRAINING_COURSE_STATUS_MAP,
  type LayeredTrainingCourseDetail,
  type LayeredTrainingCourseLesson,
} from "@/features/layered-training-course-review/types";
import { useLayeredTrainingCourseReviewStore } from "@/stores/layered-training-course-review";

defineOptions({ name: "LayeredTrainingCourseReviewDetailView" });

const listPath = "/bureau/ai-teacher-development/layered-training/course-review";
const route = useRoute();
const router = useRouter();
const reviewStore = useLayeredTrainingCourseReviewStore();
const { detail } = storeToRefs(reviewStore);
const loading = ref(false);
const saving = ref(false);
const remark = ref("");

const canReview = computed(() => detail.value?.status === "pending");
const statusMeta = computed(() => {
  const status = detail.value?.status ?? "pending";
  return LAYERED_TRAINING_COURSE_STATUS_MAP[status];
});
const metaFields = computed(() => (detail.value ? courseMetaFields(detail.value) : []));
const lessonHeading = computed(() => {
  if (!detail.value) return "";
  const media = detail.value.kind === "video" ? "视频" : "资料";
  return `课时列表（${detail.value.lessonCountLabel}）· 点击可在线查看${media}`;
});

function courseMetaFields(current: LayeredTrainingCourseDetail) {
  return [
    { label: "课程类型", value: LAYERED_TRAINING_COURSE_KIND_MAP[current.kind].label },
    { label: "所属学科", value: current.subject },
    { label: "适用学段", value: current.stageLabel },
    { label: "适用分组", value: current.groups.join("、") },
    { label: "上传单位", value: `${current.schoolName} · ${current.uploaderName}` },
  ];
}

function goBack() {
  void router.push(listPath);
}

function openLesson(lesson: LayeredTrainingCourseLesson) {
  if (!lesson.uploaded) {
    ElMessage.warning("文件尚未上传");
    return;
  }
  ElMessage.success(`正在打开：${lesson.title}`);
}

async function loadDetail() {
  const id = typeof route.params.id === "string" ? route.params.id : "";
  loading.value = true;
  remark.value = "";
  try {
    await reviewStore.loadDetail(id);
  } finally {
    loading.value = false;
  }
}

async function submitReview(approved: boolean) {
  const current = detail.value;
  if (!current) return;
  const comment = remark.value.trim();
  if (!approved && !comment) {
    ElMessage.warning("驳回时必须填写驳回原因");
    return;
  }
  saving.value = true;
  try {
    if (approved) await reviewStore.approve(current.id, comment);
    else await reviewStore.reject(current.id, comment);
    ElMessage.success(approved ? "已通过" : "已驳回");
    goBack();
  } catch (error) {
    const message = error instanceof Error ? error.message : "操作失败";
    ElMessage.error(message);
  } finally {
    saving.value = false;
  }
}

function handleApprove() {
  void submitReview(true);
}

function handleReject() {
  void submitReview(false);
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

<style scoped src="./layered-training-course-detail.css"></style>
