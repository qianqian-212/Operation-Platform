<template>
  <section class="form-card">
    <h2 class="card-title">听评课设置</h2>
    <p class="card-desc">填写授课与评课信息，活动开始前可继续完善。</p>
    <el-form-item label="课程名称" required>
      <el-input v-model="form.observation.courseName" maxlength="40" placeholder="请输入课程名称" />
    </el-form-item>
    <div class="field-grid">
      <el-form-item label="授课教师">
        <el-select v-model="form.observation.instructorName" placeholder="请选择授课教师" filterable allow-create>
          <el-option
            v-for="teacher in teachers"
            :key="teacher.id"
            :label="`${teacher.name} · ${resolveSchoolName(teacher.schoolId)}`"
            :value="teacher.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="授课时间">
        <el-date-picker
          v-model="form.observation.scheduledAt"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm"
          format="YYYY-MM-DD HH:mm"
          placeholder="请选择授课时间"
        />
      </el-form-item>
      <el-form-item label="授课方式">
        <el-select v-model="form.observation.method" placeholder="请选择授课方式">
          <el-option
            v-for="item in OBSERVATION_METHOD_OPTIONS"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="年级">
        <el-select v-model="form.observation.grade" placeholder="请选择年级">
          <el-option v-for="item in LESSON_GRADE_OPTIONS" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="学科">
        <el-select v-model="form.observation.subject" placeholder="请选择学科">
          <el-option
            v-for="item in LESSON_SUBJECT_OPTIONS"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="课程类型">
        <el-select v-model="form.observation.courseType" placeholder="请选择课程类型">
          <el-option v-for="item in COURSE_TYPE_OPTIONS" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="评课教师">
        <el-select v-model="form.observation.reviewerName" placeholder="请选择评课教师" filterable allow-create>
          <el-option
            v-for="teacher in teachers"
            :key="teacher.id"
            :label="`${teacher.name} · ${resolveSchoolName(teacher.schoolId)}`"
            :value="teacher.name"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="评课方式">
        <el-select v-model="form.observation.reviewMethod" placeholder="请选择评课方式">
          <el-option
            v-for="item in REVIEW_METHOD_OPTIONS"
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
  COURSE_TYPE_OPTIONS,
  LESSON_GRADE_OPTIONS,
  LESSON_SUBJECT_OPTIONS,
  OBSERVATION_METHOD_OPTIONS,
  REVIEW_METHOD_OPTIONS,
} from "@/features/cross-school-activity/types";
import type { TeacherOption } from "@/features/teaching-research-alliance/types";
import type { CreateActivityFormState } from "@/views/bureau/ai-teacher-development/create-activity-form";

defineOptions({ name: "CreateActivityObservationFields" });

defineProps<{
  /** 已选参与教师 */
  teachers: TeacherOption[];
  /** 学校名称映射 */
  resolveSchoolName: (id: string) => string;
}>();

const form = defineModel<CreateActivityFormState>("form", { required: true });
</script>

<style scoped src="./create-activity-sections.css"></style>
