/**
 * 学生成长画像第一阶段领域契约。
 *
 * 该文件描述可由已接入的学生原始记录计算出的事实、统计口径和观察信号，
 * 不包含展示层模型、Mock 数据或任何“综合评价”推断规则。
 */

export type EducationStage = "primary" | "junior" | "senior";

export type EnrollmentStatus = "active" | "transferred" | "graduated" | "suspended";

export type RecordStatus = "valid" | "invalid" | "revoked";

export type AcademicTerm = "first" | "second" | "whole-year";

export type PortraitDomain =
  | "profile"
  | "five-education"
  | "academic"
  | "honor"
  | "sports-health"
  | "behavior"
  | "life"
  | "practice"
  | "daily-evaluation";

export type SensitiveDataLevel = "normal" | "sensitive" | "highly-sensitive";

/** 与业务来源无关的记录追溯字段。 */
export interface SourceRecord {
  id: string;
  studentId: string;
  schoolId: string;
  occurredAt: string;
  academicYear: string;
  term: AcademicTerm;
  sourceSystem: string;
  sourceRecordId: string;
  status: RecordStatus;
  importedAt: string;
}

/**
 * 用于统计分组的最小学生主数据。姓名、联系方式等直接身份信息不属于画像聚合输入。
 */
export interface StudentProfileRecord {
  studentId: string;
  schoolId: string;
  educationStage: EducationStage;
  grade: string;
  classId?: string;
  enrollmentStatus: EnrollmentStatus;
  enrolledAt: string;
  leftAt?: string;
  sex?: "male" | "female" | "unspecified";
}

export interface GrowthGoalRecord extends SourceRecord {
  targetCredits: number;
  earnedCredits: number;
  goalCategory?: string;
}

export type GrowthEvaluationLevel = "excellent" | "average" | "needs-effort";

export interface GrowthEvaluationRecord extends SourceRecord {
  evaluationFormVersion: string;
  dimension: string;
  item: string;
  level: GrowthEvaluationLevel;
  detail?: string;
}

export type ExamComparableScope = "school-grade" | "district-unified" | "non-comparable";

export type AcademicExamType = "midterm" | "final" | "mock" | "diagnostic" | "other";

/**
 * 统一考试不能仅凭名称判定：同一考试计划、年级、试卷版本和组织范围才构成可比较批次。
 */
export type AcademicExamAdministrationScope = "school" | "district-unified";
export type AcademicScoreBand = "excellent" | "good" | "pass" | "low";

/**
 * 同校同年级相对位置由 rank 和 comparableStudentCount 计算，不能用作跨校绝对水平比较。
 */
export interface AcademicExamRecord extends SourceRecord {
  examId: string;
  examName: string;
  examType: AcademicExamType;
  administrationScope: AcademicExamAdministrationScope;
  assessmentProgramId: string;
  paperVersion: string;
  assessmentGrade: string;
  subject: string;
  score: number;
  fullScore: number;
  rank: number;
  comparableStudentCount: number;
  comparableScope: ExamComparableScope;
  examAt: string;
}

export type HonorKind = "medal" | "title" | "award";
export type HonorLevel = "international" | "national" | "provincial" | "city" | "district" | "school";

export interface HonorRecord extends SourceRecord {
  kind: HonorKind;
  name: string;
  level?: HonorLevel;
  category?: string;
  organizer?: string;
  competitionName?: string;
  receivedAt: string;
  isTeamAward?: boolean;
}

export type FitnessMetricCode =
  | "height"
  | "weight"
  | "bmi"
  | "cardiopulmonary"
  | "speed"
  | "endurance"
  | "core-strength"
  | "lower-limb-strength"
  | "flexibility";

export type FitnessStandardStatus = "excellent" | "good" | "pass" | "fail" | "not-applicable";

export interface PhysicalFitnessTestRecord extends SourceRecord {
  testBatchId: string;
  metric: FitnessMetricCode;
  value: number;
  unit: string;
  standardStatus: FitnessStandardStatus;
  standardVersion: string;
  testedAt: string;
}

export type AiExerciseType =
  | "high-knees"
  | "squat"
  | "jumping-jack"
  | "squat-jump"
  | "side-to-side-jump"
  | "sit-and-reach";

export interface AiExerciseRecord extends SourceRecord {
  exerciseType: AiExerciseType;
  sessionCount: number;
  completedAt: string;
  isVerified?: boolean;
}

