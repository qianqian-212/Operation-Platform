<template>
  <el-form class="observation-form" label-position="top" require-asterisk-position="left">
    <ActivityObservationFormFields
      v-model="form"
      :picker-schools="pickerSchools"
      :picker-people="pickerPeople"
      :org-ids="orgIds"
      :lead-org-id="detail.leadSchoolId"
      :teachers="teachers"
    />
    <div class="form-actions">
      <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
      <el-button @click="handleCancel">取消</el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import type { OrgMemberPickerPerson, OrgMemberPickerSchool } from "@/components/org-member-picker/types";
import { crossSchoolActivityRepository } from "@/features/cross-school-activity/cross-school-activity-repository";
import type { CrossSchoolActivityDetail } from "@/features/cross-school-activity/types";
import { teachingResearchAllianceRepository } from "@/features/teaching-research-alliance/teaching-research-alliance-repository";
import { SCHOOL_STAGE_LABEL, type SchoolOption, type TeacherOption } from "@/features/teaching-research-alliance/types";
import { useCrossSchoolActivityStore } from "@/stores/cross-school-activity";
import { useUserStore } from "@/stores/user";
import ActivityObservationFormFields from "@/views/bureau/ai-teacher-development/ActivityObservationFormFields.vue";
import {
  formToObservation,
  observationToForm,
  type ObservationFormState,
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
const schools = ref<SchoolOption[]>([]);
const teachers = ref<TeacherOption[]>([]);

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

function schoolName(id: string) {
  return schools.value.find((school) => school.id === id)?.name ?? id;
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
