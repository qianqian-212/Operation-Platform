<template>
  <div v-loading="loading" class="page-wrapper">
    <div class="page-header">
      <h1 class="page-title">跨校教研效果评估</h1>
      <el-button type="primary" :icon="Download" @click="handleExport">导出报告</el-button>
    </div>
    <EffectEvaluationStats :stats="stats" />
    <EffectEvaluationMetrics :metrics="metrics" :summary="summary" />
    <EffectEvaluationSchoolTable :schools="schools" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { Download } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useEffectEvaluationStore } from "@/stores/effect-evaluation";
import EffectEvaluationMetrics from "./EffectEvaluationMetrics.vue";
import EffectEvaluationSchoolTable from "./EffectEvaluationSchoolTable.vue";
import EffectEvaluationStats from "./EffectEvaluationStats.vue";

defineOptions({ name: "EffectEvaluationView" });

const evaluationStore = useEffectEvaluationStore();
const { loading, stats, metrics, summary, schools } = storeToRefs(evaluationStore);

onMounted(() => {
  void evaluationStore.load();
});

function handleExport() {
  ElMessage.success("已准备导出效果评估报告");
}
</script>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
  min-height: 0;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-16);
  flex-shrink: 0;
}

.page-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}
</style>
