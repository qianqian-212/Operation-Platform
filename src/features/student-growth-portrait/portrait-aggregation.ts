import type {
  AcademicExamRecord,
  AcademicScoreBand,
  AiExerciseRecord,
  AttentionSignal,
  BookBorrowRecord,
  ConsumptionRecord,
  GradePortraitSummary,
  GrowthEvaluationRecord,
  GrowthGoalRecord,
  HonorRecord,
  LibraryVisitRecord,
  MetricQuality,
  PortraitDataset,
  PortraitDistribution,
  PortraitDomain,
  PortraitMetric,
  PortraitPopulation,
  PortraitQuery,
  PortraitRawData,
  PracticeActivityCategory,
  PracticeActivityRecord,
  SchoolPortraitSummary,
  StudentPortraitEventRecord,
  SunshineRunRecord,
  PhysicalFitnessTestRecord,
  StudentProfileRecord,
  UnifiedExamSummary,
  UnifiedExamTrend,
} from "./data-contract";

export interface PortraitAggregationRules {
  version: string;
  minimumCoverageRate: number;
  minimumPublishableGroupSize: number;
  academicScoreBandPolicy: {
    version: string;
    excellentMinimumRate: number;
    goodMinimumRate: number;
    passMinimumRate: number;
  };
}

export const defaultPortraitAggregationRules: PortraitAggregationRules = {
  version: "student-growth-aggregation/v3",
  minimumCoverageRate: 0.8,
  minimumPublishableGroupSize: 10,
  academicScoreBandPolicy: {
    version: "academic-score-band/demo-v1",
    excellentMinimumRate: 85,
    goodMinimumRate: 75,
    passMinimumRate: 60,
  },
};

const fullDistrictPopulation = (studentCount: number): PortraitPopulation => ({
  scope: "district",
  eligibleStudentCount: studentCount,
});

const rollingWindowDays = [7, 30] as const;
const practiceCategories: readonly PracticeActivityCategory[] = [
  "moral",
  "intellectual",
  "physical",
  "aesthetic",
  "labor",
  "club",
  "volunteer",
];

function percent(numerator: number, denominator: number) {
  return denominator > 0 ? Number(((numerator / denominator) * 100).toFixed(2)) : 0;
}

function distinctStudentIds(records: readonly { studentId: string }[]) {
  return new Set(records.map((record) => record.studentId));
}

function latestRecordAt(records: readonly StudentPortraitEventRecord[]) {
  return records.reduce<string | undefined>((latest, record) => (
    !latest || record.occurredAt > latest ? record.occurredAt : latest
  ), undefined);
}

function qualityFor(
  eligibleStudentCount: number,
  records: readonly StudentPortraitEventRecord[],
): MetricQuality {
  const observedStudentCount = distinctStudentIds(records).size;
  const coverageRate = percent(observedStudentCount, eligibleStudentCount);
  return {
    status: eligibleStudentCount === 0 || observedStudentCount === 0
      ? "insufficient"
      : coverageRate === 100 ? "ready" : "partial",
    eligibleStudentCount,
    observedStudentCount,
    coverageRate,
    validRecordCount: records.length,
    sourceFreshnessAt: latestRecordAt(records),
  };
}

function metric(
  key: string,
  domain: PortraitDomain,
  value: number,
  unit: string,
  population: PortraitPopulation,
  quality: MetricQuality,
  numerator?: number,
  denominator?: number,
  comparability: PortraitMetric["comparability"] = "district-comparable",
): PortraitMetric {
  return {
    key,
    domain,
    value,
    unit,
    numerator,
    denominator,
    population,
    quality,
    comparability,
    calculationVersion: defaultPortraitAggregationRules.version,
  };
}

function isGrowthGoal(record: StudentPortraitEventRecord): record is GrowthGoalRecord {
  return "targetCredits" in record;
}

function isGrowthEvaluation(record: StudentPortraitEventRecord): record is GrowthEvaluationRecord {
  return "evaluationFormVersion" in record && "level" in record;
}

function isAcademicExam(record: StudentPortraitEventRecord): record is AcademicExamRecord {
  return "examId" in record;
}

function isDistrictUnifiedExam(record: AcademicExamRecord) {
  return record.administrationScope === "district-unified" && record.comparableScope === "district-unified";
}

function isHonor(record: StudentPortraitEventRecord): record is HonorRecord {
  return "receivedAt" in record && "kind" in record;
}

function isAiExercise(record: StudentPortraitEventRecord): record is AiExerciseRecord {
  return "exerciseType" in record;
}

function isSunshineRun(record: StudentPortraitEventRecord): record is SunshineRunRecord {
  return "distanceKilometers" in record;
}

function isPhysicalFitnessTest(record: StudentPortraitEventRecord): record is PhysicalFitnessTestRecord {
  return "testBatchId" in record;
}

function isLibraryVisit(record: StudentPortraitEventRecord): record is LibraryVisitRecord {
  return "enteredAt" in record;
}

function isBookBorrow(record: StudentPortraitEventRecord): record is BookBorrowRecord {
  return "bookId" in record;
}

function isPracticeActivity(record: StudentPortraitEventRecord): record is PracticeActivityRecord {
  return "activityId" in record;
}

function isConsumption(record: StudentPortraitEventRecord): record is ConsumptionRecord {
  return "amount" in record && "consumedAt" in record;
}

