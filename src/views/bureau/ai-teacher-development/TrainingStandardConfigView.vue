<template>
  <div class="page-wrapper">
    <PageFilterBar show-reset @search="handleSearch" @reset="handleReset">
      <div class="form-item">
        <span class="form-label">学期：</span>
        <el-select v-model="filterSemester" placeholder="全部" clearable>
          <el-option label="全部" value="" />
          <el-option
            v-for="item in TRAINING_STANDARD_SEMESTER_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
    </PageFilterBar>

    <div class="page-body">
      <div class="toolbar">
        <h1 class="toolbar-title">研修标准配置</h1>
        <div class="toolbar-right">
          <el-button @click="openWarning">预警阈值设置</el-button>
          <el-button type="primary" :icon="Plus" @click="openCreate">新增研修类型</el-button>
        </div>
      </div>

      <div class="table-wrapper">
        <TrainingStandardTypeTable
          :loading="loading"
          :rows="flatRows"
          @edit="openEdit"
          @download="handleDownload"
        />
      </div>
    </div>

    <TrainingStandardTypeDialog
      v-model:visible="dialogVisible"
      :editing-type="editingType"
      :is-create="isCreate"
      :saving="typeSaving"
      @confirm="handleSaveType"
      @closed="editingType = null"
    />

    <TrainingStandardWarningDialog
      v-model:visible="warningVisible"
      v-model:annual-credits="warningDraft.annualCredits"
      v-model:trigger-percent="warningDraft.triggerPercent"
      :saving="warningSaving"
      @save="handleSaveWarning"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import PageFilterBar from "@/components/PageFilterBar.vue";
import { trainingStandardConfigRepository } from "@/features/training-standard-config/training-standard-config-repository";
import {
  flattenTrainingStandardTypes,
  TRAINING_STANDARD_SEMESTER_OPTIONS,
  type TrainingStandardType,
  type TrainingStandardWarning,
} from "@/features/training-standard-config/types";
import { useUserStore } from "@/stores/user";
import TrainingStandardTypeDialog from "@/views/bureau/ai-teacher-development/TrainingStandardTypeDialog.vue";
import TrainingStandardTypeTable from "@/views/bureau/ai-teacher-development/TrainingStandardTypeTable.vue";
import TrainingStandardWarningDialog from "@/views/bureau/ai-teacher-development/TrainingStandardWarningDialog.vue";

defineOptions({ name: "TrainingStandardConfigView" });

const DEFAULT_SEMESTER: string = TRAINING_STANDARD_SEMESTER_OPTIONS[0].value;

const userStore = useUserStore();
const loading = ref(false);
const typeSaving = ref(false);
const warningSaving = ref(false);
const filterSemester = ref("");
const appliedSemester = ref(DEFAULT_SEMESTER);
const types = ref<TrainingStandardType[]>([]);
const warning = ref<TrainingStandardWarning>({ annualCredits: 36, triggerPercent: 60 });
const warningDraft = ref<TrainingStandardWarning>({ annualCredits: 36, triggerPercent: 60 });
const dialogVisible = ref(false);
const warningVisible = ref(false);
const isCreate = ref(false);
const editingType = ref<TrainingStandardType | null>(null);

const flatRows = computed(() => flattenTrainingStandardTypes(types.value));

function resolveSemester(value: string) {
  return value || DEFAULT_SEMESTER;
}

async function loadConfig(semester: string) {
  loading.value = true;
  try {
    const config = await trainingStandardConfigRepository.load(
      userStore.currentTenant.id,
      semester,
    );
    appliedSemester.value = semester;
    types.value = config.types;
    warning.value = { ...config.warning };
    warningDraft.value = { ...config.warning };
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  void loadConfig(resolveSemester(filterSemester.value));
}

function handleReset() {
  filterSemester.value = "";
  void loadConfig(DEFAULT_SEMESTER);
}

function openCreate() {
  isCreate.value = true;
  editingType.value = null;
  dialogVisible.value = true;
}

function openEdit(typeId: string) {
  const found = types.value.find((item) => item.id === typeId) ?? null;
  if (!found) return;
  isCreate.value = false;
  editingType.value = found;
  dialogVisible.value = true;
}

function openWarning() {
  warningDraft.value = { ...warning.value };
  warningVisible.value = true;
}

function handleDownload(name: string) {
  ElMessage.success(`已准备下载：${name}`);
}

async function handleSaveType(type: TrainingStandardType) {
  typeSaving.value = true;
  try {
    const next = isCreate.value
      ? [...types.value, type]
      : types.value.map((item) => (item.id === type.id ? type : item));
    const saved = await trainingStandardConfigRepository.saveTypes(
      userStore.currentTenant.id,
      appliedSemester.value,
      next,
    );
    types.value = saved.types;
    dialogVisible.value = false;
    ElMessage.success(isCreate.value ? "已新增研修类型" : "已保存研修类型");
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "保存失败");
  } finally {
    typeSaving.value = false;
  }
}

async function handleSaveWarning() {
  warningSaving.value = true;
  try {
    const saved = await trainingStandardConfigRepository.saveWarning(
      userStore.currentTenant.id,
      appliedSemester.value,
      { ...warningDraft.value },
    );
    warning.value = { ...saved.warning };
    warningDraft.value = { ...saved.warning };
    warningVisible.value = false;
    ElMessage.success("预警阈值已保存");
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "保存失败");
  } finally {
    warningSaving.value = false;
  }
}

onMounted(() => {
  void loadConfig(DEFAULT_SEMESTER);
});
</script>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-bg);
}

.page-body {
  flex: 1;
  overflow: hidden;
  padding: var(--spacing-24);
  background: var(--color-white);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
}

.form-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  height: 32px;
  min-width: 220px;
}

.form-label {
  font-size: var(--font-size-md);
  color: var(--color-title);
  line-height: var(--line-height-md);
  white-space: nowrap;
  flex-shrink: 0;
}

.form-item :deep(.el-select) {
  flex: 1;
  min-width: 0;
  --el-input-height: 32px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  gap: var(--spacing-16);
}

.toolbar-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-12);
}

.table-wrapper {
  flex: 1;
  overflow: auto;
}
</style>
