import type {
  WorkbenchDataContext,
  WorkbenchStatsData,
  WorkbenchStatsItemData,
} from "@/features/workbench/types";

const STATS_TITLES = {
  school: "校园数据",
  bureau: "区域数据",
  org: "机构数据",
  platform: "平台数据",
} as const;

const STATS_BY_CONTEXT: Record<string, WorkbenchStatsItemData[]> = {
  "school:admin": [
    { id: "student-count", label: "在校学生", value: "2,486", trend: "本学期新增 128 人", trendTone: "up" },
    { id: "arrival-rate", label: "今日到校率", value: "97.6%", trend: "较昨日 +0.8%", trendTone: "up" },
    { id: "pending-approvals", label: "待审批", value: "18", trend: "其中 5 项较紧急", trendTone: "neutral" },
    { id: "device-online-rate", label: "设备在线率", value: "98.2%", trend: "12 台设备需巡检", trendTone: "neutral" },
  ],
  "school:business": [
    { id: "today-courses", label: "今日课程", value: "5", trend: "下一节 10:20", trendTone: "neutral" },
    { id: "pending-tasks", label: "待处理任务", value: "7", trend: "2 项今天到期", trendTone: "neutral" },
    { id: "class-attendance", label: "班级出勤率", value: "98.1%", trend: "48 人已到校", trendTone: "up" },
  ],
  "bureau:admin": [
    { id: "school-count", label: "覆盖学校", value: "36", trend: "全部正常接入", trendTone: "up" },
    { id: "student-count", label: "在校学生", value: "48,620", trend: "本学期净增 386 人", trendTone: "up" },
    { id: "teacher-count", label: "教职工", value: "3,286", trend: "专任教师占比 91.4%", trendTone: "up" },
    { id: "pending-actions", label: "待处置事项", value: "24", trend: "6 项临近截止", trendTone: "neutral" },
  ],
  "bureau:business": [
    { id: "my-reviews", label: "待审核", value: "16", trend: "今日新增 3 项", trendTone: "neutral" },
    { id: "due-today", label: "今日到期", value: "4", trend: "最早 14:00 到期", trendTone: "neutral" },
    { id: "weekly-completed", label: "本周完成", value: "31", trend: "较上周 +6 项", trendTone: "up" },
  ],
  "org:admin": [
    { id: "course-count", label: "在售课程", value: "48", trend: "本月新增 6 门", trendTone: "up" },
    { id: "class-count", label: "开设课班", value: "126", trend: "92 个正在进行", trendTone: "up" },
    { id: "student-count", label: "报名学生", value: "3,820", trend: "续报率 76.8%", trendTone: "up" },
    { id: "pending-settlement", label: "待结算", value: "¥86,400", trend: "3 笔待确认", trendTone: "neutral" },
  ],
  "org:business": [
    { id: "today-classes", label: "今日课班", value: "6", trend: "首节 09:00 开始", trendTone: "neutral" },
    { id: "attendance-tasks", label: "待点名", value: "2", trend: "请及时完成点名", trendTone: "neutral" },
    { id: "assigned-students", label: "负责学生", value: "128", trend: "4 个课班", trendTone: "up" },
  ],
  "platform:admin": [
    { id: "tenant-count", label: "租户总数", value: "186", trend: "本月新增 8 个", trendTone: "up" },
    { id: "enabled-tenants", label: "启用租户", value: "178", trend: "启用率 95.7%", trendTone: "up" },
    { id: "role-count", label: "角色总数", value: "642", trend: "含 268 个自定义角色", trendTone: "neutral" },
    { id: "config-alerts", label: "配置提醒", value: "9", trend: "3 项建议立即处理", trendTone: "neutral" },
  ],
  "platform:business": [
    { id: "pending-tasks", label: "个人待办", value: "8", trend: "2 项今天到期", trendTone: "neutral" },
    { id: "weekly-completed", label: "本周完成", value: "26", trend: "较上周 +4 项", trendTone: "up" },
    { id: "service-status", label: "服务状态", value: "正常", trend: "所有核心服务可用", trendTone: "up" },
  ],
};

function tenantSeed(tenantId: string) {
  return [...tenantId].reduce((total, character) => total + character.charCodeAt(0), 0) % 7;
}

function statsValueForTenant(value: string, tenantId: string) {
  const seed = tenantSeed(tenantId);
  const percentage = value.match(/^(\d+(?:\.\d+)?)%$/);
  const currency = value.match(/^¥([\d,]+)$/);
  if (percentage) {
    const decimals = percentage[1]!.split(".")[1]?.length ?? 0;
    return `${(Number(percentage[1]) + seed * 0.1).toFixed(decimals)}%`;
  }
  if (currency) {
    return `¥${(Number(currency[1]!.replace(/,/g, "")) + seed * 1_200).toLocaleString("en-US")}`;
  }
  if (/^[\d,]+$/.test(value)) {
    return (Number(value.replace(/,/g, "")) + seed * 3).toLocaleString("en-US");
  }
  return value;
}

export function statsOverviewData(context: WorkbenchDataContext): WorkbenchStatsData {
  const key = `${context.tenant.type}:${context.profile}`;
  const items = STATS_BY_CONTEXT[key] ?? [];
  return {
    kind: "stats",
    title: STATS_TITLES[context.tenant.type],
    items: items.map((item) => ({
      ...item,
      value: statsValueForTenant(item.value, context.tenant.id),
    })),
  };
}
