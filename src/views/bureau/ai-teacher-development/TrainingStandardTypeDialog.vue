<template>
  <el-dialog
    v-model="visible"
    :title="isCreate ? '新增研修类型' : '编辑研修类型'"
    width="640px"
    destroy-on-close
    class="type-dialog"
    @closed="emit('closed')"
  >
    <el-form label-position="top" require-asterisk-position="left" class="type-form">
      <el-form-item label="研修类型名称" required>
        <el-input v-model="draft.name" maxlength="20" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="类型说明">
        <el-input
          v-model="draft.description"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
          placeholder="描述该研修类型的适用范围和认定标准"
        />
      </el-form-item>

      <el-form-item label="类型详解附件">
        <div class="upload-block">
          <el-button type="primary" :icon="Upload" @click="openPicker">上传文件</el-button>
          <input
            ref="inputRef"
            class="file-input"
            type="file"
            accept=".pdf,.doc,.docx"
            @change="handleFileChange"
          />
          <p class="upload-hint">支持 PDF、Word，供教师下载查看</p>
          <div v-if="draft.attachmentName" class="file-card">
            <span class="file-icon" aria-hidden="true">
              <el-icon :size="22"><Document /></el-icon>
            </span>
            <span class="file-meta">
              <span class="file-name" :title="draft.attachmentName">{{ draft.attachmentName }}</span>
              <span class="file-size">{{ draft.attachmentSizeLabel || "—" }}</span>
            </span>
            <span class="file-actions">
              <el-button link :icon="Delete" aria-label="删除" @click="clearAttachment" />
              <el-button link :icon="View" aria-label="预览" @click="previewAttachment" />
              <el-button link :icon="Download" aria-label="下载" @click="downloadAttachment" />
            </span>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="等级与分值设置" required>
        <div class="level-panel">
          <div class="level-head">
            <span>等级名称</span>
            <span>分值</span>
            <span>等级说明</span>
            <span class="level-action-spacer" />
          </div>
          <div v-for="(level, index) in draft.levels" :key="level.id" class="level-row">
            <el-input v-model="level.name" placeholder="请输入" />
            <el-input v-model="level.scoreLabel" placeholder="请输入" />
            <el-input v-model="level.description" placeholder="请输入" />
            <el-button
              link
              type="danger"
              :icon="Delete"
              :disabled="draft.levels.length <= 1"
              @click="removeLevel(index)"
            >
              删除
            </el-button>
          </div>
          <el-button class="add-level-btn" :icon="Plus" @click="addLevel">添加等级</el-button>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { Delete, Document, Download, Plus, Upload, View } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type {
  TrainingStandardLevel,
  TrainingStandardType,
} from "@/features/training-standard-config/types";
import { formatMaterialSize } from "@/views/bureau/ai-teacher-development/observation-form";

defineOptions({ name: "TrainingStandardTypeDialog" });

const props = defineProps<{
  /** 编辑中的类型，空表示新建 */
  editingType: TrainingStandardType | null;
  /** 是否新建 */
  isCreate: boolean;
  /** 保存中 */
  saving: boolean;
}>();

const visible = defineModel<boolean>("visible", { required: true });

const emit = defineEmits<{
  confirm: [type: TrainingStandardType];
  closed: [];
}>();

const toneCycle = ["green", "blue", "gray"] as const;
const draft = ref(createEmptyType());
const inputRef = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string | null>(null);

watch(
  () => [props.editingType, props.isCreate, visible.value] as const,
  ([editingType, isCreate, open]) => {
    if (!open) return;
    clearPreviewUrl();
    draft.value = isCreate || !editingType ? createEmptyType() : cloneType(editingType);
  },
  { flush: "post" },
);

const canSave = computed(() => {
  if (!draft.value.name.trim() || !draft.value.attachmentName.trim()) return false;
  return draft.value.levels.every(
    (level) => level.name.trim() && level.description.trim() && level.scoreLabel.trim(),
  );
});

