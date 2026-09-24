<template>
  <el-dialog
    v-model="visible"
    title="预警阈值设置"
    width="520px"
    destroy-on-close
  >
    <div class="warning-form">
      <div class="field-row">
        <span class="form-label">学分达标要求：</span>
        <el-input-number
          v-model="annualCredits"
          :min="1"
          :max="200"
          :controls="false"
          class="number-input"
        />
        <span class="form-suffix">学分/学期</span>
      </div>
      <div class="field-row">
        <span class="form-label">预警触发比例：</span>
        <el-input-number
          v-model="triggerPercent"
          :min="0"
          :max="100"
          :controls="false"
          class="number-input"
        />
        <span class="form-suffix">%以下触发预警</span>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="emit('save')">保存设置</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
defineOptions({ name: "TrainingStandardWarningDialog" });

defineProps<{
  /** 保存中 */
  saving: boolean;
}>();

const visible = defineModel<boolean>("visible", { required: true });
const annualCredits = defineModel<number>("annualCredits", { required: true });
const triggerPercent = defineModel<number>("triggerPercent", { required: true });

const emit = defineEmits<{
  save: [];
}>();
</script>

<style scoped>
.warning-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-24);
  padding: var(--spacing-8) 0;
}

.field-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-12);
  min-width: 0;
}

.form-label {
  flex-shrink: 0;
  width: 112px;
  text-align: right;
  font-size: var(--font-size-md);
  color: var(--color-title);
  line-height: var(--line-height-md);
}

.number-input {
  width: 160px;
}

.form-suffix {
  font-size: var(--font-size-md);
  color: var(--color-secondary);
  white-space: nowrap;
}
</style>
