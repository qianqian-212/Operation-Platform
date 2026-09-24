import type {
  TrainingStatisticsListResult,
} from "@/features/training-statistics/types";

const SCHOOLS = [
  { id: "sch-1", schoolName: "阳光小学", teacherCount: 234, reachedCount: 211 },
  { id: "sch-2", schoolName: "实验小学", teacherCount: 180, reachedCount: 144 },
  { id: "sch-3", schoolName: "第一中学", teacherCount: 156, reachedCount: 125 },
  { id: "sch-4", schoolName: "第二小学", teacherCount: 98, reachedCount: 78 },
  { id: "sch-5", schoolName: "第三小学", teacherCount: 120, reachedCount: 96 },
].map((item) => ({
  ...item,
  unreachedCount: item.teacherCount - item.reachedCount,
  reachRatePercent: Math.round((item.reachedCount / item.teacherCount) * 100),
}));

export function resetTrainingStatisticsMockData() {
  // seed is static
}

export function listTrainingStatistics(
  schoolKeyword: string,
  page: number,
  pageSize: number,
): TrainingStatisticsListResult {
  let rows = SCHOOLS.slice();
  if (schoolKeyword.trim()) {
    rows = rows.filter((item) => item.schoolName.includes(schoolKeyword.trim()));
  }
  const teacherCount = SCHOOLS.reduce((sum, item) => sum + item.teacherCount, 0);
  const reachedCount = SCHOOLS.reduce((sum, item) => sum + item.reachedCount, 0);
  const start = (page - 1) * pageSize;
  return {
    stats: {
      achievementCount: 20,
      teacherCount,
      reachRatePercent: Math.round((reachedCount / teacherCount) * 100),
    },
    rows: rows.slice(start, start + pageSize).map((item) => ({ ...item })),
    total: rows.length,
  };
}
