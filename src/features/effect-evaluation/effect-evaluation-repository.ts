import { getEffectEvaluationDataset } from "@/features/effect-evaluation/mock-data";
import type { EffectEvaluationDataset } from "@/features/effect-evaluation/types";

export interface EffectEvaluationRepository {
  load(tenantId: string): Promise<EffectEvaluationDataset>;
}

const localEffectEvaluationRepository: EffectEvaluationRepository = {
  async load(_tenantId) {
    return getEffectEvaluationDataset();
  },
};

export const effectEvaluationRepository: EffectEvaluationRepository =
  localEffectEvaluationRepository;
