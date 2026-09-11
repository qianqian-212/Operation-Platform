<template>
  <div class="create-page">
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: listPath }">跨校教研活动</el-breadcrumb-item>
        <el-breadcrumb-item>创建跨校教研活动</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="create-body">
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
          @pick-schools="openSchoolPicker"
          @pick-teachers="openTeacherPicker"
          @set-lead="setLeadSchool"
          @remove-school="removeSchool"
          @remove-teacher="removeTeacher"
        />
        <CreateActivityPrepFields
          v-if="form.type === 'lesson-prep'"
          v-model:form="form"
          :teachers="selectedTeachers"
          :resolve-school-name="schoolName"
        />
        <CreateActivityObservationFields
          v-else
          v-model:form="form"
          :teachers="selectedTeachers"
          :resolve-school-name="schoolName"
        />
      </el-form>
    </div>

    <div class="footer-bar">
      <el-button @click="goBack">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">创建活动</el-button>
    </div>

    <OrgMemberPickerDialog
      v-model:visible="schoolPickerVisible"
      mode="school"
      title="选择学校和教师"
      :schools="pickerSchools"
      :model-value="form.memberSchoolIds"
      :lead-id="form.leadSchoolId"
      :min-count="2"
      left-desc="当前教育局可管理学校"
      right-desc="在已选学校中指定 1 所牵头校"
      footer-note="至少选择 2 所学校，且只能设置 1 所牵头校"
      @confirm="handleSchoolConfirm"
    />
    <OrgMemberPickerDialog
      v-model:visible="teacherPickerVisible"
      mode="person"
      title="选择学校和教师"
      :schools="pickerSchools"
      :people="pickerPeople"
      :org-ids="form.memberSchoolIds"
      :lead-org-id="form.leadSchoolId"
      :model-value="form.teacherIds"
      :min-count="1"
      left-desc="仅展示已选成员学校"
      right-desc="可跨校多选参与教师"
      footer-note="移除成员学校时，对应教师将同步移除"
      @confirm="handleTeacherConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import OrgMemberPickerDialog from "@/components/org-member-picker/OrgMemberPickerDialog.vue";
import type {
  OrgMemberPickerPerson,
  OrgMemberPickerPersonResult,
  OrgMemberPickerSchoolResult,
} from "@/components/org-member-picker/types";
import { crossSchoolActivityRepository } from "@/features/cross-school-activity/cross-school-activity-repository";
import type { ActivityAllianceOption } from "@/features/cross-school-activity/types";
import { teachingResearchAllianceRepository } from "@/features/teaching-research-alliance/teaching-research-alliance-repository";
import { SCHOOL_STAGE_LABEL, type SchoolOption, type TeacherOption } from "@/features/teaching-research-alliance/types";
import { useCrossSchoolActivityStore } from "@/stores/cross-school-activity";
import { useUserStore } from "@/stores/user";
import CreateActivityBasicFields from "@/views/bureau/ai-teacher-development/CreateActivityBasicFields.vue";
import CreateActivityMemberSections from "@/views/bureau/ai-teacher-development/CreateActivityMemberSections.vue";
import CreateActivityObservationFields from "@/views/bureau/ai-teacher-development/CreateActivityObservationFields.vue";
import CreateActivityPrepFields from "@/views/bureau/ai-teacher-development/CreateActivityPrepFields.vue";
import { createEmptyActivityForm } from "@/views/bureau/ai-teacher-development/create-activity-form";

defineOptions({ name: "CreateCrossSchoolActivityView" });

const listPath = "/bureau/ai-teacher-development/cross-school-research/activities";
const router = useRouter();
const userStore = useUserStore();
const activityStore = useCrossSchoolActivityStore();
const formRef = ref<FormInstance>();
const form = ref(createEmptyActivityForm());
const schools = ref<SchoolOption[]>([]);
const teachers = ref<TeacherOption[]>([]);
const alliances = ref<ActivityAllianceOption[]>([]);
const submitting = ref(false);
const schoolPickerVisible = ref(false);
const teacherPickerVisible = ref(false);

