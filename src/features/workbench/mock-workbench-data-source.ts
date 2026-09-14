import type {
  WorkbenchDataContext,
  WorkbenchDataSource,
  WorkbenchDistributionItemData,
  WorkbenchEducationChartData,
  WorkbenchFeedItemData,
  WorkbenchListItemData,
  WorkbenchQuickLinkData,
  WorkbenchSubscriptionItemData,
  WorkbenchWidgetData,
  WorkbenchWidgetDefinition,
  WorkbenchWidgetSettings,
} from "@/features/workbench/types";
import { bureauPublicFeedData } from "@/features/workbench/bureau-public-feed";
import { inboxOverviewData } from "@/features/workbench/workbench-inbox-data";
import {
  allianceListData,
  crossSchoolActivitiesData,
  effectEvaluationData,
} from "@/features/workbench/workbench-alliance-panels-data";
import { allianceOverviewData } from "@/features/workbench/workbench-alliance-overview-data";
import { statsOverviewData } from "@/features/workbench/workbench-stats-data";

const bureauFeedData: Record<string, WorkbenchFeedItemData[]> = {
  "bureau-news": [
    { id: "news-1", title: "全区基础教育高质量发展推进会召开", meta: "今天", label: "局内动态", tone: "primary", source: "办公室", summary: "会议部署秋季学期重点工作，明确教育质量提升、校园安全和数字化建设三项任务的责任单位与完成时限。", unread: true },
    { id: "news-2", title: "暑期校园安全专项检查工作启动", meta: "07-17", label: "重点工作", source: "安全科", summary: "专项检查覆盖消防、校舍、食品和暑期值班四类事项，各学校需按计划完成自查和整改反馈。", unread: true },
    { id: "news-3", title: "数字化教学应用培训完成首期授课", meta: "07-16", label: "教育数字化", source: "电教中心", summary: "首期培训完成 12 所学校的教师实操辅导，后续将按学段组织专题应用工作坊。" },
    { id: "news-4", title: "区级名师工作室联合教研活动举行", meta: "07-15", label: "教研活动", source: "教研室", summary: "活动围绕跨学科主题学习开展课例研讨，并形成下一阶段联合教研任务清单。" },
    { id: "news-5", title: "课后服务质量监测结果完成复核", meta: "07-14", label: "工作简报", source: "基教科", summary: "本轮监测完成数据复核，学校覆盖率和课程开设达标率均较上期提升。" },
  ],
  ...bureauPublicFeedData,
};

const bureauSubscriptionData: WorkbenchSubscriptionItemData[] = [
  { id: "subscription-1", title: "基础教育政策速递", meta: "更新 3 条", label: "政策", subscribed: true },
  { id: "subscription-2", title: "教育数字化建设动态", meta: "更新 2 条", label: "专题", subscribed: true },
  { id: "subscription-3", title: "区域教学质量监测", meta: "每周一", label: "数据", subscribed: true },
  { id: "subscription-4", title: "教师发展与教研资讯", meta: "更新 1 条", label: "教研", subscribed: false },
  { id: "subscription-5", title: "校园安全风险提示", meta: "实时", label: "安全", tone: "warning", subscribed: true },
];

const educationChartData: Record<string, Omit<WorkbenchEducationChartData, "kind">> = {
  "grade-applications": {
    variant: "grade-applications",
    labels: ["一年级", "二年级", "三年级", "四年级", "五年级", "六年级", "初一", "初二", "初三", "高一", "高二", "高三"],
    series: [{ name: "应用量", values: [8_260, 7_850, 7_530, 7_110, 6_940, 6_620, 5_780, 5_420, 5_060, 4_880, 4_510, 4_120] }],
    centerLabel: "小学",
    centerValue: "44,310",
  },
  "application-types": {
    variant: "application-types",
    labels: ["作业", "上课", "班测", "备课", "考试", "课程任务"],
    series: [{ name: "应用量", values: [2_383, 2_728, 1_128, 12_839, 240, 2_293] }],
    centerLabel: "作业",
    centerValue: "2,383",
  },
  "resource-sharing": {
    variant: "resource-sharing",
    labels: ["公开分享", "本校分享", "私人分享"],
    series: [{ name: "资源量", values: [7_383, 2_728, 1_128] }],
    centerLabel: "公开分享",
    centerValue: "7,383",
    metrics: [
      { label: "浏览量", value: "98", tone: "primary" },
      { label: "下载量", value: "32" },
      { label: "收藏量", value: "24" },
    ],
  },
  "resource-growth": {
    variant: "resource-growth",
    labels: ["11-09", "11-12", "11-15", "11-18", "11-21", "11-24", "11-27", "11-30", "12-03"],
    series: [{ name: "新增资源", values: [22, 40, 58, 48, 44, 64, 96, 112, 142] }],
    summary: "最近 30 天日均上传 471",
  },
  "resource-contribution": {
    variant: "resource-contribution",
    labels: ["作业", "班测", "备课", "考试", "课程任务"],
    series: [{ name: "资源贡献", values: [190, 170, 185, 100, 130] }],
    unit: "单位（个数）",
  },
  "subject-resources": {
    variant: "subject-resources",
    labels: ["语文", "英语", "数学", "政治", "思想品德", "历史", "化学", "美术", "物理", "体育"],
    series: [{ name: "资源量", values: [5.9, 5.1, 5.7, 2.7, 3.7, 4.6, 5.3, 2, 5.8, 1.9] }],
    unit: "单位（万）",
  },
};

