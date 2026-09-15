<template>
  <el-dialog
    v-model="visible"
    :title="title"
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
              <el-checkbox :model-value="selectedIds.has(row.id)" @change="onCheck(row.id, $event)" />
            </template>
          </el-table-column>
          <el-table-column prop="name" label="姓名" min-width="160" />
          <el-table-column label="学校" min-width="220">
            <template #default="{ row }">{{ row.schoolName }} · {{ row.subject }}</template>
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
      <div class="inline-choice">
        <span class="inline-choice-label">
          <span class="required-mark">*</span>
          是否需要上传文件：
        </span>
        <el-radio-group v-model="draftRequireFile">
          <el-radio :value="true">是</el-radio>
          <el-radio :value="false">否</el-radio>
        </el-radio-group>
      </div>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import type { ActivityTaskAssignee } from "@/features/cross-school-activity/types";
import type { ActivityTaskTeacherOption } from "@/views/bureau/ai-teacher-development/create-activity-form";

defineOptions({ name: "CreateActivityTaskEditDialog" });

const props = withDefaults(
  defineProps<{
    /** 弹窗标题 */
    title?: string;
    /** 活动已选教师 */
    teachers: ActivityTaskTeacherOption[];
    /** 已保存的任务教师 */
    assignees: ActivityTaskAssignee[];
    /** 是否需要上传文件 */
    requireFile: boolean;
  }>(),
  { title: "添加任务" },
);

const emit = defineEmits<{
  confirm: [payload: { assignees: ActivityTaskAssignee[]; requireFile: boolean }];
}>();

const visible = defineModel<boolean>("visible", { required: true });
const page = ref(1);
const pageSize = 9;
const draftRequireFile = ref(false);
const selectedIds = ref(new Set<string>());

const pageTeachers = computed(() => {
  const start = (page.value - 1) * pageSize;
  return props.teachers.slice(start, start + pageSize);
});
const allChecked = computed(
  () => props.teachers.length > 0 && props.teachers.every((item) => selectedIds.value.has(item.id)),
);
const someChecked = computed(
  () => props.teachers.some((item) => selectedIds.value.has(item.id)) && !allChecked.value,
);

function syncFromProps() {
  selectedIds.value = new Set(props.assignees.map((item) => item.teacherId));
  draftRequireFile.value = props.requireFile;
  page.value = 1;
}

function resetDraft() {
  selectedIds.value = new Set();
  draftRequireFile.value = false;
  page.value = 1;
}

function toggleTeacher(id: string, checked: boolean) {
  const next = new Set(selectedIds.value);
  if (checked) next.add(id);
  else next.delete(id);
  selectedIds.value = next;
}

function toggleAll(value: string | number | boolean) {
  selectedIds.value = value === true ? new Set(props.teachers.map((item) => item.id)) : new Set();
}

function onCheck(id: string, value: string | number | boolean) {
  toggleTeacher(id, value === true);
}

function handleConfirm() {
  if (!selectedIds.value.size) {
    ElMessage.warning("请选择参与教师");
    return;
  }
  emit("confirm", {
    requireFile: draftRequireFile.value,
    assignees: Array.from(selectedIds.value).map((teacherId) => ({
      teacherId,
      role: "participant" as const,
    })),
  });
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
