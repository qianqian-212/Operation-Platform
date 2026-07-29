export type MetricExplanationKey = "academic-quality-rate" | "period-comparison";

export interface MetricExplanation {
  title: string;
  status: "calculable";
  nationalBasis: string;
  localRule: string;
  definition: string;
  formula: string;
  example: string;
  requiredFields: readonly string[];
  boundary: string;
}

export const metricExplanations: Readonly<Record<MetricExplanationKey, MetricExplanation>> = {
  "academic-quality-rate": {
    title: "学业质量得分率",
    status: "calculable",
    nationalBasis: "《义务教育质量评价指南》和《普通高中学校办学质量评价指南》要求关注学业发展，但未规定跨学科综合总分。",
    localRule: "学段与年级由页面筛选栏控制；选定科目后，在当前筛选范围内按最新一次统考（期中或期末）做成绩分子分母加权，页面不据此形成学校排名。",
    definition: "当前筛选范围内，该科目最新一次统考有效成绩总和占对应满分总和的比例；多年级可加权，不跨科合并。",
    formula: "学业质量得分率 = Σ有效成绩 ÷ Σ对应满分 × 100%。",
    example: "某筛选范围内数学期末统考成绩合计 7,860 分，满分合计 10,000 分，平均得分率为 7,860÷10,000=78.6%。",
    requiredFields: ["考试类型", "组织范围", "年级与学科", "成绩", "满分", "记录状态"],
    boundary: "不同科目不得合并计算；多年级加权仅用于区域总览观察，不替代同试卷版本的精细对比；当前页面数据来自明确标记的虚拟原始数据源。",
  },
  "period-comparison": {
    title: "同比变化",
    status: "calculable",
    nationalBasis: "国家评价文件要求关注发展变化；教育质量观察优先采用同学期对照，以降低学期季节性干扰。",
    localRule: "页面只发布同比：对照上一学年同一学期，并与当前学期使用同一学段、年级、科目和指标口径。不发布相邻学期环比，避免上、下学期活动节奏与考试安排不可比。",
    definition: "同比是两个百分比指标相减得到的差值，页面用 % 符号展示，含义仍是百分点差，不是相对涨跌幅。",
    formula: "同比（百分点差）= 当前学期值 − 上一学年同一学期值；卡片展示为如 +5.00% / -1.17%。",
    example: "当前学年上学期五育评价覆盖率 80%，上一学年上学期为 75%，则同比 +5.00%（即提高 5 个百分点，不是相对提高 5%）。",
    requiredFields: ["当前学期", "上一学年同一学期", "同一筛选口径", "可计算指标值"],
    boundary: "缺少对照学期数据、历史学籍快照，或统考未限定到同一年级与科目时，对应变化标记为暂无可比。",
  },
};
