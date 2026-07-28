import type { EChartsCoreOption } from "echarts/core";

const axisColor = "#898a8c";
const axisLabel = { color: axisColor, fontSize: 11 };
const axisStyle = {
  axisLine: { lineStyle: { color: axisColor } },
  axisTick: { lineStyle: { color: axisColor } },
  nameTextStyle: axisLabel,
};
const splitLine = { lineStyle: { color: "#ebecf0" } };
const grid = { left: 44, right: 20, top: 48, bottom: 32 };

export function createTrendOption(segmentMode: boolean): EChartsCoreOption {
  return {
    tooltip: { trigger: "axis" },
    legend: { right: 8, top: 0, textStyle: axisLabel },
    grid,
    xAxis: {
      ...axisStyle,
      type: "category",
      boundaryGap: false,
      data: ["2023上", "2023下", "2024上", "2024下", "2025上", "2025下"],
      axisLabel,
    },
    yAxis: [
      { ...axisStyle, type: "value", min: 60, max: 90, axisLabel: { ...axisLabel, formatter: "{value}%" }, splitLine },
      { ...axisStyle, type: "value", min: 0, max: 12, axisLabel, splitLine: { show: false } },
    ],
    series: segmentMode
      ? [
          { name: "小学", type: "line", smooth: true, data: [76, 77.2, 78.1, 79.4, 80.2, 82.6], lineStyle: { width: 3, color: "#2d55eb" }, itemStyle: { color: "#2d55eb" } },
          { name: "初中", type: "line", smooth: true, data: [72.8, 74.3, 75.1, 76.8, 77.4, 79.1], lineStyle: { width: 3, color: "#36b37e" }, itemStyle: { color: "#36b37e" } },
          { name: "高中", type: "line", smooth: true, data: [70.5, 71.9, 72.8, 73.6, 74.5, 75.8], lineStyle: { width: 3, color: "#7a5af8" }, itemStyle: { color: "#7a5af8" } },
        ]
      : [
          { name: "及格率", type: "line", smooth: true, symbolSize: 7, data: [75.4, 76.8, 77.2, 78.6, 79.3, 81.1], lineStyle: { width: 3, color: "#2d55eb" }, itemStyle: { color: "#2d55eb" }, areaStyle: { color: "rgba(45,85,235,.08)" } },
          { name: "低分率", type: "line", smooth: true, symbolSize: 7, data: [11.2, 10.7, 10.1, 9.6, 9.1, 8.4], lineStyle: { width: 2, color: "#f52f3e" }, itemStyle: { color: "#f52f3e" } },
          { name: "学业增值", type: "bar", yAxisIndex: 1, barWidth: 14, data: [3.1, 4, 4.6, 5.3, 6.1, 7.4], itemStyle: { color: "#7a5af8", borderRadius: [4, 4, 0, 0] } },
        ],
  };
}

export const groupStructureOption: EChartsCoreOption = {
  tooltip: { trigger: "item", formatter: "{b}<br/>人数：{c} 人<br/>占比：{d}%" },
  legend: { orient: "vertical", right: 18, top: "middle", itemWidth: 9, itemHeight: 9, textStyle: axisLabel },
  series: [{
    type: "pie",
    radius: ["48%", "72%"],
    center: ["36%", "52%"],
    label: { show: true, formatter: "{d}%", fontSize: 11, color: "#575859" },
    data: [
      { value: 27_482, name: "持续进步群体", itemStyle: { color: "#2d55eb" } },
      { value: 32_840, name: "稳定发展群体", itemStyle: { color: "#36b37e" } },
      { value: 10_889, name: "及格临界群体", itemStyle: { color: "#ff9c00" } },
      { value: 8_210, name: "波动较大群体", itemStyle: { color: "#7a5af8" } },
      { value: 5_999, name: "学业困难群体", itemStyle: { color: "#f52f3e" } },
    ],
  }],
};

