import { listLayeredTrainingNotices } from "@/features/layered-training-notice/mock-data";
import type {
  LayeredTrainingNoticeListResult,
  LayeredTrainingNoticeQuery,
} from "@/features/layered-training-notice/types";

export interface LayeredTrainingNoticeRepository {
  list(tenantId: string, query: LayeredTrainingNoticeQuery): Promise<LayeredTrainingNoticeListResult>;
}

const localRepository: LayeredTrainingNoticeRepository = {
  async list(_tenantId, query) {
    return listLayeredTrainingNotices(query);
  },
};

export const layeredTrainingNoticeRepository: LayeredTrainingNoticeRepository = localRepository;
