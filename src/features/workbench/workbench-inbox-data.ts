import { bureauPublicFeedData } from "@/features/workbench/bureau-public-feed";
import type {
  WorkbenchDataContext,
  WorkbenchInboxData,
  WorkbenchInboxItemData,
} from "@/features/workbench/types";

const tenantNotices: Record<WorkbenchDataContext["tenant"]["type"], string[]> = {
  school: ["本周五完成月度安全巡检", "学期家长会材料已开放提交", "新版考勤规则将于下周生效"],
  bureau: ["托管课程审核规范已更新", "本月机构数据报送截止至周五", "退款审核流程新增复核节点"],
  org: ["春季课程续报活动已开始", "教师资质年审材料请及时补充", "本月结算单已生成"],
  platform: ["租户配置完整性检查已完成", "系统维护窗口安排在周六凌晨", "权限配置审计报告已生成"],
};

const tenantTodos: Record<WorkbenchDataContext["tenant"]["type"], string[]> = {
  school: ["审批学生请假申请", "确认本周值班安排", "补充班级考勤说明", "发布家长会通知", "检查门禁异常记录"],
  bureau: ["复核星辰艺术机构资质", "确认秋季招生计划汇总数据", "处理课程细则补充材料", "完成本周审核工作汇总", "查看校园安全预警信息"],
  org: ["完成未点名课班", "提交课后教学反馈", "确认调课申请", "补充学生学习记录", "查看最新教学通知"],
  platform: ["复核租户菜单配置", "处理组织启用申请", "检查角色权限异常", "整理平台运营周报", "确认维护窗口通知"],
};

const tenantDaily: Record<WorkbenchDataContext["tenant"]["type"], string[]> = {
  school: ["填写今日值班日志", "核对学生晨检汇总"],
  bureau: ["查看今日数据报送进度", "整理科室工作简报"],
  org: ["确认今日课班教室", "回访昨日缺勤学员"],
  platform: ["巡检核心服务状态", "汇总运营值班记录"],
};

function noticeItems(context: WorkbenchDataContext): WorkbenchInboxItemData[] {
  if (context.tenant.type === "bureau") {
    return bureauPublicFeedData.announcements.map((item) => ({
      ...item,
      category: "notice" as const,
      status: item.unread ? "pending" as const : "completed" as const,
    }));
  }
  return tenantNotices[context.tenant.type].map((title, index) => ({
    id: `notice-${index}`,
    title,
    meta: index === 0 ? "今天" : `${index + 1} 天内`,
    label: "通知",
    tone: index === 0 ? "warning" as const : "neutral" as const,
    category: "notice" as const,
    status: index === 0 ? "pending" as const : "completed" as const,
    unread: index === 0,
    summary: title,
    source: context.tenant.shortName || context.tenant.name,
  }));
}

function todoItems(context: WorkbenchDataContext): WorkbenchInboxItemData[] {
  const values = tenantTodos[context.tenant.type];
  return values.map((title, index) => ({
    id: `todo-${index}`,
    title,
    meta: index === 0 ? "今天 16:00" : index === 1 ? "明天" : `${index + 1} 天内`,
    label: index === 0 ? "待审核" : "待办",
    tone: index === 0 ? "warning" as const : "neutral" as const,
    category: "todo" as const,
    status: index === values.length - 1 ? "completed" as const : "pending" as const,
  }));
}

function dailyItems(context: WorkbenchDataContext): WorkbenchInboxItemData[] {
  return tenantDaily[context.tenant.type].map((title, index) => ({
    id: `daily-${index}`,
    title,
    meta: index === 0 ? "今天" : "本周",
    label: "日常",
    category: "daily" as const,
    status: "pending" as const,
  }));
}

export function inboxOverviewData(
  context: WorkbenchDataContext,
  limit: number,
): WorkbenchInboxData {
  return {
    kind: "inbox",
    items: [
      ...todoItems(context).slice(0, limit),
      ...noticeItems(context).slice(0, limit),
      ...dailyItems(context).slice(0, limit),
    ],
  };
}
