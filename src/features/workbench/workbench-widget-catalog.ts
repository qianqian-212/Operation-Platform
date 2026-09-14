import type {
  WorkbenchProfile,
  WorkbenchWidgetDefinition,
  WorkbenchWidgetHeightPolicy,
  WorkbenchWidgetKind,
  WorkbenchWidgetScope,
  WorkbenchWidgetSize,
  WorkbenchWidgetTone,
} from "@/features/workbench/types";
import type { TenantType } from "@/types/user";

export const ALL_WORKBENCH_TENANT_TYPES: readonly TenantType[] = [
  "school",
  "bureau",
  "org",
  "platform",
];
export const OPERATING_WORKBENCH_TENANT_TYPES: readonly TenantType[] = [
  "school",
  "bureau",
  "org",
];
export const ALL_WORKBENCH_PROFILES: readonly WorkbenchProfile[] = ["admin", "business"];

const adminOnly: readonly WorkbenchProfile[] = ["admin"];
const businessOnly: readonly WorkbenchProfile[] = ["business"];

interface CatalogDraft {
  key: string;
  title: string;
  description: string;
  kind: WorkbenchWidgetKind;
  tone: WorkbenchWidgetTone;
  scope: WorkbenchWidgetScope;
  compatibleTenantTypes: readonly TenantType[];
  compatibleProfiles?: readonly WorkbenchProfile[];
  minSize: WorkbenchWidgetSize;
  preferredSize: WorkbenchWidgetSize;
  maxSize: WorkbenchWidgetSize;
}

function heightPolicy(kind: WorkbenchWidgetKind): WorkbenchWidgetHeightPolicy {
  switch (kind) {
    case "stats":
    case "alliance-overview":
      return { mode: "intrinsic", minHeight: 148, preferredHeight: 176, maxContentHeight: 240 };
    case "alliance-list":
      return { mode: "intrinsic", minHeight: 420, preferredHeight: 520, maxContentHeight: 640 };
    case "effect-evaluation":
      return { mode: "intrinsic", minHeight: 260, preferredHeight: 320, maxContentHeight: 480 };
    case "cross-school-activities":
      return { mode: "intrinsic", minHeight: 220, preferredHeight: 280, maxContentHeight: 360 };
    case "user-overview":
      return { mode: "intrinsic", minHeight: 123, preferredHeight: 144, maxContentHeight: 220 };
    case "account-panel":
      return { mode: "intrinsic", minHeight: 520, preferredHeight: 600, maxContentHeight: 720 };
    case "agent":
      return { mode: "intrinsic", minHeight: 266, preferredHeight: 306, maxContentHeight: 420 };
    case "inbox":
    case "list":
    case "schedule":
    case "distribution":
      return { mode: "intrinsic", minHeight: 248, preferredHeight: 320, maxContentHeight: 420 };
    case "quick-links":
      return { mode: "viewport", minHeight: 320, preferredHeight: 410, maxContentHeight: 460 };
    case "calendar":
      return { mode: "fixed", minHeight: 480, preferredHeight: 520, maxContentHeight: 620 };
    case "trend":
    case "education-chart":
      return { mode: "fixed", minHeight: 320, preferredHeight: 360, maxContentHeight: 420 };
    case "ranking":
    case "growth":
    case "activity-rank":
      return { mode: "viewport", minHeight: 300, preferredHeight: 360, maxContentHeight: 440 };
  }
}

function defineWidget(draft: CatalogDraft): WorkbenchWidgetDefinition {
  return {
    key: draft.key,
    title: draft.title,
    description: draft.description,
    kind: draft.kind,
    dataKey: draft.key,
    scope: draft.scope,
    compatibleTenantTypes: draft.compatibleTenantTypes,
    compatibleProfiles: draft.compatibleProfiles ?? ALL_WORKBENCH_PROFILES,
    tone: draft.tone,
    minSize: draft.minSize,
    maxSize: draft.maxSize,
    sizePresets: {
      small: draft.minSize,
      medium: draft.preferredSize,
      large: draft.maxSize,
    },
    heightPolicy: heightPolicy(draft.kind),
  };
}

