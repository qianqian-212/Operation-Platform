<template>
  <section class="form-section task-section">
    <div class="section-head">
      <h2 class="card-title">任务分工</h2>
      <p class="card-desc">
        集体备课和听评课为默认任务，自动包含所有参与教师。新增任务可自定义设置
      </p>
    </div>
    <el-table :data="form.tasks" row-key="id" border class="task-table">
      <el-table-column label="任务名称" min-width="200">
        <template #default="{ row }: { row: ActivityTaskInput }">
          <el-input
            :model-value="row.name"
            :disabled="row.source === 'system'"
            placeholder="请输入"
            @update:model-value="(value: string | number) => patchTask(row.id, { name: String(value) })"
          />
        </template>
      </el-table-column>
      <el-table-column label="参与教师" min-width="220">
        <template #default="{ row }: { row: ActivityTaskInput }">
          <el-select
            :model-value="assigneeIds(row)"
            multiple
            collapse-tags
            collapse-tags-tooltip
            clearable
            filterable
            placeholder="请选择"
            class="task-select"
            @update:model-value="(value: string[]) => setAssignees(row.id, value)"
          >
            <el-option
              v-for="teacher in teachers"
              :key="teacher.id"
              :label="`${teacher.name}（${teacher.schoolName}）`"
              :value="teacher.id"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="文件上传" min-width="180">
        <template #default="{ row }: { row: ActivityTaskInput }">
          <el-select
            :model-value="row.requireFile ? 'required' : 'optional'"
            placeholder="请选择"
            class="task-select"
            @update:model-value="
              (value: string | number | boolean) =>
                patchTask(row.id, { requireFile: value === 'required' })
            "
          >
            <el-option label="需要上传文件" value="required" />
            <el-option label="无需上传文件" value="optional" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center">
        <template #default="{ row }: { row: ActivityTaskInput }">
          <el-button
            v-if="row.source === 'custom'"
            link
            type="danger"
            @click="removeTask(row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button class="task-add" :icon="Plus" @click="addTask">添加任务</el-button>
  </section>
</template>

<script setup lang="ts">
import { Plus } from "@element-plus/icons-vue";
import type { ActivityTaskInput } from "@/features/cross-school-activity/types";
import {
  emptyCustomTask,
  type ActivityTaskTeacherOption,
  type CreateActivityFormState,
} from "@/views/bureau/ai-teacher-development/create-activity-form";

defineOptions({ name: "CreateActivityTaskSection" });

defineProps<{
  /** 活动已选教师 */
  teachers: ActivityTaskTeacherOption[];
}>();

const form = defineModel<CreateActivityFormState>("form", { required: true });

function assigneeIds(task: ActivityTaskInput) {
  return task.assignees.map((item) => item.teacherId);
}

function patchTask(id: string, next: Partial<ActivityTaskInput>) {
  form.value.tasks = form.value.tasks.map((item) => (item.id === id ? { ...item, ...next } : item));
}

function setAssignees(id: string, value: unknown) {
  const ids = Array.isArray(value) ? value.map(String) : [];
  patchTask(id, {
    assignees: ids.map((teacherId) => ({ teacherId, role: "participant" as const })),
  });
}

function removeTask(id: string) {
  form.value.tasks = form.value.tasks.filter((item) => item.id !== id);
}

function addTask() {
  form.value.tasks = [...form.value.tasks, emptyCustomTask()];
}
</script>

<style scoped src="./create-activity-sections.css"></style>
