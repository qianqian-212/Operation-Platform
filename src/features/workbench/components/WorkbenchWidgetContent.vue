<template>
  <WorkbenchStatsOverview v-if="data.kind === 'stats'" :data="data" />

  <WorkbenchAllianceOverview v-else-if="data.kind === 'alliance-overview'" :data="data" />

  <WorkbenchAllianceList v-else-if="data.kind === 'alliance-list'" :data="data" />

  <WorkbenchEffectEvaluation v-else-if="data.kind === 'effect-evaluation'" :data="data" />

  <WorkbenchCrossSchoolActivities
    v-else-if="data.kind === 'cross-school-activities'"
    :data="data"
  />

  <WorkbenchTrendChart v-else-if="data.kind === 'trend'" :data="data" />

  <WorkbenchItemCards
    v-else-if="data.kind === 'list' || data.kind === 'schedule'"
    :items="data.items"
    empty-text="暂无列表内容"
  />

  <div v-else-if="data.kind === 'distribution'" class="distribution-content">
    <div v-for="item in data.items" :key="item.label" class="distribution-row">
      <div class="distribution-label">
        <span>{{ item.label }}</span>
        <strong>{{ item.displayValue }}</strong>
      </div>
      <div class="distribution-track">
        <span :class="`tone-${item.tone}`" :style="{ width: `${item.value}%` }" />
      </div>
    </div>
  </div>

  <WorkbenchRankingList v-else-if="data.kind === 'ranking'" :data="data" />

  <WorkbenchCalendarAgenda
    v-else-if="data.kind === 'calendar'"
    :data="data"
    :context="calendarContext"
  />

  <WorkbenchTaskCenter v-else-if="data.kind === 'inbox'" :data="data" />

  <WorkbenchBureauFeed v-else-if="data.kind === 'feed'" :data="data" />

  <WorkbenchSubscriptions v-else-if="data.kind === 'subscriptions'" :data="data" />

  <WorkbenchGrowthSummary v-else-if="data.kind === 'growth'" :data="data" />

  <WorkbenchEducationChart v-else-if="data.kind === 'education-chart'" :data="data" />

  <WorkbenchActivityRank v-else-if="data.kind === 'activity-rank'" :data="data" />

  <WorkbenchQuickApps v-else-if="data.kind === 'quick-links'" :data="data" />

  <WorkbenchUserOverview v-else-if="data.kind === 'user-overview'" :data="data" />

  <WorkbenchAccountPanel v-else-if="data.kind === 'account-panel'" :data="data" />

  <WorkbenchEtoneduAgent v-else-if="data.kind === 'agent'" :data="data" />
</template>

<script setup lang="ts">
import WorkbenchAllianceList from "@/features/workbench/components/WorkbenchAllianceList.vue";
import WorkbenchAllianceOverview from "@/features/workbench/components/WorkbenchAllianceOverview.vue";
import WorkbenchCrossSchoolActivities from "@/features/workbench/components/WorkbenchCrossSchoolActivities.vue";
import WorkbenchEffectEvaluation from "@/features/workbench/components/WorkbenchEffectEvaluation.vue";
import WorkbenchStatsOverview from "@/features/workbench/components/WorkbenchStatsOverview.vue";
import WorkbenchAccountPanel from "@/features/workbench/components/WorkbenchAccountPanel.vue";
import WorkbenchEtoneduAgent from "@/features/workbench/components/WorkbenchEtoneduAgent.vue";
import WorkbenchActivityRank from "@/features/workbench/components/WorkbenchActivityRank.vue";
import WorkbenchCalendarAgenda from "@/features/workbench/components/WorkbenchCalendarAgenda.vue";
import WorkbenchBureauFeed from "@/features/workbench/components/WorkbenchBureauFeed.vue";
import WorkbenchEducationChart from "@/features/workbench/components/WorkbenchEducationChart.vue";
import WorkbenchGrowthSummary from "@/features/workbench/components/WorkbenchGrowthSummary.vue";
import WorkbenchItemCards from "@/features/workbench/components/WorkbenchItemCards.vue";
import WorkbenchQuickApps from "@/features/workbench/components/WorkbenchQuickApps.vue";
import WorkbenchRankingList from "@/features/workbench/components/WorkbenchRankingList.vue";
import WorkbenchSubscriptions from "@/features/workbench/components/WorkbenchSubscriptions.vue";
import WorkbenchTaskCenter from "@/features/workbench/components/WorkbenchTaskCenter.vue";
import WorkbenchTrendChart from "@/features/workbench/components/WorkbenchTrendChart.vue";
import WorkbenchUserOverview from "@/features/workbench/components/WorkbenchUserOverview.vue";
import type { WorkbenchDataContext, WorkbenchWidgetData } from "@/features/workbench/types";

defineProps<{
  data: WorkbenchWidgetData;
  calendarContext?: WorkbenchDataContext;
}>();
</script>

<style scoped>
.distribution-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-6);
  color: var(--color-body);
  font-size: var(--font-size-sm);
}

.distribution-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  gap: var(--spacing-14);
}

.distribution-label strong {
  color: var(--color-title);
  font-weight: var(--font-weight-semibold);
}

.distribution-track {
  height: 7px;
  overflow: hidden;
  background: var(--color-bg-soft);
  border-radius: var(--radius-full);
}

.distribution-track span {
  display: block;
  height: 100%;
  border-radius: inherit;
}

.tone-primary { background: var(--color-primary); }
.tone-success { background: var(--color-success-dark-text); }
.tone-warning { background: var(--color-warning); }
.tone-danger { background: var(--color-error); }
.tone-neutral { background: var(--color-secondary); }
</style>
