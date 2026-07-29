import type { EChartsCoreOption } from "echarts/core";
import type { AcademicExamType, UnifiedExamSummary } from "@/features/student-growth-portrait/data-contract";

export interface CoverageChartRow {
  label: string;
  coverageRate: number;
}

const axisColor = "#898a8c";
const axisLabel = { color: axisColor, fontSize: 11 };
const axisStyle = {
  axisLine: { lineStyle: { color: axisColor } },
  axisTick: { lineStyle: { color: axisColor } },
  nameTextStyle: axisLabel,
};
const splitLine = { lineStyle: { color: "#ebecf0" } };
const grid = { left: 44, right: 20, top: 48, bottom: 32 };

const trendExamTypes = ["midterm", "final"] as const satisfies readonly AcademicExamType[];
const trendExamLabels: Record<(typeof trendExamTypes)[number], string> = {
  midterm: "期中统考",
  final: "期末统考",
};

function weightedScoreRate(summaries: readonly UnifiedExamSummary[]) {
  const numerator = summaries.reduce((total, summary) => total + summary.scoreNumerator, 0);
  const denominator = summaries.reduce((total, summary) => total + summary.scoreDenominator, 0);
  return denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(2)) : null;
}

/**
 * 统考学业质量趋势：按当前科目展示本学期期中、期末得分率。
 * 同学段/筛选范围内多个年级以成绩分子分母加权，不跨科合并。
 */
export function createUnifiedExamSubjectOption(
  summaries: readonly UnifiedExamSummary[],
  selectedSubject: string,
): EChartsCoreOption {
  const selected = summaries.filter((summary) => (
    summary.subject === selectedSubject
    && (summary.examType === "midterm" || summary.examType === "final")
  ));
  const categories = trendExamTypes
    .filter((examType) => selected.some((summary) => summary.examType === examType))
    .map((examType) => trendExamLabels[examType]);
  const data = trendExamTypes
    .filter((examType) => selected.some((summary) => summary.examType === examType))
    .map((examType) => weightedScoreRate(
      selected.filter((summary) => summary.examType === examType),
    ));

  return {
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: number | string) => (
        typeof value === "number" ? `${value}%` : `${value}`
      ),
    },
    grid,
    xAxis: {
      ...axisStyle,
      type: "category",
      data: categories,
      axisLabel,
    },
    yAxis: {
      ...axisStyle,
      type: "value",
      min: 40,
      max: 100,
      axisLabel: { ...axisLabel, formatter: "{value}%" },
      splitLine,
    },
    series: [{
      name: selectedSubject,
      type: "line",
      connectNulls: false,
      symbolSize: 7,
      data,
      lineStyle: { width: 3, color: "#2d55eb" },
      itemStyle: { color: "#2d55eb" },
    }],
  };
}

export function createCoverageOption(rows: readonly CoverageChartRow[]): EChartsCoreOption {
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: Array<{ name: string; value: number }>) => {
        const item = params[0];
        return item ? `${item.name}<br/>覆盖率：${item.value}%` : "";
      },
    },
    grid: { left: 118, right: 44, top: 16, bottom: 20 },
    xAxis: {
      ...axisStyle,
      type: "value",
      min: 0,
      max: 100,
      axisLabel: { ...axisLabel, formatter: "{value}%" },
      splitLine,
    },
    yAxis: {
      ...axisStyle,
      type: "category",
      data: rows.map((row) => row.label),
      axisLabel,
    },
    series: [{
      type: "bar",
      barWidth: 18,
      data: rows.map((row) => row.coverageRate),
      label: {
        show: true,
        position: "right",
        formatter: "{c}%",
        color: "#575859",
      },
      itemStyle: {
        color: "#2d55eb",
        borderRadius: [0, 4, 4, 0],
      },
    }],
  };
}
