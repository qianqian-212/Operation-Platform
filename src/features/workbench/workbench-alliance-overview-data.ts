import type {
  WorkbenchAllianceOverviewData,
  WorkbenchDataContext,
  WorkbenchStatsItemData,
} from "@/features/workbench/types";

const ALLIANCE_METRICS: readonly WorkbenchStatsItemData[] = [
  {
    id: "alliances",
    label: "教研联盟",
    value: "3",
    trend: "个联盟使用中",
    trendTone: "neutral",
  },
  {
    id: "schools",
    label: "参与学校",
    value: "8",
    trend: "共12所学校",
    trendTone: "neutral",
  },
  {
    id: "activities",
    label: "跨校活动",
    value: "51",
    trend: "本年度开展",
    trendTone: "neutral",
  },
  {
    id: "teachers",
    label: "参与教师",
    value: "379",
    trend: "跨校参与",
    trendTone: "neutral",
  },
];

function tenantSeed(tenantId: string) {
  return [...tenantId].reduce((total, character) => total + character.charCodeAt(0), 0) % 5;
}

function metricValueForTenant(value: string, tenantId: string, index: number) {
  if (!/^\d+$/.test(value)) return value;
  return String(Number(value) + tenantSeed(tenantId) + index);
}

export function allianceOverviewData(context: WorkbenchDataContext): WorkbenchAllianceOverviewData {
  return {
    kind: "alliance-overview",
    title: "联盟数据总览",
    items: ALLIANCE_METRICS.map((item, index) => ({
      ...item,
      value: metricValueForTenant(item.value, context.tenant.id, index),
    })),
  };
}
