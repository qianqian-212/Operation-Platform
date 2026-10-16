<template>
  <div v-loading="loading" class="page">
    <h1 class="sr-only">督学标准设置</h1>
    <div class="standards">
      <section class="card" aria-labelledby="slow-progress-title">
        <h2 id="slow-progress-title" class="card-title">进度缓慢标准</h2>
        <div class="field">
          <p class="field-label">
            <span class="required" aria-hidden="true">*</span>进度缓慢判定天数
          </p>
          <p class="field-desc">
            教师连续超过此天数未更新研修进度，系统将自动判定为“进度缓慢”并触发提醒
          </p>
          <SupervisionStandardSlider
            v-model="draft.slowProgressDays"
            :min="SLOW_PROGRESS_DAY_LIMITS.min"
            :max="SLOW_PROGRESS_DAY_LIMITS.max"
            unit="天"
            label="进度缓慢判定天数"
          />
        </div>
        <div class="field">
          <p class="field-label">
            <span class="required" aria-hidden="true">*</span>通知周期
          </p>
          <p class="field-desc">
            首次通知后进入下一周期复查，如仍未达标则再次通知
          </p>
          <SupervisionStandardSlider
            v-model="draft.noticeCycleDays"
            :min="NOTICE_CYCLE_DAY_LIMITS.min"
            :max="NOTICE_CYCLE_DAY_LIMITS.max"
            unit="天"
            label="通知周期"
          />
        </div>
        <p class="reminder">{{ SUPERVISION_REMINDER_NOTE }}</p>
      </section>

      <section class="card" aria-labelledby="credit-standard-title">
        <h2 id="credit-standard-title" class="card-title">学分达标标准</h2>
        <div class="field">
          <label class="field-label" for="semester-credit-line">
            <span class="required" aria-hidden="true">*</span>学期达标线（学分）
          </label>
          <p id="semester-credit-desc" class="field-desc">教师本学期需获得的最低学分数</p>
          <el-input
            id="semester-credit-line"
            ref="creditInput"
            class="credit-input"
            :model-value="creditText"
            maxlength="3"
            inputmode="numeric"
            :aria-invalid="creditInvalid"
            :aria-describedby="creditDescribedBy"
            @update:model-value="updateCreditText"
          />
          <p v-if="creditError" id="semester-credit-error" class="field-error">{{ creditError }}</p>
        </div>
        <div class="field">
          <p class="field-label">
            <span class="required" aria-hidden="true">*</span>达标预警触发比例
          </p>
          <p class="field-desc">完成率低于此比例时触发预警</p>
          <SupervisionStandardSlider
            v-model="draft.warningTriggerPercent"
            :min="WARNING_PERCENT_LIMITS.min"
            :max="WARNING_PERCENT_LIMITS.max"
            unit="%"
            label="达标预警触发比例"
          />
        </div>
      </section>
    </div>

    <div class="actions">
      <el-button type="primary" :loading="saving" :disabled="loading" @click="handleSave">
        保存设置
      </el-button>
      <el-button :disabled="loading || saving" @click="handleRestore">恢复默认</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { layeredTrainingSupervisionRepository } from "@/features/layered-training-supervision/layered-training-supervision-repository";
import {
  cloneSupervisionStandard,
  DEFAULT_SUPERVISION_STANDARD,
  NOTICE_CYCLE_DAY_LIMITS,
  SEMESTER_CREDIT_LIMITS,
  SLOW_PROGRESS_DAY_LIMITS,
  SUPERVISION_REMINDER_NOTE,
  WARNING_PERCENT_LIMITS,
  type SupervisionStandard,
} from "@/features/layered-training-supervision/types";
import { useUserStore } from "@/stores/user";
import SupervisionStandardSlider from "@/views/bureau/ai-teacher-development/SupervisionStandardSlider.vue";

defineOptions({ name: "SupervisionStandardView" });

interface FocusableInput {
  focus: () => void;
}

const userStore = useUserStore();
const loading = ref(false);
const saving = ref(false);
const creditError = ref("");
const creditText = ref(String(DEFAULT_SUPERVISION_STANDARD.semesterCreditLine));
const creditInput = ref<FocusableInput | null>(null);
const draft = ref<SupervisionStandard>(cloneSupervisionStandard(DEFAULT_SUPERVISION_STANDARD));

const creditInvalid = computed(() => creditError.value.length > 0);
const creditDescribedBy = computed(() =>
  creditError.value ? "semester-credit-desc semester-credit-error" : "semester-credit-desc",
);

function applyLoaded(standard: SupervisionStandard) {
  draft.value = standard;
  creditText.value = String(standard.semesterCreditLine);
  creditError.value = "";
}

function updateCreditText(value: string) {
  creditText.value = value.replace(/\D/g, "").slice(0, 3);
  creditError.value = "";
}

function creditValidationMessage(value: string) {
  const parsed = Number(value);
  const inRange =
    Number.isInteger(parsed) &&
    parsed >= SEMESTER_CREDIT_LIMITS.min &&
    parsed <= SEMESTER_CREDIT_LIMITS.max;
  if (value && inRange) return "";
  return `学期达标线需在 ${SEMESTER_CREDIT_LIMITS.min}-${SEMESTER_CREDIT_LIMITS.max} 之间`;
}

function draftFromForm() {
  const message = creditValidationMessage(creditText.value);
  creditError.value = message;
  if (message) {
    creditInput.value?.focus();
    return null;
  }
  return { ...draft.value, semesterCreditLine: Number(creditText.value) };
}

async function persist(standard: SupervisionStandard, successMessage: string) {
  saving.value = true;
  try {
    const saved = await layeredTrainingSupervisionRepository.save(
      userStore.currentTenant.id,
      cloneSupervisionStandard(standard),
    );
    applyLoaded(saved);
    ElMessage.success(successMessage);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "保存失败");
  } finally {
    saving.value = false;
  }
}

function handleSave() {
  const standard = draftFromForm();
  if (!standard) return;
  void persist(standard, "督学标准已保存");
}

function handleRestore() {
  creditError.value = "";
  void persist(cloneSupervisionStandard(DEFAULT_SUPERVISION_STANDARD), "已恢复默认标准");
}

async function loadStandard() {
  loading.value = true;
  try {
    applyLoaded(await layeredTrainingSupervisionRepository.load(userStore.currentTenant.id));
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "加载督学标准失败");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadStandard();
});
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
  min-width: 0;
  max-width: 100%;
  min-height: 100%;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.standards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-16);
  align-items: stretch;
  min-width: 0;
}

.card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-20);
  min-width: 0;
  padding: var(--spacing-20) var(--spacing-24);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  container-type: inline-size;
}

.card-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-lg);
  color: var(--color-title);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.field-label {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-md);
  color: var(--color-title);
}

.required {
  margin-right: var(--spacing-4);
  color: var(--color-error);
}

.field-desc,
.reminder {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: var(--font-size-xs);
  line-height: var(--line-height-xs);
  color: var(--color-secondary);
}

.reminder {
  padding: var(--spacing-12) var(--spacing-16);
  background: var(--color-bg-muted);
  border-radius: var(--radius-md);
  color: var(--color-body);
  line-height: var(--line-height-md);
}

.credit-input :deep(.el-input__inner) {
  text-align: left;
}

.field-error {
  margin: 0;
  font-size: var(--font-size-xs);
  line-height: var(--line-height-xs);
  color: var(--color-error);
}

.actions {
  display: flex;
  gap: var(--spacing-12);
}

@media (max-width: 960px) {
  .standards {
    grid-template-columns: 1fr;
  }
}
</style>
