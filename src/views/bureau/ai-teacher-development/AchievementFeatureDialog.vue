<template>
  <el-dialog v-model="visible" title="加精" width="480px" destroy-on-close>
    <el-form label-position="top" require-asterisk-position="left">
      <el-form-item label="选择成果" required>
        <el-select v-model="selectedId" filterable placeholder="请选择成果" style="width: 100%">
          <el-option
            v-for="item in candidates"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="推荐理由">
        <el-input
          v-model="reason"
          type="textarea"
          :rows="4"
          maxlength="200"
          show-word-limit
          placeholder="简述推荐该成果的理由"
        />
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
import { ElMessage } from "element-plus";
import type { AchievementReviewRow } from "@/features/training-achievement-review/types";

defineOptions({ name: "AchievementFeatureDialog" });

const props = defineProps<{
  /** 可选成果 */
  candidates: AchievementReviewRow[];
  /** 默认选中 */
  defaultId: string;
  /** 保存中 */
  saving: boolean;
}>();

const visible = defineModel<boolean>("visible", { required: true });
const selectedId = ref("");
const reason = ref("");

const emit = defineEmits<{
  confirm: [id: string, reason: string];
}>();

watch(visible, (open) => {
  if (!open) return;
  selectedId.value = props.defaultId || props.candidates[0]?.id || "";
  reason.value = "";
});

function handleConfirm() {
  if (!selectedId.value) {
    ElMessage.warning("请选择成果");
    return;
  }
  emit("confirm", selectedId.value, reason.value.trim());
}
</script>
