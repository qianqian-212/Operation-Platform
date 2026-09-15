<template>
  <section class="form-section">
    <div class="section-head">
      <h2 class="card-title">集体备课课题信息</h2>
      <p class="card-desc">选定本次活动涉及的具体教材环节，或共享后自己完善内容目录。</p>
    </div>
    <div class="field-grid">
      <el-form-item label="学段" required>
        <el-select v-model="form.topic.stage" placeholder="请选择">
          <el-option v-for="item in LESSON_STAGE_OPTIONS" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="学科" required>
        <el-select v-model="form.topic.subject" placeholder="请选择">
          <el-option
            v-for="item in LESSON_SUBJECT_OPTIONS"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="年级" required>
        <el-select v-model="form.topic.grade" placeholder="请选择">
          <el-option v-for="item in LESSON_GRADE_OPTIONS" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="教材版本" required>
        <el-select v-model="form.topic.textbookVersion" placeholder="请选择">
          <el-option
            v-for="item in LESSON_TEXTBOOK_OPTIONS"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="章节" required>
        <el-select v-model="form.topic.chapter" placeholder="请选择">
          <el-option
            v-for="item in LESSON_CHAPTER_OPTIONS"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  LESSON_CHAPTER_OPTIONS,
  LESSON_GRADE_OPTIONS,
  LESSON_STAGE_OPTIONS,
  LESSON_SUBJECT_OPTIONS,
  LESSON_TEXTBOOK_OPTIONS,
} from "@/features/cross-school-activity/types";
import type { CreateActivityFormState } from "@/views/bureau/ai-teacher-development/create-activity-form";

defineOptions({ name: "CreateActivityPrepFields" });

const form = defineModel<CreateActivityFormState>("form", { required: true });
</script>

<style scoped src="./create-activity-sections.css"></style>
