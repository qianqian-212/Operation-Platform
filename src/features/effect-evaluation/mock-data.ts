import type {
  EffectEvaluationDataset,
  EffectEvaluationMetric,
  EffectEvaluationSchoolRow,
} from "@/features/effect-evaluation/types";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function series(label: string, value: number, unit: string) {
  return { label, value, displayValue: `${value}${unit}` };
}

function metric(
  id: string,
  title: string,
  participatingValue: number,
  nonParticipatingValue: number,
  unit: string,
): EffectEvaluationMetric {
  return {
    id,
    title,
    periodLabel: "年度",
    participating: series("参与校", participatingValue, unit),
    nonParticipating: series("未参与", nonParticipatingValue, unit),
  };
}

function school(
  id: string,
  schoolName: string,
  participating: boolean,
): EffectEvaluationSchoolRow {
  return {
    id,
    schoolName,
    participating,
    awardCount: 6,
    paperCount: 6,
    certificateCount: 6,
  };
}

const DATASET: EffectEvaluationDataset = {
  stats: {
    schoolCount: 12,
    participatingCount: 6,
    nonParticipatingCount: 3,
    awardIncreasePercent: 248,
  },
  metrics: [
    metric("awards", "竞赛获奖", 42, 12, "次"),
    metric("papers", "论文发表", 42, 12, "次"),
    metric("certificates", "技能证书获取", 42, 12, "次"),
  ],
  summary: {
    title: "量化结果",
    paragraphs: [
      "在竞赛获奖方面参与跨校教研的学校平均 8.25 次/年，未参与学校仅 2.25 次/年，参与校获奖均值是未参与校的 267%，跨校教研对教师专业发展有显著促进作用。",
      "在论文发表、技能证书获取数等方面，参与校均显著优于未参与校。",
    ],
  },
  schools: [
    school("school-sun", "阳光小学", true),
    school("school-talent", "育才中学", true),
    school("school-culture", "文德小学", true),
    school("school-spring", "春风小学", false),
  ],
};

export function getEffectEvaluationDataset() {
  return clone(DATASET);
}
