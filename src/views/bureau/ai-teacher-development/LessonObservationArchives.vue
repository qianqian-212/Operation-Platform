<template>
  <section class="archive-card">
    <div class="archive-head">
      <h2 class="archive-title">档案文件</h2>
      <p class="archive-hint">系统自动汇总评课记录，生成标准化档案文件</p>
    </div>
    <div class="archive-grid">
      <article v-for="file in archives" :key="file.id" class="archive-item">
        <div class="archive-icon" aria-hidden="true">
          <el-icon><Document /></el-icon>
        </div>
        <div class="archive-meta">
          <h3 class="archive-name">{{ file.title }}</h3>
          <p class="archive-desc">{{ file.description }}</p>
        </div>
        <el-button
          class="archive-download"
          type="primary"
          link
          :icon="Download"
          @click="emit('download', file.title)"
        >
          下载
        </el-button>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Document, Download } from "@element-plus/icons-vue";
import type { LessonObservationArchive } from "@/features/lesson-observation/types";

defineOptions({ name: "LessonObservationArchives" });

defineProps<{
  /** 档案文件列表 */
  archives: LessonObservationArchive[];
}>();

const emit = defineEmits<{
  download: [title: string];
}>();
</script>

<style scoped src="./lesson-observation-detail.css"></style>
