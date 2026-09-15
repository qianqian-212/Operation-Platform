<template>
  <section class="form-section task-section">
    <div class="section-head">
      <h2 class="card-title">任务分工</h2>
      <p class="card-desc">支持备课评课方法与任务分工，自动带出参与学校与教师，新增任务可再自定义设置。</p>
    </div>
    <div class="task-board">
      <article v-for="task in form.tasks" :key="task.id" class="task-block">
        <div class="task-block-main">
          <h3 class="task-block-title">
            {{ task.name }}
            <el-tag v-if="task.source === 'system'" type="primary" effect="plain" size="small">系统</el-tag>
          </h3>
          <p class="task-block-meta">
            参与教师：
            <template v-if="task.assignees.length">
              <el-tag v-for="item in assigneeTags(task)" :key="item.id" effect="plain">
                {{ item.label }}
              </el-tag>
            </template>
            <span v-else>全部参与教师（共{{ teacherCount }}人）</span>
          </p>
          <p class="task-block-meta">文件上传：{{ task.requireFile ? "需上传文件" : "无需上传" }}</p>
        </div>
        <div class="task-block-actions">
          <el-button
            v-if="task.source === 'custom'"
            link
            type="danger"
            @click="removeTask(task.id)"
          >
            删除
            <el-icon class="el-icon--right"><Delete /></el-icon>
          </el-button>
          <el-button
            v-if="task.source === 'custom'"
            link
            type="primary"
            @click="openEdit(task.id)"
          >
            编辑
            <el-icon class="el-icon--right"><EditPen /></el-icon>
          </el-button>
          <el-button v-else link type="primary" @click="openSettings(task.id)">高级设置</el-button>
        </div>
      </article>
      <el-button class="task-add" :icon="Plus" @click="openCreate">添加自定义任务</el-button>
    </div>
  </section>

  <CreateActivityTaskSettingsDialog
    v-model:visible="settingsVisible"
    :teachers="teachers"
    :assignees="activeTask?.assignees ?? []"
    :note="activeTask?.note ?? ''"
    @confirm="saveSettings"
  />
  <CreateActivityTaskEditDialog
    v-model:visible="editVisible"
    :title="editMode === 'create' ? '添加任务' : '编辑任务'"
    :teachers="teachers"
    :assignees="activeTask?.assignees ?? []"
    :require-file="activeTask?.requireFile ?? false"
    @confirm="saveEdit"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Delete, EditPen, Plus } from "@element-plus/icons-vue";
import type { ActivityTaskInput } from "@/features/cross-school-activity/types";
import {
  emptyCustomTask,
  type ActivityTaskTeacherOption,
  type CreateActivityFormState,
} from "@/views/bureau/ai-teacher-development/create-activity-form";
import CreateActivityTaskEditDialog from "@/views/bureau/ai-teacher-development/CreateActivityTaskEditDialog.vue";
import CreateActivityTaskSettingsDialog from "@/views/bureau/ai-teacher-development/CreateActivityTaskSettingsDialog.vue";

defineOptions({ name: "CreateActivityTaskSection" });

const props = defineProps<{
  /** 活动已选教师 */
  teachers: ActivityTaskTeacherOption[];
}>();

const form = defineModel<CreateActivityFormState>("form", { required: true });
const settingsVisible = ref(false);
const editVisible = ref(false);
const editMode = ref<"create" | "edit">("create");
const activeTaskId = ref("");

const teacherCount = computed(() => props.teachers.length);
const activeTask = computed(() => form.value.tasks.find((item) => item.id === activeTaskId.value));

function teacherLabel(id: string) {
  const teacher = props.teachers.find((item) => item.id === id);
  return teacher ? `${teacher.name}（${teacher.schoolName}）` : id;
}

function assigneeTags(task: ActivityTaskInput) {
  return task.assignees.map((item) => ({
    id: item.teacherId,
    label: teacherLabel(item.teacherId),
  }));
}

function patchTask(id: string, next: Partial<ActivityTaskInput>) {
  form.value.tasks = form.value.tasks.map((item) => (item.id === id ? { ...item, ...next } : item));
}

function openSettings(id: string) {
  activeTaskId.value = id;
  settingsVisible.value = true;
}

function openEdit(id: string) {
  activeTaskId.value = id;
  editMode.value = "edit";
  editVisible.value = true;
}

function openCreate() {
  activeTaskId.value = "";
  editMode.value = "create";
  editVisible.value = true;
}

function removeTask(id: string) {
  form.value.tasks = form.value.tasks.filter((item) => item.id !== id);
}

function saveSettings(payload: { assignees: ActivityTaskInput["assignees"]; note: string }) {
  if (!activeTaskId.value) return;
  patchTask(activeTaskId.value, payload);
}

function saveEdit(payload: { assignees: ActivityTaskInput["assignees"]; requireFile: boolean }) {
  if (editMode.value === "create") {
    form.value.tasks = [...form.value.tasks, { ...emptyCustomTask(), ...payload }];
    return;
  }
  if (activeTaskId.value) patchTask(activeTaskId.value, payload);
}
</script>

<style scoped src="./create-activity-sections.css"></style>
