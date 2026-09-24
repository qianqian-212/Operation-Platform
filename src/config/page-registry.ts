import type { RouteComponent, RouteRecordRaw } from "vue-router";
import type { MenuConfigRecord } from "@/features/menu-config/types";
import type { TenantType } from "@/types/user";

export type PageResourceStatus = "available" | "developing-placeholder";
export type PageSurface = "shell" | "standalone";
export type PageOpenMode = "current" | "new-tab";

export interface PageRegistryItem {
  key: string;
  title: string;
  path: string;
  component: RouteComponent;
  tenantTypes: TenantType[];
  status: PageResourceStatus;
  description: string;
  selectable: boolean;
  menuOwnerKey: string;
  requiresAdmin: boolean;
  allowDuplicateMenuBinding: boolean;
  menuRouteParam: string | null;
  surface: PageSurface;
  openMode: PageOpenMode;
}

interface PageOptions {
  status?: PageResourceStatus;
  description?: string;
  selectable?: boolean;
  menuOwnerKey?: string;
  requiresAdmin?: boolean;
  allowDuplicateMenuBinding?: boolean;
  menuRouteParam?: string;
  surface?: PageSurface;
  openMode?: PageOpenMode;
}

interface SelectablePageResourceOptions {
  tenantType: TenantType;
  records: readonly MenuConfigRecord[];
  editingRecordId?: string | null;
}

const school: TenantType[] = ["school"];
const bureau: TenantType[] = ["bureau"];
const org: TenantType[] = ["org"];
const platform: TenantType[] = ["platform"];
const allTenantTypes: TenantType[] = ["school", "bureau", "org", "platform"];
const PlaceholderView = () => import("@/views/PlaceholderView.vue");
export const DEVELOPING_PAGE_KEY = "developing-placeholder";

function page(
  key: string,
  title: string,
  path: string,
  tenantTypes: TenantType[],
  component?: RouteComponent,
  options: PageOptions = {},
): PageRegistryItem {
  const status = options.status ?? (component ? "available" : "developing-placeholder");
  return {
    key,
    title,
    path,
    tenantTypes,
    component: component ?? PlaceholderView,
    status,
    description: options.description ?? (
      status === "available"
        ? "已开发页面资源，可被菜单关联为导航入口。"
        : "已注册但尚未实现真实业务界面，当前使用开发中占位页。"
    ),
    selectable: options.selectable ?? true,
    menuOwnerKey: options.menuOwnerKey ?? key,
    requiresAdmin: options.requiresAdmin ?? false,
    allowDuplicateMenuBinding: options.allowDuplicateMenuBinding ?? false,
    menuRouteParam: options.menuRouteParam ?? null,
    surface: options.surface ?? "shell",
    openMode: options.openMode ?? "current",
  };
}

export function resolvePagePathForMenu(
  page: { path: string; menuRouteParam?: string | null },
  menuId: string,
) {
  if (!page.menuRouteParam) return page.path;
  return page.path.replace(`:${page.menuRouteParam}`, encodeURIComponent(menuId));
}

