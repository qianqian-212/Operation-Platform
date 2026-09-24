<template>
  <div class="detail-page page-with-breadcrumb">
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: listPath }">成果审核</el-breadcrumb-item>
        <el-breadcrumb-item>审核详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div v-loading="loading" class="detail-body">
      <template v-if="detail">
        <section class="summary-card">
          <div class="title-row">
            <h2 class="panel-title">成果基本信息</h2>
            <StatusTag :color="SCHOOL_ACHIEVEMENT_AUDIT_STATUS_MAP[detail.status].tagColor">
              {{ detailStatusLabel }}
            </StatusTag>
          </div>

          <div class="field-grid">
            <div class="field-item">
              <span class="field-label">成果标题</span>
              <span class="field-value">{{ detail.title }}</span>
            </div>
            <div class="field-item">
              <span class="field-label">提交教师</span>
              <span class="field-value">
                {{ detail.teacherName }} · {{ detail.schoolName }} · {{ detail.subject }}
              </span>
            </div>
            <div class="field-item">
              <span class="field-label">研修类型</span>
              <span class="field-value">
                {{ SCHOOL_ACHIEVEMENT_AUDIT_TYPE_MAP[detail.type].label }}
              </span>
            </div>
            <div class="field-item">
              <span class="field-label">等级 / 申报分值</span>
              <span class="field-value">
                {{ detail.levelLabel }} ·
                <span class="score-text">{{ detail.declaredScore }}分</span>
              </span>
            </div>
          </div>

          <div class="block-item">
            <span class="field-label">摘要</span>
            <p class="summary-desc">{{ detail.abstract }}</p>
          </div>

          <div class="block-item">
            <span class="field-label attachment-label">
              <el-icon :size="16"><Paperclip /></el-icon>
              附件材料
            </span>
            <ul v-if="detail.attachments.length" class="attachment-list">
              <li
                v-for="file in detail.attachments"
                :key="file.id"
                class="attachment-item"
              >
                <div class="file-icon" aria-hidden="true">
                  <el-icon><Document /></el-icon>
                </div>
                <div class="file-meta">
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ file.sizeLabel }}</span>
                </div>
                <span class="action-link" @click="handleDownload(file.name)">下载查看</span>
              </li>
            </ul>
            <p v-else class="field-value">暂无附件</p>
          </div>
        </section>

        <AchievementAuditPanel :records="detail.auditRecords" />

        <section v-if="detail.status === 'pending'" class="panel-card">
          <h2 class="panel-title">审核操作</h2>
          <label class="remark-label" for="school-achievement-audit-remark">
            审核备注
            <span class="remark-required">（驳回时必填）</span>
          </label>
          <el-input
            id="school-achievement-audit-remark"
            v-model="remark"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            placeholder="如驳回请填写驳回原因（必填）；通过可选填审核意见"
          />
          <div class="footer-actions">
            <el-button @click="goBack">返回列表</el-button>
            <el-button type="danger" :loading="saving" @click="handleReject">驳回</el-button>
            <el-button type="success" :loading="saving" @click="handleApprove">
              通过并提交区级
            </el-button>
          </div>
        </section>

        <div v-else class="footer-actions">
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>
      <el-empty v-else-if="!loading" description="未找到该成果" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { Document, Paperclip } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import StatusTag from "@/components/StatusTag.vue";
import {
  SCHOOL_ACHIEVEMENT_AUDIT_STATUS_MAP,
  SCHOOL_ACHIEVEMENT_AUDIT_TYPE_MAP,
} from "@/features/school-training-achievement-audit/types";
import { useSchoolTrainingAchievementAuditStore } from "@/stores/school-training-achievement-audit";
import AchievementAuditPanel from "@/views/school/ai-teacher-development/AchievementAuditPanel.vue";

defineOptions({ name: "SchoolAchievementAuditDetailView" });

const listPath = "/ai-teacher-development/teaching-monitoring/achievement-audit";
const route = useRoute();
const router = useRouter();
const auditStore = useSchoolTrainingAchievementAuditStore();
const { detail } = storeToRefs(auditStore);
const loading = ref(false);
const saving = ref(false);
const remark = ref("");

const detailStatusLabel = computed(() => {
  if (!detail.value) return "";
  if (detail.value.status === "pending") return "待校级初审";
  return SCHOOL_ACHIEVEMENT_AUDIT_STATUS_MAP[detail.value.status].label;
});

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
  remark.value = "";
  try {
    await auditStore.loadDetail(id);
  } finally {
    loading.value = false;
  }
}

async function handleApprove() {
  if (!detail.value) return;
  saving.value = true;
  try {
    await auditStore.approve(detail.value.id, remark.value.trim());
    ElMessage.success("已通过并提交区级");
    goBack();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "操作失败");
  } finally {
    saving.value = false;
  }
}

async function handleReject() {
  if (!detail.value) return;
  if (!remark.value.trim()) {
    ElMessage.warning("驳回时必须填写审核备注");
    return;
  }
  saving.value = true;
  try {
    await auditStore.reject(detail.value.id, remark.value.trim());
    ElMessage.success("已驳回");
    goBack();
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "操作失败");
  } finally {
    saving.value = false;
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

<style scoped>
.panel-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}

.block-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  min-width: 0;
}

.score-text {
  color: var(--color-success-dark-text);
  font-weight: var(--font-weight-semibold);
}

.attachment-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.attachment-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-12);
  padding: var(--spacing-12) var(--spacing-16);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
}

.file-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary-light);
  color: var(--color-primary);
  flex-shrink: 0;
}

.file-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-size: var(--font-size-md);
  color: var(--color-title);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: var(--font-size-sm);
  color: var(--color-secondary);
}

.action-link {
  color: var(--color-primary);
  cursor: pointer;
  font-size: var(--font-size-md);
  flex-shrink: 0;
}

.action-link:hover {
  color: var(--color-primary-hover);
}

.remark-label {
  display: block;
  margin-bottom: var(--spacing-8);
  color: var(--color-title);
  font-size: var(--font-size-md);
}

.remark-required {
  color: var(--color-error);
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-12);
  margin-top: var(--spacing-16);
}
</style>
