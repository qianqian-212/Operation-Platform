import { ref } from "vue";
import { defineStore } from "pinia";
import { effectEvaluationRepository } from "@/features/effect-evaluation/effect-evaluation-repository";
import type {
  EffectEvaluationDataset,
  EffectEvaluationMetric,
  EffectEvaluationSchoolRow,
  EffectEvaluationStats,
  EffectEvaluationSummary,
} from "@/features/effect-evaluation/types";
import { useUserStore } from "@/stores/user";

export function emptyEffectEvaluationStats(): EffectEvaluationStats {
  return {
    schoolCount: 0,
    participatingCount: 0,
    nonParticipatingCount: 0,
    awardIncreasePercent: 0,
  };
}

export const useEffectEvaluationStore = defineStore("effect-evaluation", () => {
  const userStore = useUserStore();
  const loading = ref(false);
  const stats = ref<EffectEvaluationStats>(emptyEffectEvaluationStats());
  const metrics = ref<EffectEvaluationMetric[]>([]);
  const summary = ref<EffectEvaluationSummary>({ title: "", paragraphs: [] });
  const schools = ref<EffectEvaluationSchoolRow[]>([]);
  let requestSequence = 0;

  async function load() {
    const sequence = requestSequence + 1;
    requestSequence = sequence;
    loading.value = true;
    try {
      const dataset: EffectEvaluationDataset = await effectEvaluationRepository.load(
        userStore.currentTenant.id,
      );
      if (sequence !== requestSequence) return;
      stats.value = dataset.stats;
      metrics.value = dataset.metrics;
      summary.value = dataset.summary;
      schools.value = dataset.schools;
    } finally {
      if (sequence === requestSequence) loading.value = false;
    }
  }

  return {
    loading,
    stats,
    metrics,
    summary,
    schools,
    load,
  };
});
