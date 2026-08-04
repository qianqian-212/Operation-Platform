import type { WorkbenchFeedItemData } from "@/features/workbench/types";

export const bureauPublicFeedData: Record<"information-disclosure" | "announcements", WorkbenchFeedItemData[]> = {
  "information-disclosure": [
    { id: "disclosure-1", title: "2026 年义务教育招生工作实施方案", meta: "07-18", label: "政策文件", tone: "primary", source: "基础教育科", summary: "方案明确招生对象、学区安排、报名流程及特殊群体入学保障要求。", unread: true },
    { id: "disclosure-2", title: "校外培训机构年度检查结果公示", meta: "07-16", label: "公示公告", source: "监管科", summary: "年度检查结果按合格、限期整改和不合格分类公示，公示期为七个工作日。" },
    { id: "disclosure-3", title: "教育行政事项办事指南更新", meta: "07-12", label: "办事指南", source: "行政审批科", summary: "更新教师资格认定、民办学校审批等事项的办理材料、流程和咨询方式。" },
    { id: "disclosure-4", title: "学生资助政策与申请流程说明", meta: "07-09", label: "政策解读", source: "学生资助中心", summary: "梳理各学段资助项目、认定条件、申请材料及办理时限。" },
    { id: "disclosure-5", title: "教育经费年度执行情况公开", meta: "07-05", label: "财政信息", source: "财务科", summary: "公开年度教育经费预算执行和重点项目资金使用情况。" },
  ],
  announcements: [
    { id: "announcement-1", title: "关于报送暑期值班安排的通知", meta: "今天", label: "工作通知", tone: "primary", source: "办公室", summary: "请各单位于本周五前完成暑期值班表在线填报，并确认应急联系人信息。", unread: true },
    { id: "announcement-2", title: "全区教师信息更新工作提醒", meta: "07-17", label: "数据报送", source: "人事科", summary: "教师基础信息更新将在 7 月 24 日截止，请及时处理系统校验提示。", unread: true },
    { id: "announcement-3", title: "秋季学期校历安排发布", meta: "07-15", label: "重要公告", source: "基础教育科", summary: "新学期报到、开学、考试及假期时间已确定，请各学校据此安排教学计划。" },
    { id: "announcement-4", title: "教育系统网络维护窗口说明", meta: "07-12", label: "系统通知", source: "电教中心", summary: "本周六 00:00 至 04:00 进行网络维护，部分平台服务可能短时不可用。" },
    { id: "announcement-5", title: "校外培训治理专项检查通知", meta: "07-10", label: "专项工作", source: "监管科", summary: "专项检查聚焦违规收费、隐形变异培训和安全管理，具体分组安排已下发。" },
  ],
};