export const schoolQuadrantOption: EChartsCoreOption = {
  tooltip: { formatter: (params: { data: [number, number, number, string] }) => `${params.data[3]}<br/>发展指数：${params.data[0]}<br/>学业增值：${params.data[1]}` },
  grid: { ...grid, top: 22 },
  xAxis: { ...axisStyle, name: "综合发展指数", min: 68, max: 88, axisLabel, splitLine },
  yAxis: { ...axisStyle, name: "学业增值", min: -2, max: 9, axisLabel, splitLine },
  series: [{
    type: "scatter",
    data: [[84, 7.8, 2100, "第一实验"], [81, 6.9, 1700, "东湖实验"], [79, 5.8, 1300, "临江中心"], [75, 2.2, 2100, "滨河实验"], [71, -0.8, 1270, "南岭中心"], [78, 1.6, 1650, "外国语"], [73, 4.8, 980, "向阳中学"], [86, 7.1, 1430, "启明中学"]],
    symbolSize: (data: number[]) => Math.sqrt(data[2] ?? 0) * 0.62,
    itemStyle: { color: "#2d55eb", opacity: 0.72 },
    markLine: { silent: true, symbol: "none", lineStyle: { type: "dashed", color: "#bbbcbf" }, data: [{ xAxis: 78 }, { yAxis: 4.5 }] },
    label: { show: true, formatter: (params: { data: [number, number, number, string] }) => params.data[3], position: "top", fontSize: 10, color: "#575859" },
  }],
};

const schoolDistributionData = Array.from({ length: 40 }, (_, index) => {
  const developmentIndex = 69 + ((index * 7) % 19) + (index % 3) * 0.2;
  const valueAdd = -1 + ((index * 11) % 10) * 0.88;
  const students = 600 + ((index * 173) % 1800);
  return [developmentIndex, valueAdd, students, `学校${index + 1}`];
});

export const schoolDistributionOption: EChartsCoreOption = {
  tooltip: {
    formatter: (params: { data: [number, number, number, string] }) =>
      `${params.data[3]}<br/>发展指数：${params.data[0].toFixed(1)}<br/>增值：${params.data[1].toFixed(1)}`,
  },
  grid: { ...grid, top: 24 },
  xAxis: { ...axisStyle, name: "综合发展指数", min: 68, max: 89, axisLabel, splitLine },
  yAxis: { ...axisStyle, name: "学业增值", min: -2, max: 9, axisLabel, splitLine },
  series: [{
    type: "scatter",
    data: [
      ...schoolDistributionData,
      [86.4, 7.8, 2100, "第一实验"],
      [70.8, -0.8, 1270, "南岭中心"],
    ],
    symbolSize: (data: number[]) => 8 + Math.sqrt(data[2] ?? 0) / 5.5,
    itemStyle: { color: "#2d55eb", opacity: 0.62 },
    markLine: {
      silent: true,
      symbol: "none",
      lineStyle: { type: "dashed", color: "#bbbcbf" },
      data: [{ xAxis: 78 }, { yAxis: 4.5 }],
    },
  }],
};

const groupSeries: Record<string, number[]> = {
  critical: [18.7, 17.3, 15.8, 14.9, 13.6, 12.9, 11.4, 10.2],
  decline: [12.8, 11.9, 10.5, 9.8, 8.7, 8.4, 7.6, 6.9],
  effort: [14.2, 13.6, 12.9, 11.1, 10.8, 9.5, 8.9, 8.3],
};

export function createGroupSchoolOption(group: string): EChartsCoreOption {
  return {
    tooltip: { trigger: "axis" },
    grid: { ...grid, top: 22, bottom: 58 },
    xAxis: { ...axisStyle, type: "category", data: ["第八中学", "南岭中心", "育才中学", "滨河实验", "临江中心", "东湖实验", "外国语", "第一实验"], axisLabel: { ...axisLabel, rotate: 24 } },
    yAxis: { ...axisStyle, type: "value", axisLabel: { ...axisLabel, formatter: "{value}%" }, splitLine },
    series: [{ type: "bar", data: groupSeries[group] ?? groupSeries.critical, barWidth: 24, itemStyle: { color: "#2d55eb", borderRadius: [4, 4, 0, 0] }, label: { show: true, position: "top", formatter: "{c}%", color: "#575859" } }],
  };
}

