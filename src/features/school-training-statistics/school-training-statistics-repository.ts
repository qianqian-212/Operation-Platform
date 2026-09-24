import { loadSchoolTrainingStatistics } from "@/features/school-training-statistics/mock-data";
import type { SchoolTrainingStatisticsResult } from "@/features/school-training-statistics/types";

export interface SchoolTrainingStatisticsRepository {
  load(tenantId: string, semester: string): Promise<SchoolTrainingStatisticsResult>;
}

const localRepository: SchoolTrainingStatisticsRepository = {
  async load(_tenantId, _semester) {
    return loadSchoolTrainingStatistics();
  },
};

export const schoolTrainingStatisticsRepository: SchoolTrainingStatisticsRepository =
  localRepository;
