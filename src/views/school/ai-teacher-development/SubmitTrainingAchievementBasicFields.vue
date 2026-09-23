<template>
  <section class="form-section">
    <h2 class="section-title">基本信息</h2>
    <div class="field-grid">
      <el-form-item label="成果标题" prop="title" class="field-full">
        <el-input v-model="form.title" maxlength="80" show-word-limit placeholder="请输入研修成果标题" />
      </el-form-item>

      <el-form-item label="研修类型" prop="type">
        <el-select v-model="form.type" placeholder="请选择研修类型" @change="onTypeChange">
          <el-option
            v-for="(meta, key) in TRAINING_ACHIEVEMENT_TYPE_MAP"
            :key="key"
            :label="meta.label"
            :value="key"
          />
        </el-select>
        <button type="button" class="helper-link" @click="emit('downloadGuide')">
          下载研修类型及等级说明（含分值表）
        </button>
      </el-form-item>

      <el-form-item label="等级" prop="levelId">
        <el-select v-model="form.levelId" placeholder="请先选择研修类型" :disabled="!form.type">
          <el-option
            v-for="item in levelOptions"
            :key="item.id"
            :label="`${item.label}（${item.score}分）`"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="所属教育局" prop="bureauId">
        <el-select v-model="form.bureauId" placeholder="请选择教育局">
          <el-option
            v-for="item in TRAINING_ACHIEVEMENT_BUREAU_OPTIONS"
            :key="item.id"
            :label="item.label"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="所属学期" prop="semester">
        <el-select v-model="form.semester" placeholder="请选择学期">
          <el-option
            v-for="item in TRAINING_ACHIEVEMENT_SEMESTER_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="所属学科" prop="subject">
        <el-select v-model="form.subject" placeholder="请选择学科" clearable>
          <el-option
            v-for="item in TRAINING_ACHIEVEMENT_SUBJECT_OPTIONS"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="所属学段" prop="stage">
        <el-select v-model="form.stage" placeholder="请选择学段" clearable>
          <el-option
            v-for="item in TRAINING_ACHIEVEMENT_STAGE_OPTIONS"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="摘要" prop="abstract" class="field-full">
        <el-input
          v-model="form.abstract"
          type="textarea"
          :rows="5"
          maxlength="500"
          show-word-limit
          placeholder="请简要描述研修成果的核心内容、成果价值（200-500字）"
        />
      </el-form-item>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  TRAINING_ACHIEVEMENT_BUREAU_OPTIONS,
  TRAINING_ACHIEVEMENT_LEVELS,
  TRAINING_ACHIEVEMENT_SEMESTER_OPTIONS,
  TRAINING_ACHIEVEMENT_STAGE_OPTIONS,
  TRAINING_ACHIEVEMENT_SUBJECT_OPTIONS,
  TRAINING_ACHIEVEMENT_TYPE_MAP,
  type TrainingAchievementFormInput,
  type TrainingAchievementType,
} from "@/features/training-achievement/types";

defineOptions({ name: "SubmitTrainingAchievementBasicFields" });

const form = defineModel<TrainingAchievementFormInput>("form", { required: true });

const emit = defineEmits<{
  downloadGuide: [];
}>();

const levelOptions = computed(() => {
  if (!form.value.type) return [];
  return TRAINING_ACHIEVEMENT_LEVELS[form.value.type as TrainingAchievementType];
});

function onTypeChange() {
  form.value.levelId = "";
}
</script>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.section-title {
  margin: 0 0 var(--spacing-8);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 var(--spacing-24);
}

.field-full {
  grid-column: 1 / -1;
}

.helper-link {
  margin-top: var(--spacing-8);
  border: 0;
  background: transparent;
  padding: 0;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  text-align: left;
}

.helper-link:hover {
  color: var(--color-primary-hover);
}

@media (max-width: 860px) {
  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>
