<template>
  <section class="panel-card">
    <div class="panel-header">
      <h2 class="panel-title">联盟活动列表</h2>
    </div>
    <el-table :data="activities" stripe border>
      <el-table-column label="序号" width="72" align="center">
        <template #default="{ $index }">{{ $index + 1 }}</template>
      </el-table-column>
      <el-table-column label="活动名称" min-width="280" show-overflow-tooltip>
        <template #default="{ row }: { row: AllianceActivity }">
          <span class="action-link" @click="emit('view', row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="110">
        <template #default="{ row }: { row: AllianceActivity }">
          <StatusTag color="blue">{{ row.typeLabel }}</StatusTag>
        </template>
      </el-table-column>
      <el-table-column prop="scheduledAt" label="时间" width="160" show-overflow-tooltip />
      <el-table-column prop="leadSchoolName" label="牵头学校" width="120" show-overflow-tooltip />
      <el-table-column label="状态" width="100">
        <template #default="{ row }: { row: AllianceActivity }">
          <StatusTag :color="ACTIVITY_STATUS_MAP[row.status].tagColor">
            {{ ACTIVITY_STATUS_MAP[row.status].label }}
          </StatusTag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="88" fixed="right">
        <template #default="{ row }: { row: AllianceActivity }">
          <span class="action-link" @click="emit('view', row)">查看</span>
        </template>
      </el-table-column>
    </el-table>
  </section>
</template>

<script setup lang="ts">
import StatusTag from "@/components/StatusTag.vue";
import {
  ACTIVITY_STATUS_MAP,
  type AllianceActivity,
} from "@/features/teaching-research-alliance/types";

defineOptions({ name: "AllianceDetailActivities" });

defineProps<{
  /** 联盟活动列表 */
  activities: AllianceActivity[];
}>();

const emit = defineEmits<{
  view: [activity: AllianceActivity];
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

.action-link {
  font-size: var(--font-size-md);
  color: var(--color-primary);
  cursor: pointer;
}

.action-link:hover {
  color: var(--color-primary-hover);
}
</style>