export const pageRegistry: PageRegistryItem[] = [
  page(
    DEVELOPING_PAGE_KEY,
    "功能开发中缺省页",
    "/developing/:menuId",
    allTenantTypes,
    PlaceholderView,
    {
      status: "developing-placeholder",
      description: "菜单先行配置时使用的统一占位页，后续可替换为真实页面资源。",
      allowDuplicateMenuBinding: true,
      menuRouteParam: "menuId",
    },
  ),

  // 学校通用模块
  page("family-notice", "通知公告", "/family-interaction/notice", school),
  page("family-activity", "活动管理", "/family-interaction/activity", school),
  page("course-list", "课程列表", "/academic/course-list", school),
  page("class-manage", "班级管理", "/academic/class-manage", school),
  page("room-manage", "宿舍管理", "/dorm/room-manage", school),
  page("fee-set", "收费设置", "/finance/fee-set", school),
  page("care-management", "托管管理", "/care-management", school),
  page("schedule", "排课系统", "/schedule", school),
  page("office", "校园办公", "/office", school),
  page("sports", "智慧操场", "/sports", school),

  // 学校 · 校园安全
  page(
    "device-list",
    "设备列表",
    "/security/new-gate/device-list",
    school,
    () => import("@/views/security/new-gate/DeviceListView.vue"),
  ),
  page(
    "person-group",
    "人员分组",
    "/security/new-gate/person-group",
    school,
    () => import("@/views/security/new-gate/PersonGroupView.vue"),
    { selectable: false, menuOwnerKey: "device-list" },
  ),
  page(
    "special-date",
    "特殊日期",
    "/security/new-gate/special-date",
    school,
    () => import("@/views/security/new-gate/SpecialDateView.vue"),
    { selectable: false, menuOwnerKey: "device-list" },
  ),
  page(
    "temp-auth",
    "临时授权",
    "/security/new-gate/temp-auth",
    school,
    () => import("@/views/security/new-gate/TempAuthView.vue"),
    { selectable: false, menuOwnerKey: "device-list" },
  ),
  page(
    "settings",
    "设置",
    "/security/new-gate/settings",
    school,
    () => import("@/views/security/new-gate/SettingsView.vue"),
    { selectable: false, menuOwnerKey: "device-list" },
  ),
  page("visitor", "访客管理", "/security/visitor", school),

  // 学校 · AI教师发展 · 跨校协同教研
  page(
    "school-cross-school-team",
    "跨校团队",
    "/ai-teacher-development/cross-school-research/teams",
    school,
    () => import("@/views/school/ai-teacher-development/CrossSchoolTeamView.vue"),
    {
      description: "学校查看参与的跨校教研团队，支持按联盟、学科检索并进入团队详情。",
    },
  ),
  page(
    "school-cross-school-team-detail",
    "跨校团队详情",
    "/ai-teacher-development/cross-school-research/teams/:id",
    school,
    () => import("@/views/school/ai-teacher-development/CrossSchoolTeamDetailView.vue"),
    {
      selectable: false,
      menuOwnerKey: "school-cross-school-team",
      description: "查看跨校教研团队摘要、成员、活动与成果。",
    },
  ),
  page(
    "school-cross-school-activity",
    "活动管理",
    "/ai-teacher-development/cross-school-research/activities",
    school,
    () => import("@/views/bureau/ai-teacher-development/CrossSchoolActivityView.vue"),
    {
      description: "学校统筹组织跨校教研活动，支持按类型、状态和联盟检索并进入活动详情。",
    },
  ),
  page(
    "school-cross-school-activity-create",
    "创建跨校教研活动",
    "/ai-teacher-development/cross-school-research/activities/create",
    school,
    () => import("@/views/bureau/ai-teacher-development/CreateCrossSchoolActivityView.vue"),
    {
      selectable: false,
      menuOwnerKey: "school-cross-school-activity",
      description: "学校发起跨校集体备课或听评课，配置参与学校、教师与任务分工。",
    },
  ),
  page(
    "school-cross-school-activity-detail",
    "跨校教研活动详情",
    "/ai-teacher-development/cross-school-research/activities/:id",
    school,
    () => import("@/views/bureau/ai-teacher-development/CrossSchoolActivityDetailView.vue"),
    {
      selectable: false,
      menuOwnerKey: "school-cross-school-activity",
      description: "查看跨校教研活动摘要，并管理任务分工、听评课设置、讨论投票与归档。",
    },
  ),
  page(
    "school-collective-lesson-prep",
    "集体备课管理",
    "/ai-teacher-development/cross-school-research/lesson-prep",
    school,
    () => import("@/views/bureau/ai-teacher-development/CollectiveLessonPrepView.vue"),
    {
      description: "按教材目录管理跨校集体备课，查看进度、成果并进入备课。",
    },
  ),
  page(
    "school-lesson-observation",
    "听评课管理",
    "/ai-teacher-development/cross-school-research/lesson-observation",
    school,
    () => import("@/views/bureau/ai-teacher-development/LessonObservationView.vue"),
    {
      description: "管理跨校听评课记录，支持按老师、联盟、学校和评课方式检索并查看评价报告。",
    },
  ),
  page(
    "school-lesson-observation-detail",
    "听评课详情",
    "/ai-teacher-development/cross-school-research/lesson-observation/:id",
    school,
    () => import("@/views/bureau/ai-teacher-development/LessonObservationDetailView.vue"),
    {
      selectable: false,
      menuOwnerKey: "school-lesson-observation",
      description: "查看跨校听评课摘要、课程评价报告、评课明细与档案文件。",
    },
  ),
  page(
    "school-achievement-sharing",
    "成果共享",
    "/ai-teacher-development/cross-school-research/achievement-sharing",
    school,
    () => import("@/views/bureau/ai-teacher-development/AchievementSharingView.vue"),
    {
      description: "按教材目录浏览跨校教研成果，支持按类型检索、预览与下载。",
    },
  ),

  // 学校 · AI教师发展 · 教学监测与研修管理 · 我的成果
  page(
    "school-my-training-achievements",
    "我的成果",
    "/ai-teacher-development/teaching-monitoring/achievements",
    school,
    () => import("@/views/school/ai-teacher-development/MyTrainingAchievementView.vue"),
    {
      description: "教师查看已提交的研修成果、审核状态与获得学分，并支持新建或驳回后重提。",
    },
  ),
  page(
    "school-my-training-achievements-submit",
    "提交研修成果",
    "/ai-teacher-development/teaching-monitoring/achievements/submit",
    school,
    () => import("@/views/school/ai-teacher-development/SubmitTrainingAchievementView.vue"),
    {
      selectable: false,
      menuOwnerKey: "school-my-training-achievements",
      description: "填写研修成果基本信息并上传证明材料后提交审核。",
    },
  ),
  page(
    "school-my-training-achievements-detail",
    "成果详情",
    "/ai-teacher-development/teaching-monitoring/achievements/:id",
    school,
    () => import("@/views/school/ai-teacher-development/MyTrainingAchievementDetailView.vue"),
    {
      selectable: false,
      menuOwnerKey: "school-my-training-achievements",
      description: "查看研修成果基本信息、附件材料与审核时间线。",
    },
  ),
  page(
    "school-training-achievement-audit",
    "成果审核",
    "/ai-teacher-development/teaching-monitoring/achievement-audit",
    school,
    () => import("@/views/school/ai-teacher-development/SchoolAchievementAuditView.vue"),
    {
      description: "校级初审教师研修成果，通过后提交区级终审。",
    },
  ),
  page(
    "school-training-achievement-audit-detail",
    "成果审核详情",
    "/ai-teacher-development/teaching-monitoring/achievement-audit/:id",
    school,
    () => import("@/views/school/ai-teacher-development/SchoolAchievementAuditDetailView.vue"),
    {
      selectable: false,
      menuOwnerKey: "school-training-achievement-audit",
      description: "查看成果材料并完成校级初审通过或驳回。",
    },
  ),
  page(
    "school-training-warning-teachers",
    "预警教师名单",
    "/ai-teacher-development/teaching-monitoring/warning-teachers",
    school,
    () => import("@/views/school/ai-teacher-development/SchoolWarningTeachersView.vue"),
    {
      description: "查看本校教师学分达标情况与未达标预警名单。",
    },
  ),
  page(
    "school-training-statistics",
    "研修统计",
    "/ai-teacher-development/teaching-monitoring/statistics",
    school,
    () => import("@/views/school/ai-teacher-development/SchoolTrainingStatisticsView.vue"),
    {
      description: "按学科统计本校研修成果数量、占比与平均学分。",
    },
  ),
  page(
    "school-excellent-achievements",
    "优秀成果展示",
    "/ai-teacher-development/teaching-monitoring/excellent-achievements",
    school,
    () => import("@/views/school/ai-teacher-development/SchoolExcellentAchievementsView.vue"),
    {
      description: "浏览区级加精推荐的优秀研修成果，支持筛选、点赞与下载。",
    },
  ),
  page(
    "school-excellent-achievements-detail",
    "优秀成果详情",
    "/ai-teacher-development/teaching-monitoring/excellent-achievements/:id",
    school,
    () => import("@/views/school/ai-teacher-development/SchoolExcellentAchievementDetailView.vue"),
    {
      selectable: false,
      menuOwnerKey: "school-excellent-achievements",
      description: "查看优秀研修成果摘要、附件材料与作者信息。",
    },
  ),

  // 教育局 · 托管学堂
  page("bureau-course-data-analysis", "课程数据分析", "/bureau/custody/course-data/analysis", bureau),
  page("bureau-school-signup-stats", "学校报名统计", "/bureau/custody/course-data/school-signup", bureau),
  page("bureau-org-signup-stats", "机构报名统计", "/bureau/custody/course-data/org-signup", bureau),
  page("bureau-school-class-stats", "学校开班统计", "/bureau/custody/course-data/school-class", bureau),
  page("bureau-student-signup-list", "学生报名清单", "/bureau/custody/course-data/student-list", bureau),
  page("bureau-review-list", "审核列表", "/bureau/custody/course-manage/review-list", bureau),
  page("bureau-course-rule-review", "课程细则审核", "/bureau/custody/course-manage/rule-review", bureau),
  page("bureau-course-selection", "选课管理", "/bureau/custody/course-manage/selection", bureau),
  page("bureau-course-manage", "课程管理", "/bureau/custody/course-manage/courses", bureau),
  page("bureau-tag-library", "标签库管理", "/bureau/custody/course-manage/tags", bureau),
  page("bureau-course-category", "课程分类管理", "/bureau/custody/course-manage/category", bureau),
  page("bureau-course-evaluation", "课程服务评价", "/bureau/custody/course-manage/evaluation", bureau),
  page("bureau-attendance-flow", "课班考勤流水", "/bureau/custody/course-manage/attendance", bureau),
  page("bureau-unit-price", "课时单价管理", "/bureau/custody/course-manage/unit-price", bureau),
  page("bureau-payment-flow", "课程缴费流水", "/bureau/custody/settlement/payment", bureau),
  page("bureau-refund-flow", "课程退费流水", "/bureau/custody/settlement/refund", bureau),
  page("bureau-refund-review", "课程退费审核", "/bureau/custody/settlement/refund-review", bureau),
  page("bureau-org-list", "机构列表", "/bureau/custody/org/list", bureau),
  page(
    "bureau-org-review",
    "审核列表",
    "/bureau/custody/org/review",
    bureau,
    () => import("@/views/bureau/custody/org/OrgReviewView.vue"),
  ),
  page(
    "bureau-org-review-detail",
    "审核详情",
    "/bureau/custody/org/review/:id",
    bureau,
    () => import("@/views/bureau/custody/org/OrgReviewDetailView.vue"),
    { selectable: false, menuOwnerKey: "bureau-org-review" },
  ),
  page("bureau-teacher-review", "师资审核", "/bureau/custody/org/teacher-review", bureau),
  page("bureau-school-list", "学校管理", "/bureau/custody/school/list", bureau),
  page("bureau-teacher-list", "教师列表", "/bureau/custody/teacher/list", bureau),
  page("bureau-teacher-blacklist", "教师黑名单", "/bureau/custody/teacher/blacklist", bureau),
  page("bureau-operation-log", "操作日志", "/bureau/custody/operation-log", bureau),
  page("bureau-settings", "设置", "/bureau/custody/settings", bureau),

  // 教育局 · 智慧大脑
  page(
    "bureau-regional-education-overview",
    "区域教育总览",
    "/bureau/visualization/regional-education-overview",
    bureau,
    () => import("@/views/bureau/visualization/RegionalEducationOverviewRouteView.vue"),
    {
      description: "按当前组织行政区加载的教育数字孪生首页，支持三维下钻、教育机构点位与多主题态势切换。",
      surface: "standalone",
      openMode: "new-tab",
    },
  ),

  // 教育局 · AI精准教学 · 智慧体育
  page(
    "bureau-smart-sports-cockpit",
    "智慧体育数据驾驶舱",
    "/bureau/ai-precision-teaching/smart-sports/cockpit",
    bureau,
    () => import("@/views/bureau/visualization/SmartSportsCockpitView.vue"),
    {
      description: "按当前组织行政区加载的独立智慧体育数字孪生驾驶舱，完整复用区域教育总览。",
      surface: "standalone",
      openMode: "new-tab",
    },
  ),
  page(
    "bureau-student-growth-portrait",
    "学生成长概览",
    "/bureau/education-governance/student-growth-portrait",
    bureau,
    () => import("@/views/bureau/education-governance/StudentGrowthPortraitView.vue"),
    {
      description: "面向区域教育管理者的连续学生发展概览页面，通过同页锚点串联区域总览、综合评价概览、运动健康、荣誉、行为、实践、日常评价与数据覆盖。",
    },
  ),
  page(
    "bureau-student-growth-archive",
    "学生成长档案",
    "/bureau/education-governance/student-growth-archive",
    bureau,
    () => import("@/views/bureau/education-governance/StudentGrowthArchiveView.vue"),
    {
      description: "面向区域教育管理者的辖区学校学生花名册，按学校查看学生列表并进入个人档案。",
    },
  ),
  page(
    "bureau-student-growth-archive-detail",
    "学生个人档案",
    "/bureau/education-governance/student-growth-archive/:studentId",
    bureau,
    () => import("@/views/bureau/education-governance/StudentGrowthArchiveDetailView.vue"),
    {
      selectable: false,
      menuOwnerKey: "bureau-student-growth-archive",
      description: "学生个人成长档案详情页；首期为开发中占位。",
    },
  ),

  // 教育局 · AI教师发展 · 跨校协同教研
  page(
    "bureau-teaching-research-alliance",
    "教研联盟管理",
    "/bureau/ai-teacher-development/cross-school-research/alliance",
    bureau,
    () => import("@/views/bureau/ai-teacher-development/AllianceManagementView.vue"),
    {
      description: "教育局创建和管理跨校教研联盟，支持联盟检索、启停与专属空间初始化。",
    },
  ),
  page(
    "bureau-teaching-research-alliance-create",
    "创建教研联盟",
    "/bureau/ai-teacher-development/cross-school-research/alliance/create",
    bureau,
    () => import("@/views/bureau/ai-teacher-development/CreateAllianceView.vue"),
    {
      selectable: false,
      menuOwnerKey: "bureau-teaching-research-alliance",
      description: "教育局创建跨校教研联盟，配置成员学校、牵头校、管理员与参与教师。",
    },
  ),
  page(
    "bureau-teaching-research-alliance-detail",
    "教研联盟详情",
    "/bureau/ai-teacher-development/cross-school-research/alliance/:id",
    bureau,
    () => import("@/views/bureau/ai-teacher-development/AllianceDetailView.vue"),
    {
      selectable: false,
      menuOwnerKey: "bureau-teaching-research-alliance",
      description: "查看教研联盟基本信息、成员学校、统计数据与专属空间入口。",
    },
  ),
  page(
    "bureau-cross-school-activity",
    "活动管理",
    "/bureau/ai-teacher-development/cross-school-research/activities",
    bureau,
    () => import("@/views/bureau/ai-teacher-development/CrossSchoolActivityView.vue"),
    {
      description: "牵头学校统筹组织跨校教研活动，支持按类型、状态和联盟检索并进入活动详情。",
    },
  ),
  page(
    "bureau-cross-school-activity-create",
    "创建跨校教研活动",
    "/bureau/ai-teacher-development/cross-school-research/activities/create",
    bureau,
    () => import("@/views/bureau/ai-teacher-development/CreateCrossSchoolActivityView.vue"),
    {
      selectable: false,
      menuOwnerKey: "bureau-cross-school-activity",
      description: "牵头学校发起跨校集体备课或听评课，配置参与学校、教师与任务分工。",
    },
  ),
  page(
    "bureau-cross-school-activity-detail",
    "跨校教研活动详情",
    "/bureau/ai-teacher-development/cross-school-research/activities/:id",
    bureau,
    () => import("@/views/bureau/ai-teacher-development/CrossSchoolActivityDetailView.vue"),
    {
      selectable: false,
      menuOwnerKey: "bureau-cross-school-activity",
      description: "查看跨校教研活动摘要，并管理任务分工、听评课设置、讨论投票与归档。",
    },
  ),
  page(
    "bureau-collective-lesson-prep",
    "集体备课管理",
    "/bureau/ai-teacher-development/cross-school-research/lesson-prep",
    bureau,
    () => import("@/views/bureau/ai-teacher-development/CollectiveLessonPrepView.vue"),
    {
      description: "按教材目录管理跨校集体备课，查看进度、成果并进入备课。",
    },
  ),
  page(
    "bureau-lesson-observation",
    "听评课管理",
    "/bureau/ai-teacher-development/cross-school-research/lesson-observation",
    bureau,
    () => import("@/views/bureau/ai-teacher-development/LessonObservationView.vue"),
    {
      description: "管理跨校听评课记录，支持按老师、联盟、学校和评课方式检索并查看评价报告。",
    },
  ),
  page(
    "bureau-lesson-observation-detail",
    "听评课详情",
    "/bureau/ai-teacher-development/cross-school-research/lesson-observation/:id",
    bureau,
    () => import("@/views/bureau/ai-teacher-development/LessonObservationDetailView.vue"),
    {
      selectable: false,
      menuOwnerKey: "bureau-lesson-observation",
      description: "查看跨校听评课摘要、课程评价报告、评课明细与档案文件。",
    },
  ),
  page(
    "bureau-achievement-sharing",
    "成果共享",
    "/bureau/ai-teacher-development/cross-school-research/achievement-sharing",
    bureau,
    () => import("@/views/bureau/ai-teacher-development/AchievementSharingView.vue"),
    {
      description: "按教材目录浏览跨校教研成果，支持按类型检索、预览与下载。",
    },
  ),
  page(
    "bureau-effect-evaluation",
    "效果评估",
    "/bureau/ai-teacher-development/cross-school-research/effect-evaluation",
    bureau,
    () => import("@/views/bureau/ai-teacher-development/EffectEvaluationView.vue"),
    {
      description: "对比参与与未参与跨校教研学校的核心指标，并导出效果评估报告。",
    },
  ),
  page(
    "bureau-training-standard-config",
    "研修标准配置",
    "/bureau/ai-teacher-development/teaching-monitoring/standards",
    bureau,
    () => import("@/views/bureau/ai-teacher-development/TrainingStandardConfigView.vue"),
    {
      description: "区级配置研修类型、等级分值与年度学分预警阈值，支持按学期维护。",
    },
  ),
  page(
    "bureau-training-achievement-review",
    "成果终审",
    "/bureau/ai-teacher-development/teaching-monitoring/achievement-review",
    bureau,
    () => import("@/views/bureau/ai-teacher-development/AchievementReviewView.vue"),
    {
      description: "区级终审教师研修成果，支持通过、驳回与加精推荐。",
    },
  ),
  page(
    "bureau-training-warning",
    "预警管理",
    "/bureau/ai-teacher-development/teaching-monitoring/warnings",
    bureau,
    () => import("@/views/bureau/ai-teacher-development/TrainingWarningView.vue"),
    {
      description: "按学校汇总教师学分达标情况，并下钻查看未达标教师明细。",
    },
  ),
  page(
    "bureau-training-warning-school-detail",
    "教师学分详情",
    "/bureau/ai-teacher-development/teaching-monitoring/warnings/:schoolId",
    bureau,
    () => import("@/views/bureau/ai-teacher-development/TrainingWarningSchoolDetailView.vue"),
    {
      selectable: false,
      menuOwnerKey: "bureau-training-warning",
      description: "查看指定学校教师学分达标明细与个人学分记录。",
    },
  ),
  page(
    "bureau-training-statistics",
    "研修统计",
    "/bureau/ai-teacher-development/teaching-monitoring/statistics",
    bureau,
    () => import("@/views/bureau/ai-teacher-development/TrainingStatisticsView.vue"),
    {
      description: "按学期统计全区研修成果与学校学分达标情况，支持导出明细。",
    },
  ),

  // 教育局 · 组织与运营商
  page("bureau-org-structure", "组织架构", "/bureau/org/structure", bureau),
  page("bureau-staff-manage", "人员管理", "/bureau/org/staff", bureau),
  page("bureau-operator-list", "运营商列表", "/bureau/operator/list", bureau),
  page("bureau-operator-review", "审核管理", "/bureau/operator/review", bureau),

  // 机构
  page("org-basic-info", "基础信息", "/org/manage/basic-info", org),
  page("org-admin-structure", "行政架构", "/org/manage/structure/admin", org),
  page("org-all-users", "所有用户", "/org/manage/users/all", org),
  page("org-staff-manage", "职员管理", "/org/manage/users/staff", org),
  page("org-staff-group", "职员分组", "/org/manage/users/group", org),
  page("org-auth-manage", "授权管理", "/org/manage/users/auth", org),
  page("org-teacher-review", "师资审核", "/org/manage/users/teacher-review", org),
  page("org-payment-flow", "课程缴费流水", "/org/settlement/payment", org),
  page("org-refund-flow", "课程退费流水", "/org/settlement/refund", org),
  page("org-course-list", "课程列表", "/org/course/list", org),
  page("org-class-manage", "课班管理", "/org/course/class", org),
  page("org-notice-list", "通知公告", "/org/notice/list", org),

  // 运营平台
  page(
    "system-organization-management",
    "组织管理",
    "/system/organization",
    platform,
    () => import("@/views/system/organization/OrganizationManagementView.vue"),
    { requiresAdmin: true },
  ),
  page(
    "system-role-management",
    "角色管理",
    "/system/roles",
    platform,
    () => import("@/views/system/roles/RoleManagementView.vue"),
    { requiresAdmin: true },
  ),
  page(
    "system-menu-config",
    "菜单配置",
    "/system/menu-config",
    platform,
    () => import("@/views/system/menu-config/MenuConfigView.vue"),
    { requiresAdmin: true },
  ),
  page(
    "system-workbench-widgets",
    "工作台组件管理",
    "/system/workbench-widgets",
    platform,
    () => import("@/views/system/workbench-widgets/WorkbenchWidgetCatalogView.vue"),
    { requiresAdmin: true },
  ),
];