export interface SunshineRunRecord extends SourceRecord {
  distanceKilometers: number;
  durationSeconds: number;
  completedAt: string;
  isValidRun: boolean;
}

export interface LibraryVisitRecord extends SourceRecord {
  enteredAt: string;
  leftAt?: string;
}

export interface BookBorrowRecord extends SourceRecord {
  bookId: string;
  category: string;
  borrowedAt: string;
  returnedAt?: string;
}

export type AttendanceType = "normal" | "late" | "early-leave" | "late-return" | "sick-leave" | "personal-leave" | "public-leave";

export interface AttendanceRecord extends SourceRecord {
  type: AttendanceType;
  durationMinutes?: number;
  recordedAt: string;
}

export type ConsumptionCategory = "breakfast" | "lunch" | "dinner" | "stationery" | "medical" | "other";

export interface ConsumptionRecord extends SourceRecord {
  category: ConsumptionCategory;
  amount: number;
  consumedAt: string;
}

/** 校内就诊记录属于高度敏感数据，仅允许在授权后的最小必要范围内聚合。 */
export interface CampusClinicRecord extends SourceRecord {
  symptomCodes: string[];
  visitedAt: string;
  isInfectiousDiseaseHistory?: boolean;
}

export type PracticeActivityCategory = "moral" | "intellectual" | "physical" | "aesthetic" | "labor" | "club" | "volunteer";

export interface PracticeActivityRecord extends SourceRecord {
  activityId: string;
  category: PracticeActivityCategory;
  participatedAt: string;
  isVerified: boolean;
}

export type DailyEvaluationType = "praise" | "improvement";

export interface DailyEvaluationRecord extends SourceRecord {
  type: DailyEvaluationType;
  theme?: string;
  evaluatedAt: string;
  evaluatorRole?: string;
  evaluationFormVersion?: string;
}

export type StudentPortraitEventRecord =
  | GrowthGoalRecord
  | GrowthEvaluationRecord
  | AcademicExamRecord
  | HonorRecord
  | PhysicalFitnessTestRecord
  | AiExerciseRecord
  | SunshineRunRecord
  | LibraryVisitRecord
  | BookBorrowRecord
  | AttendanceRecord
  | ConsumptionRecord
  | CampusClinicRecord
  | PracticeActivityRecord
  | DailyEvaluationRecord;

/** 第一阶段聚合所需的原始输入集合。 */
export interface PortraitRawData {
  students: StudentProfileRecord[];
  events: StudentPortraitEventRecord[];
}

export interface PortraitQuery {
  tenantId: string;
  schoolIds?: string[];
  educationStages?: EducationStage[];
  grades?: string[];
  academicYears: string[];
  terms?: AcademicTerm[];
  domains?: PortraitDomain[];
}

export type AggregationScope = "district" | "school" | "grade";

export interface PortraitPopulation {
  scope: AggregationScope;
  schoolId?: string;
  educationStage?: EducationStage;
  grade?: string;
  eligibleStudentCount: number;
}

export type MetricQualityStatus = "ready" | "partial" | "insufficient" | "unavailable";

export interface MetricQuality {
  status: MetricQualityStatus;
  eligibleStudentCount: number;
  observedStudentCount: number;
  coverageRate: number;
  validRecordCount: number;
  sourceFreshnessAt?: string;
  missingReasonCode?: string;
}

export type ComparabilityLevel = "district-comparable" | "within-school-trend-only" | "not-comparable";

/** 可追溯指标结果；百分比指标应提供 numerator 与 denominator。 */
export interface PortraitMetric {
  key: string;
  domain: PortraitDomain;
  value: number;
  unit: string;
  numerator?: number;
  denominator?: number;
  population: PortraitPopulation;
  quality: MetricQuality;
  comparability: ComparabilityLevel;
  calculationVersion: string;
}

export interface PortraitDistributionItem {
  key: string;
  value: number;
  studentCount?: number;
}

export interface PortraitDistribution {
  key: string;
  domain: PortraitDomain;
  population: PortraitPopulation;
  items: PortraitDistributionItem[];
  quality: MetricQuality;
  calculationVersion: string;
}

export interface PortraitTrendPoint {
  academicYear: string;
  term: AcademicTerm;
  value: number;
  quality: MetricQuality;
}