function tenantSeed(tenantId: string) {
  return [...tenantId].reduce((total, character) => total + character.charCodeAt(0), 0) % 7;
}

function listItems(values: string[], prefix: string): WorkbenchListItemData[] {
  return values.map((title, index) => ({
    id: `${prefix}-${index}`,
    title,
    meta: index === 0 ? "今天" : `${index + 1} 天内`,
    label: index === 0 ? "告警" : "通知",
    tone: index === 0 ? "warning" : "neutral",
  }));
}

function scheduleItems(context: WorkbenchDataContext): WorkbenchListItemData[] {
  const values = context.tenant.type === "school"
    ? ["08:30 晨会与班级签到", "10:20 三年级科学课", "14:00 教研组例会", "16:30 放学值班"]
    : context.tenant.type === "bureau"
      ? ["09:00 机构资质审核", "10:30 课程细则复核", "14:00 学校数据沟通会", "16:00 审核结果汇总"]
      : context.tenant.type === "org"
        ? ["09:00 创意美术一班", "11:00 课后反馈整理", "14:30 科学实验二班", "17:00 教师教研会"]
        : ["09:30 租户配置巡检", "11:00 服务周会", "15:00 组织数据复核", "17:30 值班交接"];
  return values.map((value, index) => {
    const [time, ...title] = value.split(" ");
    return { id: `schedule-${index}`, title: title.join(" "), meta: time!, label: "日程", tone: "primary" };
  });
}

function localIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calendarData() {
  const today = new Date();
  const dateAfter = (offset: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    return localIsoDate(date);
  };
  return {
    kind: "calendar" as const,
    events: [
      { id: "agenda-1", date: dateAfter(0), time: "09:30", endTime: "11:00", title: "重点项目周调度会", type: "meeting" as const, status: "pending" as const, location: "教育局第一会议室", audience: "项目负责人、业务科室代表" },
      { id: "agenda-2", date: dateAfter(0), time: "14:00", endTime: "16:00", title: "学校数据质量复核", type: "review" as const, status: "pending" as const, location: "数据中心", audience: "基教科、信息中心、辖区学校" },
      { id: "agenda-3", date: dateAfter(1), time: "10:00", endTime: "11:30", title: "秋季招生数据会审", type: "review" as const, status: "pending" as const, location: "招生考试中心", audience: "招生工作组" },
      { id: "agenda-4", date: dateAfter(3), time: "15:30", endTime: "17:00", title: "校园安全整改反馈", type: "task" as const, status: "pending" as const, location: "线上会议", audience: "安全科、相关学校负责人" },
      { id: "agenda-5", date: dateAfter(-2), time: "11:00", endTime: "12:00", title: "教研项目立项沟通", type: "meeting" as const, status: "completed" as const, location: "教研室", audience: "项目组成员" },
    ],
  };
}

function rankingData() {
  return {
    kind: "ranking" as const,
    items: [
      { id: "ranking-1", name: "智慧课堂", usage: 18.6, trend: "+12.8%" },
      { id: "ranking-2", name: "作业管理", usage: 15.2, trend: "+8.4%" },
      { id: "ranking-3", name: "在线教研", usage: 12.9, trend: "+6.7%" },
      { id: "ranking-4", name: "资源中心", usage: 10.4, trend: "+5.1%" },
      { id: "ranking-5", name: "学情分析", usage: 8.7, trend: "+3.6%" },
    ],
  };
}

function resourceRankingData() {
  return {
    kind: "ranking" as const,
    mode: "resource" as const,
    items: [
      { id: "resource-ranking-1", name: "七年级上册语文同步备课包", usage: 12_580, uploads: 2_180, trend: "+18.2%" },
      { id: "resource-ranking-2", name: "小学数学思维训练专题", usage: 10_960, uploads: 1_860, trend: "+15.6%" },
      { id: "resource-ranking-3", name: "初中英语听说训练资源", usage: 9_740, uploads: 1_520, trend: "+12.4%" },
      { id: "resource-ranking-4", name: "高中物理实验课程素材", usage: 8_160, uploads: 1_290, trend: "+9.8%" },
      { id: "resource-ranking-5", name: "跨学科主题学习案例集", usage: 7_430, uploads: 1_080, trend: "+8.1%" },
    ],
  };
}

