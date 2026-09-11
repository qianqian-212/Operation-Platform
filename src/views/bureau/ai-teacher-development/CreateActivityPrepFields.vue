<template>
  <section class="form-card">
    <h2 class="card-title">集体备课 · 课题信息</h2>
    <p class="card-desc">填写学段、学科、年级和课题，便于参与校协同备课。</p>
    <div class="field-grid">
      <el-form-item label="学段" required>
        <el-select v-model="form.topic.stage" placeholder="请选择学段">
          <el-option v-for="item in LESSON_STAGE_OPTIONS" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="学科" required>
        <el-select v-model="form.topic.subject" placeholder="请选择学科">
          <el-option
            v-for="item in LESSON_SUBJECT_OPTIONS"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="年级" required>
        <el-select v-model="form.topic.grade" placeholder="请选择年级">
          <el-option v-for="item in LESSON_GRADE_OPTIONS" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
    </div>
    <el-form-item label="课题名称" required>
      <el-input v-model="form.topic.title" maxlength="40" placeholder="请输入课题名称" />
    </el-form-item>
    <el-form-item label="课时">
      <el-input v-model="form.topic.period" maxlength="20" placeholder="如 2课时" />
    </el-form-item>
  </section>

  <section class="form-card">
    <div class="card-head">
      <div>
        <h2 class="card-title">任务分工</h2>
        <p class="card-desc">为参与教师分配主备、课件或练习等任务。</p>
      </div>
      <el-button :icon="Plus" @click="addTask">添加任务</el-button>
    </div>
    <div v-for="(task, index) in form.tasks" :key="`task-${index}`" class="task-row">
      <el-form-item :label="index === 0 ? '任务名称' : ''">
        <el-input v-model="task.name" placeholder="如主备教案" />
      </el-form-item>
      <el-form-item :label="index === 0 ? '负责人' : ''">
        <el-select v-model="task.ownerId" placeholder="请选择教师" clearable>
          <el-option
            v-for="teacher in teachers"
            :key="teacher.id"
            :label="`${teacher.name} · ${resolveSchoolName(teacher.schoolId)}`"
            :value="teacher.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="index === 0 ? '资源说明' : ''">
        <el-input v-model="task.resourceLabel" placeholder="如教案初稿" />
      </el-form-item>
      <el-button
        class="task-remove"
        text
        type="danger"
        :disabled="form.tasks.length === 1"
        @click="removeTask(index)"
      >
        删除
      </el-button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Plus } from "@element-plus/icons-vue";
import {
  LESSON_GRADE_OPTIONS,
  LESSON_STAGE_OPTIONS,
  LESSON_SUBJECT_OPTIONS,
} from "@/features/cross-school-activity/types";
import type { TeacherOption } from "@/features/teaching-research-alliance/types";
import {
  emptyTask,
  type CreateActivityFormState,
} from "@/views/bureau/ai-teacher-development/create-activity-form";

defineOptions({ name: "CreateActivityPrepFields" });

defineProps<{
  /** 已选参与教师 */
  teachers: TeacherOption[];
  /** 学校名称映射 */
  resolveSchoolName: (id: string) => string;
}>();

const form = defineModel<CreateActivityFormState>("form", { required: true });

function addTask() {
  form.value.tasks = [...form.value.tasks, emptyTask()];
}

function removeTask(index: number) {
  if (form.value.tasks.length === 1) return;
  form.value.tasks = form.value.tasks.filter((_, itemIndex) => itemIndex !== index);
}
</script>

<style scoped src="./create-activity-sections.css"></style>