function domain(
  key: string,
  title: string,
  description: string,
  kind: WorkbenchWidgetKind,
  tenantType: TenantType,
  options: {
    tone?: WorkbenchWidgetTone;
    profiles?: readonly WorkbenchProfile[];
    minSize: WorkbenchWidgetSize;
    preferredSize: WorkbenchWidgetSize;
    maxSize: WorkbenchWidgetSize;
  },
): CatalogDraft {
  return {
    key,
    title,
    description,
    kind,
    tone: options.tone ?? "primary",
    scope: "domain",
    compatibleTenantTypes: [tenantType],
    compatibleProfiles: options.profiles,
    minSize: options.minSize,
    preferredSize: options.preferredSize,
    maxSize: options.maxSize,
  };
}

const chartSize = {
  minSize: { w: 4, h: 3 },
  preferredSize: { w: 4, h: 3 },
  maxSize: { w: 12, h: 6 },
};

const drafts: CatalogDraft[] = [
  {
    key: "etonedu-agent",
    title: "Etonedu Agent",
    description: "输入任务或教务问题，由 AI 解析并解答。",
    kind: "agent",
    tone: "primary",
    scope: "common",
    compatibleTenantTypes: ALL_WORKBENCH_TENANT_TYPES,
    minSize: { w: 6, h: 2 },
    preferredSize: { w: 12, h: 3 },
    maxSize: { w: 12, h: 4 },
  },
  {
    key: "account-panel",
    title: "个人面板",
    description: "当前账号、任职单位与本周目标进度。",
    kind: "account-panel",
    tone: "primary",
    scope: "common",
    compatibleTenantTypes: ALL_WORKBENCH_TENANT_TYPES,
    minSize: { w: 3, h: 5 },
    preferredSize: { w: 4, h: 6 },
    maxSize: { w: 6, h: 8 },
  },
  {
    key: "quick-links",
    title: "快捷导航",
    description: "按一级菜单展示当前角色可访问的内部页面。",
    kind: "quick-links",
    tone: "primary",
    scope: "common",
    compatibleTenantTypes: ALL_WORKBENCH_TENANT_TYPES,
    minSize: { w: 3, h: 3 },
    preferredSize: { w: 4, h: 3 },
    maxSize: { w: 12, h: 6 },
  },
  {
    key: "stats-overview",
    title: "数据概览",
    description: "按当前组织类型与角色展示核心运行指标。",
    kind: "stats",
    tone: "primary",
    scope: "common",
    compatibleTenantTypes: ALL_WORKBENCH_TENANT_TYPES,
    minSize: { w: 6, h: 2 },
    preferredSize: { w: 12, h: 2 },
    maxSize: { w: 12, h: 3 },
  },
  {
    key: "message-todo-center",
    title: "消息与待办中心",
    description: "汇总通知消息、待办与日常事项，按类型筛选处理。",
    kind: "inbox",
    tone: "warning",
    scope: "common",
    compatibleTenantTypes: OPERATING_WORKBENCH_TENANT_TYPES,
    minSize: { w: 3, h: 3 },
    preferredSize: { w: 4, h: 5 },
    maxSize: { w: 8, h: 8 },
  },

  domain("school.alliance-overview", "联盟数据总览", "教研联盟规模、跨校活动与参与教师概览。", "alliance-overview", "school", {
    minSize: { w: 6, h: 2 },
    preferredSize: { w: 12, h: 2 },
    maxSize: { w: 12, h: 3 },
  }),
  domain("school.alliance-list", "教研联盟概览", "本校参与的教研联盟状态与核心指标。", "alliance-list", "school", {
    minSize: { w: 4, h: 4 },
    preferredSize: { w: 6, h: 7 },
    maxSize: { w: 12, h: 8 },
  }),
  domain("school.effect-evaluation", "效果评估速览", "参与校与未参与校的年度效果对比。", "effect-evaluation", "school", {
    minSize: { w: 4, h: 3 },
    preferredSize: { w: 6, h: 4 },
    maxSize: { w: 12, h: 6 },
  }),
  domain(
    "school.cross-school-activities",
    "近期跨校活动",
    "近期跨校教研活动进度与牵头信息。",
    "cross-school-activities",
    "school",
    {
      minSize: { w: 4, h: 3 },
      preferredSize: { w: 6, h: 3 },
      maxSize: { w: 12, h: 5 },
    },
  ),
  domain("school.attendance-trend", "考勤趋势", "学生到校率变化趋势。", "trend", "school", {
    profiles: adminOnly,
    minSize: { w: 6, h: 3 },
    preferredSize: { w: 8, h: 4 },
    maxSize: { w: 12, h: 6 },
  }),
  domain("school.operational-alerts", "运营告警", "需要管理员关注的校园异常。", "list", "school", {
    tone: "danger",
    profiles: adminOnly,
    minSize: { w: 3, h: 3 },
    preferredSize: { w: 4, h: 4 },
    maxSize: { w: 8, h: 6 },
  }),
  domain("school.student-distribution", "学生分布", "学生按年级的结构分布。", "distribution", "school", {
    tone: "success",
    profiles: adminOnly,
    minSize: { w: 3, h: 3 },
    preferredSize: { w: 4, h: 3 },
    maxSize: { w: 8, h: 5 },
  }),
  domain("school.today-schedule", "今日安排", "课程、值班与会议安排。", "schedule", "school", {
    profiles: businessOnly,
    minSize: { w: 5, h: 3 },
    preferredSize: { w: 7, h: 4 },
    maxSize: { w: 12, h: 6 },
  }),

  domain("bureau.operation-trend", "区域教育运行趋势", "辖区核心教育运行指标变化趋势。", "trend", "bureau", {
    profiles: adminOnly,
    minSize: { w: 6, h: 3 },
    preferredSize: { w: 8, h: 4 },
    maxSize: { w: 12, h: 6 },
  }),
  domain("bureau.school-operating-status", "学校运行状态", "学校数据上报与风险状态分布。", "distribution", "bureau", {
    tone: "success",
    profiles: adminOnly,
    minSize: { w: 3, h: 3 },
    preferredSize: { w: 4, h: 4 },
    maxSize: { w: 8, h: 6 },
  }),
  domain("bureau.user-overview", "个人概览", "当前账号、角色和个人消息概览。", "user-overview", "bureau", {
    minSize: { w: 8, h: 2 },
    preferredSize: { w: 12, h: 2 },
    maxSize: { w: 12, h: 2 },
  }),
  domain("bureau.calendar-tasks", "日程与任务管理", "按日期管理会议、审核与个人任务。", "calendar", "bureau", {
    minSize: { w: 6, h: 5 },
    preferredSize: { w: 8, h: 5 },
    maxSize: { w: 12, h: 8 },
  }),
  domain("bureau.bureau-news", "局内新闻", "教育局内部动态与重点工作进展。", "list", "bureau", {
    tone: "neutral",
    minSize: { w: 3, h: 3 },
    preferredSize: { w: 6, h: 4 },
    maxSize: { w: 12, h: 6 },
  }),
  domain("bureau.information-disclosure", "信息公开", "政策文件、办事指南与公开信息。", "list", "bureau", {
    tone: "neutral",
    minSize: { w: 3, h: 3 },
    preferredSize: { w: 6, h: 4 },
    maxSize: { w: 12, h: 6 },
  }),
  domain("bureau.teaching-app-ranking", "教学应用排行榜", "辖区教学应用近 30 天活跃排行。", "ranking", "bureau", {
    minSize: { w: 3, h: 4 },
    preferredSize: { w: 3, h: 4 },
    maxSize: { w: 8, h: 6 },
  }),
  domain("bureau.personal-growth", "个人成长与发展", "个人学习、研修与能力成长概览。", "growth", "bureau", {
    tone: "success",
    minSize: { w: 3, h: 4 },
    preferredSize: { w: 3, h: 4 },
    maxSize: { w: 8, h: 6 },
  }),
  domain("bureau.subscriptions", "我的订阅", "本人订阅的政策、教研与数据专题。", "list", "bureau", {
    tone: "neutral",
    minSize: { w: 3, h: 3 },
    preferredSize: { w: 3, h: 4 },
    maxSize: { w: 8, h: 6 },
  }),
  domain("bureau.grade-applications", "年级应用情况", "辖区各年级数字教学应用量分布。", "education-chart", "bureau", chartSize),
  domain("bureau.application-types", "应用类型分布", "作业、备课、考试等教学场景的应用分布。", "education-chart", "bureau", {
    ...chartSize,
    preferredSize: { w: 4, h: 3 },
  }),
  domain("bureau.activity-rank", "区域活跃度排名", "当前区域在同级教育平台中的活跃排名。", "activity-rank", "bureau", {
    tone: "warning",
    minSize: { w: 3, h: 2 },
    preferredSize: { w: 4, h: 3 },
    maxSize: { w: 8, h: 4 },
  }),
  domain("bureau.resource-sharing", "资源应用情况", "资源分享范围及浏览、下载、收藏情况。", "education-chart", "bureau", {
    ...chartSize,
    preferredSize: { w: 6, h: 3 },
  }),
  domain("bureau.resource-growth", "资源增长趋势", "最近 30 天辖区资源新增趋势。", "education-chart", "bureau", {
    ...chartSize,
    preferredSize: { w: 6, h: 3 },
  }),
  domain("bureau.resource-contribution", "资源贡献分布", "不同教学场景的资源贡献数量。", "education-chart", "bureau", {
    tone: "success",
    ...chartSize,
  }),
  domain("bureau.subject-resources", "学科资源统计", "辖区主要学科资源数量对比。", "education-chart", "bureau", {
    ...chartSize,
    preferredSize: { w: 8, h: 3 },
  }),
  domain("bureau.resource-ranking", "资源使用排行", "辖区资源浏览与上传数量排行。", "ranking", "bureau", {
    minSize: { w: 4, h: 4 },
    preferredSize: { w: 6, h: 4 },
    maxSize: { w: 12, h: 6 },
  }),

  domain("org.enrollment-trend", "报名趋势", "课程报名人数变化趋势。", "trend", "org", {
    profiles: adminOnly,
    minSize: { w: 6, h: 3 },
    preferredSize: { w: 8, h: 4 },
    maxSize: { w: 12, h: 6 },
  }),
  domain("org.refund-tasks", "退款待办", "待处理退款与异常支付。", "list", "org", {
    tone: "danger",
    profiles: adminOnly,
    minSize: { w: 3, h: 3 },
    preferredSize: { w: 4, h: 4 },
    maxSize: { w: 8, h: 6 },
  }),
  domain("org.teacher-status", "师资状态", "教师审核与在岗状态分布。", "distribution", "org", {
    tone: "success",
    profiles: adminOnly,
    minSize: { w: 3, h: 3 },
    preferredSize: { w: 4, h: 3 },
    maxSize: { w: 8, h: 5 },
  }),
  domain("org.class-schedule", "今日安排", "授课、备课与教研安排。", "schedule", "org", {
    profiles: businessOnly,
    minSize: { w: 5, h: 3 },
    preferredSize: { w: 7, h: 4 },
    maxSize: { w: 12, h: 6 },
  }),

  domain("platform.tenant-trend", "租户趋势", "平台租户数量变化趋势。", "trend", "platform", {
    profiles: adminOnly,
    minSize: { w: 6, h: 3 },
    preferredSize: { w: 8, h: 4 },
    maxSize: { w: 12, h: 6 },
  }),
  domain("platform.config-health", "配置健康", "租户菜单与角色配置检查。", "list", "platform", {
    tone: "danger",
    profiles: adminOnly,
    minSize: { w: 3, h: 3 },
    preferredSize: { w: 4, h: 4 },
    maxSize: { w: 8, h: 6 },
  }),
  domain("platform.tenant-distribution", "组织分布", "租户按组织类型分布。", "distribution", "platform", {
    tone: "success",
    profiles: adminOnly,
    minSize: { w: 3, h: 3 },
    preferredSize: { w: 4, h: 3 },
    maxSize: { w: 8, h: 5 },
  }),
  domain("platform.operation-schedule", "今日安排", "平台运营和值班安排。", "schedule", "platform", {
    profiles: businessOnly,
    minSize: { w: 5, h: 3 },
    preferredSize: { w: 7, h: 4 },
    maxSize: { w: 12, h: 6 },
  }),
];

