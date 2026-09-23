<template>
  <div class="create-page page-with-breadcrumb">
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: listPath }">我的成果列表</el-breadcrumb-item>
        <el-breadcrumb-item>{{ pageHeading }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="create-body">
      <section class="form-card">
        <h1 class="page-title">{{ pageHeading }}</h1>
        <p class="page-subtitle">请填写成果信息并上传证明材料，带 * 为必填项</p>
        <p class="form-note">
          研修类型已与类别合并。请先选择研修类型，再选择对应等级；常见类型包括教学成果、培训进修、科研获奖、论文发表与校本研修。
        </p>

        <el-form
          ref="formRef"
          class="achievement-form"
          label-position="top"
          require-asterisk-position="left"
          :model="form"
          :rules="rules"
        >
          <SubmitTrainingAchievementBasicFields
            v-model:form="form"
            @download-guide="handleDownloadGuide"
          />
          <SubmitTrainingAchievementUploadFields v-model:form="form" />
          <div class="form-actions">
            <el-button type="primary" :loading="submitting" @click="handleSubmit">
              提交审核
            </el-button>
            <el-button :loading="submitting" @click="handleSaveDraft">保存草稿</el-button>
            <el-button @click="goBack">取消</el-button>
          </div>
        </el-form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import type { TrainingAchievementFormInput } from "@/features/training-achievement/types";
import { TRAINING_ACHIEVEMENT_LEVELS } from "@/features/training-achievement/types";
import { useTrainingAchievementStore } from "@/stores/training-achievement";
import SubmitTrainingAchievementBasicFields from "@/views/school/ai-teacher-development/SubmitTrainingAchievementBasicFields.vue";
import SubmitTrainingAchievementUploadFields from "@/views/school/ai-teacher-development/SubmitTrainingAchievementUploadFields.vue";

defineOptions({ name: "SubmitTrainingAchievementView" });

const listPath = "/ai-teacher-development/teaching-monitoring/achievements";
const route = useRoute();
const router = useRouter();
const achievementStore = useTrainingAchievementStore();
const formRef = ref<FormInstance>();
const form = ref<TrainingAchievementFormInput>(achievementStore.emptyForm());
const submitting = ref(false);
const editingId = computed(() => {
  const id = route.query.id;
  return typeof id === "string" && id ? id : "";
});
const pageHeading = computed(() => (editingId.value ? "修改重提研修成果" : "提交研修成果"));

const rules: FormRules = {
  title: [{ required: true, message: "请输入成果标题", trigger: "blur" }],
  type: [{ required: true, message: "请选择研修类型", trigger: "change" }],
  levelId: [{ required: true, message: "请选择等级", trigger: "change" }],
  bureauId: [{ required: true, message: "请选择所属教育局", trigger: "change" }],
  semester: [{ required: true, message: "请选择所属学期", trigger: "change" }],
  abstract: [
    { required: true, message: "请填写摘要", trigger: "blur" },
    { min: 50, message: "摘要至少 50 字", trigger: "blur" },
  ],
};

function goBack() {
  void router.push(listPath);
}

function handleDownloadGuide() {
  ElMessage.info("研修类型及等级说明下载能力待接入正式文件服务");
}

function findLevelId(type: TrainingAchievementFormInput["type"], levelLabel: string) {
  if (!type) return "";
  return TRAINING_ACHIEVEMENT_LEVELS[type].find((item) => item.label === levelLabel)?.id ?? "";
}

async function hydrateForEdit() {
  if (!editingId.value) return;
  const detail = await achievementStore.loadDetail(editingId.value);
  if (!detail) {
    ElMessage.error("未找到待修改的成果");
    return;
  }
  form.value = {
    title: detail.title,
    type: detail.type,
    levelId: findLevelId(detail.type, detail.levelLabel),
    bureauId: "bureau-xx",
    semester: detail.semester,
    subject: detail.subject,
    stage: detail.stage,
    abstract: detail.abstract,
    certificateFiles: detail.attachments.filter((item) => item.kind === "certificate"),
    reportFiles: detail.attachments.filter((item) => item.kind === "report"),
    asDraft: false,
  };
}

async function persist(asDraft: boolean) {
  if (!asDraft) {
    const files = [...form.value.certificateFiles, ...form.value.reportFiles];
    if (!files.length) {
      ElMessage.warning("请至少上传一项证明材料");
      return;
    }
  }
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    await achievementStore.submit(
      { ...form.value, asDraft },
      editingId.value || undefined,
    );
    ElMessage.success(asDraft ? "草稿已保存" : "已提交审核");
    void router.push(listPath);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "提交失败");
  } finally {
    submitting.value = false;
  }
}

function handleSaveDraft() {
  void persist(true);
}

function handleSubmit() {
  void persist(false);
}

onMounted(() => {
  void hydrateForEdit();
});
</script>

<style scoped src="./submit-training-achievement.css"></style>
