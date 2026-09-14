<template>
  <div class="material-block">
    <el-button type="primary" :icon="Upload" @click="openPicker">上传文件</el-button>
    <input
      ref="inputRef"
      class="file-input"
      type="file"
      :accept="MATERIAL_ACCEPT"
      multiple
      @change="handleChange"
    />
    <p class="form-hint">支持.doc.docx.ppt.pptx.pdf，单个文件≤20MB，最多5个</p>
    <ul v-if="modelValue.length" class="file-list">
      <li v-for="item in modelValue" :key="item.id" class="file-item">
        <span class="file-icon" aria-hidden="true">
          <el-icon :size="20"><Document /></el-icon>
        </span>
        <span class="file-meta">
          <span class="file-name">{{ item.name }}</span>
          <span class="file-size">{{ item.sizeLabel }}</span>
        </span>
        <span class="file-actions">
          <el-button link :icon="Delete" aria-label="删除" @click="remove(item.id)" />
          <el-button link :icon="View" aria-label="预览" @click="preview(item.id)" />
          <el-button link :icon="Download" aria-label="下载" @click="download(item.id)" />
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { Delete, Document, Download, Upload, View } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { ActivityCourseMaterial } from "@/features/cross-school-activity/types";
import {
  formatMaterialSize,
  MATERIAL_ACCEPT,
  validateMaterialFile,
} from "@/views/bureau/ai-teacher-development/observation-form";

defineOptions({ name: "ActivityObservationMaterials" });

const modelValue = defineModel<ActivityCourseMaterial[]>({ required: true });
const inputRef = ref<HTMLInputElement | null>(null);
const previewUrls = ref<Record<string, string>>({});

function openPicker() {
  inputRef.value?.click();
}

function handleChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);
  input.value = "";
  files.forEach(addFile);
}

function addFile(file: File) {
  const error = validateMaterialFile(file, modelValue.value.length);
  if (error) {
    ElMessage.warning(error);
    return;
  }
  const id = `mat-${crypto.randomUUID()}`;
  previewUrls.value = { ...previewUrls.value, [id]: URL.createObjectURL(file) };
  modelValue.value = [
    ...modelValue.value,
    { id, name: file.name, sizeLabel: formatMaterialSize(file.size) },
  ];
}

function remove(id: string) {
  revokeUrl(id);
  modelValue.value = modelValue.value.filter((item) => item.id !== id);
}

function preview(id: string) {
  const url = previewUrls.value[id];
  if (!url) {
    ElMessage.info("演示数据暂不支持预览");
    return;
  }
  window.open(url, "_blank", "noopener");
}

function download(id: string) {
  const item = modelValue.value.find((file) => file.id === id);
  const url = previewUrls.value[id];
  if (!item || !url) {
    ElMessage.info("演示数据暂不支持下载");
    return;
  }
  const link = document.createElement("a");
  link.href = url;
  link.download = item.name;
  link.click();
}

function revokeUrl(id: string) {
  const url = previewUrls.value[id];
  if (url) URL.revokeObjectURL(url);
  const next = { ...previewUrls.value };
  delete next[id];
  previewUrls.value = next;
}

onBeforeUnmount(() => {
  Object.keys(previewUrls.value).forEach(revokeUrl);
});
</script>

<style scoped src="./activity-detail-view.css"></style>