function filterForQuery(rawData: PortraitRawData, query: PortraitQuery) {
  const students = rawData.students.filter((student) => (
    student.enrollmentStatus === "active"
    && (!query.schoolIds?.length || query.schoolIds.includes(student.schoolId))
    && (!query.educationStages?.length || query.educationStages.includes(student.educationStage))
    && (!query.grades?.length || query.grades.includes(student.grade))
  ));
  const studentIds = new Set(students.map((student) => student.studentId));
  const events = rawData.events.filter((record) => (
    record.status === "valid"
    && studentIds.has(record.studentId)
    && query.academicYears.includes(record.academicYear)
    && (!query.terms?.length || query.terms.includes(record.term))
    && (!query.subjects?.length || !isAcademicExam(record) || query.subjects.includes(record.subject))
  ));

  return { students, events };
}

function latestTimestamp(values: readonly string[]) {
  return values.reduce<number | undefined>((latest, value) => {
    const timestamp = Date.parse(value);
    if (!Number.isFinite(timestamp)) return latest;
    return latest === undefined || timestamp > latest ? timestamp : latest;
  }, undefined);
}

function recordsWithinRollingWindow<T>(
  records: readonly T[],
  dateFor: (record: T) => string,
  days: number,
  anchorTimestamp: number | undefined,
) {
  if (anchorTimestamp === undefined) return [];
  const startTimestamp = anchorTimestamp - (days - 1) * 24 * 60 * 60 * 1000;
  return records.filter((record) => {
    const timestamp = Date.parse(dateFor(record));
    return Number.isFinite(timestamp) && timestamp >= startTimestamp && timestamp <= anchorTimestamp;
  });
}

function createCoverageSignal(
  domain: PortraitDomain,
  metricResult: PortraitMetric,
  rules: PortraitAggregationRules,
  query: PortraitQuery,
): AttentionSignal | undefined {
  if (metricResult.quality.coverageRate >= rules.minimumCoverageRate * 100) return undefined;
  return {
    id: `low-data-coverage:${domain}:${metricResult.population.schoolId ?? "district"}`,
    type: "low-data-coverage",
    severity: metricResult.quality.coverageRate < rules.minimumCoverageRate * 50 ? "priority" : "attention",
    domain,
    population: metricResult.population,
    ruleKey: "minimum-data-coverage",
    evidence: [{
      metricKey: metricResult.key,
      observedValue: metricResult.quality.coverageRate,
      referenceValue: rules.minimumCoverageRate * 100,
      unit: "%",
      period: { academicYear: query.academicYears[0] ?? "", term: query.terms?.[0] ?? "whole-year" },
      quality: metricResult.quality,
    }],
    reviewDimension: "核对该领域的接入范围、有效记录和学籍分母后再解读业务变化。",
    ruleVersion: rules.version,
  };
}

function evaluationDistribution(
  records: readonly GrowthEvaluationRecord[],
  population: PortraitPopulation,
): PortraitDistribution {
  const quality = qualityFor(population.eligibleStudentCount, records);
  const formVersions = new Set(records.map((record) => record.evaluationFormVersion));
  const separatesFormVersions = formVersions.size > 1;
  const levelCounts = new Map<string, { label: string; count: number }>();
  records.forEach((record) => {
    const levelKey = separatesFormVersions
      ? `${record.evaluationFormVersion}::${record.level}`
      : record.level;
    const levelLabel = record.levelLabel ?? record.level;
    const label = separatesFormVersions
      ? `${levelLabel} · ${evaluationFormShortLabel(record.evaluationFormVersion)}`
      : levelLabel;
    const current = levelCounts.get(levelKey);
    levelCounts.set(levelKey, { label, count: (current?.count ?? 0) + 1 });
  });
  return {
    key: "five-education-evaluation-level-distribution",
    label: "全部一级指标",
    domain: "five-education",
    population,
    quality,
    calculationVersion: defaultPortraitAggregationRules.version,
    items: [...levelCounts.entries()].map(([levelKey, result]) => ({
      key: levelKey,
      label: result.label,
      value: percent(result.count, records.length),
      studentCount: result.count,
    })),
  };
}

function evaluationFormShortLabel(formVersion: string) {
  if (formVersion.includes("/primary/")) return "小学";
  if (formVersion.includes("/junior/")) return "初中";
  if (formVersion.includes("/senior/")) return "高中";
  return formVersion;
}