export const pageRegistryByKey = new Map(pageRegistry.map((item) => [item.key, item]));
export const pageRegistryByPath = new Map(pageRegistry.map((item) => [item.path, item]));

export function pageResourceOptionLabel(page: PageRegistryItem) {
  const statusLabel = page.status === "available" ? "已开发" : "开发中";
  return `[${statusLabel}] ${page.title} · ${page.path}`;
}

export function listSelectablePageResources({
  tenantType,
  records,
  editingRecordId = null,
}: SelectablePageResourceOptions) {
  const usedPageKeys = new Set(
    records
      .filter((record) => record.id !== editingRecordId && record.pageKey)
      .map((record) => record.pageKey),
  );

  return pageRegistry.filter(
    (page) =>
      page.selectable &&
      page.tenantTypes.includes(tenantType) &&
      (page.allowDuplicateMenuBinding || !usedPageKeys.has(page.key)),
  );
}

function routeRecord(item: PageRegistryItem, path: string): RouteRecordRaw {
  return {
    path,
    name: item.key,
    component: item.component,
    meta: {
      pageKey: item.key,
      menuOwnerKey: item.menuOwnerKey,
      title: item.title,
      requiresAdmin: item.requiresAdmin,
      pageSurface: item.surface,
    },
  };
}

export const pageRouteRecords: RouteRecordRaw[] = pageRegistry
  .filter((item) => item.surface === "shell")
  .map((item) => routeRecord(item, item.path.slice(1)));

export const standalonePageRouteRecords: RouteRecordRaw[] = pageRegistry
  .filter((item) => item.surface === "standalone")
  .map((item) => routeRecord(item, item.path));
