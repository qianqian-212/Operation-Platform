<script setup lang="ts">
import type { UnifiedExamSummary } from "../data-contract";

defineProps<{
  summaries: readonly UnifiedExamSummary[];
}>();

function summaryKey(summary: UnifiedExamSummary) {
  return `${summary.examId}:${summary.subject}:${summary.assessmentGrade}:${summary.paperVersion}`;
}

function formatPercent(value: number) {
  return `${new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(value)}%`;
}

function examTypeLabel(type: UnifiedExamSummary["examType"]) {
  return {
    midterm: "期中",
    final: "期末",
    mock: "模拟",
    diagnostic: "诊断",
    other: "其他",
  }[type];
}

function qualityLabel(summary: UnifiedExamSummary) {
  const labels = { ready: "数据完整", partial: "数据不完整", insufficient: "数据不足", unavailable: "暂无数据" };
  return `${labels[summary.quality.status]} · 覆盖 ${formatPercent(summary.quality.coverageRate)}`;
}

function qualityType(summary: UnifiedExamSummary): "success" | "warning" | "danger" | "info" {
  if (summary.quality.status === "ready") return "success";
  if (summary.quality.status === "partial") return "warning";
  if (summary.quality.status === "insufficient") return "danger";
  return "info";
}
</script>

<template>
  <ElTable :data="summaries" :row-key="summaryKey" stripe border empty-text="当前筛选范围暂无同口径统考成绩记录">
    <ElTableColumn column-key="exam" label="统考批次" min-width="230">
      <template #default="{ row }">
        <strong>{{ row.examName }}</strong>
        <span class="unified-exam-summary__meta">{{ row.assessmentGrade }} · {{ row.subject }}</span>
      </template>
    </ElTableColumn>
    <ElTableColumn column-key="type" label="考试类型" min-width="110">
      <template #default="{ row }"><ElTag type="primary" effect="light">{{ examTypeLabel(row.examType) }}</ElTag></template>
    </ElTableColumn>
    <ElTableColumn column-key="score-rate" label="统考得分率" min-width="130">
      <template #default="{ row }">{{ formatPercent(row.scoreRate) }}</template>
    </ElTableColumn>
    <ElTableColumn column-key="excellent-rate" label="优秀率" min-width="110">
      <template #default="{ row }">{{ formatPercent(row.excellentRate) }}</template>
    </ElTableColumn>
    <ElTableColumn column-key="pass-rate" label="及格率" min-width="110">
      <template #default="{ row }">{{ formatPercent(row.passRate) }}</template>
    </ElTableColumn>
    <ElTableColumn column-key="low-rate" label="低分率" min-width="110">
      <template #default="{ row }">{{ formatPercent(row.lowScoreRate) }}</template>
    </ElTableColumn>
    <ElTableColumn column-key="coverage" label="成绩覆盖" min-width="150">
      <template #default="{ row }">{{ row.studentCount }} / {{ row.eligibleStudentCount }} 人</template>
    </ElTableColumn>
    <ElTableColumn column-key="paper" label="试卷版本" min-width="220" show-overflow-tooltip>
      <template #default="{ row }">{{ row.paperVersion }}</template>
    </ElTableColumn>
    <ElTableColumn column-key="quality" label="数据质量" min-width="160">
      <template #default="{ row }"><ElTag :type="qualityType(row)" effect="light">{{ qualityLabel(row) }}</ElTag></template>
    </ElTableColumn>
  </ElTable>
</template>

<style scoped>
.unified-exam-summary__meta { display: block; margin-top: var(--spacing-4); color: var(--color-secondary); font-size: var(--font-size-xs); }
</style>
