import {
  schoolRateTone,
  teacherCompletionTone,
  type LayeredTrainingOverviewQuery,
  type LayeredTrainingOverviewResult,
  type LayeredTrainingOverviewSchool,
  type LayeredTrainingOverviewSummary,
  type LayeredTrainingOverviewTeacher,
  type LayeredTrainingSchoolSort,
  type LayeredTrainingTeacherStatus,
} from "@/features/layered-training-overview/types";

interface TeacherSeed {
  name: string;
  schoolName: string;
  subject: string;
  hoursDone: number;
  hoursTotal: number;
  creditsDone: number;
  creditsTotal: number;
  completionRate: number;
  status: LayeredTrainingTeacherStatus;
}

interface SchoolSeed {
  id: string;
  name: string;
  teacherCount: number;
  participantCount: number;
  participationRate: number;
  completionRate: number;
  reachRate: number;
}

interface OverviewDataset {
  summary: LayeredTrainingOverviewSummary;
  schools: SchoolSeed[];
  teachers: LayeredTrainingOverviewTeacher[];
}

const CURRENT_SUMMARY: LayeredTrainingOverviewSummary = {
  teacherCount: 856,
  schoolCount: 8,
  participationRate: 85,
  participantCount: 450,
  participationBaseCount: 486,
  averageCompletionRate: 85,
  completionChangeLabel: "较上周 +3.2%",
  completionChangeTone: "success",
  creditReachRate: 80,
  unmetCreditCount: 30,
};

const CURRENT_SCHOOLS: SchoolSeed[] = [
  { id: "lt-school-1", name: "阳光小学", teacherCount: 80, participantCount: 20, participationRate: 25, completionRate: 25, reachRate: 25 },
  { id: "lt-school-2", name: "育才小学", teacherCount: 120, participantCount: 96, participationRate: 80, completionRate: 80, reachRate: 80 },
  { id: "lt-school-3", name: "第一小学", teacherCount: 110, participantCount: 88, participationRate: 80, completionRate: 80, reachRate: 80 },
  { id: "lt-school-4", name: "第二小学", teacherCount: 100, participantCount: 82, participationRate: 82, completionRate: 82, reachRate: 82 },
  { id: "lt-school-5", name: "第三小学", teacherCount: 108, participantCount: 86, participationRate: 80, completionRate: 80, reachRate: 80 },
  { id: "lt-school-6", name: "实验小学", teacherCount: 96, participantCount: 75, participationRate: 78, completionRate: 78, reachRate: 78 },
  { id: "lt-school-7", name: "中心小学", teacherCount: 122, participantCount: 104, participationRate: 85, completionRate: 85, reachRate: 85 },
  { id: "lt-school-8", name: "外国语小学", teacherCount: 120, participantCount: 96, participationRate: 80, completionRate: 80, reachRate: 80 },
];

const SAMPLE_TEACHERS: TeacherSeed[] = [
  seed({ name: "张小明", schoolName: "第一小学", subject: "语文", hoursDone: 24, creditsDone: 8, completionRate: 67, status: "in-progress" }),
  seed({ name: "李芳", schoolName: "第二小学", subject: "数学", hoursDone: 36, creditsDone: 12, completionRate: 100, status: "completed" }),
  seed({ name: "王刚", schoolName: "第一小学", subject: "英语", hoursDone: 12, creditsDone: 4, completionRate: 33, status: "slow" }),
  seed({ name: "陈红", schoolName: "第三小学", subject: "语文", hoursDone: 30, creditsDone: 10, completionRate: 83, status: "near-complete" }),
  seed({ name: "刘伟", schoolName: "第一小学", subject: "数学", hoursDone: 18, creditsDone: 6, completionRate: 50, status: "in-progress" }),
];

const FAMILY_NAMES = ["张", "李", "王", "陈", "刘", "赵", "周", "吴", "郑", "孙", "黄", "林"];
const GIVEN_NAMES = ["明", "芳", "刚", "红", "伟", "敏", "强", "静", "杰", "洋", "丽", "涛"];
const SUBJECTS = ["语文", "数学", "英语", "科学", "道德与法治"];
const SCHOOL_NAMES = CURRENT_SCHOOLS.map((item) => item.name);
const PROGRESS_PATTERNS: TeacherSeed[] = [
  seed({ name: "", schoolName: "", subject: "", hoursDone: 24, creditsDone: 8, completionRate: 67, status: "in-progress" }),
  seed({ name: "", schoolName: "", subject: "", hoursDone: 36, creditsDone: 12, completionRate: 100, status: "completed" }),
  seed({ name: "", schoolName: "", subject: "", hoursDone: 12, creditsDone: 4, completionRate: 33, status: "slow" }),
  seed({ name: "", schoolName: "", subject: "", hoursDone: 30, creditsDone: 10, completionRate: 83, status: "near-complete" }),
  seed({ name: "", schoolName: "", subject: "", hoursDone: 18, creditsDone: 6, completionRate: 50, status: "in-progress" }),
];

