import type {
  AchievementReviewDetail,
  AchievementReviewListQuery,
  AchievementReviewListResult,
  AchievementReviewRow,
  AchievementReviewStats,
} from "@/features/training-achievement-review/types";

function cloneDetail(detail: AchievementReviewDetail): AchievementReviewDetail {
  return {
    ...detail,
    attachments: detail.attachments.map((item) => ({ ...item })),
    auditRecords: detail.auditRecords.map((item) => ({ ...item })),
  };
}

const DETAILS: AchievementReviewDetail[] = Array.from({ length: 12 }, (_, index) => {
  const id = `ach-${String(index + 1).padStart(3, "0")}`;
  const status =
    index % 3 === 0 ? "pending" : index % 3 === 1 ? "approved" : "rejected";
  return {
    id,
    code: `YX202609${String(index + 15).padStart(4, "0")}`,
    title: "基于核心素养的单元整体教学研究",
    schoolName: index % 2 === 0 ? "阳光小学" : "实验小学",
    teacherName: "张晓晓",
    subject: "语文",
    type: index % 2 === 0 ? "teaching-result" : "research-award",
    levelLabel: "一等奖",
    scoreLabel: "8",
    submittedAt: "2026-07-09 12:00",
    status,
    featured: status === "approved" && index % 4 === 1,
    recommendReason: "",
    attachments: [
      { id: `${id}-a1`, name: "成果研究报告.docx", sizeLabel: "10.23K" },
      { id: `${id}-a2`, name: "证明材料.docx", sizeLabel: "10.23K" },
    ],
    auditRecords: [
      {
        id: `${id}-r1`,
        action: "提交成果",
        at: "2026-09-10 09:15",
        actorName: "张三",
        orgName: "实验小学",
      },
      {
        id: `${id}-r2`,
        action: "学校初审",
        at: "2026-09-12 09:15",
        actorName: "王校长",
        orgName: "实验小学",
        result: "approved",
        comment: "同意推荐，案例选题贴合教学实际",
      },
    ],
  } satisfies AchievementReviewDetail;
});

let store = DETAILS.map(cloneDetail);

export function resetAchievementReviewMockData() {
  store = DETAILS.map(cloneDetail);
}

function toRow(detail: AchievementReviewDetail): AchievementReviewRow {
  return {
    id: detail.id,
    title: detail.title,
    schoolName: detail.schoolName,
    teacherName: detail.teacherName,
    type: detail.type,
    levelLabel: detail.levelLabel,
    scoreLabel: detail.scoreLabel,
    submittedAt: detail.submittedAt,
    status: detail.status,
    featured: detail.featured,
  };
}

function buildStats(rows: readonly AchievementReviewDetail[]): AchievementReviewStats {
  const pendingCount = rows.filter((item) => item.status === "pending").length;
  const approved = rows.filter((item) => item.status === "approved").length;
  const rejected = rows.filter((item) => item.status === "rejected").length;
  const decided = approved + rejected;
  return {
    pendingCount,
    approvedThisMonth: approved,
    rejectedThisMonth: rejected,
    passRatePercent: decided ? Math.round((approved / decided) * 100) : 0,
    featuredCount: rows.filter((item) => item.featured).length,
    featuredThisMonth: rows.filter((item) => item.featured).length,
    likeCount: 3,
    viewCount: 1009,
  };
}

export function listAchievementReviews(query: AchievementReviewListQuery): AchievementReviewListResult {
  let filtered = store.slice();
  if (query.statusTab !== "all") {
    filtered = filtered.filter((item) => item.status === query.statusTab);
  }
  if (query.schoolName.trim()) {
    filtered = filtered.filter((item) => item.schoolName.includes(query.schoolName.trim()));
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
  const total = filtered.length;
  const start = (query.page - 1) * query.pageSize;
  const rows = filtered.slice(start, start + query.pageSize).map(toRow);
  return {
    stats: buildStats(store),
    rows,
    total,
    tabCounts: {
      pending: store.filter((item) => item.status === "pending").length,
      approved: store.filter((item) => item.status === "approved").length,
      rejected: store.filter((item) => item.status === "rejected").length,
      all: store.length,
    },
  };
}

export function getAchievementReviewDetail(id: string) {
  const found = store.find((item) => item.id === id);
  return found ? cloneDetail(found) : null;
}

export function reviewAchievement(id: string, approved: boolean, remark: string) {
  const index = store.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("成果不存在");
  if (!approved && !remark.trim()) throw new Error("驳回时必须填写审核备注");
  const current = store[index]!;
  const next: AchievementReviewDetail = {
    ...cloneDetail(current),
    status: approved ? "approved" : "rejected",
    auditRecords: [
      ...current.auditRecords,
      {
        id: `audit-${Date.now()}`,
        action: "区级终审",
        at: "2026-09-24 10:00",
        actorName: "罗吴航",
        orgName: "体验区教育局",
        result: approved ? "approved" : "rejected",
        comment: remark.trim() || undefined,
      },
    ],
  };
  store[index] = next;
  return cloneDetail(next);
}

export function setAchievementFeatured(id: string, featured: boolean, reason = "") {
  const index = store.findIndex((item) => item.id === id);
  if (index < 0) throw new Error("成果不存在");
  const current = store[index]!;
  if (current.status !== "approved") throw new Error("仅已通过成果可加精");
  store[index] = {
    ...cloneDetail(current),
    featured,
    recommendReason: featured ? reason.trim() : "",
  };
  return cloneDetail(store[index]!);
}

export function listApprovedAchievementsForFeature() {
  return store.filter((item) => item.status === "approved").map(toRow);
}
