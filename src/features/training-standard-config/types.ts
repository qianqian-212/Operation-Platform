import type { StatusTagColor } from "@/components/StatusTag.vue";

/** 等级标签色调 */
export type TrainingStandardLevelTone = "green" | "blue" | "gray";

export interface TrainingStandardLevel {
  id: string;
  name: string;
  description: string;
  scoreLabel: string;
  tone: TrainingStandardLevelTone;
}

export interface TrainingStandardType {
  id: string;
  name: string;
  /** 类型说明 */
  description: string;
  attachmentName: string;
  /** 附件大小展示文案 */
  attachmentSizeLabel: string;
  levels: TrainingStandardLevel[];
}

export interface TrainingStandardWarning {
  annualCredits: number;
  triggerPercent: number;
}

export interface TrainingStandardConfig {
  semester: string;
  types: TrainingStandardType[];
  warning: TrainingStandardWarning;
}

export interface TrainingStandardFlatRow {
  typeId: string;
  typeName: string;
  typeRowSpan: number;
  attachmentName: string;
  levelId: string;
  levelName: string;
  levelDescription: string;
  scoreLabel: string;
  tone: TrainingStandardLevelTone;
}

export const TRAINING_STANDARD_SEMESTER_OPTIONS = [
  { value: "2026-fall", label: "2026年秋季学期" },
  { value: "2026-spring", label: "2026年春季学期" },
  { value: "2025-fall", label: "2025年秋季学期" },
] as const;

export const TRAINING_STANDARD_LEVEL_TONE_MAP: Record<
  TrainingStandardLevelTone,
  StatusTagColor
> = {
  green: "green",
  blue: "blue",
  gray: "gray",
};

export function flattenTrainingStandardTypes(
  types: readonly TrainingStandardType[],
): TrainingStandardFlatRow[] {
  const rows: TrainingStandardFlatRow[] = [];
  for (const type of types) {
    const span = Math.max(type.levels.length, 1);
    type.levels.forEach((level, index) => {
      rows.push({
        typeId: type.id,
        typeName: type.name,
        typeRowSpan: index === 0 ? span : 0,
        attachmentName: type.attachmentName,
        levelId: level.id,
        levelName: level.name,
        levelDescription: level.description,
        scoreLabel: level.scoreLabel,
        tone: level.tone,
      });
    });
  }
  return rows;
}
