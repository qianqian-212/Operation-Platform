<template>
  <el-drawer v-model="visible" title="终审详情" size="480px" destroy-on-close>
    <template v-if="detail">
      <p class="code">成果编号：{{ detail.code }}</p>
      <div class="title-row">
        <h2 class="title">{{ detail.title }}</h2>
        <StatusTag :color="ACHIEVEMENT_REVIEW_STATUS_MAP[detail.status].tagColor">
          {{ ACHIEVEMENT_REVIEW_STATUS_MAP[detail.status].label }}
        </StatusTag>
      </div>
      <ul class="meta-list">
        <li>{{ detail.teacherName }} · {{ detail.schoolName }} · {{ detail.subject }}</li>
        <li>研修类型：{{ ACHIEVEMENT_REVIEW_TYPE_MAP[detail.type].label }}</li>
        <li>等级/分值：{{ detail.levelLabel }}/{{ detail.scoreLabel }}分</li>
      </ul>

      <h3 class="section-title">附件材料</h3>
      <ul class="file-list">
        <li v-for="file in detail.attachments" :key="file.id" class="file-card">
          <el-icon :size="20"><Document /></el-icon>
          <span class="file-meta">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ file.sizeLabel }}</span>
          </span>
          <el-button link :icon="View" aria-label="预览" @click="emit('preview', file.name)" />
          <el-button
            link
            :icon="Download"
            aria-label="下载"
            @click="emit('download', file.name)"
          />
        </li>
      </ul>

      <h3 class="section-title">审核记录</h3>
      <el-timeline>
        <el-timeline-item
          v-for="record in detail.auditRecords"
          :key="record.id"
          :timestamp="record.at"
          placement="top"
        >
          <div class="timeline-head">
            <strong>{{ record.action }}</strong>
            <StatusTag v-if="record.result" :color="record.result === 'approved' ? 'green' : 'red'">
              {{ record.result === "approved" ? "通过" : "驳回" }}
            </StatusTag>
          </div>
          <p class="timeline-actor">{{ record.actorName }}（{{ record.orgName }}）</p>
          <p v-if="record.comment" class="timeline-comment">{{ record.comment }}</p>
        </el-timeline-item>
      </el-timeline>

      <template v-if="detail.status === 'pending'">
        <el-form-item label="审核备注（驳回时必填）" class="remark-item">
          <el-input
            v-model="remark"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="请输入审核备注"
          />
        </el-form-item>
      </template>
    </template>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="visible = false">返回</el-button>
        <template v-if="detail?.status === 'pending'">
          <el-button type="danger" :loading="saving" @click="emit('reject', remark)">
            驳回
          </el-button>
          <el-button type="primary" :loading="saving" @click="emit('approve', remark)">
            终审通过
          </el-button>
        </template>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Document, Download, View } from "@element-plus/icons-vue";
import StatusTag from "@/components/StatusTag.vue";
import {
  ACHIEVEMENT_REVIEW_STATUS_MAP,
  ACHIEVEMENT_REVIEW_TYPE_MAP,
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
</script>

<style scoped>
.code {
  margin: 0 0 var(--spacing-8);
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.title-row {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-12);
  margin-bottom: var(--spacing-12);
}

.title {
  margin: 0;
  flex: 1;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}

.meta-list {
  margin: 0 0 var(--spacing-16);
  padding: 0;
  list-style: none;
  color: var(--color-secondary);
  font-size: var(--font-size-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.section-title {
  margin: 0 0 var(--spacing-12);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
}

.file-list {
  margin: 0 0 var(--spacing-16);
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.file-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  padding: var(--spacing-12);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
}

.file-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-title);
}

.file-size {
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.timeline-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
}

.timeline-actor,
.timeline-comment {
  margin: var(--spacing-4) 0 0;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.timeline-comment {
  padding: var(--spacing-8) var(--spacing-12);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-body);
}

.remark-item {
  margin-top: var(--spacing-16);
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-8);
}
</style>
