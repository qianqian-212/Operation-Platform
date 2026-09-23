import { beforeEach, describe, expect, it } from "vitest";
import { resetTrainingStandardMockData } from "@/features/training-standard-config/mock-data";
import { trainingStandardConfigRepository } from "@/features/training-standard-config/training-standard-config-repository";
import { flattenTrainingStandardTypes } from "@/features/training-standard-config/types";

describe("training standard config repository", () => {
  beforeEach(() => {
    resetTrainingStandardMockData();
  });

  it("loads seeded types and warning for a semester", async () => {
    const config = await trainingStandardConfigRepository.load("bureau-001", "2026-fall");
    expect(config.types).toHaveLength(5);
    expect(config.types[0]?.name).toBe("科研获奖");
    expect(config.warning).toEqual({ annualCredits: 36, triggerPercent: 60 });
    expect(flattenTrainingStandardTypes(config.types)).toHaveLength(15);
  });

  it("saves warning thresholds", async () => {
    const saved = await trainingStandardConfigRepository.saveWarning("bureau-001", "2026-fall", {
      annualCredits: 40,
      triggerPercent: 55,
    });
    expect(saved.warning).toEqual({ annualCredits: 40, triggerPercent: 55 });

    const loaded = await trainingStandardConfigRepository.load("bureau-001", "2026-fall");
    expect(loaded.warning.annualCredits).toBe(40);
  });

  it("rejects invalid warning percent", async () => {
    await expect(
      trainingStandardConfigRepository.saveWarning("bureau-001", "2026-fall", {
        annualCredits: 36,
        triggerPercent: 120,
      }),
    ).rejects.toThrow("预警触发比例需在 0-100 之间");
  });

  it("saves updated type list", async () => {
    const config = await trainingStandardConfigRepository.load("bureau-001", "2026-fall");
    const nextTypes = config.types.map((type, index) =>
      index === 0 ? { ...type, name: "科研获奖（修订）" } : type,
    );
    const saved = await trainingStandardConfigRepository.saveTypes(
      "bureau-001",
      "2026-fall",
      nextTypes,
    );
    expect(saved.types[0]?.name).toBe("科研获奖（修订）");
  });
});
