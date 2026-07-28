import type {
  AcademicTerm,
  PortraitQuery,
  PortraitRawData,
  StudentPortraitEventRecord,
  StudentProfileRecord,
} from "./data-contract";
import type { PortraitRawDataSource } from "./student-growth-portrait-repository";

/**
 * 仅用于本地/演示环境的确定性原始数据源。
 *
 * 所有学校、学生标识和业务记录均为虚构；它模拟的是上游系统返回的原始记录，
 * 而非页面可直接消费的统计数字。接入真实系统时，只需替换本文件导出的 source。
 */
export const virtualPortraitDataMetadata = {
  isVirtual: true,
  sourceSystem: "local-student-growth-demo",
  datasetVersion: "2026.07.27-v3",
  academicYear: "2025-2026",
  notice: "本数据集完全虚构，仅用于本地演示、联调和计算规则验证，不得用于业务决策。",
  studentCount: 72,
  schoolCount: 6,
} as const;

const schoolDefinitions = [
  { id: "virtual-primary-a", name: "虚拟示范小学 A", educationStage: "primary", grade: "四年级" },
  { id: "virtual-primary-b", name: "虚拟示范小学 B", educationStage: "primary", grade: "四年级" },
  { id: "virtual-junior-a", name: "虚拟示范初中 A", educationStage: "junior", grade: "七年级" },
  { id: "virtual-junior-b", name: "虚拟示范初中 B", educationStage: "junior", grade: "七年级" },
  { id: "virtual-senior-a", name: "虚拟示范高中 A", educationStage: "senior", grade: "高一" },
  { id: "virtual-senior-b", name: "虚拟示范高中 B", educationStage: "senior", grade: "高一" },
] as const;

/** 虚拟学校 ID 到展示名的映射；真实环境应改由组织主数据服务提供。 */
export const virtualPortraitSchoolNames: Readonly<Record<string, string>> = Object.fromEntries(
  schoolDefinitions.map((school) => [school.id, school.name]),
);

const academicYear = virtualPortraitDataMetadata.academicYear;
const importedAt = "2026-01-15T08:00:00.000Z";
const fiveEducationDimensions = ["moral", "intellectual", "physical", "aesthetic", "labor"] as const;
const fitnessMetrics = [
  ["height", "cm"],
  ["weight", "kg"],
  ["bmi", "kg/m²"],
  ["cardiopulmonary", "score"],
  ["speed", "score"],
  ["endurance", "score"],
  ["core-strength", "score"],
  ["lower-limb-strength", "score"],
  ["flexibility", "score"],
] as const;
const exerciseTypes = [
  "high-knees",
  "squat",
  "jumping-jack",
  "squat-jump",
  "side-to-side-jump",
  "sit-and-reach",
] as const;
const practiceCategories = ["moral", "intellectual", "physical", "aesthetic", "labor", "club", "volunteer"] as const;

function sourceFields(id: string, studentId: string, schoolId: string, day: number, term: AcademicTerm = "first") {
  const month = 10 + Math.floor((day - 1) / 28);
  const dayOfMonth = ((day - 1) % 28) + 1;
  const date = `2025-${String(month).padStart(2, "0")}-${String(dayOfMonth).padStart(2, "0")}`;
  return {
    id,
    studentId,
    schoolId,
    occurredAt: `${date}T08:00:00.000Z`,
    academicYear,
    term,
    sourceSystem: virtualPortraitDataMetadata.sourceSystem,
    sourceRecordId: id,
    status: "valid" as const,
    importedAt,
  };
}