export interface PortraitTrend {
  metricKey: string;
  domain: PortraitDomain;
  unit: string;
  population: PortraitPopulation;
  points: PortraitTrendPoint[];
  comparability: ComparabilityLevel;
  calculationVersion: string;
}

export interface AcademicScoreBandDistributionItem {
  key: AcademicScoreBand;
  studentCount: number;
  rate: number;
}

export interface UnifiedExamSchoolSummary {
  schoolId: string;
  studentCount: number;
  scoreRate: number;
  standardScore: number;
  excellentRate: number;
  goodOrAboveRate: number;
  passRate: number;
  lowScoreRate: number;
  scoreBandDistribution: AcademicScoreBandDistributionItem[];
  quality: MetricQuality;
}

/**
 * 仅输出同一统考批次、学科、年级和试卷版本内的匿名聚合。
 * scoreRate 是得分总和 ÷ 满分总和，不可与不同批次或不同试卷直接拼成排名。
 */
export interface UnifiedExamSummary {
  examId: string;
  examName: string;
  examType: AcademicExamType;
  assessmentProgramId: string;
  paperVersion: string;
  educationStage: EducationStage;
  assessmentGrade: string;
  subject: string;
  examAt: string;
  scoreRate: number;
  standardScoreBaseline: number;
  scoreStandardDeviation: number;
  excellentRate: number;
  goodOrAboveRate: number;
  passRate: number;
  lowScoreRate: number;
  scoreBandPolicyVersion: string;
  scoreBandDistribution: AcademicScoreBandDistributionItem[];
  schoolSummaries: UnifiedExamSchoolSummary[];
  studentCount: number;
  eligibleStudentCount: number;
  recordCount: number;
  quality: MetricQuality;
}

export interface UnifiedExamTrendPoint {
  examId: string;
  examName: string;
  examType: AcademicExamType;
  examAt: string;
  scoreRate: number;
  changeFromPrevious?: number;
  quality: MetricQuality;
}

/**
 * 同一考试计划、学段、年级和学科内的描述性得分率序列。
 * 它不是控制起点差异后的学业增值指标。
 */
export interface UnifiedExamTrend {
  assessmentProgramId: string;
  educationStage: EducationStage;
  assessmentGrade: string;
  subject: string;
  points: UnifiedExamTrendPoint[];
  comparability: "descriptive-score-rate-only";
}

export interface SchoolPortraitSummary {
  schoolId: string;
  studentCount: number;
  metrics: PortraitMetric[];
}

/**
 * 信号只能陈述异常或变化事实及其证据；它不是对学生、教师或学校的原因诊断。
 */
export type AttentionSignalType =
  | "low-data-coverage"
  | "trend-decline"
  | "distribution-imbalance"
  | "outlier-from-peer-group"
  | "below-standard-rate"
  | "participation-gap"
  | "improvement-gap";

export type AttentionSeverity = "observe" | "attention" | "priority";

export interface AttentionSignalEvidence {
  metricKey: string;
  observedValue: number;
  referenceValue?: number;
  unit: string;
  period: {
    academicYear: string;
    term: AcademicTerm;
  };
  quality: MetricQuality;
}

export interface AttentionSignal {
  id: string;
  type: AttentionSignalType;
  severity: AttentionSeverity;
  domain: PortraitDomain;
  population: PortraitPopulation;
  ruleKey: string;
  evidence: AttentionSignalEvidence[];
  reviewDimension: string;
  ruleVersion: string;
}

/** 页面和图表只消费此聚合结果，不直接拼接原始学生事件。 */
export interface PortraitDataset {
  query: PortraitQuery;
  generatedAt: string;
  metrics: PortraitMetric[];
  distributions: PortraitDistribution[];
  trends: PortraitTrend[];
  unifiedExamSummaries: UnifiedExamSummary[];
  unifiedExamTrends: UnifiedExamTrend[];
  schools: SchoolPortraitSummary[];
  attentionSignals: AttentionSignal[];
}

export const portraitDomainSensitivity: Readonly<Record<PortraitDomain, SensitiveDataLevel>> = {
  profile: "normal",
  "five-education": "normal",
  academic: "sensitive",
  honor: "normal",
  "sports-health": "sensitive",
  behavior: "sensitive",
  life: "highly-sensitive",
  practice: "normal",
  "daily-evaluation": "sensitive",
};
