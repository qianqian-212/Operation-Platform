import {
  studentGrowthTopicCapabilityMatrix,
  type PageCapabilityStatus,
  type StudentGrowthTopicKey,
} from "./page-capability-matrix";

export type { StudentGrowthTopicKey } from "./page-capability-matrix";

export interface StudentGrowthTopicNavigationItem {
  key: StudentGrowthTopicKey;
  label: string;
  description: string;
  status: PageCapabilityStatus;
  restricted?: boolean;
}

const toNavigationItem = (topic: typeof studentGrowthTopicCapabilityMatrix[number]): StudentGrowthTopicNavigationItem => ({
  ...topic,
  restricted: topic.status === "restricted",
});

export const primaryStudentGrowthTopics: readonly StudentGrowthTopicNavigationItem[] = studentGrowthTopicCapabilityMatrix
  .slice(0, 5)
  .map(toNavigationItem);

export const moreStudentGrowthTopics: readonly StudentGrowthTopicNavigationItem[] = studentGrowthTopicCapabilityMatrix
  .slice(5)
  .map(toNavigationItem);

export const studentGrowthTopics = [...primaryStudentGrowthTopics, ...moreStudentGrowthTopics];

export const studentGrowthTopicByKey = new Map(
  studentGrowthTopics.map((topic) => [topic.key, topic]),
);
