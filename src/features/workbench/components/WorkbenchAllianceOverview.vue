<template>
  <WorkbenchStatsOverview title-id="alliance-overview-title" :data="statsData" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import WorkbenchStatsOverview from "@/features/workbench/components/WorkbenchStatsOverview.vue";
import type {
  WorkbenchAllianceOverviewData,
  WorkbenchStatsData,
} from "@/features/workbench/types";

defineOptions({ name: "WorkbenchAllianceOverview" });

const props = defineProps<{
  data: WorkbenchAllianceOverviewData;
}>();

const statsData = computed<WorkbenchStatsData>(() => ({
  kind: "stats",
  title: props.data.title,
  items: props.data.items,
}));
</script>