function evaluationDimensionDistributions(
  records: readonly GrowthEvaluationRecord[],
  population: PortraitPopulation,
): PortraitDistribution[] {
  const dimensions = new Map<string, {
    dimension: string;
    formVersion: string;
    label: string;
    order: number;
    records: GrowthEvaluationRecord[];
    levels: Map<string, { label: string; count: number; order: number }>;
  }>();
  records.forEach((record) => {
    const groupKey = `${record.evaluationFormVersion}::${record.dimension}`;
    const dimensionLabel = record.dimensionLabel ?? record.dimension;
    const group = dimensions.get(groupKey) ?? {
      dimension: record.dimension,
      formVersion: record.evaluationFormVersion,
      label: dimensionLabel,
      order: record.dimensionOrder ?? Number.MAX_SAFE_INTEGER,
      records: [],
      levels: new Map<string, { label: string; count: number; order: number }>(),
    };
    group.order = Math.min(group.order, record.dimensionOrder ?? Number.MAX_SAFE_INTEGER);
    group.records.push(record);
    const level = group.levels.get(record.level);
    group.levels.set(record.level, {
      label: record.levelLabel ?? record.level,
      count: (level?.count ?? 0) + 1,
      order: Math.min(level?.order ?? Number.MAX_SAFE_INTEGER, record.levelOrder ?? Number.MAX_SAFE_INTEGER),
    });
    dimensions.set(groupKey, group);
  });
  return [...dimensions.values()]
    .sort((left, right) => left.order - right.order || left.label.localeCompare(right.label, "zh-CN"))
    .map((definition) => {
      return {
        key: `five-education-dimension-${encodeURIComponent(definition.formVersion)}-${definition.dimension}-level-distribution`,
        label: definition.label,
        group: {
          key: definition.formVersion,
          label: evaluationFormShortLabel(definition.formVersion),
        },
        order: definition.order,
        domain: "five-education",
        population,
        quality: qualityFor(population.eligibleStudentCount, definition.records),
        calculationVersion: defaultPortraitAggregationRules.version,
        items: [...definition.levels.entries()]
          .sort(([, left], [, right]) => left.order - right.order || left.label.localeCompare(right.label, "zh-CN"))
          .map(([level, result]) => ({
            key: level,
            label: result.label,
            order: result.order,
            value: percent(result.count, definition.records.length),
            studentCount: result.count,
          })),
      };
    });
}

function honorDistribution(
  records: readonly HonorRecord[],
  population: PortraitPopulation,
  dimension: "award-type" | "award-level" | "award-grade",
  keys: readonly string[],
): PortraitDistribution {
  const quality = qualityFor(population.eligibleStudentCount, records);
  const valueFor = (record: HonorRecord) => {
    if (dimension === "award-type") return record.awardType ?? "other";
    if (dimension === "award-level") return record.level ?? "other";
    return record.awardGrade ?? "other";
  };
  return {
    key: `honor-${dimension}-distribution`,
    domain: "honor",
    population,
    quality,
    calculationVersion: defaultPortraitAggregationRules.version,
    items: keys.map((key) => {
      const recordCount = records.filter((record) => valueFor(record) === key).length;
      return {
        key,
        value: percent(recordCount, records.length),
        studentCount: recordCount,
      };
    }),
  };
}

function bookCategoryDistribution(
  records: readonly BookBorrowRecord[],
  population: PortraitPopulation,
): PortraitDistribution {
  const quality = qualityFor(population.eligibleStudentCount, records);
  const categories = [...new Set(records.map((record) => record.category))].sort((a, b) => (
    a.localeCompare(b, "zh-CN")
  ));
  return {
    key: "behavior-book-category-distribution",
    domain: "behavior",
    population,
    quality,
    calculationVersion: defaultPortraitAggregationRules.version,
    items: categories.map((key) => {
      const recordCount = records.filter((record) => record.category === key).length;
      return {
        key,
        value: percent(recordCount, records.length),
        studentCount: recordCount,
      };
    }),
  };
}

function scoreRateFor(record: AcademicExamRecord) {
  return record.fullScore > 0 ? (record.score / record.fullScore) * 100 : 0;
}

function scoreBandFor(scoreRate: number, rules: PortraitAggregationRules): AcademicScoreBand {
  if (scoreRate >= rules.academicScoreBandPolicy.excellentMinimumRate) return "excellent";
  if (scoreRate >= rules.academicScoreBandPolicy.goodMinimumRate) return "good";
  if (scoreRate >= rules.academicScoreBandPolicy.passMinimumRate) return "pass";
  return "low";
}

function scoreBandDistribution(
  records: readonly AcademicExamRecord[],
  rules: PortraitAggregationRules,
) {
  const bands: readonly AcademicScoreBand[] = ["excellent", "good", "pass", "low"];
  return bands.map((key) => {
    const studentCount = records.filter((record) => scoreBandFor(scoreRateFor(record), rules) === key).length;
    return { key, studentCount, rate: percent(studentCount, records.length) };
  });
}

function standardDeviation(values: readonly number[]) {
  if (!values.length) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;
  return Math.sqrt(variance);
}

function deduplicateExamRecords(records: readonly AcademicExamRecord[]) {
  const byStudent = new Map<string, AcademicExamRecord>();
  for (const record of records) {
    const existing = byStudent.get(record.studentId);
    if (!existing || record.importedAt >= existing.importedAt) byStudent.set(record.studentId, record);
  }
  return [...byStudent.values()];
}