export const workbenchWidgetCatalog: WorkbenchWidgetDefinition[] = drafts.map(defineWidget);

export const workbenchWidgetRegistry = new Map(
  workbenchWidgetCatalog.map((definition) => [definition.key, definition]),
);

const LEGACY_WIDGET_ID_ALIASES: Record<string, string> = {
  "quick-apps": "quick-links",
};

const MERGED_WIDGET_ALIASES: Record<string, string> = {
  "school.student-count": "stats-overview",
  "school.arrival-rate": "stats-overview",
  "school.pending-approvals": "stats-overview",
  "school.device-online-rate": "stats-overview",
  "school.today-courses": "stats-overview",
  "school.pending-tasks": "stats-overview",
  "school.class-attendance": "stats-overview",
  "bureau.school-count": "stats-overview",
  "bureau.student-count": "stats-overview",
  "bureau.teacher-count": "stats-overview",
  "bureau.pending-actions": "stats-overview",
  "bureau.my-reviews": "stats-overview",
  "bureau.due-today": "stats-overview",
  "bureau.weekly-completed": "stats-overview",
  "org.course-count": "stats-overview",
  "org.class-count": "stats-overview",
  "org.student-count": "stats-overview",
  "org.pending-settlement": "stats-overview",
  "org.today-classes": "stats-overview",
  "org.attendance-tasks": "stats-overview",
  "org.assigned-students": "stats-overview",
  "platform.tenant-count": "stats-overview",
  "platform.enabled-tenants": "stats-overview",
  "platform.role-count": "stats-overview",
  "platform.config-alerts": "stats-overview",
  "platform.pending-tasks": "stats-overview",
  "platform.weekly-completed": "stats-overview",
  "platform.service-status": "stats-overview",
  "school.notices": "message-todo-center",
  "school.my-tasks": "message-todo-center",
  "bureau.message-todo-center": "message-todo-center",
  "bureau.announcements": "message-todo-center",
  "org.notices": "message-todo-center",
  "org.my-tasks": "message-todo-center",
};

