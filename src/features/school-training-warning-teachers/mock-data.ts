import { getTrainingWarningTeacherDetail } from "@/features/training-warning/mock-data";
import type {
  SchoolWarningTeacherListResult,
  SchoolWarningTeacherRow,
  SchoolWarningTeacherStatus,
} from "@/features/school-training-warning-teachers/types";

const TEACHERS: SchoolWarningTeacherRow[] = [
  {
    id: "sch-warn-t-1",
    name: "张三",
    subject: "语文",
    currentCredits: 18,
    creditLine: 36,
    completionPercent: 50,
    status: "unreached",
  },
  {
    id: "sch-warn-t-2",
    name: "李四",
    subject: "数学",
    currentCredits: 20,
    creditLine: 36,
    completionPercent: 56,
    status: "unreached",
  },
  {
    id: "sch-warn-t-3",
    name: "王五",
    subject: "英语",
    currentCredits: 22,
    creditLine: 36,
    completionPercent: 61,
    status: "unreached",
  },
  {
    id: "sch-warn-t-4",
    name: "赵六",
    subject: "语文",
    currentCredits: 42,
    creditLine: 36,
    completionPercent: 117,
    status: "reached",
  },
  {
    id: "sch-warn-t-5",
    name: "钱七",
    subject: "数学",
    currentCredits: 30,
    creditLine: 36,
    completionPercent: 83,
    status: "unreached",
  },
  {
    id: "sch-warn-t-6",
    name: "孙八",
    subject: "英语",
    currentCredits: 16,
    creditLine: 36,
    completionPercent: 44,
    status: "unreached",
  },
  {
    id: "sch-warn-t-7",
    name: "周九",
    subject: "物理",
    currentCredits: 38,
    creditLine: 36,
    completionPercent: 106,
    status: "reached",
  },
  {
    id: "sch-warn-t-8",
    name: "吴十",
    subject: "化学",
    currentCredits: 28,
    creditLine: 36,
    completionPercent: 78,
    status: "unreached",
  },
  {
    id: "sch-warn-t-9",
    name: "郑十一",
    subject: "语文",
    currentCredits: 12,
    creditLine: 36,
    completionPercent: 33,
    status: "unreached",
  },
  {
    id: "sch-warn-t-10",
    name: "王十二",
    subject: "数学",
    currentCredits: 36,
    creditLine: 36,
    completionPercent: 100,
    status: "reached",
  },
  {
    id: "sch-warn-t-11",
    name: "冯十三",
    subject: "英语",
    currentCredits: 19,
    creditLine: 36,
    completionPercent: 53,
    status: "unreached",
  },
  {
    id: "sch-warn-t-12",
    name: "陈十四",
    subject: "语文",
    currentCredits: 40,
    creditLine: 36,
    completionPercent: 111,
    status: "reached",
  },
];

export function listSchoolWarningTeachers(
  status: SchoolWarningTeacherStatus | "",
  subject: string,
  teacherName: string,
  page: number,
  pageSize: number,
): SchoolWarningTeacherListResult {
  let teachers = TEACHERS.slice().sort(
    (left, right) => left.completionPercent - right.completionPercent,
  );
  if (status) teachers = teachers.filter((item) => item.status === status);
  if (subject) teachers = teachers.filter((item) => item.subject === subject);
  if (teacherName.trim()) {
    teachers = teachers.filter((item) => item.name.includes(teacherName.trim()));
  }
  const teacherCount = 68;
  const reachedCount = 52;
  const unreachedCount = 16;
  const start = (page - 1) * pageSize;
  return {
    schoolName: "实验小学",
    banner: {
      unreachedTeacherCount: unreachedCount,
      creditLine: 36,
      triggerPercent: 60,
    },
    stats: {
      teacherCount,
      reachedCount,
      unreachedCount,
      reachRatePercent: 76.5,
    },
    teachers: teachers.slice(start, start + pageSize).map((item) => ({ ...item })),
    total: teachers.length,
  };
}

export function getSchoolWarningTeacherDetail(teacherId: string) {
  return getTrainingWarningTeacherDetail(teacherId);
}
