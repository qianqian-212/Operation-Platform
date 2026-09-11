<template>
  <section class="panel-card">
    <div class="panel-header">
      <h2 class="panel-title">成员学校</h2>
    </div>
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
  </section>
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
</script>

<style scoped>
.panel-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-24);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
  min-width: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
}

.panel-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}
</style>
