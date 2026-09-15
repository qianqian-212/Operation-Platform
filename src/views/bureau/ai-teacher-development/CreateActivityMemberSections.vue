<template>
  <section class="form-section">
    <div class="section-head">
      <h2 class="card-title">参与学校与教师</h2>
      <p class="card-desc">牵头学校与成员学校由联盟配置决定，不可变动。需在至少 2 所学校中选择参与教师。</p>
    </div>
    <el-form-item label="参与教师" prop="teacherIds" required>
      <div class="pick-field">
        <el-button :icon="Plus" @click="emit('pick-teachers')">选择教师</el-button>
        <div v-if="teacherGroups.length" class="pick-panel">
          <div class="pick-panel-head">已选择</div>
          <div class="pick-panel-body">
            <div v-for="group in teacherGroups" :key="group.schoolId" class="pick-group">
              <p class="pick-group-title">
                {{ group.schoolName }}
                <el-tag v-if="group.schoolId === leadSchoolId" type="primary" effect="plain" size="small">
                  牵头学校
                </el-tag>
              </p>
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
  "pick-teachers": [];
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
</script>

<style scoped src="./create-activity-sections.css"></style>
