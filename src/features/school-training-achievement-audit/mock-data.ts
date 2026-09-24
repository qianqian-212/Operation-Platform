import type {
  SchoolAchievementAuditDetail,
  SchoolAchievementAuditListQuery,
  SchoolAchievementAuditListResult,
  SchoolAchievementAuditRow,
  SchoolAchievementAuditStatus,
  SchoolAchievementAuditType,
} from "@/features/school-training-achievement-audit/types";

function cloneDetail(detail: SchoolAchievementAuditDetail): SchoolAchievementAuditDetail {
  return {
    ...detail,
    attachments: detail.attachments.map((item) => ({ ...item })),
    auditRecords: detail.auditRecords.map((item) => ({ ...item })),
  };
}

const TYPE_CYCLE: SchoolAchievementAuditType[] = [
  "teaching-result",
  "training",
  "paper",
  "research-award",
  "school-based",
];

const DETAILS: SchoolAchievementAuditDetail[] = Array.from({ length: 12 }, (_, index) => {
  const id = `school-ach-${String(index + 1).padStart(3, "0")}`;
  const status: SchoolAchievementAuditStatus =
    index % 4 === 0
      ? "pending"
      : index % 4 === 1
        ? "district-reviewing"
        : index % 4 === 2
          ? "approved"
          : "rejected";
  const type = TYPE_CYCLE[index % TYPE_CYCLE.length]!;
  return {
    id,
    title: "基于核心素养的单元整体教学研究",
    teacherName: index % 2 === 0 ? "张三" : "李四",
    subject: index % 2 === 0 ? "语文" : "数学",
    schoolName: "实验小学",
    type,
    levelLabel:
      type === "paper" ? "市级期刊" : type === "training" ? "市级" : index % 3 === 0 ? "省级 / 一等" : "市级 / 二等",
    declaredScore: type === "training" ? 12 : 8,
    submittedAt: "2026-09-16 10:25",
    status,
    abstract:
      "围绕核心素养导向，探索单元整体教学设计路径，形成可迁移的校本实践案例与评价要点。",
    attachments: [
      { id: `${id}-a1`, name: "成果研究报告_张三.docx", sizeLabel: "2.4 MB" },
      { id: `${id}-a2`, name: "证明材料.pdf", sizeLabel: "1.1 MB" },
    ],
    auditRecords: [
      {
        id: `${id}-r1`,
        title: "提交成果",
        occurredAt: "2026-09-16 10:25",
        actorLabel: "提交人：张三 (实验小学)",
        tone: "neutral",
      },
    ],
  } satisfies SchoolAchievementAuditDetail;
});

let store = DETAILS.map(cloneDetail);

export function resetSchoolAchievementAuditMockData() {
  store = DETAILS.map(cloneDetail);
}

function toRow(detail: SchoolAchievementAuditDetail): SchoolAchievementAuditRow {
  return {
    id: detail.id,
    title: detail.title,
    teacherName: detail.teacherName,
    subject: detail.subject,
    type: detail.type,
    levelLabel: detail.levelLabel,
    declaredScore: detail.declaredScore,
    submittedAt: detail.submittedAt,
    status: detail.status,
  };
}

export function listSchoolAchievementAudits(
  query: SchoolAchievementAuditListQuery,
): SchoolAchievementAuditListResult {
  let filtered = store.slice();
  if (query.statusTab !== "all") {
    filtered = filtered.filter((item) => item.status === query.statusTab);
  }
  if (query.type) {
    filtered = filtered.filter((item) => item.type === query.type);
  }
  if (query.keyword.trim()) {
    const keyword = query.keyword.trim();
    filtered = filtered.filter(
      (item) => item.title.includes(keyword) || item.teacherName.includes(keyword),
    );
  }
  const start = (query.page - 1) * query.pageSize;
  return {
    schoolName: "实验小学",
    stats: {
      pendingCount: store.filter((item) => item.status === "pending").length,
      districtReviewingCount: store.filter((item) => item.status === "district-reviewing").length,
      approvedThisMonth: store.filter((item) => item.status === "approved").length,
      rejectedThisMonth: store.filter((item) => item.status === "rejected").length,
    },
    rows: filtered.slice(start, start + query.pageSize).map(toRow),
    total: filtered.length,
    tabCounts: {
      pending: store.filter((item) => item.status === "pending").length,
      "district-reviewing": store.filter((item) => item.status === "district-reviewing").length,
      approved: store.filter((item) => item.status === "approved").length,
      rejected: store.filter((item) => item.status === "rejected").length,
      all: store.length,
    },
  };
}

export function getSchoolAchievementAuditDetail(id: string) {
  const found = store.find((item) => item.id === id);
  return found ? cloneDetail(found) : null;
}

export function reviewSchoolAchievement(id: string, approved: boolean, remark: string) {
  const index = store.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("成果不存在");
  if (!approved && !remark.trim()) throw new Error("驳回时必须填写审核备注");
  const current = store[index]!;
  if (current.status !== "pending") throw new Error("仅待初审成果可审核");
  const next: SchoolAchievementAuditDetail = {
    ...cloneDetail(current),
    status: approved ? "district-reviewing" : "rejected",
    auditRecords: [
      ...current.auditRecords,
      {
        id: `audit-${Date.now()}`,
        title: approved ? "学校初审通过" : "学校初审驳回",
        occurredAt: "2026-09-24 11:30",
        actorLabel: "审核人：张晓晓 (实验小学)",
        comment: remark.trim() || undefined,
        tone: approved ? "success" : "danger",
      },
    ],
  };
  store[index] = next;
  return cloneDetail(next);
}
