<template>
  <section class="form-section">
    <div class="section-head">
      <h2 class="card-title">听评课设置</h2>
      <p class="card-desc">活动勾选了听评课类型，完善以下听评课配置信息，促进各校听评课活动开展和学情沟通。</p>
    </div>
    <ActivityObservationFormFields
      v-model="form.observation"
      :picker-schools="pickerSchools"
      :picker-people="pickerPeople"
      :org-ids="orgIds"
      :lead-org-id="leadOrgId"
      :teachers="teachers"
    />
  </section>
</template>

<script setup lang="ts">
import type {
  OrgMemberPickerPerson,
  OrgMemberPickerSchool,
} from "@/components/org-member-picker/types";
import type { TeacherOption } from "@/features/teaching-research-alliance/types";
import ActivityObservationFormFields from "@/views/bureau/ai-teacher-development/ActivityObservationFormFields.vue";
import type { CreateActivityFormState } from "@/views/bureau/ai-teacher-development/create-activity-form";

defineOptions({ name: "CreateActivityObservationFields" });

defineProps<{
  /** 人员选择学校 */
  pickerSchools: OrgMemberPickerSchool[];
  /** 人员选择候选项 */
  pickerPeople: OrgMemberPickerPerson[];
  /** 可选组织 */
  orgIds: string[];
  /** 牵头校 */
  leadOrgId: string;
  /** 教师列表 */
  teachers: TeacherOption[];
}>();

const form = defineModel<CreateActivityFormState>("form", { required: true });
</script>

<style scoped src="./create-activity-sections.css"></style>
