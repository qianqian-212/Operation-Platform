<template>
  <el-dialog
    v-model="visible"
    title="高级设置"
    width="720px"
    append-to-body
    destroy-on-close
    @closed="resetDraft"
  >
    <el-form label-position="top" require-asterisk-position="left">
      <el-form-item label="参与教师设置" required>
        <el-table :data="pageTeachers" row-key="id" header-cell-class-name="task-table-head">
          <el-table-column width="52">
            <template #header>
              <el-checkbox
                :model-value="allChecked"
                :indeterminate="someChecked"
                @change="toggleAll"
              />
            </template>
            <template #default="{ row }">
              <el-checkbox :model-value="selected.has(row.id)" @change="onCheck(row.id, $event)" />
            </template>
          </el-table-column>
          <el-table-column prop="name" label="姓名" min-width="120" />
          <el-table-column label="学校" min-width="180">
            <template #default="{ row }">{{ row.schoolName }} · {{ row.subject }}</template>
          </el-table-column>
          <el-table-column label="角色" min-width="220">
            <template #default="{ row }">
              <el-radio-group :model-value="selected.get(row.id) ?? ''" @change="onRole(row.id, $event)">
                <el-radio
                  v-for="(label, role) in ACTIVITY_TASK_ROLE_MAP"
                  :key="role"
                  :value="role"
                  size="small"
                >
                  {{ label }}
                </el-radio>
              </el-radio-group>
            </template>
          </el-table-column>
        </el-table>
        <div class="dialog-pager">
          <el-pagination
            v-model:current-page="page"
            layout="prev, pager, next, jumper"
            :page-size="pageSize"
            :total="teachers.length"
          />
        </div>
      </el-form-item>
      <el-form-item label="分工说明">
        <el-input v-model="draftNote" type="textarea" :rows="3" placeholder="请输入" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  ACTIVITY_TASK_ROLE_MAP,
  type ActivityTaskAssignee,
  type ActivityTaskRole,
} from "@/features/cross-school-activity/types";
import {
  applyTeacherCheck,
  applyTeacherRole,
  defaultTaskAssignees,
  toAssignees,
  type ActivityTaskTeacherOption,
} from "@/views/bureau/ai-teacher-development/create-activity-form";

defineOptions({ name: "CreateActivityTaskSettingsDialog" });

const props = defineProps<{
  /** 活动已选教师 */
  teachers: ActivityTaskTeacherOption[];
  /** 已保存的任务分工 */
  assignees: ActivityTaskAssignee[];
  /** 已保存的分工说明 */
  note: string;
}>();

const emit = defineEmits<{
  confirm: [payload: { assignees: ActivityTaskAssignee[]; note: string }];
}>();

const visible = defineModel<boolean>("visible", { required: true });
const page = ref(1);
const pageSize = 9;
const draftNote = ref("");
const selected = ref(new Map<string, ActivityTaskRole>());

const pageTeachers = computed(() => {
  const start = (page.value - 1) * pageSize;
  return props.teachers.slice(start, start + pageSize);
});
const allChecked = computed(
  () => props.teachers.length > 0 && props.teachers.every((item) => selected.value.has(item.id)),
);
const someChecked = computed(
  () => props.teachers.some((item) => selected.value.has(item.id)) && !allChecked.value,
);

function syncFromProps() {
  selected.value = defaultTaskAssignees(props.teachers, props.assignees);
  draftNote.value = props.note;
  page.value = 1;
}

function resetDraft() {
  selected.value = new Map();
  draftNote.value = "";
  page.value = 1;
}

function toggleTeacher(id: string, checked: boolean) {
  selected.value = applyTeacherCheck(selected.value, id, checked);
}

function setRole(id: string, value: string) {
  selected.value = applyTeacherRole(selected.value, id, value);
}

function toggleAll(value: string | number | boolean) {
  if (value !== true) {
    selected.value = new Map();
    return;
  }
  selected.value = new Map(
    props.teachers.map((item) => [item.id, selected.value.get(item.id) ?? "participant"]),
  );
}

function onCheck(id: string, value: string | number | boolean) {
  toggleTeacher(id, value === true);
}

function onRole(id: string, value: string | number | boolean) {
  setRole(id, String(value));
}

function handleConfirm() {
  emit("confirm", { assignees: toAssignees(selected.value), note: draftNote.value.trim() });
  visible.value = false;
}

watch(
  () => visible.value,
  (open) => {
    if (open) syncFromProps();
  },
  { flush: "post" },
);
</script>

<style scoped src="./create-activity-sections.css"></style>