function unifiedExamSummaries(
  exams: readonly AcademicExamRecord[],
  students: readonly StudentProfileRecord[],
  rules: PortraitAggregationRules,
): UnifiedExamSummary[] {
  const studentById = new Map(students.map((student) => [student.studentId, student]));
  const groups = new Map<string, AcademicExamRecord[]>();
  for (const record of exams.filter(isDistrictUnifiedExam)) {
    const key = [
      record.examId,
      record.subject,
      record.assessmentGrade,
      record.assessmentProgramId,
      record.paperVersion,
    ].join("::");
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }

  return [...groups.values()]
    .map((records) => {
      const sample = records[0];
      if (!sample) throw new Error("统考分组不能为空");
      const educationStage = studentById.get(sample.studentId)?.educationStage;
      if (!educationStage) throw new Error(`统考记录 ${sample.id} 无法匹配学生学段`);
      const uniqueRecords = deduplicateExamRecords(records);
      const eligibleStudents = students.filter((student) => (
        student.grade === sample.assessmentGrade && student.educationStage === educationStage
      ));
      const quality = qualityFor(eligibleStudents.length, uniqueRecords);
      const totalScore = uniqueRecords.reduce((sum, record) => sum + record.score, 0);
      const totalFullScore = uniqueRecords.reduce((sum, record) => sum + record.fullScore, 0);
      const scoreRates = uniqueRecords.map(scoreRateFor);
      const meanScoreRate = scoreRates.reduce((sum, value) => sum + value, 0) / Math.max(scoreRates.length, 1);
      const scoreDeviation = standardDeviation(scoreRates);
      const distribution = scoreBandDistribution(uniqueRecords, rules);
      const bandRate = (key: AcademicScoreBand) => distribution.find((item) => item.key === key)?.rate ?? 0;
      const atOrAbove = (threshold: number) => percent(
        uniqueRecords.filter((record) => scoreRateFor(record) >= threshold).length,
        uniqueRecords.length,
      );
      const schoolSummaries = [...new Set(uniqueRecords.map((record) => record.schoolId))]
        .map((schoolId) => {
          const schoolRecords = uniqueRecords.filter((record) => record.schoolId === schoolId);
          if (schoolRecords.length < rules.minimumPublishableGroupSize) return undefined;
          const schoolScoreRates = schoolRecords.map(scoreRateFor);
          const schoolMean = schoolScoreRates.reduce((sum, value) => sum + value, 0) / Math.max(schoolScoreRates.length, 1);
          const schoolScoreNumerator = schoolRecords.reduce((sum, record) => sum + record.score, 0);
          const schoolScoreDenominator = schoolRecords.reduce((sum, record) => sum + record.fullScore, 0);
          const schoolDistribution = scoreBandDistribution(schoolRecords, rules);
          return {
            schoolId,
            studentCount: new Set(schoolRecords.map((record) => record.studentId)).size,
            scoreNumerator: schoolScoreNumerator,
            scoreDenominator: schoolScoreDenominator,
            scoreRate: Number(schoolMean.toFixed(2)),
            standardScore: Number((scoreDeviation > 0 ? 50 + (10 * (schoolMean - meanScoreRate) / scoreDeviation) : 50).toFixed(2)),
            excellentRate: schoolDistribution.find((item) => item.key === "excellent")?.rate ?? 0,
            goodOrAboveRate: percent(schoolRecords.filter((record) => scoreRateFor(record) >= rules.academicScoreBandPolicy.goodMinimumRate).length, schoolRecords.length),
            passRate: percent(schoolRecords.filter((record) => scoreRateFor(record) >= rules.academicScoreBandPolicy.passMinimumRate).length, schoolRecords.length),
            lowScoreRate: schoolDistribution.find((item) => item.key === "low")?.rate ?? 0,
            scoreBandDistribution: schoolDistribution,
            quality: qualityFor(
              eligibleStudents.filter((student) => student.schoolId === schoolId).length,
              schoolRecords,
            ),
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .sort((left, right) => left.schoolId.localeCompare(right.schoolId));
      return {
        examId: sample.examId,
        examName: sample.examName,
        examType: sample.examType,
        assessmentProgramId: sample.assessmentProgramId,
        paperVersion: sample.paperVersion,
        educationStage,
        assessmentGrade: sample.assessmentGrade,
        subject: sample.subject,
        examAt: sample.examAt,
        scoreNumerator: totalScore,
        scoreDenominator: totalFullScore,
        scoreRate: percent(totalScore, totalFullScore),
        standardScoreBaseline: 50,
        scoreStandardDeviation: Number(scoreDeviation.toFixed(2)),
        excellentRate: bandRate("excellent"),
        goodOrAboveRate: atOrAbove(rules.academicScoreBandPolicy.goodMinimumRate),
        passRate: atOrAbove(rules.academicScoreBandPolicy.passMinimumRate),
        lowScoreRate: bandRate("low"),
        scoreBandPolicyVersion: rules.academicScoreBandPolicy.version,
        scoreBandDistribution: distribution,
        schoolSummaries,
        studentCount: quality.observedStudentCount,
        eligibleStudentCount: eligibleStudents.length,
        recordCount: records.length,
        quality,
      };
    })
    .sort((left, right) => right.examAt.localeCompare(left.examAt) || left.subject.localeCompare(right.subject, "zh-CN"));
}

function unifiedExamTrends(summaries: readonly UnifiedExamSummary[]): UnifiedExamTrend[] {
  const groups = new Map<string, UnifiedExamSummary[]>();
  for (const summary of summaries) {
    const key = [summary.assessmentProgramId, summary.educationStage, summary.assessmentGrade, summary.subject].join("::");
    groups.set(key, [...(groups.get(key) ?? []), summary]);
  }

  return [...groups.values()].map((group) => {
    const sorted = [...group].sort((left, right) => left.examAt.localeCompare(right.examAt));
    const sample = sorted[0];
    if (!sample) throw new Error("统考趋势分组不能为空");
    return {
      assessmentProgramId: sample.assessmentProgramId,
      educationStage: sample.educationStage,
      assessmentGrade: sample.assessmentGrade,
      subject: sample.subject,
      points: sorted.map((summary, index) => ({
        examId: summary.examId,
        examName: summary.examName,
        examType: summary.examType,
        examAt: summary.examAt,
        scoreRate: summary.scoreRate,
        changeFromPrevious: index > 0
          ? Number((summary.scoreRate - sorted[index - 1]!.scoreRate).toFixed(2))
          : undefined,
        quality: summary.quality,
      })),
      comparability: "descriptive-score-rate-only" as const,
    };
  });
}

function buildMetrics(
  events: readonly StudentPortraitEventRecord[],
  population: PortraitPopulation,
) {
  const goals = events.filter(isGrowthGoal);
  const physicalGoals = goals.filter((record) => record.goalCategory === "physical");
  const evaluations = events.filter(isGrowthEvaluation);
  const exams = events.filter(isAcademicExam);
  const unifiedExams = exams.filter(isDistrictUnifiedExam);
  const honors = events.filter(isHonor);
  const exercises = events.filter(isAiExercise).filter((record) => record.isVerified !== false);
  const runs = events.filter(isSunshineRun).filter((record) => record.isValidRun);
  const fitnessTests = events.filter(isPhysicalFitnessTest).filter((record) => record.standardStatus !== "not-applicable");
  const libraryVisits = events.filter(isLibraryVisit);
  const bookBorrows = events.filter(isBookBorrow);
  const consumptions = events.filter(isConsumption);
  const practice = events.filter(isPracticeActivity).filter((record) => record.isVerified);
  const dailyEvaluations = events.filter((record) => "type" in record && "evaluatedAt" in record);
  const targetCredits = goals.reduce((total, record) => total + record.targetCredits, 0);
  const earnedCredits = goals.reduce((total, record) => total + record.earnedCredits, 0);
  const physicalTargetCredits = physicalGoals.reduce((total, record) => total + record.targetCredits, 0);
  const physicalEarnedCredits = physicalGoals.reduce((total, record) => total + record.earnedCredits, 0);
  const goalQuality = qualityFor(population.eligibleStudentCount, goals);
  const physicalGoalQuality = qualityFor(population.eligibleStudentCount, physicalGoals);
  const evaluationQuality = qualityFor(population.eligibleStudentCount, evaluations);
  const evaluatedStudentCount = distinctStudentIds(evaluations).size;
  const evaluationFormVersionCount = new Set(
    evaluations.map((record) => record.evaluationFormVersion),
  ).size;
  const examQuality = qualityFor(population.eligibleStudentCount, exams);
  const unifiedExamQuality = qualityFor(population.eligibleStudentCount, unifiedExams);
  const honorQuality = qualityFor(population.eligibleStudentCount, honors);
  const honorCountByLevel = new Map<string, number>();
  honors.forEach((record) => {
    const level = record.level ?? "other";
    honorCountByLevel.set(level, (honorCountByLevel.get(level) ?? 0) + 1);
  });
  const exerciseQuality = qualityFor(population.eligibleStudentCount, exercises);
  const runQuality = qualityFor(population.eligibleStudentCount, runs);
  const fitnessQuality = qualityFor(population.eligibleStudentCount, fitnessTests);
  const libraryVisitQuality = qualityFor(population.eligibleStudentCount, libraryVisits);
  const bookBorrowQuality = qualityFor(population.eligibleStudentCount, bookBorrows);
  const completedLibraryVisits = libraryVisits.filter((record) => {
    if (!record.leftAt) return false;
    const durationMilliseconds = Date.parse(record.leftAt) - Date.parse(record.enteredAt);
    return Number.isFinite(durationMilliseconds) && durationMilliseconds > 0;
  });
  const libraryDwellQuality = qualityFor(population.eligibleStudentCount, completedLibraryVisits);
  const consumptionQuality = qualityFor(population.eligibleStudentCount, consumptions);
  const practiceQuality = qualityFor(population.eligibleStudentCount, practice);
  const dailyQuality = qualityFor(population.eligibleStudentCount, dailyEvaluations);
  const praised = dailyEvaluations.filter((record) => record.type === "praise").length;
  const improvements = dailyEvaluations.filter((record) => record.type === "improvement").length;
  const standardPasses = fitnessTests.filter((record) => record.standardStatus !== "fail").length;
  const fitnessStudentIds = [...new Set(fitnessTests.map((record) => record.studentId))];
  const fitnessPassedStudentCount = fitnessStudentIds.filter((studentId) => (
    fitnessTests
      .filter((record) => record.studentId === studentId)
      .every((record) => record.standardStatus !== "fail")
  )).length;
  const totalExerciseSessions = exercises.reduce((total, record) => total + record.sessionCount, 0);
  const totalRunDistance = runs.reduce((total, record) => total + record.distanceKilometers, 0);
  const totalRunDurationSeconds = runs.reduce((total, record) => total + record.durationSeconds, 0);
  const totalLibraryDwellMinutes = completedLibraryVisits.reduce((total, record) => (
    total + (Date.parse(record.leftAt!) - Date.parse(record.enteredAt)) / 60_000
  ), 0);
  const bookBorrowTransactionCount = new Set(
    bookBorrows.map((record) => record.borrowTransactionId ?? record.sourceRecordId),
  ).size;
  const behaviorWindowAnchor = latestTimestamp([
    ...libraryVisits.map((record) => record.enteredAt),
    ...bookBorrows.map((record) => record.borrowedAt),
  ]);
  const rollingBehaviorRecords = Object.fromEntries(rollingWindowDays.map((days) => {
    const visits = recordsWithinRollingWindow(
      libraryVisits,
      (record) => record.enteredAt,
      days,
      behaviorWindowAnchor,
    );
    const borrows = recordsWithinRollingWindow(
      bookBorrows,
      (record) => record.borrowedAt,
      days,
      behaviorWindowAnchor,
    );
    return [days, {
      visits,
      borrows,
      transactions: new Set(
        borrows.map((record) => record.borrowTransactionId ?? record.sourceRecordId),
      ).size,
    }];
  })) as Record<(typeof rollingWindowDays)[number], {
    visits: LibraryVisitRecord[];
    borrows: BookBorrowRecord[];
    transactions: number;
  }>;
  const practiceStudentCategoryCount = new Set(
    practice.map((record) => `${record.studentId}::${record.category}`),
  ).size;
  const activePracticeCategoryCount = new Set(practice.map((record) => record.category)).size;
  const practiceCategoryParticipantCounts = new Map(
    practiceCategories.map((category) => [
      category,
      distinctStudentIds(practice.filter((record) => record.category === category)).size,
    ]),
  );

  return {
    evaluations,
    metrics: [
      metric("enrolled-student-count", "profile", population.eligibleStudentCount, "人", population, {
        status: population.eligibleStudentCount > 0 ? "ready" : "unavailable",
        eligibleStudentCount: population.eligibleStudentCount,
        observedStudentCount: population.eligibleStudentCount,
        coverageRate: population.eligibleStudentCount > 0 ? 100 : 0,
        validRecordCount: population.eligibleStudentCount,
      }),
      metric("five-education-goal-completion-rate", "five-education", percent(earnedCredits, targetCredits), "%", population, goalQuality, earnedCredits, targetCredits),
      metric("five-education-evaluation-coverage-rate", "five-education", evaluationQuality.coverageRate, "%", population, evaluationQuality, evaluationQuality.observedStudentCount, population.eligibleStudentCount),
      metric("five-education-evaluated-student-count", "five-education", evaluatedStudentCount, "人", population, evaluationQuality, evaluatedStudentCount),
      metric("five-education-evaluation-record-count", "five-education", evaluations.length, "条", population, evaluationQuality, evaluations.length),
      metric("five-education-evaluation-form-version-count", "five-education", evaluationFormVersionCount, "套", population, evaluationQuality, evaluationFormVersionCount),
      metric("academic-exam-coverage-rate", "academic", examQuality.coverageRate, "%", population, examQuality, examQuality.observedStudentCount, population.eligibleStudentCount, "within-school-trend-only"),
      metric("academic-unified-exam-record-coverage-rate", "academic", unifiedExamQuality.coverageRate, "%", population, unifiedExamQuality, unifiedExamQuality.observedStudentCount, population.eligibleStudentCount),
      metric("honor-student-coverage-rate", "honor", honorQuality.coverageRate, "%", population, honorQuality, honorQuality.observedStudentCount, population.eligibleStudentCount),
      metric(
        "honor-per-100-students",
        "honor",
        population.eligibleStudentCount > 0
          ? Number(((honors.length / population.eligibleStudentCount) * 100).toFixed(2))
          : 0,
        "项/百人",
        population,
        honorQuality,
        honors.length,
        population.eligibleStudentCount,
      ),
      metric("honor-national-count", "honor", honorCountByLevel.get("national") ?? 0, "项", population, honorQuality, honorCountByLevel.get("national") ?? 0),
      metric("honor-provincial-count", "honor", honorCountByLevel.get("provincial") ?? 0, "项", population, honorQuality, honorCountByLevel.get("provincial") ?? 0),
      metric("honor-city-count", "honor", honorCountByLevel.get("city") ?? 0, "项", population, honorQuality, honorCountByLevel.get("city") ?? 0),
      metric("ai-exercise-participation-rate", "sports-health", exerciseQuality.coverageRate, "%", population, exerciseQuality, exerciseQuality.observedStudentCount, population.eligibleStudentCount),
      metric("ai-exercise-sessions-per-participant", "sports-health", exerciseQuality.observedStudentCount > 0 ? Number((totalExerciseSessions / exerciseQuality.observedStudentCount).toFixed(2)) : 0, "次/人", population, exerciseQuality, totalExerciseSessions, exerciseQuality.observedStudentCount),
      metric("sunshine-run-participation-rate", "sports-health", runQuality.coverageRate, "%", population, runQuality, runQuality.observedStudentCount, population.eligibleStudentCount),
      metric("sunshine-run-total-distance", "sports-health", Number(totalRunDistance.toFixed(2)), "km", population, runQuality, totalRunDistance),
      metric("sunshine-run-distance-per-participant", "sports-health", runQuality.observedStudentCount > 0 ? Number((totalRunDistance / runQuality.observedStudentCount).toFixed(2)) : 0, "km/人", population, runQuality, totalRunDistance, runQuality.observedStudentCount),
      metric("sunshine-run-session-count", "sports-health", runs.length, "人次", population, runQuality, runs.length),
      metric("sunshine-run-duration-per-participant", "sports-health", runQuality.observedStudentCount > 0 ? Number((totalRunDurationSeconds / 3600 / runQuality.observedStudentCount).toFixed(2)) : 0, "h/人", population, runQuality, totalRunDurationSeconds, runQuality.observedStudentCount),
      metric("fitness-test-record-coverage-rate", "sports-health", fitnessQuality.coverageRate, "%", population, fitnessQuality, fitnessQuality.observedStudentCount, population.eligibleStudentCount),
      metric("fitness-test-item-pass-rate", "sports-health", percent(standardPasses, fitnessTests.length), "%", population, fitnessQuality, standardPasses, fitnessTests.length),
      metric("fitness-standard-pass-rate", "sports-health", percent(fitnessPassedStudentCount, fitnessStudentIds.length), "%", population, fitnessQuality, fitnessPassedStudentCount, fitnessStudentIds.length),
      metric("sports-goal-completion-rate", "sports-health", percent(physicalEarnedCredits, physicalTargetCredits), "%", population, physicalGoalQuality, physicalEarnedCredits, physicalTargetCredits),
      metric("library-visit-coverage-rate", "behavior", libraryVisitQuality.coverageRate, "%", population, libraryVisitQuality, libraryVisitQuality.observedStudentCount, population.eligibleStudentCount),
      metric("library-borrower-coverage-rate", "behavior", bookBorrowQuality.coverageRate, "%", population, bookBorrowQuality, bookBorrowQuality.observedStudentCount, population.eligibleStudentCount),
      metric(
        "library-visits-per-student",
        "behavior",
        population.eligibleStudentCount > 0
          ? Number((libraryVisits.length / population.eligibleStudentCount).toFixed(2))
          : 0,
        "次/生",
        population,
        libraryVisitQuality,
        libraryVisits.length,
        population.eligibleStudentCount,
      ),
      metric(
        "library-dwell-hours-per-student",
        "behavior",
        population.eligibleStudentCount > 0
          ? Number((totalLibraryDwellMinutes / 60 / population.eligibleStudentCount).toFixed(2))
          : 0,
        "小时/生",
        population,
        libraryDwellQuality,
        Number((totalLibraryDwellMinutes / 60).toFixed(2)),
        population.eligibleStudentCount,
      ),
      metric(
        "book-borrow-volume-per-student",
        "behavior",
        population.eligibleStudentCount > 0
          ? Number((bookBorrows.length / population.eligibleStudentCount).toFixed(2))
          : 0,
        "册/生",
        population,
        bookBorrowQuality,
        bookBorrows.length,
        population.eligibleStudentCount,
      ),
      metric(
        "book-borrow-transactions-per-student",
        "behavior",
        population.eligibleStudentCount > 0
          ? Number((bookBorrowTransactionCount / population.eligibleStudentCount).toFixed(2))
          : 0,
        "次/生",
        population,
        bookBorrowQuality,
        bookBorrowTransactionCount,
        population.eligibleStudentCount,
      ),
      ...rollingWindowDays.flatMap((days) => {
        const windowRecords = rollingBehaviorRecords[days];
        const visitQuality = qualityFor(population.eligibleStudentCount, windowRecords.visits);
        const borrowQuality = qualityFor(population.eligibleStudentCount, windowRecords.borrows);
        return [
          metric(
            `library-visit-count-last-${days}-days`,
            "behavior",
            windowRecords.visits.length,
            "次",
            population,
            visitQuality,
            windowRecords.visits.length,
          ),
          metric(
            `book-borrow-volume-last-${days}-days`,
            "behavior",
            windowRecords.borrows.length,
            "册",
            population,
            borrowQuality,
            windowRecords.borrows.length,
          ),
          metric(
            `book-borrow-transaction-count-last-${days}-days`,
            "behavior",
            windowRecords.transactions,
            "次",
            population,
            borrowQuality,
            windowRecords.transactions,
          ),
        ];
      }),
      metric("campus-consumption-record-coverage-rate", "life", consumptionQuality.coverageRate, "%", population, consumptionQuality, consumptionQuality.observedStudentCount, population.eligibleStudentCount, "not-comparable"),
      metric("practice-participation-rate", "practice", practiceQuality.coverageRate, "%", population, practiceQuality, practiceQuality.observedStudentCount, population.eligibleStudentCount),
      metric(
        "practice-activity-count-per-student",
        "practice",
        population.eligibleStudentCount > 0
          ? Number((practice.length / population.eligibleStudentCount).toFixed(2))
          : 0,
        "次/生",
        population,
        practiceQuality,
        practice.length,
        population.eligibleStudentCount,
      ),
      metric(
        "practice-category-count-per-student",
        "practice",
        population.eligibleStudentCount > 0
          ? Number((practiceStudentCategoryCount / population.eligibleStudentCount).toFixed(2))
          : 0,
        "类/生",
        population,
        practiceQuality,
        practiceStudentCategoryCount,
        population.eligibleStudentCount,
      ),
      metric(
        "practice-category-coverage-rate",
        "practice",
        percent(activePracticeCategoryCount, practiceCategories.length),
        "%",
        population,
        practiceQuality,
        activePracticeCategoryCount,
        practiceCategories.length,
      ),
      ...practiceCategories.map((category) => metric(
        `practice-${category}-participant-count`,
        "practice",
        practiceCategoryParticipantCounts.get(category) ?? 0,
        "人",
        population,
        practiceQuality,
        practiceCategoryParticipantCounts.get(category) ?? 0,
        population.eligibleStudentCount,
      )),
      ...practiceCategories.map((category) => {
        const participantCount = practiceCategoryParticipantCounts.get(category) ?? 0;
        return metric(
          `practice-${category}-participation-rate`,
          "practice",
          percent(participantCount, population.eligibleStudentCount),
          "%",
          population,
          practiceQuality,
          participantCount,
          population.eligibleStudentCount,
        );
      }),
      metric("daily-evaluation-record-coverage-rate", "daily-evaluation", dailyQuality.coverageRate, "%", population, dailyQuality, dailyQuality.observedStudentCount, population.eligibleStudentCount),
      metric("daily-evaluation-positive-rate", "daily-evaluation", percent(praised, dailyEvaluations.length), "%", population, dailyQuality, praised, dailyEvaluations.length, "within-school-trend-only"),
      metric("daily-evaluation-improvement-rate", "daily-evaluation", percent(improvements, dailyEvaluations.length), "%", population, dailyQuality, improvements, dailyEvaluations.length, "within-school-trend-only"),
    ],
  };
}

/**
 * 从经过权限过滤的学生明细生成区域/学校聚合快照。
 *
 * 这里只输出有明确分子、分母和来源记录的事实；趋势、原因诊断及处置闭环
 * 必须由各自的可比周期或工作流数据源补充，不能从本函数臆造。
 */
export function aggregatePortraitDataset(
  rawData: PortraitRawData,
  query: PortraitQuery,
  generatedAt = new Date().toISOString(),
  rules = defaultPortraitAggregationRules,
): PortraitDataset {
  const { students, events } = filterForQuery(rawData, query);
  const population = fullDistrictPopulation(students.length);
  const district = buildMetrics(events, population);
  const honors = events.filter(isHonor);
  const bookBorrows = events.filter(isBookBorrow);
  const distributions = [
    evaluationDistribution(district.evaluations, population),
    ...evaluationDimensionDistributions(district.evaluations, population),
    honorDistribution(honors, population, "award-type", [
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
    ]),
    honorDistribution(honors, population, "award-level", [
      "international",
      "national",
      "provincial",
      "city",
      "district",
      "school",
      "other",
    ]),
    honorDistribution(honors, population, "award-grade", [
      "special",
      "first",
      "second",
      "third",
      "other",
    ]),
    bookCategoryDistribution(bookBorrows, population),
  ];
  const examSummaries = unifiedExamSummaries(events.filter(isAcademicExam), students, rules);
  const examTrends = unifiedExamTrends(examSummaries);
  const grades: GradePortraitSummary[] = [
    ...new Map(
      students.map((student) => [
        `${student.educationStage}::${student.grade}`,
        { educationStage: student.educationStage, grade: student.grade },
      ]),
    ).values(),
  ].map(({ educationStage, grade }) => {
    const gradeStudents = students.filter((student) => (
      student.educationStage === educationStage && student.grade === grade
    ));
    const studentIds = new Set(gradeStudents.map((student) => student.studentId));
    const gradePopulation: PortraitPopulation = {
      scope: "grade",
      educationStage,
      grade,
      eligibleStudentCount: gradeStudents.length,
    };
    return {
      educationStage,
      grade,
      studentCount: gradeStudents.length,
      metrics: gradeStudents.length >= rules.minimumPublishableGroupSize
        ? buildMetrics(events.filter((event) => studentIds.has(event.studentId)), gradePopulation).metrics
        : [],
    };
  });
  const schools: SchoolPortraitSummary[] = [...new Set(students.map((student) => student.schoolId))].map((schoolId) => {
    const schoolStudents = students.filter((student) => student.schoolId === schoolId);
    const schoolPopulation: PortraitPopulation = {
      scope: "school",
      schoolId,
      eligibleStudentCount: schoolStudents.length,
    };
    const schoolResult = schoolStudents.length >= rules.minimumPublishableGroupSize
      ? buildMetrics(events.filter((event) => event.schoolId === schoolId), schoolPopulation)
      : undefined;
    return {
      schoolId,
      studentCount: schoolStudents.length,
      metrics: schoolResult?.metrics ?? [],
      distributions: schoolResult
        ? evaluationDimensionDistributions(schoolResult.evaluations, schoolPopulation)
            .filter((distribution) => (
              distribution.quality.coverageRate >= rules.minimumCoverageRate * 100
            ))
        : [],
    };
  });
  const attentionSignals = district.metrics
    .filter((result) => result.domain !== "profile")
    .map((result) => createCoverageSignal(result.domain, result, rules, query))
    .filter((signal): signal is AttentionSignal => Boolean(signal));

  return {
    query,
    generatedAt,
    metrics: district.metrics,
    distributions,
    trends: [],
    unifiedExamSummaries: examSummaries,
    unifiedExamTrends: examTrends,
    grades,
    schools,
    attentionSignals,
  };
}
