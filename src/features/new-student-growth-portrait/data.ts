export interface PortraitMetric {
  label: string;
  value: string;
  unit: string;
  trend: string;
  trendDirection: "positive" | "negative";
}

export interface FocusSchool {
  school: string;
  type: string;
  students: string;
  issue: string;
  group: string;
  value: string;
  delta: string;
  level: "高关注" | "较高关注" | "持续观察";
  action: string;
}

export interface SchoolDevelopmentRow {
  school: string;
  type: string;
  index: number;
  valueAdd: number;
  critical: string;
  support: string;
  trend: string;
  status: "优势发展" | "稳定进步" | "改善明显" | "重点关注" | "专项支持";
}

export interface SupportSchoolRow {
  school: string;
  target: string;
  coverage: number;
  completion: string;
  improve: string;
  stable: string;
  status: "成效良好" | "持续改善" | "需要优化" | "重点督导";
}

export const portraitAnchors = [
  { key: "regional-overview", label: "区域发展总览" },
  { key: "student-groups", label: "学生群体画像" },
  { key: "school-development", label: "学校发展画像" },
  { key: "regional-equity", label: "区域均衡分析" },
  { key: "growth-support", label: "成长支持成效" },
] as const;

export const overviewMetrics: PortraitMetric[] = [
  { label: "区域学生总数", value: "86,420", unit: "人", trend: "+1.8%", trendDirection: "positive" },
  { label: "综合发展指数", value: "78.6", unit: "分", trend: "+2.6%", trendDirection: "positive" },
  { label: "持续进步群体", value: "31.8", unit: "%", trend: "+3.2%", trendDirection: "positive" },
  { label: "及格临界群体", value: "12.6", unit: "%", trend: "+0.9%", trendDirection: "negative" },
  { label: "重点群体改善率", value: "43.7", unit: "%", trend: "+5.4%", trendDirection: "positive" },
];

export const equityMetrics: PortraitMetric[] = [
  { label: "校际差异指数", value: "0.164", unit: "", trend: "下降 0.012", trendDirection: "positive" },
  { label: "城乡得分率差距", value: "6.8", unit: "pt", trend: "扩大 0.6", trendDirection: "negative" },
  { label: "同类学校差距", value: "4.2", unit: "pt", trend: "缩小 0.9", trendDirection: "positive" },
  { label: "活动覆盖差异", value: "8.5", unit: "pt", trend: "缩小 1.1", trendDirection: "positive" },
  { label: "支持覆盖差异", value: "7.3", unit: "pt", trend: "扩大 0.3", trendDirection: "negative" },
];

export const findings = [
  { tone: "success", title: "持续进步群体扩大", text: "区域持续进步群体较上学期增加 3.2 个百分点，主要来自七年级和小学高年级。" },
  { tone: "warning", title: "八年级英语需重点关注", text: "及格临界群体占比达到 15.8%，连续两个学期上升，涉及 11 所学校。" },
  { tone: "danger", title: "城乡数学差距扩大", text: "乡镇学校数学平均得分率低于城区学校 7.4 个百分点，差距扩大 0.8 个百分点。" },
] as const;

export const focusSchools: FocusSchool[] = [
  { school: "海州市第八中学", type: "城区初中", students: "1,842", issue: "八年级英语临界群体持续扩大", group: "及格临界群体", value: "18.7%", delta: "+3.4%", level: "高关注", action: "开展英语分层支持" },
  { school: "滨河实验学校", type: "九年一贯制", students: "2,106", issue: "数学高投入低成效群体偏高", group: "高投入低成效", value: "14.2%", delta: "+1.8%", level: "较高关注", action: "优化作业与反馈机制" },
  { school: "南岭镇中心学校", type: "乡镇初中", students: "1,276", issue: "低分群体改善率低于区域均值", group: "学业困难群体", value: "26.5%", delta: "-2.1%", level: "较高关注", action: "加强区域教研帮扶" },
  { school: "海州外国语学校", type: "城区初中", students: "1,635", issue: "学生学习表现波动较大", group: "波动较大群体", value: "11.4%", delta: "+0.7%", level: "持续观察", action: "关注考试稳定性" },
];

export const groupStats = [
  { label: "重点群体总规模", value: "21,680 人", note: "占区域学生 25.1%" },
  { label: "较上学期净减少", value: "1,246 人", note: "困难与临界群体合计" },
  { label: "群体支持覆盖率", value: "87.3%", note: "已进入支持计划" },
  { label: "改善后稳定保持率", value: "72.1%", note: "连续两个周期保持" },
];

export const schoolRows: SchoolDevelopmentRow[] = [
  { school: "海州市第一实验学校", type: "城区九年一贯制", index: 86.4, valueAdd: 7.8, critical: "8.2%", support: "94.1%", trend: "上升 3.6%", status: "优势发展" },
  { school: "启明中学", type: "城区初中", index: 84.9, valueAdd: 7.1, critical: "9.5%", support: "92.8%", trend: "上升 2.8%", status: "稳定进步" },
  { school: "东湖实验学校", type: "城区九年一贯制", index: 83.7, valueAdd: 6.9, critical: "10.1%", support: "91.3%", trend: "上升 2.1%", status: "稳定进步" },
  { school: "临江镇中心学校", type: "乡镇初中", index: 78.2, valueAdd: 4.8, critical: "13.6%", support: "89.5%", trend: "上升 1.7%", status: "改善明显" },
  { school: "滨河实验学校", type: "九年一贯制", index: 74.6, valueAdd: 2.2, critical: "14.9%", support: "84.6%", trend: "下降 0.4%", status: "重点关注" },
  { school: "南岭镇中心学校", type: "乡镇初中", index: 70.8, valueAdd: -0.8, critical: "17.3%", support: "76.2%", trend: "下降 1.9%", status: "专项支持" },
];

export const supportStats = [
  { label: "识别重点群体", value: "21,680 人", note: "规则命中并经学校确认" },
  { label: "已纳入支持", value: "18,929 人", note: "覆盖率 87.3%" },
  { label: "措施完成率", value: "81.6%", note: "15,445 人完成措施" },
  { label: "阶段改善率", value: "43.7%", note: "8,268 人状态改善" },
];

export const supportRows: SupportSchoolRow[] = [
  { school: "海州市第一实验学校", target: "582 人", coverage: 96, completion: "92.4%", improve: "58.7%", stable: "81.2%", status: "成效良好" },
  { school: "启明中学", target: "436 人", coverage: 94, completion: "89.6%", improve: "54.1%", stable: "78.5%", status: "成效良好" },
  { school: "临江镇中心学校", target: "398 人", coverage: 88, completion: "82.3%", improve: "46.8%", stable: "73.2%", status: "持续改善" },
  { school: "滨河实验学校", target: "614 人", coverage: 83, completion: "76.9%", improve: "35.6%", stable: "65.4%", status: "需要优化" },
  { school: "南岭镇中心学校", target: "522 人", coverage: 74, completion: "68.5%", improve: "27.4%", stable: "58.1%", status: "重点督导" },
];