function createEmptyType(): TrainingStandardType {
  return {
    id: `type-${Date.now()}`,
    name: "",
    description: "",
    attachmentName: "",
    attachmentSizeLabel: "",
    levels: [createEmptyLevel(0), createEmptyLevel(1)],
  };
}

function createEmptyLevel(index: number): TrainingStandardLevel {
  const tone = toneCycle[index % toneCycle.length] ?? "gray";
  return {
    id: `lvl-${Date.now()}-${index}`,
    name: "",
    description: "",
    scoreLabel: "",
    tone,
  };
}

function cloneType(type: TrainingStandardType): TrainingStandardType {
  return {
    ...type,
    description: type.description ?? "",
    attachmentSizeLabel: type.attachmentSizeLabel ?? "",
    levels: type.levels.map((level) => ({ ...level })),
  };
}

function openPicker() {
  inputRef.value?.click();
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  const lower = file.name.toLowerCase();
  if (!/\.(pdf|doc|docx)$/.test(lower)) {
    ElMessage.warning("仅支持 PDF、Word 文件");
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    ElMessage.warning("单个文件不超过 20MB");
    return;
  }
  clearPreviewUrl();
  previewUrl.value = URL.createObjectURL(file);
  draft.value.attachmentName = file.name;
  draft.value.attachmentSizeLabel = formatMaterialSize(file.size);
}

function clearAttachment() {
  clearPreviewUrl();
  draft.value.attachmentName = "";
  draft.value.attachmentSizeLabel = "";
}

function previewAttachment() {
  if (!previewUrl.value) {
    ElMessage.info("演示数据暂不支持预览");
    return;
  }
  window.open(previewUrl.value, "_blank", "noopener");
}

function downloadAttachment() {
  if (!previewUrl.value || !draft.value.attachmentName) {
    ElMessage.info("演示数据暂不支持下载");
    return;
  }
  const link = document.createElement("a");
  link.href = previewUrl.value;
  link.download = draft.value.attachmentName;
  link.click();
}

function clearPreviewUrl() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = null;
}

function addLevel() {
  draft.value.levels = [...draft.value.levels, createEmptyLevel(draft.value.levels.length)];
}

function removeLevel(index: number) {
  draft.value.levels = draft.value.levels.filter((_, i) => i !== index);
}

function handleConfirm() {
  if (!canSave.value) {
    ElMessage.warning("请完善研修类型、附件与等级信息");
    return;
  }
  emit("confirm", {
    ...draft.value,
    name: draft.value.name.trim(),
    description: draft.value.description.trim(),
    attachmentName: draft.value.attachmentName.trim(),
    attachmentSizeLabel: draft.value.attachmentSizeLabel.trim(),
    levels: draft.value.levels.map((level) => ({
      ...level,
      name: level.name.trim(),
      description: level.description.trim(),
      scoreLabel: level.scoreLabel.trim(),
    })),
  });
}

onBeforeUnmount(() => {
  clearPreviewUrl();
});
</script>

<style scoped>
.type-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.upload-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-8);
  width: 100%;
}

.file-input {
  display: none;
}

.upload-hint {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-secondary);
  line-height: var(--line-height-md);
}

.file-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-12);
  width: 100%;
  padding: var(--spacing-12);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
}

.file-icon {
  display: inline-flex;
  color: var(--color-primary);
  flex-shrink: 0;
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
}

.file-size {
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.file-actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.level-panel {
  width: 100%;
  padding: var(--spacing-16);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
}

.level-head,
.level-row {
  display: grid;
  grid-template-columns: 1fr 0.7fr 1.4fr auto;
  gap: var(--spacing-8);
  align-items: center;
}

.level-head {
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.level-action-spacer {
  width: 64px;
}

.add-level-btn {
  align-self: flex-start;
}

@media (max-width: 720px) {
  .level-head {
    display: none;
  }

  .level-row {
    grid-template-columns: 1fr;
  }
}
</style>
