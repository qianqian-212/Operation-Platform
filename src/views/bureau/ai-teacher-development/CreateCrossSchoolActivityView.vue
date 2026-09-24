<template>
  <div class="create-page page-with-breadcrumb">
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: listPath }">活动管理</el-breadcrumb-item>
        <el-breadcrumb-item>创建活动</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <section class="page-card">
      <h1 class="page-title">创建跨校教研活动</h1>
      <el-form
        ref="formRef"
        class="activity-form"
        label-position="top"
        require-asterisk-position="left"
        :model="form"
        :rules="rules"
        @submit.prevent="handleSubmit"
      >
        <CreateActivityBasicFields
          v-model:form="form"
          :alliances="alliances"
          @alliance-change="handleAllianceChange"
        />
        <CreateActivityMemberSections
          :schools="selectedSchools"
          :lead-school-id="form.leadSchoolId"
          :teachers="selectedTeachers"
          @pick-teachers="openTeacherPicker"
          @remove-teacher="removeTeacher"
        />
        <CreateActivityPrepFields v-if="hasPrep" v-model:form="form" />
        <CreateActivityTaskSection v-model:form="form" :teachers="taskTeachers" />
        <CreateActivityObservationFields
          v-if="hasObservation"
          v-model:form="form"
          :picker-schools="pickerSchools"
          :picker-people="pickerPeople"
          :org-ids="observationOrgIds"
          :lead-org-id="form.leadSchoolId"
          :teachers="selectedTeachers"
        />
        <div class="form-actions">
          <el-button type="primary" :loading="submitting" @click="handleSubmit">创建活动</el-button>
          <el-button @click="goBack">取消</el-button>
        </div>
      </el-form>
    </section>

    <OrgMemberPickerDialog
      v-model:visible="teacherPickerVisible"
      mode="person"
      title="选择学校和教师"
      :schools="pickerSchools"
      :people="pickerPeople"
      :org-ids="allianceOrgIds"
      :lead-org-id="form.leadSchoolId"
      :model-value="form.teacherIds"
      :selected-org-ids="form.memberSchoolIds"
      :min-count="0"
      @confirm="handleTeacherConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import OrgMemberPickerDialog from "@/components/org-member-picker/OrgMemberPickerDialog.vue";
import type {
  OrgMemberPickerPerson,
  OrgMemberPickerPersonResult,
  OrgMemberPickerSchoolResult,
} from "@/components/org-member-picker/types";
import { crossSchoolActivityRepository } from "@/features/cross-school-activity/cross-school-activity-repository";
import { crossSchoolActivityListPath } from "@/features/cross-school-activity/cross-school-paths";
import type { ActivityAllianceOption } from "@/features/cross-school-activity/types";
import { teachingResearchAllianceRepository } from "@/features/teaching-research-alliance/teaching-research-alliance-repository";
import { SCHOOL_STAGE_LABEL, type SchoolOption, type TeacherOption } from "@/features/teaching-research-alliance/types";
import { useCrossSchoolActivityStore } from "@/stores/cross-school-activity";
import { useUserStore } from "@/stores/user";
import CreateActivityBasicFields from "@/views/bureau/ai-teacher-development/CreateActivityBasicFields.vue";
import CreateActivityMemberSections from "@/views/bureau/ai-teacher-development/CreateActivityMemberSections.vue";
import CreateActivityObservationFields from "@/views/bureau/ai-teacher-development/CreateActivityObservationFields.vue";
import CreateActivityPrepFields from "@/views/bureau/ai-teacher-development/CreateActivityPrepFields.vue";
import CreateActivityTaskSection from "@/views/bureau/ai-teacher-development/CreateActivityTaskSection.vue";
import { createEmptyActivityForm, hasActivityType, primaryActivityType } from "@/views/bureau/ai-teacher-development/create-activity-form";
import { formToObservation, validateObservationForm } from "@/views/bureau/ai-teacher-development/observation-form";

defineOptions({ name: "CreateCrossSchoolActivityView" });

const route = useRoute();
const router = useRouter();
const listPath = computed(() => crossSchoolActivityListPath(route.path));
const userStore = useUserStore();
const activityStore = useCrossSchoolActivityStore();
const formRef = ref<FormInstance>();
const form = ref(createEmptyActivityForm());
const schools = ref<SchoolOption[]>([]);
const teachers = ref<TeacherOption[]>([]);
const alliances = ref<ActivityAllianceOption[]>([]);
const submitting = ref(false);
const teacherPickerVisible = ref(false);

const rules: FormRules = {
  name: [{ required: true, message: "请输入活动主题", trigger: "blur" }],
  types: [{ type: "array", required: true, min: 1, message: "请选择活动类型", trigger: "change" }],
  allianceId: [{ required: true, message: "请选择所属联盟", trigger: "change" }],
  scheduledAt: [{ required: true, message: "请选择活动时间", trigger: "change" }],
  location: [{ required: true, message: "请选择活动地点", trigger: "blur" }],
  teacherIds: [{ validator: validateMembers, trigger: "change" }],
};

