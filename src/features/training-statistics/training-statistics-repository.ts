import { listTrainingStatistics } from "@/features/training-statistics/mock-data";
import type { TrainingStatisticsListResult } from "@/features/training-statistics/types";

export interface TrainingStatisticsRepository {
  list(
    tenantId: string,
    semester: string,
    schoolKeyword: string,
    page: number,
    pageSize: number,
  ): Promise<TrainingStatisticsListResult>;
}

const localRepository: TrainingStatisticsRepository = {
  async list(_tenantId, _semester, schoolKeyword, page, pageSize) {
    return listTrainingStatistics(schoolKeyword, page, pageSize);
  },
};

export const trainingStatisticsRepository: TrainingStatisticsRepository = localRepository;