function buildVirtualRawData(): PortraitRawData {
  const students: StudentProfileRecord[] = [];
  const events: StudentPortraitEventRecord[] = [];

  schoolDefinitions.forEach((school, schoolIndex) => {
    for (let studentIndex = 0; studentIndex < 12; studentIndex += 1) {
      const ordinal = studentIndex + 1;
      const studentId = `${school.id}-student-${String(ordinal).padStart(2, "0")}`;
      const recordId = (kind: string) => `${kind}-${schoolIndex + 1}-${ordinal}`;
      const unifiedRank = studentIndex + 1 + (schoolIndex % 2) * 12;
      const goalCredits = 20 + (studentIndex % 3) * 2;
      const earnedCredits = goalCredits - ((studentIndex + schoolIndex) % 4);
      const standardStatus = studentIndex === 11 ? "fail" : studentIndex % 3 === 0 ? "good" : "pass";
      const base = (kind: string, offset: number, term: AcademicTerm = "first") => sourceFields(
        recordId(kind), studentId, school.id, 10 + ((studentIndex * 3 + schoolIndex + offset) % 50), term,
      );

      students.push({
        studentId,
        schoolId: school.id,
        educationStage: school.educationStage,
        grade: school.grade,
        classId: `${school.id}-class-${studentIndex < 6 ? "01" : "02"}`,
        enrollmentStatus: "active",
        enrolledAt: school.educationStage === "primary" ? "2022-09-01" : school.educationStage === "junior" ? "2023-09-01" : "2024-09-01",
        sex: studentIndex % 2 === 0 ? "female" : "male",
      });

      fiveEducationDimensions.forEach((dimension, dimensionIndex) => {
        events.push({
          ...base(`goal-${dimension}`, dimensionIndex),
          targetCredits: goalCredits,
          earnedCredits: Math.max(0, earnedCredits - (dimensionIndex === 4 ? 1 : 0)),
          goalCategory: dimension,
        });
        events.push({
          ...base(`evaluation-${dimension}`, dimensionIndex + 5),
          evaluationFormVersion: "five-education-form/2025-v1",
          dimension,
          item: `${dimension}-成长表现`,
          level: (studentIndex + dimensionIndex + schoolIndex) % 6 === 0
            ? "needs-effort"
            : (studentIndex + dimensionIndex) % 3 === 0 ? "average" : "excellent",
          detail: "虚拟评价明细，仅用于演示评价表记录结构。",
        });
      });

      ["语文", "数学", "英语"].forEach((subject, subjectIndex) => {
        events.push({
          ...base(`exam-midterm-${subjectIndex}`, 12 + subjectIndex),
          examId: `district-unified-${school.educationStage}-${school.grade}-2025-first-midterm`,
          examName: `${school.grade}期中统考`,
          examType: "midterm",
          administrationScope: "district-unified",
          assessmentProgramId: `district-unified/${school.educationStage}/${school.grade}/2025-first`,
          paperVersion: `district-paper/${school.educationStage}/${school.grade}/2025-first-v1`,
          assessmentGrade: school.grade,
          subject,
          score: 48 + ((studentIndex * 7 + schoolIndex * 3 + subjectIndex * 5) % 50),
          fullScore: 100,
          rank: unifiedRank,
          comparableStudentCount: 24,
          comparableScope: "district-unified",
          examAt: "2025-10-30T08:00:00.000Z",
        });
        events.push({
          ...base(`exam-final-${subjectIndex}`, 20 + subjectIndex),
          examId: `district-unified-${school.educationStage}-${school.grade}-2025-first-final`,
          examName: `${school.grade}期末统考`,
          examType: "final",
          administrationScope: "district-unified",
          assessmentProgramId: `district-unified/${school.educationStage}/${school.grade}/2025-first`,
          paperVersion: `district-paper/${school.educationStage}/${school.grade}/2025-first-v1`,
          assessmentGrade: school.grade,
          subject,
          score: 52 + ((studentIndex * 7 + schoolIndex * 3 + subjectIndex * 5) % 46),
          fullScore: 100,
          rank: ((unifiedRank + 22) % 24) + 1,
          comparableStudentCount: 24,
          comparableScope: "district-unified",
          examAt: "2025-12-28T08:00:00.000Z",
        });
      });

      if (studentIndex % 2 === 0) {
        events.push({
          ...base("honor", 25),
          kind: studentIndex % 4 === 0 ? "award" : "title",
          name: studentIndex % 4 === 0 ? "虚拟综合实践奖" : "虚拟成长之星",
          level: studentIndex % 4 === 0 ? "district" : "school",
          category: studentIndex % 4 === 0 ? "实践" : "成长",
          organizer: "虚拟教育机构",
          competitionName: studentIndex % 4 === 0 ? "虚拟综合实践活动" : undefined,
          receivedAt: "2025-11-20T08:00:00.000Z",
          isTeamAward: false,
        });
      }

      fitnessMetrics.forEach(([metric, unit], metricIndex) => {
        const value = metric === "height"
          ? 135 + schoolIndex * 4 + studentIndex
          : metric === "weight"
            ? 32 + schoolIndex * 2 + studentIndex
            : metric === "bmi"
              ? Number((16.5 + schoolIndex * 0.4 + studentIndex * 0.35).toFixed(1))
              : 60 + ((studentIndex * 5 + metricIndex * 3 + schoolIndex) % 35);
        events.push({
          ...base(`fitness-${metric}`, 28 + metricIndex),
          testBatchId: `virtual-fitness-2025-${school.educationStage}`,
          metric,
          value,
          unit,
          standardStatus,
          standardVersion: "national-student-fitness/2014-revised",
          testedAt: "2025-10-15T08:00:00.000Z",
        });
      });

      exerciseTypes.forEach((exerciseType, exerciseIndex) => {
        events.push({
          ...base(`ai-exercise-${exerciseIndex}`, 38 + exerciseIndex),
          exerciseType,
          sessionCount: 2 + ((studentIndex + exerciseIndex + schoolIndex) % 5),
          completedAt: `2025-11-${String(5 + exerciseIndex).padStart(2, "0")}T16:00:00.000Z`,
          isVerified: studentIndex !== 11,
        });
      });
      events.push({
        ...base("sunshine-run", 45),
        distanceKilometers: Number((1.2 + studentIndex * 0.1).toFixed(1)),
        durationSeconds: 420 + studentIndex * 18,
        completedAt: "2025-11-22T16:00:00.000Z",
        isValidRun: studentIndex !== 7,
      });

      events.push({
        ...base("library-visit", 46),
        enteredAt: "2025-11-08T15:00:00.000Z",
        leftAt: `2025-11-08T${String(15 + (studentIndex % 2)).padStart(2, "0")}:35:00.000Z`,
      });
      events.push({
        ...base("book-borrow", 47),
        bookId: `virtual-book-${schoolIndex + 1}-${ordinal}`,
        category: ["文学", "科学", "历史", "艺术"][studentIndex % 4]!,
        borrowedAt: "2025-11-08T15:10:00.000Z",
        returnedAt: "2025-11-22T15:10:00.000Z",
      });
      events.push({
        ...base("attendance", 48),
        type: studentIndex === 6 ? "late" : studentIndex === 7 ? "sick-leave" : "normal",
        durationMinutes: studentIndex === 6 ? 12 : 0,
        recordedAt: "2025-11-10T07:40:00.000Z",
      });
      (["breakfast", "lunch", "dinner", "stationery"] as const).forEach((category, categoryIndex) => {
        events.push({
          ...base(`consumption-${category}`, 49 + categoryIndex),
          category,
          amount: 3 + categoryIndex * 4 + (studentIndex % 3),
          consumedAt: `2025-11-${String(11 + categoryIndex).padStart(2, "0")}T12:00:00.000Z`,
        });
      });
      if (studentIndex === 5) {
        events.push({
          ...base("clinic", 4),
          symptomCodes: ["cough", "fever"],
          visitedAt: "2025-10-04T10:00:00.000Z",
          isInfectiousDiseaseHistory: false,
        });
      }

      practiceCategories.forEach((category, categoryIndex) => {
        events.push({
          ...base(`practice-${category}`, 5 + categoryIndex),
          activityId: `virtual-practice-${schoolIndex + 1}-${categoryIndex + 1}`,
          category,
          participatedAt: `2025-10-${String(5 + categoryIndex).padStart(2, "0")}T14:00:00.000Z`,
          isVerified: studentIndex !== 7,
        });
      });
      events.push({
        ...base("daily-praise", 14),
        type: "praise",
        theme: "课堂参与",
        evaluatedAt: "2025-10-14T12:00:00.000Z",
        evaluatorRole: "teacher",
        evaluationFormVersion: "daily-evaluation/2025-v1",
      });
      events.push({
        ...base("daily-improvement", 15),
        type: "improvement",
        theme: "任务坚持",
        evaluatedAt: "2025-10-15T12:00:00.000Z",
        evaluatorRole: "teacher",
        evaluationFormVersion: "daily-evaluation/2025-v1",
      });
    }
  });

  return { students, events };
}

