<template>
  <el-dialog
    v-model="visible"
    title="新增分组"
    width="560px"
    destroy-on-close
    class="lt-group-dialog lt-group-create-dialog"
  >
    <el-form label-position="top" require-asterisk-position="left" @submit.prevent="handleConfirm">
      <el-form-item label="分组名称" required>
        <el-input v-model="name" maxlength="20" placeholder="请输入" />
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

defineOptions({ name: "LayeredTrainingGroupCreateDialog" });

defineProps<{
  /** 确认请求进行中 */
  saving: boolean;
}>();

const visible = defineModel<boolean>({ required: true });
const emit = defineEmits<{ confirm: [name: string] }>();
const name = ref("");

watch(
  visible,
  (open) => {
    if (open) name.value = "";
  },
  { flush: "post" },
);

function handleConfirm() {
  emit("confirm", name.value);
}
</script>
