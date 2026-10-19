import { getSchoolTrainingArchive } from "@/features/school-layered-training-archive/mock-data";
import type {
  SchoolTrainingArchiveQuery,
  SchoolTrainingArchiveSnapshot,
} from "@/features/school-layered-training-archive/types";

export interface SchoolTrainingArchiveRepository {
  load(tenantId: string, query: SchoolTrainingArchiveQuery): Promise<SchoolTrainingArchiveSnapshot>;
}

const localRepository: SchoolTrainingArchiveRepository = {
  async load(_tenantId, query) {
    return getSchoolTrainingArchive(query);
  },
};

export const schoolTrainingArchiveRepository: SchoolTrainingArchiveRepository = localRepository;
