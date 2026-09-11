<template>
  <section class="form-card">
    <h2 class="card-title">参与学校与教师</h2>
    <p class="card-desc">至少选择 2 所学校，并指定 1 所牵头校与参与教师。</p>
    <el-form-item label="成员学校" prop="memberSchoolIds" required>
      <el-button :icon="Plus" @click="emit('pick-schools')">添加学校</el-button>
      <div v-if="schools.length" class="pick-panel">
        <div class="pick-panel-head">
          <span>已选学校</span>
          <span>{{ schools.length }} 所</span>
        </div>
        <div class="pick-tags">
          <el-tag
            v-for="school in schools"
            :key="school.id"
            type="primary"
            effect="plain"
            closable
            @close="emit('remove-school', school.id)"
          >
            {{ school.name }}
          </el-tag>
        </div>
      </div>
    </el-form-item>

    <el-form-item v-if="schools.length" label="牵头学校" prop="leadSchoolId" required>
      <el-radio-group :model-value="leadSchoolId" @change="onLeadChange">
        <el-radio v-for="school in schools" :key="school.id" :value="school.id">
          {{ school.name }}
        </el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="参与教师" prop="teacherIds" required>
      <el-button :icon="Plus" :disabled="schools.length === 0" @click="emit('pick-teachers')">
        添加老师
      </el-button>
      <div v-if="teacherGroups.length" class="pick-panel">
        <div class="pick-panel-head">
          <span>已选教师</span>
          <span>{{ teachers.length }} 人</span>
        </div>
        <div v-for="group in teacherGroups" :key="group.schoolId" class="pick-group">
          <p class="pick-group-title">{{ group.schoolName }}</p>
          <div class="pick-tags">
            <el-tag
              v-for="teacher in group.teachers"
              :key="teacher.id"
              type="primary"
              effect="plain"
              closable
              @close="emit('remove-teacher', teacher.id)"
            >
              {{ teacher.name }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-form-item>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Plus } from "@element-plus/icons-vue";
import type { SchoolOption, TeacherOption } from "@/features/teaching-research-alliance/types";

defineOptions({ name: "CreateActivityMemberSections" });

const props = defineProps<{
  /** 已选学校 */
  schools: SchoolOption[];
  /** 牵头校 ID */
  leadSchoolId: string;
  /** 已选教师 */
  teachers: TeacherOption[];
}>();

const emit = defineEmits<{
  "pick-schools": [];
  "pick-teachers": [];
  "set-lead": [id: string];
  "remove-school": [id: string];
  "remove-teacher": [id: string];
}>();

const teacherGroups = computed(() =>
  props.schools
    .map((school) => ({
      schoolId: school.id,
      schoolName: school.name,
      teachers: props.teachers.filter((teacher) => teacher.schoolId === school.id),
    }))
    .filter((group) => group.teachers.length > 0),
);

function onLeadChange(value: string | number | boolean) {
  if (typeof value === "string") emit("set-lead", value);
}
</script>

<style scoped src="./create-activity-sections.css"></style>
