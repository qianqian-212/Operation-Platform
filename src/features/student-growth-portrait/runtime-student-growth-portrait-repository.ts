import {
  AggregatingStudentGrowthPortraitRepository,
  type StudentGrowthPortraitRepository,
} from "./student-growth-portrait-repository";
import { virtualPortraitRawDataSource } from "./virtual-portrait-raw-data-source";

/**
 * 当前运行时使用的画像仓库。
 *
 * 本地演示阶段接入确定性虚拟原始数据；部署真实环境时，在组合根替换
 * `virtualPortraitRawDataSource` 为经权限过滤的 API 适配器，无需修改页面或聚合规则。
 */
export const runtimeStudentGrowthPortraitRepository: StudentGrowthPortraitRepository =
  new AggregatingStudentGrowthPortraitRepository(virtualPortraitRawDataSource);

