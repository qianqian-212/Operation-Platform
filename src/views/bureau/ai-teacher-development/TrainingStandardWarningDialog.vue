<template>
  <el-dialog
    v-model="visible"
    title="预警阈值设置"
    width="480px"
    destroy-on-close
  >
    <div class="warning-form">
      <div class="form-item">
        <span class="form-label">年度学分达标要求</span>
        <el-input-number
          v-model="annualCredits"
          :min="1"
          :max="200"
          :controls="false"
          class="number-input"
        />
        <span class="form-suffix">学分/年</span>
      </div>
      <div class="form-item">
        <span class="form-label">预警触发比例</span>
        <el-input-number
          v-model="triggerPercent"
          :min="0"
          :max="100"
          :controls="false"
          class="number-input"
        />
        <span class="form-suffix">% 以下触发预警</span>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="emit('save')">保存</el-button>
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
  gap: var(--spacing-16);
}

.form-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-12);
  min-width: 0;
}

.form-label {
  width: 128px;
  flex-shrink: 0;
  font-size: var(--font-size-md);
  color: var(--color-title);
}

.number-input {
  width: 96px;
}

.form-suffix {
  font-size: var(--font-size-md);
  color: var(--color-secondary);
  white-space: nowrap;
}
</style>