export const groupScaleOption: EChartsCoreOption = {
  tooltip: { trigger: "axis" },
  grid: { ...grid, left: 100, top: 20 },
  xAxis: { ...axisStyle, type: "value", axisLabel: { ...axisLabel, formatter: "{value}人" }, splitLine },
  yAxis: { ...axisStyle, type: "category", data: ["持续下降", "学业困难", "高投入低成效", "波动较大", "及格临界"], axisLabel },
  series: [{ type: "bar", barWidth: 18, data: [4218, 5999, 7135, 8210, 10889], itemStyle: { color: "#2d55eb", borderRadius: [0, 4, 4, 0] }, label: { show: true, position: "right", formatter: "{c} 人", color: "#575859" } }],
};

export const migrationOption: EChartsCoreOption = {
  tooltip: { trigger: "item" },
  series: [{
    type: "sankey",
    left: 15,
    right: 22,
    top: 15,
    bottom: 15,
    nodeWidth: 18,
    nodeGap: 16,
    emphasis: { focus: "adjacency" },
    lineStyle: { color: "gradient", curveness: 0.5, opacity: 0.32 },
    label: { fontSize: 10, color: "#575859" },
    data: [
      { name: "上期困难", itemStyle: { color: "#f52f3e" } },
      { name: "上期临界", itemStyle: { color: "#ff9c00" } },
      { name: "上期稳定", itemStyle: { color: "#8ba2f8" } },
      { name: "本期困难", itemStyle: { color: "#f52f3e" } },
      { name: "本期临界", itemStyle: { color: "#ff9c00" } },
      { name: "本期稳定", itemStyle: { color: "#2d55eb" } },
      { name: "本期进步", itemStyle: { color: "#36b37e" } },
    ],
    links: [
      { source: "上期困难", target: "本期困难", value: 3300 },
      { source: "上期困难", target: "本期临界", value: 1800 },
      { source: "上期临界", target: "本期困难", value: 1100 },
      { source: "上期临界", target: "本期临界", value: 6200 },
      { source: "上期临界", target: "本期稳定", value: 2800 },
      { source: "上期稳定", target: "本期临界", value: 1500 },
      { source: "上期稳定", target: "本期稳定", value: 10500 },
      { source: "上期稳定", target: "本期进步", value: 7200 },
    ],
  }],
};

export const schoolTypeOption: EChartsCoreOption = {
  tooltip: { trigger: "item" },
  legend: { bottom: 4, textStyle: axisLabel },
  series: [{ type: "pie", radius: ["42%", "68%"], center: ["50%", "44%"], label: { formatter: "{b}\n{d}%", color: "#575859", fontSize: 11 }, data: [{ value: 18, name: "城区学校", itemStyle: { color: "#2d55eb" } }, { value: 26, name: "乡镇学校", itemStyle: { color: "#36b37e" } }, { value: 10, name: "九年一贯制", itemStyle: { color: "#7a5af8" } }] }],
};

export const urbanRuralOption: EChartsCoreOption = {
  tooltip: { trigger: "axis" },
  legend: { top: 0, right: 0, textStyle: axisLabel },
  grid,
  xAxis: { ...axisStyle, type: "category", data: ["得分率", "及格率", "优秀率", "活动覆盖", "支持覆盖"], axisLabel },
  yAxis: { ...axisStyle, type: "value", min: 50, max: 100, axisLabel: { ...axisLabel, formatter: "{value}%" }, splitLine },
  series: [
    { name: "城区学校", type: "bar", barWidth: 18, data: [82.3, 86.8, 31.2, 89.4, 91.8], itemStyle: { color: "#2d55eb", borderRadius: [4, 4, 0, 0] } },
    { name: "乡镇学校", type: "bar", barWidth: 18, data: [75.5, 79.7, 23.8, 80.9, 84.5], itemStyle: { color: "#8ba2f8", borderRadius: [4, 4, 0, 0] } },
  ],
};

export const gapTrendOption: EChartsCoreOption = {
  tooltip: { trigger: "axis" },
  legend: { top: 0, right: 0, textStyle: axisLabel },
  grid,
  xAxis: { ...axisStyle, type: "category", data: ["2023上", "2023下", "2024上", "2024下", "2025上", "2025下"], axisLabel },
  yAxis: { ...axisStyle, type: "value", min: 0.12, max: 0.24, axisLabel, splitLine },
  series: [
    { name: "校际差异指数", type: "line", smooth: true, data: [0.221, 0.213, 0.198, 0.187, 0.176, 0.164], lineStyle: { width: 3, color: "#36b37e" }, itemStyle: { color: "#36b37e" }, areaStyle: { color: "rgba(54,179,126,.08)" } },
    { name: "城乡差异指数", type: "line", smooth: true, data: [0.182, 0.177, 0.169, 0.171, 0.174, 0.181], lineStyle: { width: 2, color: "#ff9c00" }, itemStyle: { color: "#ff9c00" } },
  ],
};