const DATASETS: Record<string, OverviewDataset> = {
  "2026-1": {
    summary: CURRENT_SUMMARY,
    schools: CURRENT_SCHOOLS,
    teachers: buildFallTeachers(),
  },
  "2025-2": {
    summary: {
      teacherCount: 120,
      schoolCount: 2,
      participationRate: 80,
      participantCount: 96,
      participationBaseCount: 120,
      averageCompletionRate: 70,
      completionChangeLabel: "较上周 -1.5%",
      completionChangeTone: "danger",
      creditReachRate: 60,
      unmetCreditCount: 48,
    },
    schools: [
      { id: "lt-spring-1", name: "第一小学", teacherCount: 68, participantCount: 54, participationRate: 79, completionRate: 70, reachRate: 58 },
      { id: "lt-spring-2", name: "实验小学", teacherCount: 52, participantCount: 42, participationRate: 81, completionRate: 66, reachRate: 52 },
    ],
    teachers: buildGeneratedTeachers("lt-spring", 20),
  },
  "2025-1": {
    summary: {
      ...CURRENT_SUMMARY,
      averageCompletionRate: 71,
      completionChangeLabel: "较上周 +0.4%",
      creditReachRate: 64,
      unmetCreditCount: 42,
    },
    schools: CURRENT_SCHOOLS,
    teachers: buildFallTeachers(),
  },
};

const EMPTY_SUMMARY: LayeredTrainingOverviewSummary = {
  teacherCount: 0,
  schoolCount: 0,
  participationRate: 0,
  participantCount: 0,
  participationBaseCount: 0,
  averageCompletionRate: 0,
  completionChangeLabel: "较上周 0%",
  completionChangeTone: "default",
  creditReachRate: 0,
  unmetCreditCount: 0,
};

export function queryLayeredTrainingOverview(
  query: LayeredTrainingOverviewQuery,
): LayeredTrainingOverviewResult {
  const dataset = DATASETS[query.semester];
  const schools = sortSchools(
    (dataset?.schools ?? []).filter((item) => matchesSchool(item, query.schoolKeyword)),
    query.schoolSort,
  );
  const teachers = (dataset?.teachers ?? []).filter((item) => matchesTeacher(item, query));
  return {
    summary: dataset?.summary ?? EMPTY_SUMMARY,
    schools: schools.map((item) => toSchool(item)),
    schoolOptions: (dataset?.schools ?? []).map((item) => item.name),
    subjectOptions: uniqueInOrder((dataset?.teachers ?? []).map((item) => item.subject)),
    teachers: paginate(teachers, query.page, query.pageSize).map((item) => ({ ...item })),
    teacherTotal: teachers.length,
  };
}

function seed(input: Omit<TeacherSeed, "hoursTotal" | "creditsTotal">): TeacherSeed {
  return {
    ...input,
    hoursTotal: 36,
    creditsTotal: 12,
  };
}

function buildFallTeachers(): LayeredTrainingOverviewTeacher[] {
  const samples = SAMPLE_TEACHERS.map((item, index) => toTeacher(`lt-teacher-${index + 1}`, item));
  const generated = buildGeneratedTeachers("lt-teacher", 450 - samples.length, samples.length);
  return [...samples, ...generated];
}

function buildGeneratedTeachers(
  idPrefix: string,
  count: number,
  offset = 0,
): LayeredTrainingOverviewTeacher[] {
  return Array.from({ length: count }, (_, index) => {
    const cursor = offset + index;
    return toTeacher(`${idPrefix}-${cursor + 1}`, {
      ...patternAt(cursor),
      name: `${nameAt(FAMILY_NAMES, cursor)}${nameAt(GIVEN_NAMES, cursor * 3)}`,
      schoolName: nameAt(SCHOOL_NAMES, cursor),
      subject: nameAt(SUBJECTS, cursor),
    });
  });
}

function patternAt(index: number): TeacherSeed {
  const pattern = PROGRESS_PATTERNS[index % PROGRESS_PATTERNS.length];
  if (pattern) return pattern;
  throw new Error("研修进度模板不能为空");
}

function nameAt(values: readonly string[], index: number) {
  const value = values[index % values.length];
  if (value) return value;
  throw new Error("研修名单不能为空");
}

function toTeacher(id: string, item: TeacherSeed): LayeredTrainingOverviewTeacher {
  return {
    id,
    name: item.name,
    schoolName: item.schoolName,
    subject: item.subject,
    hoursLabel: `${item.hoursDone}/${item.hoursTotal}`,
    creditsLabel: `${item.creditsDone}/${item.creditsTotal}`,
    completionRate: item.completionRate,
    completionTone: teacherCompletionTone(item.completionRate),
    status: item.status,
  };
}

function toSchool(item: SchoolSeed): LayeredTrainingOverviewSchool {
  return {
    ...item,
    participationTone: schoolRateTone(item.participationRate),
    completionTone: schoolRateTone(item.completionRate),
    reachTone: schoolRateTone(item.reachRate),
  };
}

function sortSchools(schools: readonly SchoolSeed[], sort: LayeredTrainingSchoolSort) {
  const rateOf = (item: SchoolSeed) => {
    if (sort === "participation") return item.participationRate;
    if (sort === "completion") return item.completionRate;
    return item.reachRate;
  };
  return [...schools].sort((left, right) => rateOf(left) - rateOf(right) || left.name.localeCompare(right.name, "zh"));
}

function matchesSchool(item: SchoolSeed, keyword: string) {
  const normalized = keyword.trim();
  return normalized.length === 0 || item.name.includes(normalized);
}

function matchesTeacher(item: LayeredTrainingOverviewTeacher, query: LayeredTrainingOverviewQuery) {
  const schoolName = query.teacherSchool.trim();
  const subject = query.teacherSubject.trim();
  const schoolMatched = schoolName.length === 0 || item.schoolName === schoolName;
  const subjectMatched = subject.length === 0 || item.subject === subject;
  return schoolMatched && subjectMatched;
}

function paginate<T>(rows: readonly T[], page: number, pageSize: number) {
  const size = pageSize > 0 ? pageSize : 10;
  const safePage = page > 0 ? page : 1;
  const start = (safePage - 1) * size;
  return rows.slice(start, start + size);
}

function uniqueInOrder(values: readonly string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}
