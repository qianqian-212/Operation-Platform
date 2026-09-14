<template>
  <el-form-item label="选择成员学校及教师" prop="teacherIds" required>
    <div class="pick-field">
      <el-button :icon="Plus" @click="emit('pick-members')">添加</el-button>
      <div v-if="schools.length" class="pick-panel">
        <div class="pick-panel-head">已选择</div>
        <div class="pick-panel-body">
          <div v-for="group in memberGroups" :key="group.schoolId" class="pick-group">
            <p class="pick-group-title">{{ group.schoolName }}</p>
            <div v-if="group.teachers.length" class="pick-tags">
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

  <el-form-item label="牵头学校" prop="leadSchoolId" required>
    <el-select
      :model-value="leadSchoolId"
      :disabled="schools.length === 0"
      placeholder="请选择"
      @change="onLeadChange"
    >
      <el-option
        v-for="school in schools"
        :key="school.id"
        :label="school.name"
        :value="school.id"
      />
    </el-select>
  </el-form-item>

  <el-form-item prop="adminId" required>
    <template #label>
      联盟管理员
      <span class="field-hint">从牵头学校教师名单中选择联盟管理员</span>
    </template>
    <el-select
      :model-value="adminId"
      :disabled="leadTeachers.length === 0"
      placeholder="请选择"
      @change="onAdminChange"
    >
      <el-option
        v-for="teacher in leadTeachers"
        :key="teacher.id"
        :label="teacher.name"
        :value="teacher.id"
      />
    </el-select>
  </el-form-item>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Plus } from "@element-plus/icons-vue";
import type { SchoolOption, TeacherOption } from "@/features/teaching-research-alliance/types";

defineOptions({ name: "CreateAllianceMemberSections" });

const props = defineProps<{
  /** 已选学校 */
  schools: SchoolOption[];
  /** 牵头校 ID */
  leadSchoolId: string;
  /** 联盟管理员 ID */
  adminId: string;
  /** 已选教师 */
  teachers: TeacherOption[];
}>();

const emit = defineEmits<{
  "pick-members": [];
  "set-lead": [id: string];
  "set-admin": [id: string];
  "remove-teacher": [id: string];
}>();

const memberGroups = computed(() =>
  props.schools.map((school) => ({
    schoolId: school.id,
    schoolName: school.name,
    teachers: props.teachers.filter((teacher) => teacher.schoolId === school.id),
  })),
);
const leadTeachers = computed(() =>
  props.teachers.filter((teacher) => teacher.schoolId === props.leadSchoolId),
);

function onLeadChange(value: string | number | boolean | undefined) {
  if (typeof value === "string") emit("set-lead", value);
}

function onAdminChange(value: string | number | boolean | undefined) {
  if (typeof value === "string") emit("set-admin", value);
}
</script>

<style scoped>
.pick-field {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-12);
  width: 100%;
}

.pick-field :deep(.el-button) {
  width: auto;
  flex: none;
}

.pick-panel {
  align-self: stretch;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-white);
}

.pick-panel-head {
  padding: var(--spacing-8) var(--spacing-12);
  background: var(--color-bg);
  color: var(--color-title);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-md);
}

.pick-panel-body {
  padding: var(--spacing-16);
  box-sizing: border-box;
  background: var(--color-white);
}

.pick-group + .pick-group {
  margin-top: var(--spacing-16);
}

.pick-group-title {
  margin: 0 0 var(--spacing-8);
  color: var(--color-title);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-md);
}

.pick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-8);
}

.pick-tags :deep(.el-tag) {
  height: 32px;
  padding: 0 var(--spacing-12);
  font-size: var(--font-size-md);
  line-height: 30px;
  background: var(--color-white);
  border-color: var(--color-primary);
  color: var(--color-primary);
  border-radius: var(--radius-md);
}

.pick-tags :deep(.el-tag .el-tag__close) {
  color: var(--color-primary);
}

.field-hint {
  margin-left: var(--spacing-8);
  color: var(--color-secondary);
  font-weight: var(--font-weight-regular);
}
</style>
