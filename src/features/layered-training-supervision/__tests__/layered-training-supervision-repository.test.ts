import { beforeEach, describe, expect, it } from "vitest";
import { resetSupervisionStandardMockData } from "@/features/layered-training-supervision/mock-data";
import { layeredTrainingSupervisionRepository } from "@/features/layered-training-supervision/layered-training-supervision-repository";
import { DEFAULT_SUPERVISION_STANDARD } from "@/features/layered-training-supervision/types";

describe("layered training supervision repository", () => {
  beforeEach(() => {
    resetSupervisionStandardMockData();
  });

  it("loads the default supervision standard for a new tenant", async () => {
    const standard = await layeredTrainingSupervisionRepository.load("bureau-001");
    expect(standard).toEqual(DEFAULT_SUPERVISION_STANDARD);
  });

  it("saves standards per tenant", async () => {
    const saved = await layeredTrainingSupervisionRepository.save("bureau-001", {
      slowProgressDays: 10,
      noticeCycleDays: 7,
      semesterCreditLine: 18,
      warningTriggerPercent: 55,
    });
    expect(saved.semesterCreditLine).toBe(18);

    const loaded = await layeredTrainingSupervisionRepository.load("bureau-001");
    const other = await layeredTrainingSupervisionRepository.load("bureau-002");
    expect(loaded.noticeCycleDays).toBe(7);
    expect(other).toEqual(DEFAULT_SUPERVISION_STANDARD);
  });

  it("rejects a warning percent outside 0-100", async () => {
    await expect(
      layeredTrainingSupervisionRepository.save("bureau-001", {
        ...DEFAULT_SUPERVISION_STANDARD,
        warningTriggerPercent: 120,
      }),
    ).rejects.toThrow("达标预警触发比例需在 0-100 之间");
  });

  it("rejects a non-integer slow progress day count", async () => {
    await expect(
      layeredTrainingSupervisionRepository.save("bureau-001", {
        ...DEFAULT_SUPERVISION_STANDARD,
        slowProgressDays: 1.5,
      }),
    ).rejects.toThrow("进度缓慢判定天数需在 1-30 之间");
  });
});
