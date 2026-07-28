import type { PortraitDataset, PortraitQuery, PortraitRawData } from "./data-contract";
import {
  aggregatePortraitDataset,
  type PortraitAggregationRules,
} from "./portrait-aggregation";

/**
 * 后端适配边界。实现方负责按租户、权限与查询条件取回已经脱敏、授权的原始记录。
 * UI 不得绕过此接口读取学生个人明细。
 */
export interface PortraitRawDataSource {
  load(query: PortraitQuery, signal?: AbortSignal): Promise<PortraitRawData>;
}

export interface StudentGrowthPortraitRepository {
  query(query: PortraitQuery, signal?: AbortSignal): Promise<PortraitDataset>;
}

export class AggregatingStudentGrowthPortraitRepository implements StudentGrowthPortraitRepository {
  constructor(
    private readonly source: PortraitRawDataSource,
    private readonly rules?: PortraitAggregationRules,
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  async query(query: PortraitQuery, signal?: AbortSignal) {
    const rawData = await this.source.load(query, signal);
    return aggregatePortraitDataset(rawData, query, this.now(), this.rules);
  }
}
