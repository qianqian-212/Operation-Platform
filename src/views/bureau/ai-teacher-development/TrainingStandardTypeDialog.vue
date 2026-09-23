<template>
  <el-dialog
    v-model="visible"
    :title="isCreate ? '新增研修类型' : '编辑研修类型'"
    width="640px"
    destroy-on-close
    @closed="emit('closed')"
  >
    <el-form label-position="top" require-asterisk-position="left">
      <el-form-item label="研修类型名称" required>
        <el-input v-model="draft.name" maxlength="20" placeholder="请输入研修类型名称" />
      </el-form-item>
      <el-form-item label="类型详解附件名称" required>
        <el-input
          v-model="draft.attachmentName"
          maxlength="60"
          placeholder="例如：科研获奖认定标准.pdf"
        />
      </el-form-item>

      <div class="level-header">
        <span class="level-title">等级与分值</span>
        <el-button link type="primary" @click="addLevel">添加等级</el-button>
      </div>

      <div v-for="(level, index) in draft.levels" :key="level.id" class="level-row">
        <el-input v-model="level.name" placeholder="等级名称" />
        <el-input v-model="level.description" placeholder="等级说明" />
        <el-input v-model="level.scoreLabel" placeholder="分值" />
        <el-select v-model="level.tone" placeholder="标签色">
          <el-option label="绿色" value="green" />
          <el-option label="蓝色" value="blue" />
          <el-option label="灰色" value="gray" />
        </el-select>
        <el-button link type="danger" :disabled="draft.levels.length <= 1" @click="removeLevel(index)">
          删除
        </el-button>
      </div>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleConfirm">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import type {
  TrainingStandardLevel,
  TrainingStandardType,
} from "@/features/training-standard-config/types";

defineOptions({ name: "TrainingStandardTypeDialog" });

const props = defineProps<{
  /** 编辑中的类型，空表示新建 */
  editingType: TrainingStandardType | null;
  /** 是否新建 */
  isCreate: boolean;
  /** 保存中 */
  saving: boolean;
}>();

const visible = defineModel<boolean>("visible", { required: true });

const emit = defineEmits<{
  confirm: [type: TrainingStandardType];
  closed: [];
}>();

const draft = ref(createEmptyType());

const toneCycle = ["green", "blue", "gray"] as const;

watch(
  () => [props.editingType, props.isCreate, visible.value] as const,
  ([editingType, isCreate, open]) => {
    if (!open) return;
    draft.value = isCreate || !editingType ? createEmptyType() : cloneType(editingType);
  },
  { flush: "post" },
);

const canSave = computed(() => {
  if (!draft.value.name.trim() || !draft.value.attachmentName.trim()) return false;
  return draft.value.levels.every(
    (level) => level.name.trim() && level.description.trim() && level.scoreLabel.trim(),
  );
});

function createEmptyType(): TrainingStandardType {
  return {
    id: `type-${Date.now()}`,
    name: "",
    attachmentName: "",
    levels: [createEmptyLevel(0)],
  };
}

function createEmptyLevel(index: number): TrainingStandardLevel {
  const tone = toneCycle[index % toneCycle.length] ?? "gray";
  return {
    id: `lvl-${Date.now()}-${index}`,
    name: "",
    description: "",
    scoreLabel: "",
    tone,
  };
}

function cloneType(type: TrainingStandardType): TrainingStandardType {
  return {
    ...type,
    levels: type.levels.map((level) => ({ ...level })),
  };
}

function addLevel() {
  draft.value.levels = [...draft.value.levels, createEmptyLevel(draft.value.levels.length)];
}

function removeLevel(index: number) {
  draft.value.levels = draft.value.levels.filter((_, i) => i !== index);
}

function handleConfirm() {
  if (!canSave.value) {
    ElMessage.warning("请完善研修类型与等级信息");
    return;
  }
  emit("confirm", {
    ...draft.value,
    name: draft.value.name.trim(),
    attachmentName: draft.value.attachmentName.trim(),
    levels: draft.value.levels.map((level) => ({
      ...level,
      name: level.name.trim(),
      description: level.description.trim(),
      scoreLabel: level.scoreLabel.trim(),
    })),
  });
}
</script>

<style scoped>
.level-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-8);
}

.level-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
}

.level-row {
  display: grid;
  grid-template-columns: 1.2fr 1.4fr 0.7fr 0.7fr auto;
  gap: var(--spacing-8);
  margin-bottom: var(--spacing-8);
  align-items: center;
}

@media (max-width: 720px) {
  .level-row {
    grid-template-columns: 1fr;
  }
}
</style>
