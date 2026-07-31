<script setup lang="ts">
import { computed } from "vue";
import {
  metricExplanations,
  type MetricExplanationKey,
} from "./metric-explanations";
import PortraitHintPopover from "./PortraitHintPopover.vue";

const props = defineProps<{
  metricKey: MetricExplanationKey;
  label?: string;
}>();

const explanation = computed(() => metricExplanations[props.metricKey]);
const triggerLabel = computed(() => props.label ?? explanation.value.title);
const status = computed(() => ({
  prototype: { label: "原型规则", type: "warning" as const },
  calculable: { label: "具备计算条件", type: "success" as const },
  pending: { label: "待数据接入", type: "info" as const },
}[explanation.value.status]));

const items = computed(() => [
  { label: "国家依据", value: explanation.value.nationalBasis },
  { label: "地方规则", value: explanation.value.localRule },
  { label: "定义", value: explanation.value.definition },
  { label: "计算公式", value: explanation.value.formula },
  { label: "计算示例", value: explanation.value.example },
  { label: "数据字段", value: explanation.value.requiredFields.join("、") },
  { label: "发布边界", value: explanation.value.boundary },
]);
</script>

<template>
  <PortraitHintPopover
    :label="triggerLabel"
    :title="explanation.title"
    :items="items"
    :status-label="status.label"
    :status-type="status.type"
  />
</template>