const virtualPortraitRawData = buildVirtualRawData();

function cloneEvent(record: StudentPortraitEventRecord): StudentPortraitEventRecord {
  return "symptomCodes" in record
    ? { ...record, symptomCodes: [...record.symptomCodes] }
    : { ...record };
}

function matchesQuery(student: StudentProfileRecord, query: PortraitQuery) {
  return (!query.schoolIds?.length || query.schoolIds.includes(student.schoolId))
    && (!query.educationStages?.length || query.educationStages.includes(student.educationStage))
    && (!query.grades?.length || query.grades.includes(student.grade));
}

/** 可替代真实 API 适配器的本地 source；返回值会随查询条件过滤且不暴露内部可变数组。 */
export const virtualPortraitRawDataSource: PortraitRawDataSource = {
  async load(query, signal) {
    if (signal?.aborted) throw new DOMException("Portrait query aborted", "AbortError");

    const students = virtualPortraitRawData.students
      .filter((student) => matchesQuery(student, query))
      .map((student) => ({ ...student }));
    const selectedStudentIds = new Set(students.map((student) => student.studentId));
    const events = virtualPortraitRawData.events
      .filter((event) => selectedStudentIds.has(event.studentId))
      .filter((event) => query.academicYears.includes(event.academicYear))
      .filter((event) => !query.terms?.length || query.terms.includes(event.term))
      .map(cloneEvent);

    return { students, events };
  },
};
