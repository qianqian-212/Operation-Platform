import type { PortraitDomain } from "./data-contract";
import { portraitMetricDefinitionByKey } from "./metric-registry";

/**
 * 学生成长画像的数据领域与内容组件能力事实源。
 *
 * 每一项都把页面可见能力限定为：可计算指标、原始记录、质量门槛与权限边界的交集。
 * 页面锚点由最终画像页面的 page/data.ts 维护，不得把数据领域当成页面或菜单。
 * 内容组件不得绕过本矩阵新增指标、诊断、排名或处置动作。
 */
export type StudentGrowthTopicKey = PortraitDomain | "overview" | "mental-health";

export type PageCapabilityStatus = "enabled" | "limited" | "restricted";

export interface StudentGrowthTopicCapability {
  key: StudentGrowthTopicKey;
  label: string;
  description: string;
  status: PageCapabilityStatus;
  limitation?: string;
}

export interface StudentGrowthPageCapability {
  key: string;
  topic: StudentGrowthTopicKey;
  label: string;
  status: PageCapabilityStatus;
  /** 只有这些已注册指标可作为本能力的页面结论。 */
  metricKeys: readonly string[];
  /** 数据契约中的上游原始记录集合；字段口径以指标字典为准。 */
  sourceRecords: readonly string[];
  qualityGate: string;
  permissionBoundary: string;
  limitation?: string;
}

export const studentGrowthTopicCapabilityMatrix: readonly StudentGrowthTopicCapability[] = [
  { key: "overview", label: "区域总览", description: "展示数据覆盖、区域汇总与学校差异。", status: "enabled" },
  { key: "five-education", label: "综合评价概览", description: "展示目标完成和结构化评价结果。", status: "enabled" },
  {
    key: "academic",
    label: "学业发展",
    description: "展示有效考试覆盖及校内同年级可比边界。",
    status: "limited",
    limitation: "当前只有校内同年级相对位置口径；不展示跨校学业排名、绝对水平或趋势结论。",
  },
  {
    key: "sports-health",
    label: "运动健康",
    description: "展示体测、AI 体锻和阳光长跑的有效记录。",
    status: "limited",
    limitation: "体测总达标率须补齐统一标准版本、适用人群和完整测试字段后才能发布。",
  },
  {
    key: "mental-health",
    label: "心理健康",
    description: "仅保留安全接入说明。",
    status: "restricted",
    limitation: "未接入经授权、审计和专业处置链路的心理健康数据，不生成风险人数、诊断或学生标签。",
  },
  { key: "honor", label: "荣誉发展", description: "展示荣誉覆盖与记录数量。", status: "enabled" },
  {
    key: "behavior",
    label: "行为习惯",
    description: "展示近 7 天或近 30 天到馆与借阅累计值、学期生均泡馆时长及借阅类别构成。",
    status: "limited",
    limitation: "考勤异常率缺少应考勤人次分母，当前不做异常率比较或行为判断。",
  },
  {
    key: "life",
    label: "生活观察",
    description: "受限数据，必须独立授权后使用。",
    status: "restricted",
    limitation: "消费、用餐和就诊为受限或高度敏感数据；未完成独立授权、最小样本隐藏和审计前不展示。",
  },
  { key: "practice", label: "实践活动", description: "展示有效活动参与与类别记录。", status: "enabled" },
  {
    key: "daily-evaluation",
    label: "日常评价",
    description: "展示结构化表扬与待改进记录。",
    status: "limited",
    limitation: "改进项闭环率依赖事项、复核和关闭流程数据，当前只展示已接入的评价记录。",
  },
];

