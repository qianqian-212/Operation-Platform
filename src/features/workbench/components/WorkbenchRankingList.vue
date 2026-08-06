<template>
  <div class="ranking-panel">
    <WorkbenchSecondaryTabs
      v-model="period"
      :options="periodOptions"
      :panel-id="panelId"
      aria-label="排行周期"
    />
    <div :id="panelId" class="ranking-panel-body" role="tabpanel" aria-label="排行榜">
      <ol class="ranking-list">
        <li v-for="(item, index) in rankedItems" :key="item.id">
          <span class="ranking-index" :class="{ 'is-leading': index < 3 }">{{ index + 1 }}</span>
          <div class="ranking-body">
            <span class="ranking-topline">
              <strong :title="item.name">{{ item.name }}</strong>
              <span class="ranking-metrics">
                <template v-if="data.mode === 'resource'">
                  <small class="ranking-usage">
                    {{ formatCount(item.usage) }} 浏览 · {{ formatCount(item.uploads ?? 0) }} 上传
                  </small>
                  <small :class="trendToneClass(item.trend)">{{ item.trend }}</small>
                </template>
                <small v-else :class="trendToneClass(item.trend)">
                  {{ formatUsage(item.usage) }} · {{ item.trend }}
                </small>
              </span>
            </span>
            <el-progress
              :percentage="Math.round((item.usage / maxUsage) * 100)"
              :show-text="false"
              :stroke-width="5"
              aria-hidden="true"
            />
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from "vue";
import WorkbenchSecondaryTabs from "@/features/workbench/components/WorkbenchSecondaryTabs.vue";
import type { WorkbenchRankingData } from "@/features/workbench/types";

const props = defineProps<{ data: WorkbenchRankingData }>();
const period = ref<"7d" | "30d" | "term">("30d");
const panelId = useId();
const periodOptions = [
  { label: "近 7 天", value: "7d" },
  { label: "近 30 天", value: "30d" },
  { label: "本学期", value: "term" },
];
const periodFactor = computed(() => ({ "7d": 0.26, "30d": 1, term: 4.8 })[period.value]);
const rankedItems = computed(() => props.data.items.map((item) => ({
  ...item,
  usage: Number((item.usage * periodFactor.value).toFixed(1)),
})));
const maxUsage = computed(() => Math.max(...rankedItems.value.map((item) => item.usage), 1));

function formatUsage(usage: number) {
  return `${usage.toFixed(usage >= 10 ? 1 : 2)} 万次`;
}

function formatCount(value: number) {
  return value.toLocaleString("zh-CN");
}

function trendToneClass(trend: string) {
  const normalized = trend.trim();
  if (normalized.startsWith("-") || normalized.startsWith("−") || normalized.startsWith("下降")) {
    return "is-down";
  }
  if (normalized.startsWith("+") || normalized.startsWith("上升")) {
    return "is-up";
  }
  return "is-flat";
}
</script>

<style scoped>
.ranking-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: var(--spacing-10);
}

.ranking-panel-body {
  min-height: 0;
  flex: 1;
}

.ranking-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.ranking-list li {
  display: flex;
  align-items: center;
  min-height: 44px;
  gap: var(--spacing-10);
}

.ranking-list li + li {
  margin-top: var(--spacing-6);
}

.ranking-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
  font-weight: var(--font-weight-semibold);
  background: var(--color-bg-muted);
  border-radius: var(--radius-md);
}

.ranking-index.is-leading {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.ranking-body {
  min-width: 0;
  flex: 1;
}

.ranking-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  margin-bottom: var(--spacing-4);
  gap: var(--spacing-8);
}

.ranking-topline strong {
  overflow: hidden;
  color: var(--color-body);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ranking-metrics {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: var(--spacing-8);
  font-variant-numeric: tabular-nums;
}

.ranking-metrics small {
  font-size: var(--font-size-xs);
}

.ranking-usage,
.ranking-metrics small.is-flat {
  color: var(--color-secondary);
}

.ranking-metrics small.is-up {
  color: var(--color-success-dark-text);
}

.ranking-metrics small.is-down {
  color: var(--color-error-dark-text);
}
</style>
