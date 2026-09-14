<template>
  <el-dialog v-model="visible" title="成员学校" width="800px" append-to-body>
    <el-table :data="schools" stripe border>
      <el-table-column label="序号" width="72" align="center">
        <template #default="{ $index }">{{ $index + 1 }}</template>
      </el-table-column>
      <el-table-column prop="name" label="学校名称" min-width="140" show-overflow-tooltip />
      <el-table-column label="类型" width="100">
        <template #default="{ row }: { row: AllianceMemberSchool }">
          {{ SCHOOL_STAGE_LABEL[row.stage] }}
        </template>
      </el-table-column>
      <el-table-column label="角色" width="110">
        <template #default="{ row }: { row: AllianceMemberSchool }">
          <StatusTag :color="MEMBER_ROLE_MAP[row.role].tagColor">
            {{ MEMBER_ROLE_MAP[row.role].label }}
          </StatusTag>
        </template>
      </el-table-column>
      <el-table-column prop="teacherCount" label="教师数" width="90" align="center" />
      <el-table-column prop="activityCount" label="活动数" width="90" align="center" />
    </el-table>
  </el-dialog>
</template>

<script setup lang="ts">
import StatusTag from "@/components/StatusTag.vue";
import {
  MEMBER_ROLE_MAP,
  SCHOOL_STAGE_LABEL,
  type AllianceMemberSchool,
} from "@/features/teaching-research-alliance/types";

defineOptions({ name: "AllianceDetailMemberSchools" });

defineProps<{
  /** 成员学校列表 */
  schools: AllianceMemberSchool[];
}>();

const visible = defineModel<boolean>("visible", { required: true });
</script>