function growthData() {
  return {
    kind: "growth" as const,
    score: "86",
    summary: "本月成长值 +12",
    items: [
      { label: "研修学习", value: 82, displayValue: "18 学时" },
      { label: "业务协同", value: 68, displayValue: "24 次" },
      { label: "知识贡献", value: 56, displayValue: "9 篇" },
    ],
  };
}

function taskItems(context: WorkbenchDataContext, dataKey: string) {
  const values = dataKey.includes("review")
    ? ["复核星辰艺术机构资质", "处理课程细则补充材料", "确认教师黑名单申诉", "完成本周审核汇总", "跟进退款异常记录"]
    : context.tenant.type === "school"
      ? ["审批学生请假申请", "确认本周值班安排", "补充班级考勤说明", "发布家长会通知", "检查门禁异常记录"]
      : context.tenant.type === "org"
        ? ["完成未点名课班", "提交课后教学反馈", "确认调课申请", "补充学生学习记录", "查看最新教学通知"]
        : ["复核租户菜单配置", "处理组织启用申请", "检查角色权限异常", "整理平台运营周报", "确认维护窗口通知"];
  return listItems(values, dataKey);
}

function distributionItems(context: WorkbenchDataContext): WorkbenchDistributionItemData[] {
  if (context.tenant.type === "school") {
    return [
      { label: "低年级", value: 34, displayValue: "846 人", tone: "primary" },
      { label: "中年级", value: 35, displayValue: "872 人", tone: "success" },
      { label: "高年级", value: 31, displayValue: "768 人", tone: "warning" },
    ];
  }
  if (context.tenant.type === "bureau") {
    return [
      { label: "运行正常", value: 83, displayValue: "30 所", tone: "success" },
      { label: "待补报数据", value: 11, displayValue: "4 所", tone: "primary" },
      { label: "存在风险", value: 6, displayValue: "2 所", tone: "warning" },
    ];
  }
  if (context.tenant.type === "org") {
    return [
      { label: "在岗教师", value: 78, displayValue: "96 人", tone: "success" },
      { label: "审核中", value: 14, displayValue: "17 人", tone: "primary" },
      { label: "待补材料", value: 8, displayValue: "10 人", tone: "warning" },
    ];
  }
  return [
    { label: "学校", value: 48, displayValue: "89 个", tone: "primary" },
    { label: "教育局", value: 16, displayValue: "30 个", tone: "warning" },
    { label: "机构", value: 36, displayValue: "67 个", tone: "success" },
  ];
}

function trendData(
  settings: WorkbenchWidgetSettings,
  context: WorkbenchDataContext,
) {
  const isThirtyDays = settings.kind === "trend" && settings.range === "30d";
  const base = context.tenant.type === "school"
    ? [94, 96, 95, 97, 96, 98, 97]
    : context.tenant.type === "bureau"
      ? [52, 61, 58, 72, 76, 84, 91]
      : context.tenant.type === "org"
        ? [68, 74, 79, 76, 88, 92, 96]
        : [42, 48, 57, 66, 72, 79, 86];
  const seed = tenantSeed(context.tenant.id);
  const tenantValues = base.map((value) => Math.min(100, value + seed * 0.2));
  const values = isThirtyDays
    ? [
        ...tenantValues,
        ...tenantValues.map((value, index) => Math.min(100, value + (index % 3) * 2)),
      ]
    : tenantValues;
  return {
    kind: "trend" as const,
    labels: values.map((_, index) => isThirtyDays ? `${index * 2 + 1}日` : `周${"一二三四五六日"[index % 7]}`),
    values,
    summary: isThirtyDays ? "近 30 天整体保持稳定增长" : "近 7 天关键指标整体稳定",
  };
}

const tenantTypeLabels = {
  school: "学校",
  bureau: "教育局",
  org: "机构",
  platform: "平台",
} as const;

