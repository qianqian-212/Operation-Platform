import type {
  LayeredTrainingNoticeQuery,
  LayeredTrainingNoticeResult,
  LayeredTrainingNoticeRow,
  LayeredTrainingNoticeType,
} from "@/features/layered-training-notice/types";

const NOTICE_TOTAL = 128;

const NOTICE_SEEDS: Omit<LayeredTrainingNoticeRow, "id">[] = [
  {
    notifiedAt: "2026-10-10 09:00",
    teacherName: "王刚",
    schoolName: "第一小学",
    subject: "英语",
    noticeType: "periodic",
    staleDays: 28,
    result: "unmet",
  },
  {
    notifiedAt: "2026-10-08 09:00",
    teacherName: "张小明",
    schoolName: "第一小学",
    subject: "语文",
    noticeType: "first",
    staleDays: 21,
    result: "met",
  },
  {
    notifiedAt: "2026-10-07 09:00",
    teacherName: "赵敏",
    schoolName: "第三小学",
    subject: "物理",
    noticeType: "periodic",
    staleDays: 22,
    result: "unmet",
  },
  {
    notifiedAt: "2026-09-26 09:00",
    teacherName: "王刚",
    schoolName: "第一小学",
    subject: "英语",
    noticeType: "first",
    staleDays: 14,
    result: "reviewing",
  },
  {
    notifiedAt: "2026-09-25 09:00",
    teacherName: "赵强",
    schoolName: "第一小学",
    subject: "数学",
    noticeType: "first",
    staleDays: 16,
    result: "reviewing",
  },
  {
    notifiedAt: "2026-09-24 09:00",
    teacherName: "周杰",
    schoolName: "实验小学",
    subject: "数学",
    noticeType: "first",
    staleDays: 26,
    result: "reviewing",
  },
  {
    notifiedAt: "2026-09-23 09:00",
    teacherName: "钱伟",
    schoolName: "第三小学",
    subject: "数学",
    noticeType: "first",
    staleDays: 17,
    result: "met",
  },
  {
    notifiedAt: "2026-09-22 09:00",
    teacherName: "吴静",
    schoolName: "实验小学",
    subject: "英语",
    noticeType: "first",
    staleDays: 18,
    result: "met",
  },
];

const GENERATED_TEACHERS = ["陈静", "刘洋", "孙丽", "郑凯", "冯雪", "何敏", "高峰", "林涛"];
const GENERATED_SCHOOLS = ["第二小学", "实验小学", "第一小学", "第三小学"];
const GENERATED_SUBJECTS = ["语文", "数学", "英语", "科学", "物理"];
const GENERATED_RESULTS: LayeredTrainingNoticeResult[] = ["unmet", "met", "reviewing"];

function noticeId(index: number) {
  return `ltn-${String(index + 1).padStart(3, "0")}`;
}

function noticeTime(dayOffset: number) {
  const date = new Date(Date.UTC(2026, 8, 21));
  date.setUTCDate(date.getUTCDate() - dayOffset);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}-${day} 09:00`;
}

function buildGeneratedNotice(index: number): LayeredTrainingNoticeRow {
  const offset = index - NOTICE_SEEDS.length;
  const noticeType: LayeredTrainingNoticeType = offset % 2 === 0 ? "first" : "periodic";
  return {
    id: noticeId(index),
    notifiedAt: noticeTime(offset),
    teacherName: GENERATED_TEACHERS[offset % GENERATED_TEACHERS.length] ?? "陈静",
    schoolName: GENERATED_SCHOOLS[offset % GENERATED_SCHOOLS.length] ?? "第二小学",
    subject: GENERATED_SUBJECTS[offset % GENERATED_SUBJECTS.length] ?? "语文",
    noticeType,
    staleDays: 10 + (offset % 20),
    result: GENERATED_RESULTS[offset % GENERATED_RESULTS.length] ?? "reviewing",
  };
}

function buildNotices() {
  const seeded = NOTICE_SEEDS.map((item, index) => ({ ...item, id: noticeId(index) }));
  const generated = Array.from({ length: NOTICE_TOTAL - seeded.length }, (_, offset) =>
    buildGeneratedNotice(seeded.length + offset),
  );
  return [...seeded, ...generated];
}

const NOTICES = buildNotices();

function uniqueSchools(rows: readonly LayeredTrainingNoticeRow[]) {
  const names: string[] = [];
  for (const row of rows) {
    if (!names.includes(row.schoolName)) names.push(row.schoolName);
  }
  return names;
}

function matchesNotice(row: LayeredTrainingNoticeRow, query: LayeredTrainingNoticeQuery) {
  const schoolName = query.schoolName.trim();
  if (schoolName && row.schoolName !== schoolName) return false;
  if (query.noticeType && row.noticeType !== query.noticeType) return false;
  return true;
}

export function listLayeredTrainingNotices(query: LayeredTrainingNoticeQuery) {
  const filtered = NOTICES.filter((row) => matchesNotice(row, query));
  const start = Math.max(query.page - 1, 0) * query.pageSize;
  return {
    rows: filtered.slice(start, start + query.pageSize).map((row) => ({ ...row })),
    total: filtered.length,
    schools: uniqueSchools(NOTICES),
  };
}
