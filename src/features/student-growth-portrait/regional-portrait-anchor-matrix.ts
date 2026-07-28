import { portraitMetricDefinitionByKey } from "./metric-registry";

export type RegionalPortraitAnchorStatus = "enabled" | "limited" | "planned";

/**
 * 区域学生发展画像左侧锚点的唯一事实源。
 *
 * 每一项对应同一页面右侧的一个连续内容区，不代表路由、菜单节点或独立页面。
 * 底层可以使用学生个体事实参与计算，但区域端只发布区域、学校、年级、学科和群体聚合。
 */
export interface RegionalPortraitAnchorCapability {
  key: string;
  label: string;
  description: string;
  status: RegionalPortraitAnchorStatus;
  metricKeys: readonly string[];
  sourceRecords: readonly string[];
  qualityGate: string;
  permissionBoundary: string;
  limitation?: string;
  missingRequirements?: readonly string[];
}

export const regionalPortraitAnchorMatrix: readonly RegionalPortraitAnchorCapability[] = [
  {
    key: "regional-overview",
    label: "区域发展总览",
    description: "汇总区域学生规模、数据覆盖、主要发展事实与需要核查的数据问题。",
    status: "enabled",
    metricKeys: [
      "enrolled-student-count",
      "five-education-evaluation-coverage-rate",
      "academic-unified-exam-record-coverage-rate",
      "fitness-test-record-coverage-rate",
      "ai-exercise-participation-rate",
      "practice-participation-rate",
    ],
    sourceRecords: ["StudentProfileRecord", "GrowthEvaluationRecord", "AcademicExamRecord", "PhysicalFitnessTestRecord", "AiExerciseRecord", "PracticeActivityRecord"],
    qualityGate: "摘要只发布有来源、分子、分母、覆盖率和计算版本的群体事实；覆盖不足时只提示核查。",
    permissionBoundary: "仅展示区域匿名聚合，不展示班级、学生名单或个人明细。",
  },
  {
    key: "academic-development",
    label: "学业发展画像",
    description: "观察统考覆盖、同口径得分结构与学科发展，不进入学生个人成绩。",
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
    qualityGate: "统考比较必须保持同一考试批次、考试计划、年级、学科和试卷版本；可识别子群体少于 10 人时不发布明细指标。",
    permissionBoundary: "最低分析粒度为学校、年级、学科或学生群体，不展示学生个人排名。",
    limitation: "当前可展示统考整体质量、分数段结构、学科质量、校际结构和期中—期末描述性变化；知识模块、正式增值和三期以上稳定性仍未发布。",
    missingRequirements: ["知识模块及题目映射", "正式增值模型起点与规则版本", "连续三期以上标准化成绩序列", "学校类型与城乡片区主数据"],
  },
  {
    key: "student-cohorts",
    label: "学生群体画像",
    description: "按明确规则观察临界、困难、进步或波动群体的规模、占比和分布。",
    status: "planned",
    metricKeys: [],
    sourceRecords: ["AcademicExamRecord", "GrowthEvaluationRecord", "AttendanceRecord"],
    qualityGate: "每个群体必须有可版本化定义、互斥或重叠规则、适用范围、最小样本和可比周期。",
    permissionBoundary: "只展示群体数量、比例和分布；区域端禁止打开成员名单或反向识别个人。",
    limitation: "现有数据尚未定义临界、困难、进步和波动群体的正式阈值，因此不生成群体结论。",
    missingRequirements: ["群体定义与阈值版本", "连续可比周期", "最小统计单元规则", "群体迁移计算口径"],
  },
  {
    key: "school-development",
    label: "学校发展画像",
    description: "在同一筛选范围内比较学校聚合指标、数据覆盖和发展结构。",
    status: "enabled",
    metricKeys: [
      "enrolled-student-count",
      "five-education-goal-completion-rate",
      "five-education-evaluation-coverage-rate",
      "ai-exercise-participation-rate",
      "practice-participation-rate",
    ],
    sourceRecords: ["StudentProfileRecord", "GrowthGoalRecord", "GrowthEvaluationRecord", "AiExerciseRecord", "PracticeActivityRecord"],
    qualityGate: "只比较同口径、具有明确分子分母且通过质量门槛的学校聚合指标。",
    permissionBoundary: "只到学校、年级、学科和群体，不提供学生明细或综合排名。",
  },
  {
    key: "regional-balance",
    label: "区域均衡分析",
    description: "观察校际、片区和学校类型差异及其变化方向。",
    status: "planned",
    metricKeys: [],
    sourceRecords: ["SchoolPortraitSummary", "StudentProfileRecord"],
    qualityGate: "差异指标须明确同类学校分组、样本门槛、离散度公式、历史基期和数据完整度。",
    permissionBoundary: "用于资源配置和质量监测，不生成学校综合排名或原因归责。",
    limitation: "当前只有学校同口径指标对照，缺少片区、城乡、学校类型和历史基期，不能发布均衡变化结论。",
    missingRequirements: ["学校类型与城乡片区主数据", "均衡度公式和基期", "历史同口径学校聚合快照"],
  },
  {
    key: "comprehensive-development",
    label: "综合素质画像",
    description: "汇总五育、体育健康、荣誉、行为与实践活动的群体覆盖和结构。",
    status: "limited",
    metricKeys: [
      "five-education-goal-completion-rate",
      "five-education-evaluation-coverage-rate",
      "fitness-test-record-coverage-rate",
      "fitness-test-item-pass-rate",
      "ai-exercise-participation-rate",
      "sunshine-run-participation-rate",
      "honor-student-coverage-rate",
      "library-borrower-coverage-rate",
      "practice-participation-rate",
      "daily-evaluation-positive-rate",
    ],
    sourceRecords: ["GrowthGoalRecord", "GrowthEvaluationRecord", "PhysicalFitnessTestRecord", "AiExerciseRecord", "SunshineRunRecord", "HonorRecord", "BookBorrowRecord", "PracticeActivityRecord", "DailyEvaluationRecord"],
    qualityGate: "各领域独立呈现来源与覆盖；没有统一评价方案、机会分母和标准版本时不合成综合指数。",
    permissionBoundary: "只展示学校和群体覆盖，不据活动次数给学生评分、排名或贴标签。",
    limitation: "当前可展示已接入记录的覆盖与参与事实；艺术课程、劳动课程、科技创新等专门来源尚未接入。",
    missingRequirements: ["艺术、劳动与科技课程台账", "活动机会分母", "统一评价方案版本"],
  },
  {
    key: "growth-support",
    label: "成长支持成效",
    description: "评估学校对重点群体的支持覆盖、措施完成和群体改善情况。",
    status: "planned",
    metricKeys: [],
    sourceRecords: [],
    qualityGate: "必须形成群体识别、支持计划、措施执行、复核、关闭和随访的完整事件链。",
    permissionBoundary: "区域端只看学校和群体成效，不展示具体学生接受了何种支持。",
    limitation: "当前没有成长支持工作流数据，不能虚构覆盖率、改善率或转化率。",
    missingRequirements: ["支持计划与适用群体", "措施执行和完成记录", "复核结果与随访周期", "改善和转化规则"],
  },
  {
    key: "special-analysis",
    label: "专题分析",
    description: "围绕特定年级、学科、片区或群体形成有明确口径的专题观察。",
    status: "limited",
    metricKeys: [],
    sourceRecords: ["PortraitMetric", "AttentionSignal"],
    qualityGate: "专题必须声明筛选范围、使用指标、比较基准、数据质量和结论限制。",
    permissionBoundary: "专题仍遵循区域聚合边界；心理、医疗等敏感专题需独立授权和审计。",
    limitation: "当前只具备数据覆盖核查信号，尚未建立可保存、复用和发布的专题配置。",
    missingRequirements: ["专题定义与版本", "比较基准", "保存和发布流程"],
  },
  {
    key: "ai-analysis",
    label: "AI 分析助手",
    description: "基于已发布的区域聚合指标回答群体变化、学校差异和共性问题。",
    status: "planned",
    metricKeys: [],
    sourceRecords: [],
    qualityGate: "AI 只能引用已发布指标、口径、证据和权限范围，回答必须可回溯且明确不确定性。",
    permissionBoundary: "禁止查询学生姓名、个人成绩、个人行为、个人风险和个体辅导方案。",
    limitation: "当前聚合数据尚未接入受控 AI 上下文，页面不展示伪造的分析对话。",
    missingRequirements: ["受控聚合查询工具", "指标引用与证据链", "敏感问题拦截", "审计记录"],
  },
  {
    key: "regional-report",
    label: "区域发展报告",
    description: "按固定口径生成区域、学段、年级、学科或群体发展报告。",
    status: "planned",
    metricKeys: [],
    sourceRecords: [],
    qualityGate: "报告必须固化筛选快照、指标版本、数据时间、质量状态、引用来源和审核状态。",
    permissionBoundary: "报告只包含符合发布门槛的聚合结果，不导出学生明细或小样本群体。",
    limitation: "当前没有报告模板、版本快照与审核发布工作流，因此不提供虚假导出按钮。",
    missingRequirements: ["报告模板和章节规则", "指标快照与版本", "审核发布流程", "脱敏导出策略"],
  },
];

export const regionalPortraitAnchorByKey = new Map(
  regionalPortraitAnchorMatrix.map((anchor) => [anchor.key, anchor]),
);

export function assertRegionalPortraitAnchorMatrix() {
  for (const anchor of regionalPortraitAnchorMatrix) {
    for (const metricKey of anchor.metricKeys) {
      if (!portraitMetricDefinitionByKey.has(metricKey)) {
        throw new Error(`区域画像锚点 ${anchor.key} 引用了未注册指标 ${metricKey}`);
      }
    }
    if (anchor.status !== "enabled" && !anchor.limitation) {
      throw new Error(`非完整可用锚点 ${anchor.key} 必须说明限制原因`);
    }
  }
}
