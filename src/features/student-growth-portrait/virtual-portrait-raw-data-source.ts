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
  datasetVersion: "2026.07.29-v7",
  academicYear: "2025-2026",
  comparisonPeriods: ["2024-2025-first", "2024-2025-second", "2025-2026-second"],
  notice: "本数据集完全虚构，仅用于本地演示、联调和计算规则验证，不得用于业务决策。",
  studentCount: 72,
  schoolCount: 6,
} as const;

const schoolDefinitions = [
  { id: "virtual-primary-a", name: "虚拟示范小学 A", educationStage: "primary" as const },
  { id: "virtual-primary-b", name: "虚拟示范小学 B", educationStage: "primary" as const },
  { id: "virtual-junior-a", name: "虚拟示范初中 A", educationStage: "junior" as const },
  { id: "virtual-junior-b", name: "虚拟示范初中 B", educationStage: "junior" as const },
  { id: "virtual-senior-a", name: "虚拟示范高中 A", educationStage: "senior" as const },
  { id: "virtual-senior-b", name: "虚拟示范高中 B", educationStage: "senior" as const },
] as const;

const schoolVariationProfiles = [
  { evaluationCoverage: 12, fitnessCoverage: 11, honorCoverage: 10, libraryVisitCoverage: 11, bookBorrowCoverage: 10, practiceCoverage: 12, dailyCoverage: 11, exerciseCoverage: 12, runCoverage: 10, academicOffset: -6, finalDelta: -2 },
  { evaluationCoverage: 10, fitnessCoverage: 9, honorCoverage: 7, libraryVisitCoverage: 8, bookBorrowCoverage: 7, practiceCoverage: 9, dailyCoverage: 8, exerciseCoverage: 8, runCoverage: 12, academicOffset: 4, finalDelta: 5 },
  { evaluationCoverage: 11, fitnessCoverage: 12, honorCoverage: 12, libraryVisitCoverage: 12, bookBorrowCoverage: 11, practiceCoverage: 10, dailyCoverage: 12, exerciseCoverage: 10, runCoverage: 8, academicOffset: -2, finalDelta: 1 },
  { evaluationCoverage: 9, fitnessCoverage: 10, honorCoverage: 8, libraryVisitCoverage: 9, bookBorrowCoverage: 8, practiceCoverage: 7, dailyCoverage: 9, exerciseCoverage: 7, runCoverage: 11, academicOffset: 7, finalDelta: -3 },
  { evaluationCoverage: 12, fitnessCoverage: 8, honorCoverage: 9, libraryVisitCoverage: 10, bookBorrowCoverage: 12, practiceCoverage: 11, dailyCoverage: 10, exerciseCoverage: 11, runCoverage: 7, academicOffset: -5, finalDelta: 6 },
  { evaluationCoverage: 8, fitnessCoverage: 12, honorCoverage: 11, libraryVisitCoverage: 7, bookBorrowCoverage: 9, practiceCoverage: 8, dailyCoverage: 7, exerciseCoverage: 9, runCoverage: 9, academicOffset: 6, finalDelta: 2 },
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
const dailyThemes = ["课堂参与", "任务坚持", "同伴互助", "劳动实践", "阅读习惯", "体育锻炼"] as const;
const bookCategories = ["文学", "科学", "历史", "艺术", "社科"] as const;
const honorAwardTypes = [
  "outstanding-student",
  "subject-competition",
  "academic-innovation",
  "social-practice",
  "student-leader",
  "sports-competition",
  "artistic-performance",
  "art-work",
  "student-scholarship",
  "campus-culture-art",
  "financial-aid",
  "work-study",
  "other",
] as const;
const honorLevels = [
  "international",
  "national",
  "provincial",
  "city",
  "district",
  "school",
  "other",
] as const;
const honorAwardGrades = ["special", "first", "second", "third", "other"] as const;

function gradeForStudent(
  educationStage: (typeof schoolDefinitions)[number]["educationStage"],
  studentIndex: number,
) {
  if (educationStage === "primary") return studentIndex < 6 ? "四年级" : "五年级";
  if (educationStage === "junior") return studentIndex < 6 ? "七年级" : "八年级";
  return studentIndex < 6 ? "高一" : "高二";
}

function subjectsForStage(educationStage: (typeof schoolDefinitions)[number]["educationStage"]) {
  return educationStage === "primary" ? ["语文", "数学", "英语"] : ["语文", "数学", "英语", "科学"];
}

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
    const variation = schoolVariationProfiles[schoolIndex]!;
    for (let studentIndex = 0; studentIndex < 12; studentIndex += 1) {
      const ordinal = studentIndex + 1;
      const studentId = `${school.id}-student-${String(ordinal).padStart(2, "0")}`;
      const grade = gradeForStudent(school.educationStage, studentIndex);
      const gradePeers = 12;
      const gradeRankSeed = (studentIndex % 6) + 1 + (schoolIndex % 2) * 6;
      const recordId = (kind: string) => `${kind}-${schoolIndex + 1}-${ordinal}`;
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
        grade,
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
        if (studentIndex < variation.evaluationCoverage) {
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
          if (studentIndex % 4 === dimensionIndex % 4) {
            events.push({
              ...base(`evaluation-extra-${dimension}`, dimensionIndex + 60),
              evaluationFormVersion: "five-education-form/2025-v1",
              dimension,
              item: `${dimension}-专项观察`,
              level: studentIndex % 5 === 0 ? "needs-effort" : studentIndex % 2 === 0 ? "excellent" : "average",
              detail: "同学期二次评价，用于丰富等级分布。",
            });
          }
        }
      });

      subjectsForStage(school.educationStage).forEach((subject, subjectIndex) => {
        const gradeOffset = studentIndex < 6 ? -3 : 4;
        const midtermScore = Math.max(
          40,
          Math.min(98, 58 + variation.academicOffset + gradeOffset + subjectIndex * 2 + ((studentIndex * 7) % 31)),
        );
        const finalScore = Math.max(
          40,
          Math.min(100, midtermScore + variation.finalDelta + (studentIndex % 3) - 1),
        );
        events.push({
          ...base(`exam-midterm-${subjectIndex}`, 12 + subjectIndex),
          examId: `district-unified-${school.educationStage}-${grade}-2025-first-midterm`,
          examName: `${grade}期中统考`,
          examType: "midterm",
          administrationScope: "district-unified",
          assessmentProgramId: `district-unified/${school.educationStage}/${grade}/2025-first`,
          paperVersion: `district-paper/${school.educationStage}/${grade}/2025-first-v1`,
          assessmentGrade: grade,
          subject,
          score: midtermScore,
          fullScore: 100,
          rank: gradeRankSeed,
          comparableStudentCount: gradePeers,
          comparableScope: "district-unified",
          examAt: "2025-10-30T08:00:00.000Z",
        });
        events.push({
          ...base(`exam-final-${subjectIndex}`, 20 + subjectIndex),
          examId: `district-unified-${school.educationStage}-${grade}-2025-first-final`,
          examName: `${grade}期末统考`,
          examType: "final",
          administrationScope: "district-unified",
          assessmentProgramId: `district-unified/${school.educationStage}/${grade}/2025-first`,
          paperVersion: `district-paper/${school.educationStage}/${grade}/2025-first-v1`,
          assessmentGrade: grade,
          subject,
          score: finalScore,
          fullScore: 100,
          rank: ((gradeRankSeed + 10) % gradePeers) + 1,
          comparableStudentCount: gradePeers,
          comparableScope: "district-unified",
          examAt: "2025-12-28T08:00:00.000Z",
        });
        if (subjectIndex === 1 && studentIndex % 3 !== 2) {
          events.push({
            ...base(`exam-diagnostic-${subjectIndex}`, 70 + subjectIndex),
            examId: `district-unified-${school.educationStage}-${grade}-2025-first-diagnostic`,
            examName: `${grade}阶段诊断`,
            examType: "diagnostic",
            administrationScope: "district-unified",
            assessmentProgramId: `district-unified/${school.educationStage}/${grade}/2025-first`,
            paperVersion: `district-paper/${school.educationStage}/${grade}/2025-first-diagnostic-v1`,
            assessmentGrade: grade,
            subject,
            score: Math.max(40, midtermScore - 3),
            fullScore: 100,
            rank: gradeRankSeed,
            comparableStudentCount: gradePeers,
            comparableScope: "district-unified",
            examAt: "2025-09-18T08:00:00.000Z",
          });
        }
      });

      const hasHonorRecord = studentIndex < variation.honorCoverage;
      if (hasHonorRecord && studentIndex % 2 === 0) {
        events.push({
          ...base("honor", 25),
          kind: studentIndex % 4 === 0 ? "award" : "title",
          name: studentIndex % 4 === 0 ? "虚拟综合实践奖" : "虚拟成长之星",
          level: honorLevels[(schoolIndex * 2 + studentIndex) % honorLevels.length],
          awardType: honorAwardTypes[(schoolIndex * 3 + studentIndex) % honorAwardTypes.length],
          awardGrade: honorAwardGrades[(schoolIndex + studentIndex) % honorAwardGrades.length],
          category: studentIndex % 4 === 0 ? "实践" : "成长",
          organizer: "虚拟教育机构",
          competitionName: studentIndex % 4 === 0 ? "虚拟综合实践活动" : undefined,
          receivedAt: "2025-11-20T08:00:00.000Z",
          isTeamAward: false,
        });
      }
      if (hasHonorRecord && studentIndex % 3 === 0) {
        events.push({
          ...base("honor-medal", 26),
          kind: "medal",
          name: "虚拟体育达标章",
          level: honorLevels[(schoolIndex + studentIndex + 2) % honorLevels.length],
          awardType: "sports-competition",
          awardGrade: honorAwardGrades[(schoolIndex + studentIndex + 1) % honorAwardGrades.length],
          category: "体育",
          organizer: "虚拟体卫艺中心",
          receivedAt: "2025-10-28T08:00:00.000Z",
          isTeamAward: studentIndex % 6 === 0,
        });
      }
      if (hasHonorRecord && (studentIndex === 1 || studentIndex === 4)) {
        events.push({
          ...base("honor-team", 27),
          kind: "award",
          name: "虚拟校园艺术节集体奖",
          level: "district",
          awardType: studentIndex === 1 ? "artistic-performance" : "campus-culture-art",
          awardGrade: studentIndex === 1 ? "first" : "second",
          category: "艺术",
          organizer: "虚拟教育局",
          competitionName: "虚拟校园艺术节",
          receivedAt: "2025-12-05T08:00:00.000Z",
          isTeamAward: true,
        });
      }

      if (studentIndex < variation.fitnessCoverage) {
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
      }

      if (studentIndex < variation.exerciseCoverage) {
        exerciseTypes.forEach((exerciseType, exerciseIndex) => {
          events.push({
            ...base(`ai-exercise-${exerciseIndex}`, 38 + exerciseIndex),
            exerciseType,
            sessionCount: 2 + ((studentIndex + exerciseIndex + schoolIndex) % 5),
            completedAt: `2025-11-${String(5 + exerciseIndex).padStart(2, "0")}T16:00:00.000Z`,
            isVerified: studentIndex !== 11,
          });
          if (studentIndex % 2 === exerciseIndex % 2) {
            events.push({
              ...base(`ai-exercise-extra-${exerciseIndex}`, 80 + exerciseIndex),
              exerciseType,
              sessionCount: 1 + (studentIndex % 3),
              completedAt: `2025-12-${String(2 + exerciseIndex).padStart(2, "0")}T16:00:00.000Z`,
              isVerified: studentIndex !== 10,
            });
          }
        });
      }

      if (studentIndex < variation.runCoverage) {
        [0, 1, 2].forEach((runIndex) => {
          if (studentIndex === 8 && runIndex === 2) return;
          events.push({
            ...base(`sunshine-run-${runIndex}`, 45 + runIndex),
            distanceKilometers: Number((1.2 + studentIndex * 0.1 + runIndex * 0.3).toFixed(1)),
            durationSeconds: 420 + studentIndex * 18 + runIndex * 40,
            completedAt: `2025-11-${String(12 + runIndex * 5).padStart(2, "0")}T16:00:00.000Z`,
            isValidRun: !(studentIndex === 7 && runIndex === 0),
          });
        });
      }

      if (studentIndex < variation.libraryVisitCoverage) {
        events.push({
          ...base("library-visit", 46),
          enteredAt: "2025-11-08T15:00:00.000Z",
          leftAt: `2025-11-08T${String(15 + (studentIndex % 2)).padStart(2, "0")}:35:00.000Z`,
        });
        events.push({
          ...base("library-visit-2", 90),
          enteredAt: "2025-11-22T15:00:00.000Z",
          leftAt: "2025-11-22T16:10:00.000Z",
        });
      }
      if (studentIndex < variation.bookBorrowCoverage) {
        events.push({
          ...base("book-borrow", 47),
          bookId: `virtual-book-${schoolIndex + 1}-${ordinal}`,
          category: bookCategories[studentIndex % bookCategories.length]!,
          borrowedAt: "2025-11-08T15:10:00.000Z",
          returnedAt: "2025-11-22T15:10:00.000Z",
        });
        if (studentIndex % 2 === 0) {
          events.push({
            ...base("book-borrow-2", 91),
            bookId: `virtual-book-${schoolIndex + 1}-${ordinal}-b`,
            category: bookCategories[(studentIndex + 2) % bookCategories.length]!,
            borrowedAt: "2025-12-01T15:10:00.000Z",
            returnedAt: "2025-12-15T15:10:00.000Z",
          });
        }
      }

      [0, 1, 2].forEach((attendanceIndex) => {
        events.push({
          ...base(`attendance-${attendanceIndex}`, 48 + attendanceIndex),
          type: studentIndex === 6 && attendanceIndex === 0
            ? "late"
            : studentIndex === 7 && attendanceIndex === 1
              ? "sick-leave"
              : studentIndex === 9 && attendanceIndex === 2
                ? "early-leave"
                : "normal",
          durationMinutes: studentIndex === 6 && attendanceIndex === 0 ? 12 : 0,
          recordedAt: `2025-11-${String(10 + attendanceIndex).padStart(2, "0")}T07:40:00.000Z`,
        });
      });

      (["breakfast", "lunch", "dinner", "stationery"] as const).forEach((category, categoryIndex) => {
        events.push({
          ...base(`consumption-${category}`, 49 + categoryIndex),
          category,
          amount: 3 + categoryIndex * 4 + (studentIndex % 3),
          consumedAt: `2025-11-${String(11 + categoryIndex).padStart(2, "0")}T12:00:00.000Z`,
        });
      });
      if (studentIndex === 5 || studentIndex === 9) {
        events.push({
          ...base("clinic", 4),
          symptomCodes: studentIndex === 5 ? ["cough", "fever"] : ["headache"],
          visitedAt: studentIndex === 5 ? "2025-10-04T10:00:00.000Z" : "2025-11-18T10:00:00.000Z",
          isInfectiousDiseaseHistory: false,
        });
      }

      practiceCategories.forEach((category, categoryIndex) => {
        if (studentIndex >= variation.practiceCoverage) return;
        if (studentIndex === 9 && categoryIndex > 3) return;
        events.push({
          ...base(`practice-${category}`, 5 + categoryIndex),
          activityId: `virtual-practice-${schoolIndex + 1}-${categoryIndex + 1}`,
          category,
          participatedAt: `2025-10-${String(5 + categoryIndex).padStart(2, "0")}T14:00:00.000Z`,
          isVerified: studentIndex !== 7 && !(studentIndex === 10 && category === "club"),
        });
        if (category === "volunteer" && studentIndex % 3 === 0) {
          events.push({
            ...base("practice-volunteer-extra", 95),
            activityId: `virtual-practice-${schoolIndex + 1}-volunteer-extra`,
            category,
            participatedAt: "2025-12-03T14:00:00.000Z",
            isVerified: true,
          });
        }
      });

      if (studentIndex < variation.dailyCoverage) {
        dailyThemes.forEach((theme, themeIndex) => {
          if (studentIndex === 11 && themeIndex > 2) return;
          const isPraise = (studentIndex + themeIndex + schoolIndex) % 3 !== 0;
          events.push({
            ...base(`daily-${themeIndex}`, 14 + themeIndex),
            type: isPraise ? "praise" : "improvement",
            theme,
            evaluatedAt: `2025-10-${String(14 + themeIndex).padStart(2, "0")}T12:00:00.000Z`,
            evaluatorRole: themeIndex % 2 === 0 ? "teacher" : "class-teacher",
            evaluationFormVersion: "daily-evaluation/2025-v1",
          });
        });
      }
    }
  });

  const comparisonEvents = [
    ...buildPeriodEvents(events, {
      academicYear: "2024-2025",
      term: "first",
      scoreAdjustment: -4,
      coverageStudentLimit: 8,
    }),
    ...buildPeriodEvents(events, {
      academicYear: "2024-2025",
      term: "second",
      scoreAdjustment: -2,
      coverageStudentLimit: 10,
    }),
    ...buildPeriodEvents(events, {
      academicYear: "2025-2026",
      term: "second",
      scoreAdjustment: 2,
      coverageStudentLimit: 12,
    }),
  ];

  return { students, events: [...events, ...comparisonEvents] };
}

