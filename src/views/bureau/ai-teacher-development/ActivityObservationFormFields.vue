<template>
  <div class="observation-fields">
    <div class="field-grid">
      <el-form-item label="课程名称" required>
        <el-input v-model="form.courseName" maxlength="40" placeholder="请输入" />
      </el-form-item>
    </div>
    <el-form-item label="授课老师" required>
      <div class="pick-field">
        <el-button :icon="Plus" @click="openPicker('instructor')">选择老师</el-button>
        <el-tag
          v-if="form.instructorName"
          class="teacher-chip"
          effect="plain"
          closable
          @close="clearTeacher('instructor')"
        >
          {{ form.instructorName }}
        </el-tag>
      </div>
    </el-form-item>
    <div class="field-grid">
      <el-form-item label="授课时间" required>
        <div class="datetime-row">
          <el-date-picker
            v-model="form.scheduledDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
          <el-select v-model="form.scheduledPeriod" placeholder="请选择节数">
            <el-option v-for="item in periodOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </div>
      </el-form-item>
      <el-form-item label="学科/年级" required>
        <el-select v-model="form.subjectGrade" placeholder="请选择">
          <el-option v-for="item in subjectGradeOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
    </div>
    <div class="field-grid">
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
    </div>
    <el-form-item label="课程资料" required>
      <ActivityObservationMaterials v-model="form.materials" />
    </el-form-item>
    <el-form-item label="评课老师" required>
      <div class="pick-field">
        <el-button :icon="Plus" @click="openPicker('reviewer')">选择老师</el-button>
        <el-tag
          v-if="form.reviewerName"
          class="teacher-chip"
          effect="plain"
          closable
          @close="clearTeacher('reviewer')"
        >
          {{ form.reviewerName }}
        </el-tag>
      </div>
    </el-form-item>
    <el-form-item label="评课方式" required>
      <el-radio-group v-model="form.reviewMethod">
        <el-radio v-for="item in OBSERVATION_REVIEW_METHOD_OPTIONS" :key="item" :value="item">
          {{ item }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
  </div>

  <OrgMemberPickerDialog
    v-model:visible="pickerVisible"
    mode="person"
    :multiple="false"
    title="选择学校和教师"
    :schools="pickerSchools"
    :people="pickerPeople"
    :org-ids="orgIds"
    :lead-org-id="leadOrgId"
    :model-value="currentPickerIds"
    :min-count="1"
    @confirm="handleTeacherConfirm"
  />
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Plus } from "@element-plus/icons-vue";
import OrgMemberPickerDialog from "@/components/org-member-picker/OrgMemberPickerDialog.vue";
import type {
  OrgMemberPickerPerson,
  OrgMemberPickerPersonResult,
  OrgMemberPickerSchool,
  OrgMemberPickerSchoolResult,
} from "@/components/org-member-picker/types";
import {
  OBSERVATION_REVIEW_METHOD_OPTIONS,
  OBSERVATION_TEMPLATE_OPTIONS,
} from "@/features/cross-school-activity/types";
import type { TeacherOption } from "@/features/teaching-research-alliance/types";
import ActivityObservationMaterials from "@/views/bureau/ai-teacher-development/ActivityObservationMaterials.vue";
import {
  periodOptions as buildPeriodOptions,
  subjectGradeOptions as buildSubjectGradeOptions,
  type ObservationFormState,
  type ObservationPickerRole,
} from "@/views/bureau/ai-teacher-development/observation-form";

defineOptions({ name: "ActivityObservationFormFields" });

const props = defineProps<{
  /** 人员选择学校 */
  pickerSchools: OrgMemberPickerSchool[];
  /** 人员选择候选项 */
  pickerPeople: OrgMemberPickerPerson[];
  /** 可选组织 */
  orgIds: string[];
  /** 牵头校 */
  leadOrgId: string;
  /** 教师列表，用于回填姓名 */
  teachers: TeacherOption[];
}>();

const form = defineModel<ObservationFormState>({ required: true });
const pickerVisible = ref(false);
const pickerRole = ref<ObservationPickerRole>("instructor");
const subjectGradeOptions = computed(() => buildSubjectGradeOptions(form.value.subjectGrade));
const periodOptions = computed(() => buildPeriodOptions(form.value.scheduledPeriod));
const currentPickerIds = computed(() => {
  const id = pickerRole.value === "instructor" ? form.value.instructorId : form.value.reviewerId;
  return id ? [id] : [];
});

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
  const teacher = props.teachers.find((item) => item.id === id);
  if (!id || !teacher) return;
  if (pickerRole.value === "instructor") {
    form.value.instructorId = teacher.id;
    form.value.instructorName = teacher.name;
    return;
  }
  form.value.reviewerId = teacher.id;
  form.value.reviewerName = teacher.name;
}
</script>

<style scoped>
@import "./create-activity-sections.css";

.observation-fields .field-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
</style>
