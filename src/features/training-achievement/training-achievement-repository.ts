import {
  createTrainingAchievementMockDetail,
  getTrainingAchievementMockDetail,
  listTrainingAchievementMockRows,
  updateTrainingAchievementMockDetail,
} from "@/features/training-achievement/mock-data";
import type {
  PageResult,
  TrainingAchievementDetail,
  TrainingAchievementFilter,
  TrainingAchievementFormInput,
  TrainingAchievementRow,
  TrainingAchievementType,
} from "@/features/training-achievement/types";

export interface TrainingAchievementRepository {
  list(
    tenantId: string,
    filter: TrainingAchievementFilter,
    page: number,
    pageSize: number,
  ): Promise<PageResult<TrainingAchievementRow>>;
  detail(tenantId: string, id: string): Promise<TrainingAchievementDetail | undefined>;
  create(
    tenantId: string,
    input: TrainingAchievementFormInput,
  ): Promise<TrainingAchievementDetail>;
  update(
    tenantId: string,
    id: string,
    input: TrainingAchievementFormInput,
  ): Promise<TrainingAchievementDetail>;
}

function matchesFilter(row: TrainingAchievementRow, filter: TrainingAchievementFilter) {
  const keyword = filter.title.trim();
  if (keyword && !row.title.includes(keyword)) return false;
  if (filter.status && row.status !== filter.status) return false;
  if (filter.type && row.type !== filter.type) return false;
  if (filter.semester && row.semester !== filter.semester) return false;
  return true;
}

function validateFormInput(input: TrainingAchievementFormInput) {
  if (!input.title.trim()) throw new Error("请输入成果标题");
  if (!input.type) throw new Error("请选择研修类型");
  if (!input.levelId) throw new Error("请选择等级");
  if (!input.bureauId) throw new Error("请选择所属教育局");
  if (!input.semester) throw new Error("请选择所属学期");
  const abstract = input.abstract.trim();
  if (!abstract) throw new Error("请填写摘要");
  if (abstract.length < 200) throw new Error("摘要至少 200 字");
  if (input.asDraft) return;
  const files = [...input.certificateFiles, ...input.reportFiles];
  if (!files.length) throw new Error("请至少上传一项证明材料");
}

const localTrainingAchievementRepository: TrainingAchievementRepository = {
  async list(_tenantId, filter, page, pageSize) {
    const matched = listTrainingAchievementMockRows().filter((row) =>
      matchesFilter(row, filter),
    );
    const start = (page - 1) * pageSize;
    return {
      list: matched.slice(start, start + pageSize),
      total: matched.length,
    };
  },

  async detail(_tenantId, id) {
    return getTrainingAchievementMockDetail(id);
  },

  async create(_tenantId, input) {
    validateFormInput(input);
    return createTrainingAchievementMockDetail(input);
  },

  async update(_tenantId, id, input) {
    validateFormInput(input);
    return updateTrainingAchievementMockDetail(id, input);
  },
};

export const trainingAchievementRepository: TrainingAchievementRepository =
  localTrainingAchievementRepository;

export function emptyTrainingAchievementForm(): TrainingAchievementFormInput {
  return {
    title: "",
    type: "" as TrainingAchievementType | "",
    levelId: "",
    bureauId: "bureau-xx",
    semester: "2026-fall",
    subject: "语文",
    stage: "小学",
    abstract: "",
    certificateFiles: [],
    reportFiles: [],
    asDraft: false,
  };
}