function isKnownWorkbenchWidgetKey(widgetKey: string) {
  return workbenchWidgetRegistry.has(widgetKey) || widgetKey in MERGED_WIDGET_ALIASES;
}

export function isWorkbenchWidgetCompatible(
  definition: WorkbenchWidgetDefinition,
  tenantType: TenantType,
  profile: WorkbenchProfile,
) {
  return (
    definition.compatibleTenantTypes.includes(tenantType) &&
    definition.compatibleProfiles.includes(profile)
  );
}

export function listCompatibleWorkbenchWidgets(tenantType: TenantType, profile: WorkbenchProfile) {
  return workbenchWidgetCatalog.filter((definition) =>
    isWorkbenchWidgetCompatible(definition, tenantType, profile),
  );
}

export function migrateLegacyWorkbenchWidgetKey(
  widgetKey: string,
  tenantType: TenantType,
  profile: WorkbenchProfile,
) {
  const normalized = normalizeLegacyWorkbenchWidgetKey(widgetKey, tenantType, profile);
  return MERGED_WIDGET_ALIASES[normalized] ?? normalized;
}

function normalizeLegacyWorkbenchWidgetKey(
  widgetKey: string,
  tenantType: TenantType,
  profile: WorkbenchProfile,
) {
  if (isKnownWorkbenchWidgetKey(widgetKey)) return widgetKey;
  const prefix = `${tenantType}.${profile}.`;
  if (!widgetKey.startsWith(prefix)) return widgetKey;
  const aliased = LEGACY_WIDGET_ID_ALIASES[widgetKey.slice(prefix.length)]
    ?? widgetKey.slice(prefix.length);
  if (isKnownWorkbenchWidgetKey(aliased)) return aliased;
  const domainKey = `${tenantType}.${aliased}`;
  return isKnownWorkbenchWidgetKey(domainKey) ? domainKey : widgetKey;
}
