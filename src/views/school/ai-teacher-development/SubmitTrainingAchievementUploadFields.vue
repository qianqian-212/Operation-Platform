<template>
  <section class="form-section">
    <h2 class="section-title">证明材料上传 (至少上传一项)</h2>

    <div class="upload-grid">
      <div class="upload-panel">
        <el-upload
          drag
          :auto-upload="false"
          :show-file-list="false"
          accept=".pdf,.png,.jpg,.jpeg"
          :on-change="onCertificateChange"
        >
          <div class="upload-inner">
            <el-icon class="upload-icon" :size="36"><Reading /></el-icon>
            <p class="upload-title">获奖证书/证明文件</p>
            <p class="upload-desc">点击上传证书扫描件</p>
            <p class="upload-limit">支持 PDF、图片，不超过20MB</p>
          </div>
        </el-upload>
        <ul v-if="form.certificateFiles.length" class="file-list">
          <li v-for="file in form.certificateFiles" :key="file.id" class="file-row">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ file.sizeLabel }}</span>
            <el-button link type="danger" @click="removeCertificate(file.id)">删除</el-button>
          </li>
        </ul>
      </div>

      <div class="upload-panel">
        <el-upload
          drag
          :auto-upload="false"
          :show-file-list="false"
          accept=".doc,.docx,.pdf"
          :on-change="onReportChange"
        >
          <div class="upload-inner">
            <el-icon class="upload-icon" :size="36"><Document /></el-icon>
            <p class="upload-title">成果报告/论文</p>
            <p class="upload-desc">点击上传成果文档</p>
            <p class="upload-limit">支持 Word、PDF，不超过30MB</p>
          </div>
        </el-upload>
        <ul v-if="form.reportFiles.length" class="file-list">
          <li v-for="file in form.reportFiles" :key="file.id" class="file-row">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ file.sizeLabel }}</span>
            <el-button link type="danger" @click="removeReport(file.id)">删除</el-button>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { UploadFile } from "element-plus";
import { Document, Reading } from "@element-plus/icons-vue";
import type {
  TrainingAchievementAttachment,
  TrainingAchievementFormInput,
} from "@/features/training-achievement/types";

defineOptions({ name: "SubmitTrainingAchievementUploadFields" });

const form = defineModel<TrainingAchievementFormInput>("form", { required: true });

function formatSize(size?: number) {
  if (!size) return "—";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function toAttachment(
  file: UploadFile,
  kind: TrainingAchievementAttachment["kind"],
  mimeHint: TrainingAchievementAttachment["mimeHint"],
): TrainingAchievementAttachment {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    name: file.name,
    sizeLabel: formatSize(file.size),
    mimeHint,
  };
}

function onCertificateChange(file: UploadFile) {
  const raw = file.raw;
  if (raw && raw.size > 20 * 1024 * 1024) return;
  form.value.certificateFiles = [
    ...form.value.certificateFiles,
    toAttachment(file, "certificate", file.name.endsWith(".pdf") ? "pdf" : "image"),
  ];
}

function onReportChange(file: UploadFile) {
  const raw = file.raw;
  if (raw && raw.size > 30 * 1024 * 1024) return;
  const mimeHint = file.name.endsWith(".pdf") ? "pdf" : "word";
  form.value.reportFiles = [
    ...form.value.reportFiles,
    toAttachment(file, "report", mimeHint),
  ];
}

function removeCertificate(id: string) {
  form.value.certificateFiles = form.value.certificateFiles.filter((item) => item.id !== id);
}

function removeReport(id: string) {
  form.value.reportFiles = form.value.reportFiles.filter((item) => item.id !== id);
}
</script>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}

.section-title::before {
  content: "";
  width: 3px;
  height: 16px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  flex-shrink: 0;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-16);
}

.upload-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
  min-width: 0;
}

.upload-panel :deep(.el-upload) {
  width: 100%;
  --el-upload-dragger-padding-horizontal: 0;
  --el-upload-dragger-padding-vertical: 0;
}

.upload-panel :deep(.el-upload-dragger) {
  width: 100%;
  height: auto;
  min-height: 148px;
  padding: var(--spacing-24) var(--spacing-16);
  border: 1px dashed var(--color-border-deep);
  border-radius: var(--radius-lg);
  background: var(--color-bg);
}

.upload-panel :deep(.el-upload-dragger:hover) {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.upload-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.upload-icon {
  color: var(--color-primary);
  margin-bottom: 2px;
}

.upload-title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: var(--line-height-md);
}

.upload-desc {
  margin: 0;
  font-size: var(--font-size-md);
  color: var(--color-body);
  line-height: var(--line-height-md);
}

.upload-limit {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-secondary);
  line-height: var(--line-height-md);
}

.file-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.file-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  padding: var(--spacing-8) var(--spacing-12);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
}

.file-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-title);
  font-size: var(--font-size-md);
}

.file-size {
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
  flex-shrink: 0;
}

@media (max-width: 860px) {
  .upload-grid {
    grid-template-columns: 1fr;
  }
}
</style>
