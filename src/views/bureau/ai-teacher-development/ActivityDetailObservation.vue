<template>
  <el-form class="observation-form" label-position="top" require-asterisk-position="left">
    <el-form-item label="课程名称" required>
      <el-input v-model="form.courseName" maxlength="40" placeholder="请输入" />
    </el-form-item>
    <el-form-item label="授课老师" required>
      <div class="picker-row">
        <el-button :icon="Plus" @click="openPicker('instructor')">选择老师</el-button>
        <el-tag v-if="form.instructorName" type="info" effect="plain" closable @close="clearTeacher('instructor')">
          {{ form.instructorName }}
        </el-tag>
      </div>
    </el-form-item>
    <el-form-item label="授课时间" required>
      <div class="datetime-row">
        <el-date-picker
          v-model="form.scheduledDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
        />
        <el-time-picker
          v-model="form.scheduledTime"
          value-format="HH:mm"
          format="HH:mm"
          placeholder="选择"
        />
      </div>
    </el-form-item>
    <el-form-item label="学科/年级" required>
      <el-select v-model="form.subjectGrade" placeholder="请选择">
        <el-option
          v-for="item in subjectGradeOptions"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="考核模板" required>
      <el-select v-model="form.assessmentTemplate" placeholder="请选择">
        <el-option
          v-for="item in OBSERVATION_TEMPLATE_OPTIONS"
          :key="item"
          :label="item"
          :value="item"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="课程资料" required>
      <ActivityObservationMaterials v-model="form.materials" />
    </el-form-item>
    <el-form-item label="评课老师" required>
      <div class="picker-row">
        <el-button :icon="Plus" @click="openPicker('reviewer')">选择老师</el-button>
        <el-tag v-if="form.reviewerName" type="info" effect="plain" closable @close="clearTeacher('reviewer')">
          {{ form.reviewerName }}
        </el-tag>
      </div>
      <p class="form-hint">评课老师从联盟成员学校的教师中选择</p>
    </el-form-item>
    <el-form-item label="评课方式" required>
      <el-radio-group v-model="form.reviewMethod">
        <el-radio
          v-for="item in OBSERVATION_REVIEW_METHOD_OPTIONS"
          :key="item"
          :value="item"
        >
          {{ item }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <div class="form-actions">
      <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
      <el-button @click="handleCancel">取消</el-button>
    </div>
  </el-form>

  <OrgMemberPickerDialog
    v-model:visible="pickerVisible"
    mode="person"
    :multiple="false"
    title="选择老师"
    :schools="pickerSchools"
    :people="pickerPeople"
    :org-ids="orgIds"
    :lead-org-id="detail.leadSchoolId"
    :model-value="currentPickerIds"
    :min-count="1"
    left-desc="联盟成员学校"
    right-desc="从成员校教师中选择 1 人"
    @confirm="handleTeacherConfirm"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import OrgMemberPickerDialog from "@/components/org-member-picker/OrgMemberPickerDialog.vue";
import type {
  OrgMemberPickerPerson,
  OrgMemberPickerPersonResult,
  OrgMemberPickerSchool,
  OrgMemberPickerSchoolResult,
} from "@/components/org-member-picker/types";
import { crossSchoolActivityRepository } from "@/features/cross-school-activity/cross-school-activity-repository";
import {
  OBSERVATION_REVIEW_METHOD_OPTIONS,
  OBSERVATION_TEMPLATE_OPTIONS,
  type CrossSchoolActivityDetail,
} from "@/features/cross-school-activity/types";
import { teachingResearchAllianceRepository } from "@/features/teaching-research-alliance/teaching-research-alliance-repository";
import { SCHOOL_STAGE_LABEL, type SchoolOption, type TeacherOption } from "@/features/teaching-research-alliance/types";
import { useCrossSchoolActivityStore } from "@/stores/cross-school-activity";
import { useUserStore } from "@/stores/user";
import ActivityObservationMaterials from "@/views/bureau/ai-teacher-development/ActivityObservationMaterials.vue";
import {
  formToObservation,
  observationToForm,
  subjectGradeOptions as buildSubjectGradeOptions,
  type ObservationFormState,
  type ObservationPickerRole,
  validateObservationForm,
} from "@/views/bureau/ai-teacher-development/observation-form";

defineOptions({ name: "ActivityDetailObservation" });

const props = defineProps<{
  /** 活动详情 */
  detail: CrossSchoolActivityDetail;
}>();

const emit = defineEmits<{
  updated: [detail: CrossSchoolActivityDetail];
}>();

const userStore = useUserStore();
const activityStore = useCrossSchoolActivityStore();
const form = ref<ObservationFormState>(observationToForm(props.detail.observation));
const submitting = ref(false);
const pickerVisible = ref(false);
const pickerRole = ref<ObservationPickerRole>("instructor");
const schools = ref<SchoolOption[]>([]);
const teachers = ref<TeacherOption[]>([]);

const subjectGradeOptions = computed(() => buildSubjectGradeOptions(form.value.subjectGrade));

const orgIds = computed(() => schools.value.map((school) => school.id));
const pickerSchools = computed((): OrgMemberPickerSchool[] =>
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
const currentPickerIds = computed(() => {
  const id = pickerRole.value === "instructor" ? form.value.instructorId : form.value.reviewerId;
  return id ? [id] : [];
});

function schoolName(id: string) {
  return schools.value.find((school) => school.id === id)?.name ?? id;
}

function openPicker(role: ObservationPickerRole) {
  pickerRole.value = role;
  pickerVisible.value = true;
}

function clearTeacher(role: ObservationPickerRole) {
  if (role === "instructor") {
    form.value.instructorId = "";
    form.value.instructorName = "";
    return;
  }
  form.value.reviewerId = "";
  form.value.reviewerName = "";
}

function handleTeacherConfirm(payload: OrgMemberPickerSchoolResult | OrgMemberPickerPersonResult) {
  const id = payload.selectedIds[0];
  const teacher = teachers.value.find((item) => item.id === id);
  if (!id || !teacher) return;
  if (pickerRole.value === "instructor") {
    form.value.instructorId = teacher.id;
    form.value.instructorName = teacher.name;
    return;
  }
  form.value.reviewerId = teacher.id;
  form.value.reviewerName = teacher.name;
}

function handleCancel() {
  form.value = observationToForm(props.detail.observation);
}

async function handleSubmit() {
  const error = validateObservationForm(form.value);
  if (error) {
    ElMessage.warning(error);
    return;
  }
  submitting.value = true;
  try {
    const next = await activityStore.saveObservation(
      props.detail.id,
      formToObservation(form.value, props.detail.observation),
    );
    emit("updated", next);
    ElMessage.success("听评课设置已保存");
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : "保存失败");
  } finally {
    submitting.value = false;
  }
}

async function loadTeachers() {
  const tenantId = userStore.currentTenant.id;
  if (props.detail.allianceId) {
    const alliance = await teachingResearchAllianceRepository.detail(tenantId, props.detail.allianceId);
    if (alliance) {
      schools.value = alliance.memberSchools.map((school) => ({
        id: school.id,
        name: school.name,
        stage: school.stage,
        district: "",
      }));
    }
  }
  if (!schools.value.length) {
    schools.value = await crossSchoolActivityRepository.listSchools(tenantId);
  }
  teachers.value = await crossSchoolActivityRepository.listTeachers(
    tenantId,
    schools.value.map((school) => school.id),
  );
}

onMounted(() => {
  void loadTeachers();
});

watch(
  () => props.detail.id,
  () => {
    form.value = observationToForm(props.detail.observation);
    void loadTeachers();
  },
  { flush: "post" },
);
</script>

<style scoped src="./activity-detail-view.css"></style>