function cloneEvent(record: StudentPortraitEventRecord): StudentPortraitEventRecord {
  return "symptomCodes" in record
    ? { ...record, symptomCodes: [...record.symptomCodes] }
    : { ...record };
}

interface VirtualPeriod {
  academicYear: string;
  term: Exclude<AcademicTerm, "whole-year">;
  scoreAdjustment: number;
  coverageStudentLimit: number;
}

const eventDateFields = [
  "occurredAt",
  "importedAt",
  "examAt",
  "receivedAt",
  "testedAt",
  "completedAt",
  "enteredAt",
  "leftAt",
  "borrowedAt",
  "returnedAt",
  "recordedAt",
  "consumedAt",
  "visitedAt",
  "participatedAt",
  "evaluatedAt",
] as const;

function remapTimestamp(timestamp: string, period: VirtualPeriod) {
  const [startYear] = period.academicYear.split("-").map(Number);
  const targetYear = period.term === "first" ? startYear : startYear! + 1;
  const sourceMonth = Number(timestamp.slice(5, 7));
  const targetMonth = period.term === "first"
    ? sourceMonth
    : sourceMonth === 10 ? 3 : sourceMonth === 11 ? 4 : 6;
  return `${targetYear}-${String(targetMonth).padStart(2, "0")}${timestamp.slice(7)}`;
}

