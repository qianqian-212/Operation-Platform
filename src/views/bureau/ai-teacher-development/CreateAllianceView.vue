<template>
  <div class="create-page">
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: listPath }">教研联盟管理</el-breadcrumb-item>
        <el-breadcrumb-item>创建教研联盟</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="create-body">
      <section class="form-card">
        <h1 class="page-title">创建教研联盟</h1>
        <el-form
          ref="formRef"
          class="alliance-form"
          label-position="top"
          require-asterisk-position="left"
          :model="form"
          :rules="rules"
          @submit.prevent="handleSubmit"
        >
          <el-form-item label="联盟名称" prop="name" required>
            <el-input v-model="form.name" maxlength="40" placeholder="请输入联盟名称" />
          </el-form-item>

          <CreateAllianceMemberSections
            :schools="selectedSchools"
            :lead-school-id="form.leadSchoolId"
            :teachers="selectedTeachers"
            @pick-members="openMemberPicker"
            @set-lead="setLeadSchool"
            @remove-teacher="removeTeacher"
          />

          <el-form-item label="联盟描述" prop="description" required>
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
              maxlength="300"
              placeholder="简要描述联盟目标与覆盖范围"
            />
          </el-form-item>

          <div class="form-actions">
            <el-button type="primary" :loading="submitting" @click="handleSubmit">
              创建联盟
            </el-button>
            <el-button @click="goBack">取消</el-button>
          </div>

          <p class="form-note">
            系统将自动创建联盟专属空间（空间名称=联盟名称+空间），含在线文档、讨论区、文件共享等协作工具。
          </p>
        </el-form>
      </section>
    </div>

    <OrgMemberPickerDialog
      v-model:visible="memberPickerVisible"
      mode="person"
      title="选择学校和教师"
      :schools="pickerSchools"
      :people="pickerPeople"
      :model-value="form.teacherIds"
      :selected-org-ids="form.memberSchoolIds"
      :min-count="0"
      @confirm="handleMemberConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import OrgMemberPickerDialog from "@/components/org-member-picker/OrgMemberPickerDialog.vue";
import type {
  OrgMemberPickerPersonResult,
  OrgMemberPickerSchoolResult,
} from "@/components/org-member-picker/types";
import { teachingResearchAllianceRepository } from "@/features/teaching-research-alliance/teaching-research-alliance-repository";
import {
  SCHOOL_STAGE_LABEL,
  type SchoolOption,
  type TeacherOption,
} from "@/features/teaching-research-alliance/types";
import { useTeachingResearchAllianceStore } from "@/stores/teaching-research-alliance";
import { useUserStore } from "@/stores/user";
import CreateAllianceMemberSections from "@/views/bureau/ai-teacher-development/CreateAllianceMemberSections.vue";

defineOptions({ name: "CreateAllianceView" });

const listPath = "/bureau/ai-teacher-development/cross-school-research/alliance";
const router = useRouter();
const userStore = useUserStore();
const allianceStore = useTeachingResearchAllianceStore();
const formRef = ref<FormInstance>();
const schools = ref<SchoolOption[]>([]);
const teachers = ref<TeacherOption[]>([]);
const submitting = ref(false);
const memberPickerVisible = ref(false);

const form = ref({
  name: "",
  leadSchoolId: "",
  memberSchoolIds: [] as string[],
  teacherIds: [] as string[],
  description: "",
});

const rules: FormRules = {
  name: [{ required: true, message: "请输入联盟名称", trigger: "blur" }],
  teacherIds: [{ validator: validateMembers, trigger: "change" }],
  leadSchoolId: [{ required: true, message: "请选择牵头学校", trigger: "change" }],
  description: [{ required: true, message: "请输入联盟描述", trigger: "blur" }],
};

const selectedTeachers = computed(() =>
  form.value.teacherIds
    .map((id) => teachers.value.find((teacher) => teacher.id === id))
    .filter((teacher): teacher is TeacherOption => Boolean(teacher)),
);
const selectedSchools = computed(() =>
  form.value.memberSchoolIds
    .map((id) => schools.value.find((school) => school.id === id))
    .filter((school): school is SchoolOption => Boolean(school)),
);
const pickerSchools = computed(() =>
  schools.value.map((school) => ({
    id: school.id,
    name: school.name,
    stageLabel: SCHOOL_STAGE_LABEL[school.stage],
    groupLabel: school.district,
  })),
);
const pickerPeople = computed(() =>
  teachers.value.map((teacher) => ({
    id: teacher.id,
    name: teacher.name,
    orgId: teacher.schoolId,
    orgName: schoolName(teacher.schoolId),
    meta: `${teacher.subject} · ${teacher.roleLabel}`,
    kind: "teacher" as const,
    groupName: `${teacher.subject}组`,
  })),
);

function validateMembers(_rule: unknown, value: unknown, callback: (error?: Error) => void) {
  if (form.value.memberSchoolIds.length < 2) {
    callback(new Error("请至少选择 2 所学校"));
    return;
  }
  if (!Array.isArray(value) || value.length < 1) {
    callback(new Error("请选择参与教师"));
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

function openMemberPicker() {
  memberPickerVisible.value = true;
}

function setLeadSchool(id: string) {
  form.value.leadSchoolId = id;
}

function removeTeacher(id: string) {
  form.value.teacherIds = form.value.teacherIds.filter((item) => item !== id);
}

function handleMemberConfirm(payload: OrgMemberPickerSchoolResult | OrgMemberPickerPersonResult) {
  form.value.teacherIds = [...payload.selectedIds];
  form.value.memberSchoolIds = "orgIds" in payload ? [...payload.orgIds] : form.value.memberSchoolIds;
  if (!form.value.memberSchoolIds.includes(form.value.leadSchoolId)) {
    form.value.leadSchoolId = "";
  }
}

function resolveAdminId() {
  const inLead = selectedTeachers.value.find(
    (teacher) => teacher.schoolId === form.value.leadSchoolId,
  );
  return inLead?.id ?? selectedTeachers.value[0]?.id ?? "";
}

async function loadOptions() {
  const tenantId = userStore.currentTenant.id;
  schools.value = await teachingResearchAllianceRepository.listSchools(tenantId);
  teachers.value = await teachingResearchAllianceRepository.listTeachers(
    tenantId,
    schools.value.map((school) => school.id),
  );
}

async function handleSubmit() {
  form.value.name = form.value.name.trim();
  form.value.description = form.value.description.trim();
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  submitting.value = true;
  try {
    const row = await allianceStore.createAlliance({
      name: form.value.name,
      leadSchoolId: form.value.leadSchoolId,
      adminId: resolveAdminId(),
      memberSchoolIds: [...form.value.memberSchoolIds],
      teacherIds: [...form.value.teacherIds],
      description: form.value.description,
    });
    ElMessage.success(`已创建联盟，并自动生成「${row.spaceName}」`);
    void router.push(listPath);
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "创建联盟失败");
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  void loadOptions();
});
</script>

<style scoped src="./create-alliance-view.css"></style>
