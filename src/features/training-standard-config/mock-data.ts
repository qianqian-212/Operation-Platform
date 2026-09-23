import type {
  TrainingStandardConfig,
  TrainingStandardType,
  TrainingStandardWarning,
} from "@/features/training-standard-config/types";

function cloneConfig(config: TrainingStandardConfig): TrainingStandardConfig {
  return {
    semester: config.semester,
    warning: { ...config.warning },
    types: config.types.map((type) => ({
      ...type,
      levels: type.levels.map((level) => ({ ...level })),
    })),
  };
}

const seedBySemester: Record<string, TrainingStandardConfig> = {
  "2026-fall": {
    semester: "2026-fall",
    warning: { annualCredits: 36, triggerPercent: 60 },
    types: [
      {
        id: "type-research-award",
        name: "科研获奖",
        attachmentName: "科研获奖评分标准.pdf",
        levels: [
          {
            id: "lvl-1",
            name: "一等奖",
            description: "国家级教学成果奖、科研课题成果一等奖",
            scoreLabel: "15",
            tone: "green",
          },
          {
            id: "lvl-2",
            name: "二等奖",
            description: "省级教学成果奖、科研课题成果二等奖",
            scoreLabel: "12",
            tone: "blue",
          },
          {
            id: "lvl-3",
            name: "三等奖",
            description: "市级教学成果奖、科研课题成果三等奖",
            scoreLabel: "8",
            tone: "gray",
          },
        ],
      },
      {
        id: "type-paper",
        name: "论文发表",
        attachmentName: "科研获奖评分标准.pdf",
        levels: [
          {
            id: "lvl-4",
            name: "核心期刊",
            description: "说明文字",
            scoreLabel: "8",
            tone: "green",
          },
          {
            id: "lvl-5",
            name: "省级期刊",
            description: "说明文字",
            scoreLabel: "8",
            tone: "blue",
          },
          {
            id: "lvl-6",
            name: "市级刊物",
            description: "说明文字",
            scoreLabel: "8",
            tone: "gray",
          },
        ],
      },
      {
        id: "type-self-study",
        name: "提高自学",
        attachmentName: "提高自学认定标准.pdf",
        levels: [
          {
            id: "lvl-7",
            name: "学历提升",
            description: "取得更高学历学位",
            scoreLabel: "12",
            tone: "green",
          },
          {
            id: "lvl-8",
            name: "资格证书",
            description: "取得专业资格证书",
            scoreLabel: "8",
            tone: "blue",
          },
          {
            id: "lvl-9",
            name: "自主学习",
            description: "完成自主研修并提交证明",
            scoreLabel: "3-5",
            tone: "gray",
          },
        ],
      },
      {
        id: "type-training",
        name: "培训进修",
        attachmentName: "培训进修认定标准.pdf",
        levels: [
          {
            id: "lvl-10",
            name: "国家级培训",
            description: "国家级骨干 / 专项培训",
            scoreLabel: "10",
            tone: "green",
          },
          {
            id: "lvl-11",
            name: "省级培训",
            description: "省级专项培训并结业",
            scoreLabel: "8",
            tone: "blue",
          },
          {
            id: "lvl-12",
            name: "市/区级培训",
            description: "市、区组织的专题培训",
            scoreLabel: "4-6",
            tone: "gray",
          },
        ],
      },
      {
        id: "type-school-based",
        name: "校本研修",
        attachmentName: "校本研修认定标准.pdf",
        levels: [
          {
            id: "lvl-13",
            name: "校级重点项目",
            description: "学校立项重点研修项目",
            scoreLabel: "6",
            tone: "green",
          },
          {
            id: "lvl-14",
            name: "校级一般项目",
            description: "学校立项一般研修项目",
            scoreLabel: "4",
            tone: "blue",
          },
          {
            id: "lvl-15",
            name: "常规研修",
            description: "校本常规研修活动参与",
            scoreLabel: "2",
            tone: "gray",
          },
        ],
      },
    ],
  },
};

const FALL_2026_SEED = seedBySemester["2026-fall"]!;

let store: Record<string, TrainingStandardConfig> = {
  "2026-fall": cloneConfig(FALL_2026_SEED),
};

export function resetTrainingStandardMockData() {
  store = {
    "2026-fall": cloneConfig(FALL_2026_SEED),
  };
}

export function getTrainingStandardMockConfig(semester: string) {
  const found = store[semester] ?? {
    semester,
    warning: { annualCredits: 36, triggerPercent: 60 },
    types: [],
  };
  return cloneConfig(found);
}

export function saveTrainingStandardMockTypes(
  semester: string,
  types: TrainingStandardType[],
) {
  const current = getTrainingStandardMockConfig(semester);
  store[semester] = cloneConfig({
    ...current,
    semester,
    types: types.map((type) => ({
      ...type,
      levels: type.levels.map((level) => ({ ...level })),
    })),
  });
  return cloneConfig(store[semester]);
}

export function saveTrainingStandardMockWarning(
  semester: string,
  warning: TrainingStandardWarning,
) {
  const current = getTrainingStandardMockConfig(semester);
  store[semester] = cloneConfig({
    ...current,
    semester,
    warning: { ...warning },
  });
  return cloneConfig(store[semester]);
}