function studentOrdinal(studentId: string) {
  return Number(studentId.slice(-2));
}

function isCoverageFact(record: StudentPortraitEventRecord) {
  return "examId" in record
    || ("evaluationFormVersion" in record && "dimension" in record)
    || "testBatchId" in record
    || ("kind" in record && "receivedAt" in record)
    || "bookId" in record
    || "activityId" in record
    || ("evaluatedAt" in record && "type" in record);
}

function buildPeriodEvents(
  sourceEvents: StudentPortraitEventRecord[],
  period: VirtualPeriod,
): StudentPortraitEventRecord[] {
  const periodKey = `${period.academicYear}-${period.term}`;
  return sourceEvents.flatMap((sourceRecord) => {
    const ordinal = studentOrdinal(sourceRecord.studentId);
    if (isCoverageFact(sourceRecord) && ordinal > period.coverageStudentLimit) return [];
    if (
      "evaluatedAt" in sourceRecord
      && sourceRecord.type === "improvement"
      && period.term === "second"
      && ordinal % 3 === 0
    ) return [];

    const record = cloneEvent(sourceRecord);
    const mutableRecord = record as unknown as Record<string, unknown>;
    eventDateFields.forEach((field) => {
      const value = mutableRecord[field];
      if (typeof value === "string") mutableRecord[field] = remapTimestamp(value, period);
    });

    record.id = `${sourceRecord.id}-${periodKey}`;
    record.sourceRecordId = `${sourceRecord.sourceRecordId}-${periodKey}`;
    record.academicYear = period.academicYear;
    record.term = period.term;

    if ("examId" in record) {
      record.examId = record.examId.replace("2025-first", periodKey);
      record.assessmentProgramId = record.assessmentProgramId.replace("2025-first", periodKey);
      record.paperVersion = record.paperVersion.replace("2025-first", periodKey);
      record.score = Math.max(0, Math.min(record.fullScore, record.score + period.scoreAdjustment));
    }
    if ("testBatchId" in record) {
      const testBatchParts = record.testBatchId.split("-");
      record.testBatchId = `virtual-fitness-${periodKey}-${testBatchParts[testBatchParts.length - 1]}`;
    }

    return [record];
  });
}

const virtualPortraitRawData = buildVirtualRawData();

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
      .filter((event) => !query.subjects?.length || !("examId" in event) || query.subjects.includes(event.subject))
      .map(cloneEvent);

    return { students, events };
  },
};