const rules: FormRules = {
  name: [{ required: true, message: "请输入活动主题", trigger: "blur" }],
  type: [{ required: true, message: "请选择活动类型", trigger: "change" }],
  scheduledAt: [{ required: true, message: "请选择活动时间", trigger: "change" }],
  memberSchoolIds: [{ validator: validateSchools, trigger: "change" }],
  leadSchoolId: [{ required: true, message: "请选择牵头学校", trigger: "change" }],
  teacherIds: [{ validator: validateTeachers, trigger: "change" }],
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

function validateSchools(_rule: unknown, value: unknown, callback: (error?: Error) => void) {
  if (!Array.isArray(value) || value.length < 2) {
    callback(new Error("请至少选择 2 所学校"));
    return;
  }
  callback();
}

function validateTeachers(_rule: unknown, value: unknown, callback: (error?: Error) => void) {
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
  void router.push(listPath);
}

function openSchoolPicker() {
  schoolPickerVisible.value = true;
}

function openTeacherPicker() {
  teacherPickerVisible.value = true;
}

function setLeadSchool(id: string) {
  form.value.leadSchoolId = id;
}

function removeSchool(id: string) {
  form.value.memberSchoolIds = form.value.memberSchoolIds.filter((item) => item !== id);
  form.value.teacherIds = form.value.teacherIds.filter((teacherId) => {
    const teacher = teachers.value.find((item) => item.id === teacherId);
    return teacher ? teacher.schoolId !== id : false;
  });
  if (form.value.leadSchoolId === id) {
    form.value.leadSchoolId = form.value.memberSchoolIds[0] ?? "";
  }
}

function removeTeacher(id: string) {
  form.value.teacherIds = form.value.teacherIds.filter((item) => item !== id);
}

function handleSchoolConfirm(payload: OrgMemberPickerSchoolResult | OrgMemberPickerPersonResult) {
  if (!("leadId" in payload) || !payload.leadId) return;
  const removed = form.value.memberSchoolIds.filter((id) => !payload.selectedIds.includes(id));
  form.value.memberSchoolIds = [...payload.selectedIds];
  form.value.leadSchoolId = payload.leadId;
  if (!removed.length) return;
  form.value.teacherIds = form.value.teacherIds.filter((id) => {
    const teacher = teachers.value.find((item) => item.id === id);
    return teacher ? payload.selectedIds.includes(teacher.schoolId) : false;
  });
}

function handleTeacherConfirm(payload: OrgMemberPickerSchoolResult | OrgMemberPickerPersonResult) {
  form.value.teacherIds = [...payload.selectedIds];
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
  if (form.value.type === "lesson-prep" && !form.value.topic.title.trim()) {
    ElMessage.warning("请填写课题名称");
    return false;
  }
  if (form.value.type === "lesson-observation" && !form.value.observation.courseName.trim()) {
    ElMessage.warning("请填写课程名称");
    return false;
  }
  return true;
}

function buildCreateInput() {
  const observation = {
    ...form.value.observation,
    scheduledAt: form.value.observation.scheduledAt || form.value.scheduledAt,
  };
  return {
    name: form.value.name.trim(),
    type: form.value.type,
    allianceId: form.value.allianceId,
    scheduledAt: form.value.scheduledAt,
    location: form.value.location.trim(),
    description: form.value.description.trim(),
    leadSchoolId: form.value.leadSchoolId,
    memberSchoolIds: [...form.value.memberSchoolIds],
    teacherIds: [...form.value.teacherIds],
    topic: form.value.type === "lesson-prep" ? { ...form.value.topic } : null,
    tasks: form.value.tasks.map((task) => ({ ...task })),
    observation: form.value.type === "lesson-observation" ? observation : null,
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
    void router.push(listPath);
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
