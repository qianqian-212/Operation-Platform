import {
  getTrainingStandardMockConfig,
  saveTrainingStandardMockTypes,
  saveTrainingStandardMockWarning,
} from "@/features/training-standard-config/mock-data";
import type {
  TrainingStandardConfig,
  TrainingStandardType,
  TrainingStandardWarning,
} from "@/features/training-standard-config/types";

export interface TrainingStandardConfigRepository {
  load(tenantId: string, semester: string): Promise<TrainingStandardConfig>;
  saveTypes(
    tenantId: string,
    semester: string,
    types: TrainingStandardType[],
  ): Promise<TrainingStandardConfig>;
  saveWarning(
    tenantId: string,
    semester: string,
    warning: TrainingStandardWarning,
  ): Promise<TrainingStandardConfig>;
}

function validateWarning(warning: TrainingStandardWarning) {
  if (!Number.isFinite(warning.annualCredits) || warning.annualCredits <= 0) {
    throw new Error("请填写有效的年度学分达标要求");
  }
  if (
    !Number.isFinite(warning.triggerPercent) ||
    warning.triggerPercent < 0 ||
    warning.triggerPercent > 100
  ) {
    throw new Error("预警触发比例需在 0-100 之间");
  }
}

function validateTypes(types: readonly TrainingStandardType[]) {
  if (!types.length) throw new Error("请至少保留一种研修类型");
  for (const type of types) {
    if (!type.name.trim()) throw new Error("研修类型名称不能为空");
    if (!type.levels.length) throw new Error(`「${type.name}」至少需要一个等级`);
    for (const level of type.levels) {
      if (!level.name.trim()) throw new Error("等级名称不能为空");
      if (!level.scoreLabel.trim()) throw new Error("分值不能为空");
    }
  }
}

const localTrainingStandardConfigRepository: TrainingStandardConfigRepository = {
  async load(_tenantId, semester) {
    return getTrainingStandardMockConfig(semester);
  },

  async saveTypes(_tenantId, semester, types) {
    validateTypes(types);
    return saveTrainingStandardMockTypes(semester, types);
  },

  async saveWarning(_tenantId, semester, warning) {
    validateWarning(warning);
    return saveTrainingStandardMockWarning(semester, warning);
  },
};

export const trainingStandardConfigRepository: TrainingStandardConfigRepository =
  localTrainingStandardConfigRepository;