const heatmapAreas = ["东部片区", "西部片区", "南部片区", "北部片区", "中心城区"];
const heatmapMetrics = ["学业发展", "体育健康", "实践活动", "支持覆盖", "发展增值"];

export const heatmapOption: EChartsCoreOption = {
  tooltip: {
    position: "top",
    formatter: (params: { data: [number, number, number] }) =>
      `${heatmapAreas[params.data[0]]} · ${heatmapMetrics[params.data[1]]}<br/>指数：${params.data[2]}`,
  },
  grid: { left: 90, right: 30, top: 15, bottom: 76 },
  xAxis: { ...axisStyle, type: "category", data: heatmapAreas, splitArea: { show: true }, axisLabel },
  yAxis: { ...axisStyle, type: "category", data: heatmapMetrics, splitArea: { show: true }, axisLabel },
  visualMap: {
    min: 65,
    max: 95,
    calculable: false,
    orient: "horizontal",
    left: "center",
    bottom: 8,
    itemWidth: 8,
    itemHeight: 140,
    text: ["95", "65"],
    textGap: 8,
    inRange: { color: ["#fff1f0", "#eaeefe", "#2d55eb"] },
    textStyle: axisLabel,
  },
  series: [{
    type: "heatmap",
    data: [
      [0, 0, 78], [1, 0, 71], [2, 0, 74], [3, 0, 69], [4, 0, 86],
      [0, 1, 82], [1, 1, 76], [2, 1, 79], [3, 1, 75], [4, 1, 84],
      [0, 2, 81], [1, 2, 68], [2, 2, 73], [3, 2, 70], [4, 2, 88],
      [0, 3, 86], [1, 3, 77], [2, 3, 82], [3, 3, 74], [4, 3, 92],
      [0, 4, 79], [1, 4, 72], [2, 4, 76], [3, 4, 70], [4, 4, 85],
    ],
    label: { show: true, color: "#394760" },
    itemStyle: { borderColor: "#fff", borderWidth: 3 },
  }],
};

export const supportFunnelOption: EChartsCoreOption = {
  tooltip: { trigger: "item", formatter: "{b}<br/>{c} 人" },
  series: [{ type: "funnel", left: "8%", top: 18, bottom: 18, width: "84%", minSize: "34%", maxSize: "100%", sort: "descending", gap: 4, label: { show: true, position: "inside", formatter: "{b}  {c}人", color: "#fff", fontSize: 11 }, itemStyle: { borderColor: "#fff", borderWidth: 2 }, data: [{ value: 21680, name: "识别重点群体", itemStyle: { color: "#2d55eb" } }, { value: 18929, name: "纳入支持", itemStyle: { color: "#5572ee" } }, { value: 15445, name: "完成支持措施", itemStyle: { color: "#7c8ef0" } }, { value: 8268, name: "阶段改善", itemStyle: { color: "#36b37e" } }, { value: 5962, name: "稳定保持", itemStyle: { color: "#65c69d" } }] }],
};

export const measureOption: EChartsCoreOption = {
  tooltip: { trigger: "axis" },
  grid: { ...grid, left: 108, top: 20 },
  xAxis: { ...axisStyle, type: "value", max: 70, axisLabel: { ...axisLabel, formatter: "{value}%" }, splitLine },
  yAxis: { ...axisStyle, type: "category", data: ["家校协同支持", "个性化作业", "学科专项辅导", "学习习惯指导", "临界生分层支持"], axisLabel },
  series: [{ type: "bar", barWidth: 18, data: [35.4, 41.6, 47.2, 51.8, 58.7], label: { show: true, position: "right", formatter: "{c}%", color: "#575859" }, itemStyle: { color: "#2d55eb", borderRadius: [0, 4, 4, 0] } }],
};
