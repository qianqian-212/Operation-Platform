import type {
  TrainingWarningSchoolDetail,
  TrainingWarningSchoolListResult,
  TrainingWarningSortKey,
  TrainingWarningTeacherDetail,
} from "@/features/training-warning/types";

const SCHOOLS = [
  { id: "sch-1", schoolName: "阳光小学", teacherCount: 234, reachedCount: 211 },
  { id: "sch-2", schoolName: "实验小学", teacherCount: 180, reachedCount: 45 },
  { id: "sch-3", schoolName: "第一中学", teacherCount: 156, reachedCount: 140 },
  { id: "sch-4", schoolName: "第二小学", teacherCount: 98, reachedCount: 88 },
  { id: "sch-5", schoolName: "第三小学", teacherCount: 120, reachedCount: 96 },
].map((item) => ({
  ...item,
  unreachedCount: item.teacherCount - item.reachedCount,
  reachRatePercent: Math.round((item.reachedCount / item.teacherCount) * 100),
}));

export function resetTrainingWarningMockData() {
  // seed is static; reserved for tests
}

export function listTrainingWarningSchools(
  schoolKeyword: string,
  sort: TrainingWarningSortKey,
  page: number,
  pageSize: number,
): TrainingWarningSchoolListResult {
  let rows = SCHOOLS.slice();
  if (schoolKeyword.trim()) {
    rows = rows.filter((item) => item.schoolName.includes(schoolKeyword.trim()));
  }
  rows = [...rows].sort((left, right) => {
    if (sort === "name") return left.schoolName.localeCompare(right.schoolName, "zh-CN");
    if (sort === "unreached") return right.unreachedCount - left.unreachedCount;
    // 默认按达标率升序：低达标率优先展示
    return left.reachRatePercent - right.reachRatePercent;
  });
  const teacherCount = SCHOOLS.reduce((sum, item) => sum + item.teacherCount, 0);
  const reachedCount = SCHOOLS.reduce((sum, item) => sum + item.reachedCount, 0);
  const unreachedCount = teacherCount - reachedCount;
  const start = (page - 1) * pageSize;
  return {
    banner: {
      unreachedTeacherCount: unreachedCount,
      schoolCount: SCHOOLS.length,
      creditLine: 36,
      triggerPercent: 60,
    },
    stats: {
      teacherCount,
      reachedCount,
      unreachedCount,
      reachRatePercent: Math.round((reachedCount / teacherCount) * 100),
    },
    rows: rows.slice(start, start + pageSize).map((item) => ({ ...item })),
    total: rows.length,
  };
}

export function getTrainingWarningSchoolDetail(
  schoolId: string,
  page: number,
  pageSize: number,
  status: "" | "reached" | "unreached",
  subject: string,
  teacherName: string,
): TrainingWarningSchoolDetail {
  const school = SCHOOLS.find((item) => item.id === schoolId);
  if (!school) throw new Error("学校不存在");
  const teachers = Array.from({ length: 12 }, (_, index) => {
    const reached = index > 1;
    const currentCredits = reached ? 24 : 18;
    const completionPercent = reached ? 80 : 25;
    return {
      id: `${schoolId}-t-${index + 1}`,
      name: "张晓晓",
      subject: "语文",
      currentCredits,
      creditLine: 30,
      completionPercent,
      reached,
    };
  })
    .filter((item) => {
      if (status === "reached" && !item.reached) return false;
      if (status === "unreached" && item.reached) return false;
      if (subject && item.subject !== subject) return false;
      if (teacherName.trim() && !item.name.includes(teacherName.trim())) return false;
      return true;
    })
    .sort((left, right) => left.completionPercent - right.completionPercent);
  const start = (page - 1) * pageSize;
  return {
    schoolId: school.id,
    schoolName: school.schoolName,
    stats: {
      teacherCount: school.teacherCount,
      reachedCount: school.reachedCount,
      unreachedCount: school.unreachedCount,
      reachRatePercent: school.reachRatePercent,
    },
    teachers: teachers.slice(start, start + pageSize),
    total: teachers.length,
  };
}

export function getTrainingWarningTeacherDetail(teacherId: string): TrainingWarningTeacherDetail {
  const schoolId = teacherId.split("-t-")[0] ?? "";
  const school = SCHOOLS.find((item) => item.id === schoolId) ?? SCHOOLS[0]!;
  return {
    id: teacherId,
    name: "张晓晓",
    schoolName: school.schoolName,
    subject: "语文",
    hireYear: "2018",
    currentCredits: 12,
    shortfallCredits: 13,
    completionPercent: 59,
    yearLabel: "2026",
    items: [
      {
        id: "c1",
        title: "2026省级骨干教师培训",
        typeLabel: "培训进修",
        levelLabel: "省级",
        at: "2026-09-09 12:00",
        statusLabel: "已通过",
        statusTone: "green",
        credits: 10,
      },
      {
        id: "c2",
        title: "单元整体教学案例研究",
        typeLabel: "教学成果",
        levelLabel: "市级",
        at: "2026-09-09 12:00",
        statusLabel: "区级审核中",
        statusTone: "orange",
        credits: 8,
      },
      {
        id: "c3",
        title: "2026年省级骨干教师培训",
        typeLabel: "培训进修",
        levelLabel: "省级",
        at: "2026-09-09 12:00",
        statusLabel: "已通过",
        statusTone: "green",
        credits: 10,
      },
      {
        id: "c4",
        title: "2026年省级骨干教师培训",
        typeLabel: "培训进修",
        levelLabel: "省级",
        at: "2026-09-09 12:00",
        statusLabel: "区级审核中",
        statusTone: "orange",
        credits: 10,
      },
      {
        id: "c5",
        title: "2026年省级骨干教师培训",
        typeLabel: "培训进修",
        levelLabel: "省级",
        at: "2026-09-09 12:00",
        statusLabel: "已通过",
        statusTone: "green",
        credits: 10,
      },
    ],
  };
}
