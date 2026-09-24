<template>
  <el-drawer
    v-model="visible"
    title="终审详情"
    size="600px"
    destroy-on-close
    class="achievement-review-detail-drawer"
  >
    <template v-if="detail">
      <div class="drawer-body">
        <div class="summary-block">
          <p class="code">成果编号：{{ detail.code }}</p>
          <div class="title-row">
            <h2 class="title">{{ detail.title }}</h2>
            <StatusTag :color="ACHIEVEMENT_REVIEW_STATUS_MAP[detail.status].tagColor">
              {{ ACHIEVEMENT_REVIEW_STATUS_MAP[detail.status].label }}
            </StatusTag>
          </div>
        </div>

        <ul class="meta-list">
          <li class="meta-item">
            <el-icon class="meta-icon" :size="16"><User /></el-icon>
            <span>
              提交教师：{{ detail.teacherName }}，{{ detail.schoolName }} · {{ detail.subject }}
            </span>
          </li>
          <li class="meta-item">
            <el-icon class="meta-icon" :size="16"><Document /></el-icon>
            <span>研修类型：{{ ACHIEVEMENT_REVIEW_TYPE_MAP[detail.type].label }}</span>
          </li>
          <li class="meta-item">
            <el-icon class="meta-icon" :size="16"><Medal /></el-icon>
            <span>等级/申报分值：{{ detail.levelLabel }}/{{ detail.scoreLabel }}分</span>
          </li>
        </ul>

        <section class="attachment-section">
          <h3 class="attachment-heading">
            <el-icon class="attachment-icon" :size="16"><Paperclip /></el-icon>
            <span>附件材料：</span>
          </h3>
          <ul class="file-list">
            <li v-for="file in detail.attachments" :key="file.id" class="file-card">
              <span class="file-icon" aria-hidden="true">W</span>
              <span class="file-meta">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ file.sizeLabel }}</span>
              </span>
              <el-button
                class="file-action"
                link
                :icon="View"
                aria-label="预览"
                @click="emit('preview', file.name)"
              />
              <el-button
                class="file-action"
                link
                :icon="Download"
                aria-label="下载"
                @click="emit('download', file.name)"
              />
            </li>
          </ul>
        </section>

        <section class="audit-section">
          <h3 class="section-title">审核记录</h3>
          <ol class="audit-timeline">
            <li
              v-for="record in detail.auditRecords"
              :key="record.id"
              class="timeline-item"
              :data-tone="timelineTone(record)"
            >
              <div class="timeline-dot" aria-hidden="true" />
              <div class="timeline-content">
                <div class="timeline-head">
                  <div class="timeline-title-row">
                    <strong class="timeline-title">{{ record.action }}</strong>
                    <StatusTag
                      v-if="record.result"
                      :color="record.result === 'approved' ? 'green' : 'red'"
                    >
                      {{ record.result === "approved" ? "通过" : "驳回" }}
                    </StatusTag>
                  </div>
                  <time class="timeline-time">{{ record.at }}</time>
                </div>
                <p class="timeline-actor">{{ actorLabel(record) }}</p>
                <p v-if="record.comment" class="timeline-comment">{{ record.comment }}</p>
              </div>
            </li>
          </ol>
        </section>

        <div v-if="detail.status === 'pending'" class="remark-block">
          <label class="remark-label" for="achievement-review-remark">
            <span class="required" aria-hidden="true">*</span>
            审核备注 (驳回时必填)
          </label>
          <el-input
            id="achievement-review-remark"
            v-model="remark"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            placeholder="如驳回请填写驳回原因；通过可选填审核意见"
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="visible = false">返回</el-button>
        <template v-if="detail?.status === 'pending'">
          <el-button type="danger" :loading="saving" @click="handleReject">驳回</el-button>
          <el-button type="primary" :loading="saving" @click="emit('approve', remark.trim())">
            终审通过
          </el-button>
        </template>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Document, Download, Medal, Paperclip, User, View } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import StatusTag from "@/components/StatusTag.vue";
import {
  ACHIEVEMENT_REVIEW_STATUS_MAP,
  ACHIEVEMENT_REVIEW_TYPE_MAP,
  type AchievementReviewAuditRecord,
  type AchievementReviewDetail,
} from "@/features/training-achievement-review/types";

