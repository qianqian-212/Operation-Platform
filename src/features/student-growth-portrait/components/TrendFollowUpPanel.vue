<script setup lang="ts">
import { computed } from "vue";
import type { AttentionSignal, PortraitDataset } from "../data-contract";

const props = defineProps<{
  dataset: PortraitDataset;
}>();

const signals = computed(() => props.dataset.attentionSignals);

function domainLabel(domain: AttentionSignal["domain"]) {
  return {
    profile: "学生基础",
    "five-education": "五育评价",
    academic: "学业发展",
    honor: "荣誉发展",
    "sports-health": "运动健康",
    behavior: "行为习惯",
    life: "生活观察",
    practice: "实践活动",
    "daily-evaluation": "日常评价",
  }[domain];
}

function severityType(severity: AttentionSignal["severity"]): "info" | "warning" | "danger" {
  if (severity === "priority") return "danger";
  if (severity === "attention") return "warning";
  return "info";
}

function severityLabel(severity: AttentionSignal["severity"]) {
  return { observe: "观察", attention: "需核查", priority: "优先核查" }[severity];
}
</script>

<template>
  <section class="trend-follow-up" aria-label="区域数据关注">
    <header class="trend-follow-up__header">
      <div>
        <h2>数据关注</h2>
        <p>这里只展示由规则和证据生成的待核查信号；不推断原因，也不伪造处置闭环。</p>
      </div>
    </header>

    <ElAlert
      title="当前信号规则：数据覆盖率"
      description="当某领域有效记录的学生覆盖率低于配置阈值时，先核对数据接入范围和学籍分母，再分析业务变化。"
      type="info"
      :closable="false"
      show-icon
    />

    <ElEmpty v-if="!signals.length" description="当前筛选范围没有待核查信号" :image-size="100" />
    <ElTable v-else :data="signals" row-key="id" stripe border>
      <ElTableColumn label="领域" min-width="140">
        <template #default="{ row }">{{ domainLabel(row.domain) }}</template>
      </ElTableColumn>
      <ElTableColumn label="关注级别" width="120">
        <template #default="{ row }"><ElTag :type="severityType(row.severity)" effect="light">{{ severityLabel(row.severity) }}</ElTag></template>
      </ElTableColumn>
      <ElTableColumn label="观察到的事实" min-width="240">
        <template #default="{ row }">
          {{ row.evidence[0]?.metricKey }}：{{ row.evidence[0]?.observedValue }}{{ row.evidence[0]?.unit }}，阈值 {{ row.evidence[0]?.referenceValue }}{{ row.evidence[0]?.unit }}
        </template>
      </ElTableColumn>
      <ElTableColumn label="核查建议" min-width="300">
        <template #default="{ row }">{{ row.reviewDimension }}</template>
      </ElTableColumn>
    </ElTable>
  </section>
</template>

<style scoped>
.trend-follow-up { display: grid; min-width: 0; gap: var(--spacing-16); padding: var(--spacing-20); border-radius: var(--radius-md); background: var(--color-white); }
.trend-follow-up h2 { font-size: var(--font-size-lg); line-height: var(--line-height-lg); }
.trend-follow-up__header p { margin-top: var(--spacing-4); color: var(--color-secondary); font-size: var(--font-size-xs); }
</style>
