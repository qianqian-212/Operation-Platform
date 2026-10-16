import { queryLayeredTrainingOverview } from "@/features/layered-training-overview/mock-data";
import type {
  LayeredTrainingOverviewQuery,
  LayeredTrainingOverviewResult,
} from "@/features/layered-training-overview/types";

export interface LayeredTrainingOverviewRepository {
  load(tenantId: string, query: LayeredTrainingOverviewQuery): Promise<LayeredTrainingOverviewResult>;
}

const localRepository: LayeredTrainingOverviewRepository = {
  async load(_tenantId, query) {
    return queryLayeredTrainingOverview(query);
  },
};

export const layeredTrainingOverviewRepository: LayeredTrainingOverviewRepository = localRepository;