function accountPanelData(context: WorkbenchDataContext) {
  const roleName = context.roleName ?? (context.profile === "admin" ? "管理员" : "业务角色");
  const orgName = context.tenant.shortName || context.tenant.name;
  return {
    kind: "account-panel" as const,
    name: context.userName ?? context.userId,
    initials: context.userInitials ?? (context.userName ?? context.userId).slice(0, 1).toUpperCase(),
    account: context.userAccount ?? context.userId,
    badgeLabel: roleName,
    verified: true,
    organizations: [
      {
        id: `${context.tenant.id}-primary`,
        orgName,
        roleName,
        tenantTypeLabel: tenantTypeLabels[context.tenant.type],
        meta: "当前",
        active: true,
      },
      {
        id: `${context.tenant.id}-secondary`,
        orgName: context.tenant.type === "bureau" ? "辖区协作组" : "跨校协作组",
        roleName: "协作者",
        tenantTypeLabel: tenantTypeLabels[context.tenant.type],
        meta: "备用",
      },
    ],
    goals: [
      {
        id: "tasks",
        title: "待办处理",
        remainingLabel: "还剩 3 项",
        progress: 58,
        tone: "primary" as const,
        icon: "ClipboardList",
      },
      {
        id: "messages",
        title: "消息回复",
        remainingLabel: "还剩 5 条",
        progress: 72,
        tone: "warning" as const,
        icon: "MessageSquareText",
      },
      {
        id: "learning",
        title: "资源学习",
        remainingLabel: "还剩 2 课时",
        progress: 64,
        tone: "primary" as const,
        icon: "BookOpen",
      },
      {
        id: "training",
        title: "培训学时",
        remainingLabel: "还剩 1.5 小时",
        progress: 82,
        tone: "success" as const,
        icon: "GraduationCap",
      },
    ],
  };
}

export class MockWorkbenchDataSource implements WorkbenchDataSource {
  async load(
    definition: WorkbenchWidgetDefinition,
    settings: WorkbenchWidgetSettings,
    context: WorkbenchDataContext,
    quickLinks: readonly WorkbenchQuickLinkData[],
  ): Promise<WorkbenchWidgetData> {
    if (definition.kind === "user-overview") {
      const overviewTarget = (pattern: RegExp) => quickLinks.find((item) => pattern.test(item.name));
      return {
        kind: "user-overview",
        name: context.userName ?? context.userId,
        initials: context.userInitials ?? (context.userName ?? context.userId).slice(0, 1).toUpperCase(),
        account: context.userAccount ?? context.userId,
        roleName: context.roleName ?? (context.profile === "admin" ? "管理员" : "业务角色"),
        stats: [
          { label: "通知消息", value: 0, target: overviewTarget(/通知|消息|公告/) },
          { label: "我的邮件", value: 0, target: overviewTarget(/邮件|邮箱/) },
          { label: "我的订阅", value: 0, target: overviewTarget(/订阅/) },
        ],
      };
    }
    if (definition.kind === "account-panel") {
      return accountPanelData(context);
    }
    if (definition.kind === "agent") {
      return { kind: "agent" };
    }
    if (definition.kind === "stats") {
      return statsOverviewData(context);
    }
    if (definition.kind === "alliance-overview") {
      return allianceOverviewData(context);
    }
    if (definition.kind === "alliance-list") {
      return allianceListData();
    }
    if (definition.kind === "effect-evaluation") {
      return effectEvaluationData();
    }
    if (definition.kind === "cross-school-activities") {
      return crossSchoolActivitiesData();
    }
    if (definition.kind === "inbox") {
      const limit = settings.kind === "list" ? settings.limit : 5;
      return inboxOverviewData(context, limit);
    }
    if (definition.kind === "trend") return trendData(settings, context);
    if (definition.kind === "education-chart") {
      const dataKeyParts = definition.dataKey.split(".");
      const chartKey = dataKeyParts[dataKeyParts.length - 1] ?? "";
      const chart = educationChartData[chartKey];
      if (!chart) throw new Error(`未找到工作台图表数据：${definition.dataKey}`);
      return { kind: "education-chart", ...chart };
    }
    if (definition.kind === "activity-rank") {
      return { kind: "activity-rank", rank: 32, change: -12, summary: "较上月" };
    }
    if (definition.kind === "distribution") {
      return { kind: "distribution", items: distributionItems(context) };
    }
    if (definition.kind === "quick-links") {
      return { kind: "quick-links", items: [...quickLinks] };
    }
    if (definition.kind === "ranking") {
      return definition.dataKey.endsWith("resource-ranking") ? resourceRankingData() : rankingData();
    }
    if (definition.kind === "calendar") return calendarData();
    if (definition.kind === "growth") return growthData();
    const limit = settings.kind === "list" ? settings.limit : 5;
    if (definition.kind === "schedule") {
      return { kind: "schedule", items: scheduleItems(context).slice(0, limit) };
    }
    const dataKeyParts = definition.dataKey.split(".");
    const bureauDataKey = dataKeyParts[dataKeyParts.length - 1] ?? "";
    if (context.tenant.type === "bureau" && bureauFeedData[bureauDataKey]) {
      return { kind: "feed", items: bureauFeedData[bureauDataKey].slice(0, limit) };
    }
    if (context.tenant.type === "bureau" && bureauDataKey === "subscriptions") {
      return { kind: "subscriptions", items: bureauSubscriptionData.slice(0, limit) };
    }
    return { kind: "list", items: taskItems(context, definition.dataKey).slice(0, limit) };
  }
}

export const workbenchDataSource = new MockWorkbenchDataSource();
