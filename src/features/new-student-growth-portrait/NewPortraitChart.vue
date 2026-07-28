<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import {
  BarChart,
  FunnelChart,
  HeatmapChart,
  LineChart,
  PieChart,
  SankeyChart,
  ScatterChart,
} from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components";
import { init, use, type ECharts, type EChartsCoreOption } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

use([
  BarChart,
  FunnelChart,
  HeatmapChart,
  LineChart,
  PieChart,
  SankeyChart,
  ScatterChart,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

const props = defineProps<{
  option: EChartsCoreOption;
  ariaLabelText: string;
}>();

const chartElement = ref<HTMLElement | null>(null);
const chart = shallowRef<ECharts | null>(null);
let resizeObserver: ResizeObserver | null = null;
let resizeFrame: number | undefined;

function renderChart() {
  if (document.hidden) return;
  chart.value?.setOption(props.option, { notMerge: true, lazyUpdate: true });
}

function scheduleResize() {
  if (resizeFrame !== undefined) return;
  resizeFrame = window.requestAnimationFrame(() => {
    resizeFrame = undefined;
    chart.value?.resize({ animation: { duration: 0 } });
  });
}

function handleVisibilityChange() {
  if (document.hidden) {
    chart.value?.getZr().animation.stop();
    return;
  }
  chart.value?.getZr().animation.start();
  renderChart();
  scheduleResize();
}

onMounted(() => {
  if (!chartElement.value) return;
  chart.value = init(chartElement.value, undefined, {
    renderer: "canvas",
    devicePixelRatio: Math.min(Math.max(window.devicePixelRatio || 1, 1), 2),
  });
  renderChart();
  resizeObserver = new ResizeObserver(scheduleResize);
  resizeObserver.observe(chartElement.value);
  document.addEventListener("visibilitychange", handleVisibilityChange);
});

watch(() => props.option, renderChart, { deep: false, flush: "post" });

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  if (resizeFrame !== undefined) window.cancelAnimationFrame(resizeFrame);
  chart.value?.dispose();
  chart.value = null;
});
</script>

<template>
  <div ref="chartElement" class="new-portrait-chart" role="img" :aria-label="ariaLabelText" />
</template>

<style scoped>
.new-portrait-chart {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 240px;
}
</style>
