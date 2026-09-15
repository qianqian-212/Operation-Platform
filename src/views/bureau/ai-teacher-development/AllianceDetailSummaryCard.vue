<template>
  <section class="summary-card">
    <div class="title-row">
      <h2 class="summary-title">{{ detail.name }}</h2>
      <StatusTag :color="ALLIANCE_STATUS_MAP[detail.status].tagColor">
        {{ ALLIANCE_STATUS_MAP[detail.status].label }}
      </StatusTag>
    </div>
    <p class="meta-line">
      <span>创建于{{ detail.createdAt }}</span>
      <span>管理员：{{ detail.adminName }}</span>
    </p>
    <p class="description">{{ detail.description }}</p>
    <div class="metric-row">
      <div v-for="metric in metrics" :key="metric.label" class="metric-item">
        <div class="metric-copy">
          <span class="metric-value">{{ metric.value }}</span>
          <span class="metric-label">{{ metric.label }}</span>
        </div>
        <button
          v-if="metric.action"
          type="button"
          class="metric-action"
          @click="emit('view-schools')"
        >
          查看
          <el-icon><ArrowRight /></el-icon>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ArrowRight } from "@element-plus/icons-vue";
import StatusTag from "@/components/StatusTag.vue";
import {
  ALLIANCE_STATUS_MAP,
  type TeachingResearchAllianceDetail,
} from "@/features/teaching-research-alliance/types";

defineOptions({ name: "AllianceDetailSummaryCard" });

const props = defineProps<{
  /** 联盟详情 */
  detail: TeachingResearchAllianceDetail;
}>();

const emit = defineEmits<{
  "view-schools": [];
}>();

const metrics = computed(() => [
  { label: "成员学校", value: String(props.detail.memberSchoolCount), action: true },
  { label: "教研活动", value: String(props.detail.activityCount), action: false },
  { label: "参与教师", value: String(props.detail.teacherCount), action: false },
]);
</script>

<style scoped>
.summary-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-24);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-12);
  flex-wrap: wrap;
}

.summary-title {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 28px;
}

.meta-line {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-16);
  font-size: var(--font-size-sm);
  color: var(--color-secondary);
  line-height: var(--line-height-md);
}

.description {
  margin: 0;
  font-size: var(--font-size-md);
  color: var(--color-body);
  line-height: var(--line-height-md);
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-12);
  margin-top: auto;
  padding-top: var(--spacing-8);
}

.metric-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-8);
  min-height: 72px;
  padding: var(--spacing-12) var(--spacing-16);
  background: var(--color-bg);
  border-radius: var(--radius-md);
}

.metric-copy {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  min-width: 0;
}

.metric-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  line-height: 28px;
}

.metric-label {
  font-size: var(--font-size-sm);
  color: var(--color-secondary);
  line-height: var(--line-height-md);
}

.metric-action {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
  cursor: pointer;
  flex-shrink: 0;
}

.metric-action:hover {
  color: var(--color-primary-hover);
}

@media (max-width: 720px) {
  .metric-row {
    grid-template-columns: 1fr;
  }
}
</style>
