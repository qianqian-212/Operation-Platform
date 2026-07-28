import { describe, expect, it } from "vitest";
import {
  moreStudentGrowthTopics,
  primaryStudentGrowthTopics,
  studentGrowthTopicByKey,
} from "../topic-navigation";

describe("student growth portrait topic navigation", () => {
  it("only exposes data domains with an explicit product boundary", () => {
    const topics = [...primaryStudentGrowthTopics, ...moreStudentGrowthTopics];

    expect(new Set(topics.map((topic) => topic.key)).size).toBe(topics.length);
    expect(topics.map((topic) => topic.key)).not.toContain("growth-support");
    expect(studentGrowthTopicByKey.get("life")?.restricted).toBe(true);
    expect(studentGrowthTopicByKey.get("mental-health")?.restricted).toBe(true);
  });
});
