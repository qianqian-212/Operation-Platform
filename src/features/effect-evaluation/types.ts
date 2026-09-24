export interface EffectEvaluationSeries {
  label: string;
  value: number;
  displayValue: string;
}

export interface EffectEvaluationMetric {
  id: string;
  title: string;
  periodLabel: string;
  participating: EffectEvaluationSeries;
  nonParticipating: EffectEvaluationSeries;
}

export interface EffectEvaluationSummary {
  title: string;
  paragraphs: string[];
}

export interface EffectEvaluationSchoolRow {
  id: string;
  schoolName: string;
  participating: boolean;
  awardCount: number;
  paperCount: number;
  certificateCount: number;
}

export interface EffectEvaluationStats {
  schoolCount: number;
  participatingCount: number;
  nonParticipatingCount: number;
  awardIncreasePercent: number;
}

export interface EffectEvaluationDataset {
  stats: EffectEvaluationStats;
  metrics: EffectEvaluationMetric[];
  summary: EffectEvaluationSummary;
  schools: EffectEvaluationSchoolRow[];
}
