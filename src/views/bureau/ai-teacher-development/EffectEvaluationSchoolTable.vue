<template>
  <section class="school-panel" aria-label="学校维度对比">
    <h2 class="section-title">学校维度对比</h2>
    <el-table :data="schools" stripe border>
      <el-table-column label="序号" width="72" align="center">
        <template #default="{ $index }">{{ $index + 1 }}</template>
      </el-table-column>
      <el-table-column prop="schoolName" label="学校名称" min-width="160" show-overflow-tooltip />
      <el-table-column label="参与情况" width="120" align="center">
        <template #default="{ row }: { row: EffectEvaluationSchoolRow }">
          <StatusTag :color="row.participating ? 'blue' : 'gray'">
            {{ row.participating ? "参与" : "未参与" }}
          </StatusTag>
        </template>
      </el-table-column>
      <el-table-column prop="awardCount" label="竞赛获奖(次)" width="130" align="center" />
      <el-table-column prop="paperCount" label="论文发表(次)" width="130" align="center" />
      <el-table-column prop="certificateCount" label="技能证书(次)" width="130" align="center" />
    </el-table>
  </section>
</template>

<script setup lang="ts">
import StatusTag from "@/components/StatusTag.vue";
import type { EffectEvaluationSchoolRow } from "@/features/effect-evaluation/types";

defineOptions({ name: "EffectEvaluationSchoolTable" });

defineProps<{
  /** 学校维度对比行 */
  schools: EffectEvaluationSchoolRow[];
}>();
</script>

<style scoped>
.school-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
  padding: var(--spacing-20) var(--spacing-24);
  background: var(--color-white);
  border-radius: var(--radius-lg);
}

.section-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}
</style>
