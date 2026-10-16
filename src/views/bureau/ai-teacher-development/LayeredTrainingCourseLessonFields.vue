<template>
  <section class="lessons" aria-labelledby="managed-course-lessons">
    <div class="lessons-head">
      <h2 id="managed-course-lessons" class="lessons-title">课时</h2>
      <p class="lessons-hint">{{ lessonHint }}</p>
    </div>

    <el-table :data="lessons" row-key="id" border>
      <el-table-column label="课时标题" min-width="280">
        <template #default="{ row, $index }: { row: ManagedCourseLesson; $index: number }">
          <div class="title-cell">
            <span class="lesson-index">第{{ $index + 1 }}讲</span>
            <el-input
              :model-value="row.title"
              :disabled="disabled"
              placeholder="请输入课时标题"
              @update:model-value="updateTitle(row.id, $event)"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="uploadColumnLabel" min-width="280">
        <template #default="{ row, $index }: { row: ManagedCourseLesson; $index: number }">
          <div v-if="row.fileName" class="file-cell">
            <el-icon class="file-icon">
              <VideoPlay v-if="isVideo" />
              <Document v-else />
            </el-icon>
            <span class="file-name">{{ row.fileName }}</span>
            <button
              v-if="!disabled"
              type="button"
              class="file-clear"
              aria-label="移除文件"
              @click="clearFile(row.id)"
            >
              <el-icon><Close /></el-icon>
            </button>
          </div>
          <div v-else-if="!disabled" class="upload-actions">
            <el-button type="primary" :icon="Upload" @click="attachDefault(row.id, $index)">
              {{ uploadButtonLabel }}
            </el-button>
            <el-button>打开资源库</el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="!disabled" label="操作" width="88" align="right" header-align="right">
        <template #default="{ row }: { row: ManagedCourseLesson }">
          <button type="button" class="delete-link" @click="removeLesson(row.id)">删除</button>
        </template>
      </el-table-column>
    </el-table>

    <el-button v-if="!disabled" :icon="Plus" @click="addLesson">添加课时</el-button>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Close, Document, Plus, Upload, VideoPlay } from "@element-plus/icons-vue";
import {
  defaultManagedLessonFile,
  emptyManagedCourseLesson,
  type ManagedCourseKind,
  type ManagedCourseLesson,
} from "@/features/layered-training-course-manage/types";

defineOptions({ name: "LayeredTrainingCourseLessonFields" });

const lessons = defineModel<ManagedCourseLesson[]>({ required: true });

const props = defineProps<{
  /** 当前课程类型，决定上传文件类型 */
  kind: ManagedCourseKind | "";
  /** 查看模式下禁止修改课时 */
  disabled: boolean;
}>();

const isVideo = computed(() => props.kind === "video" || props.kind === "");
const uploadColumnLabel = computed(() => (isVideo.value ? "上传视频 (MP4)" : "上传文件"));
const uploadButtonLabel = computed(() => (isVideo.value ? "上传视频" : "上传文件"));
const lessonHint = computed(() =>
  isVideo.value
    ? "视频课程按课时上传，与教师端「课时」一一对应；视频时长由系统自动检测，不可人工修改。"
    : "按资料上传课时文件，提交审核前请确认文件已选择。",
);

function updateTitle(id: string, title: string) {
  lessons.value = lessons.value.map((lesson) => (lesson.id === id ? { ...lesson, title } : lesson));
}

function addLesson() {
  lessons.value = [...lessons.value, emptyManagedCourseLesson()];
}

function removeLesson(id: string) {
  lessons.value = lessons.value.filter((lesson) => lesson.id !== id);
}

function attachFile(id: string, fileName: string, durationMinutes: number | null) {
  lessons.value = lessons.value.map((lesson) =>
    lesson.id === id ? { ...lesson, fileName, durationMinutes } : lesson,
  );
}

function clearFile(id: string) {
  attachFile(id, "", null);
}

function attachDefault(id: string, index: number) {
  if (props.disabled) return;
  const file = defaultManagedLessonFile(props.kind, index);
  attachFile(id, file.fileName, file.durationMinutes);
}

</script>

<style scoped>
.lessons {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-12);
}

.lessons-head,
.lessons :deep(.el-table) {
  width: 100%;
}

.lessons-title {
  margin: 0;
  color: var(--color-title);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
}

.lessons-title::before {
  content: "*";
  margin-right: var(--spacing-4);
  color: var(--color-error);
}

.lessons-hint {
  margin: var(--spacing-8) 0 0;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
}

.title-cell,
.upload-actions,
.file-cell {
  display: flex;
  align-items: center;
  gap: var(--spacing-12);
}

.lesson-index {
  flex-shrink: 0;
  color: var(--color-title);
}

.title-cell :deep(.el-input) {
  flex: 1;
}

.file-icon {
  flex-shrink: 0;
  color: var(--color-secondary);
}

.file-name {
  min-width: 0;
  color: var(--color-title);
}

.file-clear,
.delete-link {
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  font: inherit;
}

.file-clear {
  display: inline-flex;
  color: var(--color-secondary);
}

.delete-link {
  color: var(--color-error);
  font-size: var(--font-size-md);
}

.file-clear:hover,
.delete-link:hover {
  color: var(--color-error-dark-text);
}

.file-clear:focus-visible,
.delete-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
