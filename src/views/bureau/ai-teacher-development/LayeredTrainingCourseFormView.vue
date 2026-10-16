<template>
  <div class="create-page page-with-breadcrumb">
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: listPath }">课程管理</el-breadcrumb-item>
        <el-breadcrumb-item>{{ pageHeading }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div v-loading="loading" class="create-body">
      <section class="form-card">
        <div class="form-inner">
          <h1 class="page-title">{{ pageHeading }}</h1>
          <el-alert
            v-if="reviewComment"
            class="review-alert"
            :title="reviewComment"
            type="error"
            show-icon
            :closable="false"
          />
          <el-form class="course-form" label-position="top" :disabled="readOnly">
            <el-form-item label="课程名称" required>
              <el-input v-model="form.title" maxlength="50" placeholder="请输入课程名称" />
            </el-form-item>
            <div class="field-grid">
              <el-form-item label="课程类型" required>
                <el-select v-model="form.kind" placeholder="请选择">
                  <el-option
                    v-for="item in MANAGED_COURSE_KIND_OPTIONS"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="所属学科" required>
                <el-select v-model="form.subject" placeholder="请选择">
                  <el-option
                    v-for="subject in MANAGED_COURSE_SUBJECT_OPTIONS"
                    :key="subject"
                    :label="subject"
                    :value="subject"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="适用学段" required>
                <el-select v-model="form.stage" placeholder="请选择">
                  <el-option
                    v-for="item in MANAGED_COURSE_STAGE_OPTIONS"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="适用分组">
                <div class="group-fields">
                  <el-select v-model="form.groupType" placeholder="分组类型" clearable>
                    <el-option
                      v-for="item in MANAGED_COURSE_GROUP_TYPE_OPTIONS"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <el-select v-model="form.groupName" placeholder="具体分组" :disabled="!form.groupType">
                    <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group" />
                  </el-select>
                </div>
                <p class="field-hint">先选择分组类型（系统分组/自定义分组），再选择具体分组。</p>
              </el-form-item>
            </div>
            <el-form-item label="课程学分" required>
              <el-input v-model="form.creditText" maxlength="3" placeholder="如：2（学分）" />
              <p class="field-hint">为课程设置对应的继续教育学分，教师完成学习并通过考核后自动认定。</p>
            </el-form-item>
            <el-form-item label="课程简介" required>
              <el-input
                v-model="form.summary"
                type="textarea"
                :rows="4"
                maxlength="200"
                show-word-limit
                placeholder="请输入课程简介（限200字内）"
              />
            </el-form-item>
            <LayeredTrainingCourseLessonFields
              v-model="form.lessons"
              :kind="form.kind"
              :disabled="readOnly"
            />
          </el-form>
          <div class="form-actions">
            <el-button v-if="!readOnly" type="primary" :loading="saving" @click="handleSubmit">
              提交审核
            </el-button>
            <el-button v-if="!readOnly" :loading="saving" @click="handleDraft">保存草稿</el-button>
            <el-button @click="goBack">返回列表</el-button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { layeredTrainingGroupRepository } from "@/features/layered-training-group/layered-training-group-repository";
import {
  MANAGED_COURSE_GROUP_TYPE_OPTIONS,
  MANAGED_COURSE_KIND_OPTIONS,
  MANAGED_COURSE_STAGE_OPTIONS,
  MANAGED_COURSE_SUBJECT_OPTIONS,
  emptyManagedCourseForm,
  managedCourseFormError,
  managedCourseGroups,
  managedCourseToForm,
  type ManagedCourseForm,
  type ManagedCourseStatus,
} from "@/features/layered-training-course-manage/types";
import {
  useLayeredTrainingCourseManageStore,
  useSchoolLayeredTrainingCourseManageStore,
} from "@/stores/layered-training-course-manage";
import { useUserStore } from "@/stores/user";
import LayeredTrainingCourseLessonFields from "./LayeredTrainingCourseLessonFields.vue";

defineOptions({ name: "LayeredTrainingCourseFormView" });

const props = withDefaults(
  defineProps<{
    /** bureau 与 school 共用表单，只区分保存到哪一份课程目录 */
    audience?: "bureau" | "school";
  }>(),
  { audience: "bureau" },
);

const route = useRoute();
const router = useRouter();
const bureauStore = useLayeredTrainingCourseManageStore();
const schoolStore = useSchoolLayeredTrainingCourseManageStore();
const userStore = useUserStore();
const form = ref<ManagedCourseForm>(emptyManagedCourseForm());
const loading = ref(false);
const saving = ref(false);
const reviewComment = ref("");
const loadedStatus = ref<ManagedCourseStatus | "">("");
const customGroupNames = ref<string[]>([]);

const courseId = computed(() => (typeof route.params.id === "string" ? route.params.id : ""));
const listPath = computed(() =>
  props.audience === "school"
    ? "/ai-teacher-development/layered-training/courses"
    : "/bureau/ai-teacher-development/layered-training/courses",
);

function courseStore() {
  return props.audience === "school" ? schoolStore : bureauStore;
}
const readOnly = computed(() => {
  if (!courseId.value) return false;
  if (loadedStatus.value === "pending") return true;
  return route.query.mode !== "edit";
});
const pageHeading = computed(() => {
  if (!courseId.value) return "上传课程";
  return readOnly.value ? "查看课程" : "编辑课程";
});
const groupOptions = computed(() =>
  managedCourseGroups(form.value.groupType, customGroupNames.value),
);

async function loadCustomGroups() {
  const groups = await layeredTrainingGroupRepository.listGroups(userStore.currentTenant.id);
  customGroupNames.value = groups.map((group) => group.name);
}

async function loadPage() {
  await loadCustomGroups();
  await loadCourse();
}

function goBack() {
  void router.push(listPath.value);
}

async function loadCourse() {
  reviewComment.value = "";
  loadedStatus.value = "";
  if (!courseId.value) {
    form.value = emptyManagedCourseForm();
    return;
  }
  loading.value = true;
  try {
    const course = await courseStore().loadDetail(courseId.value);
    if (!course) {
      form.value = emptyManagedCourseForm();
      return;
    }
    form.value = managedCourseToForm(course);
    reviewComment.value = course.reviewComment;
    loadedStatus.value = course.reviewStatus;
  } finally {
    loading.value = false;
  }
}

async function persist(intent: "draft" | "submit") {
  const error = managedCourseFormError(form.value, intent);
  if (error) {
    ElMessage.warning(error);
    return;
  }
  saving.value = true;
  try {
    await courseStore().save(courseId.value, form.value, intent);
    ElMessage.success(intent === "submit" ? "已提交审核" : "已保存草稿");
    goBack();
  } catch (saveError) {
    ElMessage.error(saveError instanceof Error ? saveError.message : "保存失败");
  } finally {
    saving.value = false;
  }
}

function handleSubmit() {
  void persist("submit");
}

function handleDraft() {
  void persist("draft");
}

onMounted(() => {
  void loadPage();
});

watch(
  () => [route.params.id, route.query.mode],
  () => {
    void loadPage();
  },
  { flush: "post" },
);

watch(
  () => form.value.groupType,
  () => {
    if (!groupOptions.value.includes(form.value.groupName)) form.value.groupName = "";
  },
  { flush: "post" },
);
</script>

<style scoped src="./layered-training-course-form.css"></style>

<style scoped>
.review-alert {
  margin-bottom: var(--spacing-16);
}
</style>
