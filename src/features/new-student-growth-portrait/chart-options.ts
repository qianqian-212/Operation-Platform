import type { EChartsCoreOption } from "echarts/core";
import type { AcademicExamType, UnifiedExamSummary } from "@/features/student-growth-portrait/data-contract";

export interface CoverageChartRow {
  label: string;
  coverageRate: number;
}

const axisColor = "#898a8c";
const primaryColor = "#2d55eb";
const positiveColor = "#13a889";
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

const gradeOrder = [
  "一年级",
  "二年级",
  "三年级",
  "四年级",
  "五年级",
  "六年级",
  "七年级",
  "八年级",
  "九年级",
  "高一",
  "高二",
  "高三",
] as const;

function compareGrades(left: string, right: string) {
  const leftIndex = gradeOrder.indexOf(left as (typeof gradeOrder)[number]);
  const rightIndex = gradeOrder.indexOf(right as (typeof gradeOrder)[number]);
  if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right, "zh-CN");
  if (leftIndex === -1) return 1;
  if (rightIndex === -1) return -1;
  return leftIndex - rightIndex;
}

function latestSummary(summaries: readonly UnifiedExamSummary[]) {
  return summaries.reduce<UnifiedExamSummary | undefined>((latest, summary) => (
    !latest || summary.examAt > latest.examAt ? summary : latest
  ), undefined);
}

/**
 * 统考年级质量对比：每个年级只取当前科目最新一场统考。
 * 柱形表示得分质量，折线表示成绩记录完整度，两者都使用百分比但不互相推导。
 */
export function createUnifiedExamGradeComparisonOption(
  summaries: readonly UnifiedExamSummary[],
  selectedSubject: string,
): EChartsCoreOption {
  const subjectSummaries = summaries.filter((summary) => (
    summary.subject === selectedSubject
    && (summary.examType === "midterm" || summary.examType === "final")
  ));
  const grades = [...new Set(subjectSummaries.map((summary) => summary.assessmentGrade))]
    .sort(compareGrades);
  const latestByGrade = new Map(grades.map((grade) => [
    grade,
    latestSummary(subjectSummaries.filter((summary) => summary.assessmentGrade === grade)),
  ]));

  return {
    color: [primaryColor, positiveColor],
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value: number | string) => (
        typeof value === "number" ? `${value}%` : `${value}`
      ),
    },
    legend: {
      top: 4,
      right: 12,
      textStyle: axisLabel,
    },
    grid,
    xAxis: {
      ...axisStyle,
      type: "category",
      data: grades,
      axisLabel,
    },
    yAxis: {
      ...axisStyle,
      type: "value",
      min: 0,
      max: 100,
      axisLabel: { ...axisLabel, formatter: "{value}%" },
      splitLine,
    },
    series: [
      {
        name: "平均得分率",
        type: "bar",
        barMaxWidth: 38,
        data: grades.map((grade) => latestByGrade.get(grade)?.scoreRate ?? null),
        itemStyle: { color: primaryColor, borderRadius: [4, 4, 0, 0] },
      },
      {
        name: "成绩覆盖率",
        type: "line",
        symbolSize: 7,
        data: grades.map((grade) => latestByGrade.get(grade)?.quality.coverageRate ?? null),
        lineStyle: { width: 2, type: "dashed", color: positiveColor },
        itemStyle: { color: positiveColor },
      },
    ],
  };
}

/**
 * 统考学业质量阶段对比：横轴按年级排列，每个年级并列展示期中、期末得分率。
 * 不连接不同年级，避免把不同学生群体误读为纵向成长。
 */
export function createUnifiedExamSubjectOption(
  summaries: readonly UnifiedExamSummary[],
  selectedSubject: string,
): EChartsCoreOption {
  const selected = summaries.filter((summary) => (
    summary.subject === selectedSubject
    && (summary.examType === "midterm" || summary.examType === "final")
  ));
  const grades = [...new Set(selected.map((summary) => summary.assessmentGrade))]
    .sort(compareGrades);
  const gradePoints = grades.map((grade) => {
    const gradeSummaries = selected.filter((summary) => summary.assessmentGrade === grade);
    const midterm = latestSummary(gradeSummaries.filter((summary) => summary.examType === "midterm"));
    const final = latestSummary(gradeSummaries.filter((summary) => summary.examType === "final"));
    return {
      grade,
      midterm: midterm?.scoreRate,
      final: final?.scoreRate,
      change: midterm && final ? Number((final.scoreRate - midterm.scoreRate).toFixed(2)) : undefined,
    };
  });

  return {
    color: [positiveColor, primaryColor],
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value: number | string) => (
        typeof value === "number" ? `${value}%` : `${value}`
      ),
    },
    legend: {
      top: 4,
      right: 12,
      textStyle: axisLabel,
    },
    grid,
    xAxis: {
      ...axisStyle,
      type: "category",
      data: grades,
      axisLabel,
    },
    yAxis: {
      ...axisStyle,
      type: "value",
      min: 0,
      max: 100,
      axisLabel: { ...axisLabel, formatter: "{value}%" },
      splitLine,
    },
    series: [
      {
        name: trendExamLabels.midterm,
        type: "bar",
        barMaxWidth: 34,
        data: gradePoints.map((point) => point.midterm ?? null),
        itemStyle: { color: positiveColor, borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: "top",
          color: "#575859",
          formatter: "{c}%",
        },
      },
      {
        name: trendExamLabels.final,
        type: "bar",
        barMaxWidth: 34,
        data: gradePoints.map((point) => ({
          value: point.final ?? null,
          change: point.change,
        })),
        itemStyle: { color: primaryColor, borderRadius: [4, 4, 0, 0] },
        label: {
          show: true,
          position: "top",
          color: "#575859",
          formatter: (params: { value: number; data: { value: number | null; change?: number } }) => {
            const change = params.data.change;
            if (change === undefined) return `{value|${params.value}%}`;
            if (change > 0) return `{value|${params.value}%}\n{up|↑ ${change}}`;
            if (change < 0) return `{value|${params.value}%}\n{down|↓ ${Math.abs(change)}}`;
            return `{value|${params.value}%}\n{flat|— 0}`;
          },
          rich: {
            value: { color: "#575859", lineHeight: 16 },
            up: { color: "#0f7b64", fontSize: 10, lineHeight: 14 },
            down: { color: "#c83c43", fontSize: 10, lineHeight: 14 },
            flat: { color: axisColor, fontSize: 10, lineHeight: 14 },
          },
        },
      },
    ],
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