const selectedSchools = computed(() =>
  form.value.memberSchoolIds
    .map((id) => schools.value.find((school) => school.id === id))
    .filter((school): school is SchoolOption => Boolean(school)),
);
const selectedTeachers = computed(() =>
  form.value.teacherIds
    .map((id) => teachers.value.find((teacher) => teacher.id === id))
    .filter((teacher): teacher is TeacherOption => Boolean(teacher)),
);
const pickerSchools = computed(() =>
  schools.value.map((school) => ({
    id: school.id,
    name: school.name,
    stageLabel: SCHOOL_STAGE_LABEL[school.stage],
    groupLabel: school.district,
  })),
);
const pickerPeople = computed((): OrgMemberPickerPerson[] =>
  teachers.value.map((teacher) => ({
    id: teacher.id,
    name: teacher.name,
    orgId: teacher.schoolId,
    orgName: schoolName(teacher.schoolId),
    meta: `${teacher.subject} · ${teacher.roleLabel}`,
    kind: "teacher",
    groupName: `${teacher.subject}组`,
  })),
);
const taskTeachers = computed(() =>
  selectedTeachers.value.map((teacher) => ({
    id: teacher.id,
    name: teacher.name,
    schoolName: schoolName(teacher.schoolId),
    subject: teacher.subject,
  })),
);
const allianceOrgIds = computed(() => (form.value.allianceId ? form.value.memberSchoolIds : []));
const observationOrgIds = computed(() =>
  form.value.memberSchoolIds.length ? form.value.memberSchoolIds : schools.value.map((item) => item.id),
);
const hasPrep = computed(() => hasActivityType(form.value.types, "lesson-prep"));
const hasObservation = computed(() => hasActivityType(form.value.types, "lesson-observation"));

function validateMembers(_rule: unknown, value: unknown, callback: (error?: Error) => void) {
  if (form.value.memberSchoolIds.length < 2) {
    callback(new Error("请至少选择 2 所学校"));
    return;
  }
  if (!Array.isArray(value) || value.length < 1) {
    callback(new Error("请至少选择 1 名参与教师"));
    return;
  }
  callback();
}

function schoolName(id: string) {
  return schools.value.find((school) => school.id === id)?.name ?? id;
}

function goBack() {
  void router.push(listPath.value);
}

function openTeacherPicker() {
  teacherPickerVisible.value = true;
}

function removeTeacher(id: string) {
  form.value.teacherIds = form.value.teacherIds.filter((item) => item !== id);
}

function syncLeadSchool() {
  if (!form.value.memberSchoolIds.includes(form.value.leadSchoolId)) {
    form.value.leadSchoolId = form.value.memberSchoolIds[0] ?? "";
  }
}

function handleTeacherConfirm(payload: OrgMemberPickerSchoolResult | OrgMemberPickerPersonResult) {
  form.value.teacherIds = [...payload.selectedIds];
  if (!form.value.allianceId && "orgIds" in payload) {
    form.value.memberSchoolIds = [...payload.orgIds];
  }
  syncLeadSchool();
}

async function handleAllianceChange(allianceId: string) {
  if (!allianceId) return;
  const detail = await teachingResearchAllianceRepository.detail(
    userStore.currentTenant.id,
    allianceId,
  );
  if (!detail) return;
  form.value.memberSchoolIds = detail.memberSchools.map((school) => school.id);
  form.value.leadSchoolId = detail.leadSchoolId;
  form.value.teacherIds = form.value.teacherIds.filter((id) => {
    const teacher = teachers.value.find((item) => item.id === id);
    return teacher ? form.value.memberSchoolIds.includes(teacher.schoolId) : false;
  });
}

async function loadOptions() {
  const tenantId = userStore.currentTenant.id;
  const [schoolList, allianceList] = await Promise.all([
    crossSchoolActivityRepository.listSchools(tenantId),
    crossSchoolActivityRepository.listAlliances(tenantId),
  ]);
  schools.value = schoolList;
  alliances.value = allianceList;
  teachers.value = await crossSchoolActivityRepository.listTeachers(
    tenantId,
    schoolList.map((school) => school.id),
  );
}

function validateTypedFields() {
  if (hasPrep.value) {
    const topic = form.value.topic;
    if (!topic.stage || !topic.subject || !topic.grade || !topic.textbookVersion || !topic.chapter) {
      ElMessage.warning("请完善集体备课课题信息");
      return false;
    }
  }
  if (hasObservation.value) {
    const error = validateObservationForm(form.value.observation);
    if (error) {
      ElMessage.warning(error);
      return false;
    }
  }
  return true;
}

function buildCreateInput() {
  const types = [...form.value.types];
  return {
    name: form.value.name.trim(),
    type: primaryActivityType(types),
    types,
    allianceId: form.value.allianceId,
    scheduledAt: form.value.scheduledAt,
    location: form.value.location.trim(),
    description: form.value.description.trim(),
    leadSchoolId: form.value.leadSchoolId,
    memberSchoolIds: [...form.value.memberSchoolIds],
    teacherIds: [...form.value.teacherIds],
    topic: hasPrep.value ? { ...form.value.topic } : null,
    tasks: form.value.tasks
      .filter((task) => task.source === "system" || task.name.trim())
      .map((task) => ({
        ...task,
        name: task.name.trim(),
        assignees: task.assignees.map((item) => ({ ...item })),
      })),
    observation: hasObservation.value ? formToObservation(form.value.observation, null) : null,
  };
}

async function handleSubmit() {
  form.value.name = form.value.name.trim();
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid || !validateTypedFields()) return;
  submitting.value = true;
  try {
    await activityStore.createActivity(buildCreateInput());
    ElMessage.success("已创建跨校教研活动");
    void router.push(listPath.value);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "创建活动失败");
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  void loadOptions();
});
</script>

<style scoped src="./create-cross-school-activity.css"></style>
