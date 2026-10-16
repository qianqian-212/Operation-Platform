<template>
  <el-dialog v-model="visible" title="添加成员" width="560px" destroy-on-close class="lt-group-dialog">
    <el-form label-position="top" require-asterisk-position="left" @submit.prevent="handleConfirm">
      <el-form-item label="学校名称" required>
        <el-input v-model="schoolName" maxlength="30" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="老师姓名" required>
        <el-input v-model="teacherName" maxlength="30" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="电话号码" required>
        <el-input v-model="phone" maxlength="11" placeholder="请输入" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { LayeredTrainingGroupMemberDraft } from "@/features/layered-training-group/types";

defineOptions({ name: "LayeredTrainingGroupMemberDialog" });

defineProps<{
  /** 确认请求进行中 */
  saving: boolean;
}>();

const visible = defineModel<boolean>({ required: true });
const emit = defineEmits<{ confirm: [draft: LayeredTrainingGroupMemberDraft] }>();
const schoolName = ref("");
const teacherName = ref("");
const phone = ref("");

watch(
  visible,
  (open) => {
    if (!open) return;
    schoolName.value = "";
    teacherName.value = "";
    phone.value = "";
  },
  { flush: "post" },
);

function handleConfirm() {
  emit("confirm", {
    schoolName: schoolName.value,
    teacherName: teacherName.value,
    phone: phone.value,
  });
}
</script>
