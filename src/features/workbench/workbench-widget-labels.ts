import type { WorkbenchProfile, WorkbenchWidgetKind, WorkbenchWidgetScope } from "@/features/workbench/types";

export const WORKBENCH_WIDGET_KIND_LABEL: Record<WorkbenchWidgetKind, string> = {
  stats: "数据概览",
  inbox: "消息待办",
  trend: "趋势",
  list: "列表",
  schedule: "日程",
  distribution: "分布",
  "quick-links": "快捷导航",
  ranking: "排行",
  calendar: "日历",
  growth: "成长",
  "education-chart": "教育图表",
  "activity-rank": "活跃排名",
  "user-overview": "个人概览",
  "account-panel": "个人面板",
  agent: "AI 助手",
};

export const WORKBENCH_WIDGET_SCOPE_LABEL: Record<WorkbenchWidgetScope, string> = {
  common: "公共组件",
  domain: "领域组件",
};

export const WORKBENCH_PROFILE_LABEL: Record<WorkbenchProfile, string> = {
  admin: "管理员",
  business: "业务角色",
};

export function workbenchProfileHint(profiles: readonly WorkbenchProfile[]) {
  return profiles.map((profile) => WORKBENCH_PROFILE_LABEL[profile]).join("、");
}