defineOptions({ name: "AchievementReviewDetailDrawer" });

defineProps<{
  /** 详情 */
  detail: AchievementReviewDetail | null;
  /** 提交中 */
  saving: boolean;
}>();

const visible = defineModel<boolean>("visible", { required: true });
const remark = ref("");

const emit = defineEmits<{
  approve: [remark: string];
  reject: [remark: string];
  preview: [name: string];
  download: [name: string];
}>();

watch(visible, (open) => {
  if (open) remark.value = "";
});

function actorLabel(record: AchievementReviewAuditRecord) {
  const role = record.result ? "审核人" : "提交人";
  return `${role}：${record.actorName} (${record.orgName})`;
}

function timelineTone(record: AchievementReviewAuditRecord) {
  if (record.result === "approved") return "success";
  if (record.result === "rejected") return "danger";
  return "neutral";
}

function handleReject() {
  if (!remark.value.trim()) {
    ElMessage.warning("驳回时必须填写审核备注");
    return;
  }
  emit("reject", remark.value.trim());
}
</script>

<style scoped>
.drawer-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
}

.summary-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.code {
  margin: 0;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
}

.title-row {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-12);
}

.title {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 28px;
}

.meta-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.meta-item {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  color: var(--color-secondary);
  font-size: var(--font-size-md);
  line-height: var(--line-height-md);
}

.meta-icon {
  margin-top: 2px;
  color: var(--color-secondary);
  flex-shrink: 0;
}

.attachment-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.attachment-heading {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: var(--color-secondary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-regular, 400);
  line-height: var(--line-height-md);
}

.attachment-icon {
  color: var(--color-secondary);
  flex-shrink: 0;
}

.file-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.file-card {
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
  flex-shrink: 0;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}

.file-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-title);
  font-size: var(--font-size-md);
  line-height: var(--line-height-md);
}

.file-size {
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
}

.file-action {
  color: var(--color-secondary);
  flex-shrink: 0;
}

.file-action:hover {
  color: var(--color-primary);
}

.audit-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
}

.section-title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}

.audit-timeline {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 16px 1fr;
  gap: var(--spacing-12);
  padding-bottom: var(--spacing-20);
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-item:not(:last-child)::before {
  content: "";
  position: absolute;
  left: 7px;
  top: 16px;
  bottom: 0;
  width: 2px;
  background: var(--color-border);
}

.timeline-dot {
  width: 12px;
  height: 12px;
  margin-top: 4px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  justify-self: center;
}

.timeline-item[data-tone="success"] .timeline-dot {
  background: var(--color-success);
}

.timeline-item[data-tone="danger"] .timeline-dot {
  background: var(--color-error);
}

.timeline-item[data-tone="neutral"] .timeline-dot {
  background: var(--color-secondary);
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  min-width: 0;
}

.timeline-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-12);
}

.timeline-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-8);
  min-width: 0;
}

.timeline-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: var(--line-height-md);
}

.timeline-time {
  flex-shrink: 0;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
}

.timeline-actor {
  margin: 0;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
}

.timeline-comment {
  margin: var(--spacing-4) 0 0;
  padding: var(--spacing-12);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-body);
  font-size: var(--font-size-md);
  line-height: 1.6;
}

.remark-block {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.remark-label {
  color: var(--color-title);
  font-size: var(--font-size-md);
  line-height: var(--line-height-md);
}

.required {
  margin-right: 2px;
  color: var(--color-error);
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-8);
}
</style>

<style>
.achievement-review-detail-drawer.el-drawer .el-drawer__header {
  margin-bottom: 0;
  padding: var(--spacing-16) var(--spacing-24);
  border-bottom: 1px solid var(--color-border);
}

.achievement-review-detail-drawer.el-drawer .el-drawer__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
}

.achievement-review-detail-drawer.el-drawer .el-drawer__body {
  padding: var(--spacing-16) var(--spacing-24);
}

.achievement-review-detail-drawer.el-drawer .el-drawer__footer {
  padding: var(--spacing-12) var(--spacing-24) var(--spacing-16);
  border-top: 1px solid var(--color-border);
}
</style>
