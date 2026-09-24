import type { SchoolTrainingStatisticsResult } from "@/features/school-training-statistics/types";

export function loadSchoolTrainingStatistics(): SchoolTrainingStatisticsResult {
  return {
    schoolName: "实验小学",
    stats: {
      achievementCount: 256,
      passRatePercent: 87.3,
      averageCredits: 32.5,
    },
    rows: [
      { id: "sub-1", subject: "语文", achievementCount: 52, sharePercent: 20.3, averageCredits: 35.2 },
      { id: "sub-2", subject: "数学", achievementCount: 48, sharePercent: 18.8, averageCredits: 33.8 },
      { id: "sub-3", subject: "英语", achievementCount: 42, sharePercent: 16.4, averageCredits: 31.5 },
      { id: "sub-4", subject: "物理", achievementCount: 35, sharePercent: 13.7, averageCredits: 30.2 },
      { id: "sub-5", subject: "化学", achievementCount: 28, sharePercent: 10.9, averageCredits: 29.6 },
      { id: "sub-6", subject: "其他", achievementCount: 51, sharePercent: 19.9, averageCredits: 31.1 },
    ],
  };
}