export const studentGrowthPageCapabilityMatrix: readonly StudentGrowthPageCapability[] = [
  {
    key: "overview-summary",
    topic: "overview",
    label: "发展总览",
    status: "enabled",
    metricKeys: ["enrolled-student-count", "five-education-evaluation-coverage-rate"],
    sourceRecords: ["StudentProfileRecord", "GrowthEvaluationRecord"],
    qualityGate: "所有摘要必须显示覆盖率；数据不足时只展示待核查信号。",
    permissionBoundary: "仅区域匿名聚合，不展示学生个人明细。",
  },
  {
    key: "overview-school-comparison",
    topic: "overview",
    label: "学校差异",
    status: "enabled",
    metricKeys: [
      "enrolled-student-count",
      "five-education-goal-completion-rate",
      "five-education-evaluation-coverage-rate",
      "ai-exercise-participation-rate",
      "practice-participation-rate",
    ],
    sourceRecords: ["StudentProfileRecord", "GrowthGoalRecord", "GrowthEvaluationRecord", "AiExerciseRecord", "PracticeActivityRecord"],
    qualityGate: "只比较同口径、具有明确分子分母的学校聚合指标；不生成综合排名。",
    permissionBoundary: "仅学校匿名聚合，不展示个人名单或原因归因。",
  },
  {
    key: "overview-data-summary",
    topic: "overview",
    label: "数据总览",
    status: "enabled",
    metricKeys: [
      "five-education-evaluation-coverage-rate",
      "academic-exam-coverage-rate",
      "academic-unified-exam-record-coverage-rate",
      "fitness-test-record-coverage-rate",
      "ai-exercise-participation-rate",
      "sunshine-run-participation-rate",
      "honor-student-coverage-rate",
      "library-borrower-coverage-rate",
      "practice-participation-rate",
    ],
    sourceRecords: [
      "GrowthEvaluationRecord",
      "AcademicExamRecord",
      "PhysicalFitnessTestRecord",
      "AiExerciseRecord",
      "SunshineRunRecord",
      "HonorRecord",
      "BookBorrowRecord",
      "PracticeActivityRecord",
    ],
    qualityGate: "只汇总同一筛选范围下已注册的覆盖率或参与率；统考得分率须限定在同一考试批次、学科、年级和试卷版本内；每项都显示分子、分母和数据质量。",
    permissionBoundary: "统一呈现数据接入与参与事实，不生成跨领域综合指数或学生标签。",
  },
  {
    key: "overview-data-attention",
    topic: "overview",
    label: "数据关注",
    status: "enabled",
    metricKeys: [],
    sourceRecords: ["PortraitMetric.quality", "AttentionSignal.evidence"],
    qualityGate: "仅输出低覆盖率等有规则、有证据的核查信号。",
    permissionBoundary: "不生成原因诊断、干预建议或伪造处置闭环。",
  },
  {
    key: "five-education-topic",
    topic: "five-education",
    label: "五育评价专题",
    status: "enabled",
    metricKeys: [
      "five-education-goal-completion-rate",
      "five-education-evaluation-coverage-rate",
      "five-education-evaluated-student-count",
      "five-education-evaluation-record-count",
      "five-education-evaluation-form-version-count",
    ],
    sourceRecords: ["GrowthGoalRecord", "GrowthEvaluationRecord"],
    qualityGate: "成长目标完成率按学分总和计算；评价结果必须带评价表版本、一级指标、二级指标、评价项和该版本定义的评价等级。",
    permissionBoundary: "仅聚合展示，不推导跨维度综合评分。",
  },
  {
    key: "academic-topic",
    topic: "academic",
    label: "学业发展专题",
    status: "limited",
    metricKeys: [
      "academic-exam-coverage-rate",
      "academic-unified-exam-record-coverage-rate",
      "academic-unified-exam-average-score-rate",
      "academic-unified-exam-standard-score",
      "academic-unified-exam-excellent-rate",
      "academic-unified-exam-good-or-above-rate",
      "academic-unified-exam-pass-rate",
      "academic-unified-exam-low-score-rate",
      "academic-unified-exam-score-band-distribution",
      "academic-unified-exam-score-rate-trend",
    ],
    sourceRecords: ["AcademicExamRecord"],
    qualityGate: "可比考试须明确 examId、考试类型、组织范围、考试计划、试卷版本、年级、学科、排名、参考人数和可比范围。",
    permissionBoundary: "只允许校内同年级纵向解读，不做跨校排名。",
    limitation: "当前可发布同批次质量结构和期中—期末描述性变化；知识模块、正式学业增值和三期以上稳定性仍缺少必要来源。",
  },
  {
    key: "sports-health-topic",
    topic: "sports-health",
    label: "运动健康专题",
    status: "limited",
    metricKeys: [
      "fitness-test-record-coverage-rate",
      "fitness-standard-pass-rate",
      "sports-goal-completion-rate",
      "fitness-test-item-pass-rate",
      "ai-exercise-participation-rate",
      "ai-exercise-sessions-per-participant",
      "sunshine-run-participation-rate",
      "sunshine-run-total-distance",
      "sunshine-run-distance-per-participant",
      "sunshine-run-session-count",
      "sunshine-run-duration-per-participant",
    ],
    sourceRecords: ["GrowthGoalRecord", "PhysicalFitnessTestRecord", "AiExerciseRecord", "SunshineRunRecord"],
    qualityGate: "体测项目比较必须保持同一标准版本；运动记录仅纳入有效或已核验记录。",
    permissionBoundary: "不据此生成健康诊断、风险标签或个人排名。",
    limitation: "当前可发布同一标准版本下的学生体测达标率；没有医疗诊断和风险模型，不发布健康风险结论。",
  },
  {
    key: "mental-health-topic",
    topic: "mental-health",
    label: "心理健康专题",
    status: "restricted",
    metricKeys: [],
    sourceRecords: [],
    qualityGate: "需先建立专业量表、知情授权、最小必要聚合、复核与转介闭环。",
    permissionBoundary: "无独立授权和审计时禁止展示、推断或导出。",
    limitation: "当前无可发布指标。",
  },
  {
    key: "honor-topic",
    topic: "honor",
    label: "荣誉发展专题",
    status: "enabled",
    metricKeys: [
      "honor-student-coverage-rate",
      "honor-per-100-students",
      "honor-national-count",
      "honor-provincial-count",
      "honor-city-count",
    ],
    sourceRecords: ["HonorRecord"],
    qualityGate: "荣誉记录按 sourceRecordId 去重；必须同时保留颁发时间和荣誉类别。",
    permissionBoundary: "没有参与机会分母时，不评价机会公平性。",
  },
  {
    key: "behavior-topic",
    topic: "behavior",
    label: "行为习惯专题",
    status: "limited",
    metricKeys: [
      "library-visit-coverage-rate",
      "library-borrower-coverage-rate",
      "library-dwell-hours-per-student",
      "library-visit-count-last-7-days",
      "library-visit-count-last-30-days",
      "book-borrow-volume-last-7-days",
      "book-borrow-volume-last-30-days",
      "book-borrow-transaction-count-last-7-days",
      "book-borrow-transaction-count-last-30-days",
    ],
    sourceRecords: ["LibraryVisitRecord", "BookBorrowRecord", "AttendanceRecord"],
    qualityGate: "借阅记录不等同于完成阅读；考勤异常率须先补齐应考勤人次。",
    permissionBoundary: "不根据借阅、到馆或考勤记录生成行为标签。",
    limitation: "当前以来源最新业务时间为截止日展示近 7 天或近 30 天到馆、借阅累计值，并保留学期生均泡馆时长；不展示考勤异常率。",
  },
  {
    key: "life-topic",
    topic: "life",
    label: "生活观察专题",
    status: "restricted",
    metricKeys: [],
    sourceRecords: ["ConsumptionRecord", "CampusClinicRecord"],
    qualityGate: "需完成独立授权、最小样本门槛、脱敏及审计；消费记录也须明确供餐资格分母。",
    permissionBoundary: "不得用于成长评分、学生标签、公开排名或疾病诊断。",
    limitation: "当前无可发布指标。",
  },
  {
    key: "practice-topic",
    topic: "practice",
    label: "实践活动专题",
    status: "enabled",
    metricKeys: [
      "practice-participation-rate",
      "practice-activity-count-per-student",
      "practice-category-count-per-student",
      "practice-category-coverage-rate",
      "practice-moral-participation-rate",
      "practice-intellectual-participation-rate",
      "practice-physical-participation-rate",
      "practice-aesthetic-participation-rate",
      "practice-labor-participation-rate",
      "practice-club-participation-rate",
      "practice-volunteer-participation-rate",
    ],
    sourceRecords: ["PracticeActivityRecord"],
    qualityGate: "仅统计已核验活动；参与次数不等同于活动质量。",
    permissionBoundary: "不以活动次数推导综合素质结论。",
  },
  {
    key: "daily-evaluation-topic",
    topic: "daily-evaluation",
    label: "日常评价专题",
    status: "limited",
    metricKeys: [
      "daily-evaluation-record-coverage-rate",
      "daily-evaluation-positive-rate",
      "daily-evaluation-improvement-rate",
    ],
    sourceRecords: ["DailyEvaluationRecord"],
    qualityGate: "必须同时保留评价表版本与覆盖率；评价频率不同不直接比较。",
    permissionBoundary: "不将待改进记录作为学生标签或处分依据。",
    limitation: "当前没有改进事项工作流，不能展示闭环率。",
  },
];

export const studentGrowthTopicCapabilityByKey = new Map(
  studentGrowthTopicCapabilityMatrix.map((topic) => [topic.key, topic]),
);

export const studentGrowthPageCapabilityByKey = new Map(
  studentGrowthPageCapabilityMatrix.map((capability) => [capability.key, capability]),
);

export function pageCapabilityForTopic(topic: StudentGrowthTopicKey) {
  return studentGrowthPageCapabilityMatrix.find((capability) => capability.topic === topic && capability.key.endsWith("-topic"));
}

export function assertStudentGrowthCapabilityMatrix() {
  for (const capability of studentGrowthPageCapabilityMatrix) {
    for (const metricKey of capability.metricKeys) {
      if (!portraitMetricDefinitionByKey.has(metricKey)) {
        throw new Error(`页面能力 ${capability.key} 引用了未注册指标 ${metricKey}`);
      }
    }
    if (capability.status !== "enabled" && !capability.limitation) {
      throw new Error(`受限页面能力 ${capability.key} 必须说明限制原因`);
    }
  }
}
