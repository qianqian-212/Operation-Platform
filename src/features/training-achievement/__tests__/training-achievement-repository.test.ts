import { beforeEach, describe, expect, it } from "vitest";
import {
  resetTrainingAchievementMockData,
} from "@/features/training-achievement/mock-data";
import { trainingAchievementRepository } from "@/features/training-achievement/training-achievement-repository";
import type { TrainingAchievementFormInput } from "@/features/training-achievement/types";

function sampleInput(
  overrides: Partial<TrainingAchievementFormInput> = {},
): TrainingAchievementFormInput {
  return {
    title: "区域语文单元整体教学案例",
    type: "teaching-result",
    levelId: "city-second",
    bureauId: "bureau-xx",
    semester: "2026-fall",
    subject: "语文",
    stage: "小学",
    abstract: `${"围绕单元整体教学开展实践研究，形成可迁移案例与课例资源，服务区域校本研修改进与课堂提质。".repeat(5)}`,
    certificateFiles: [
      {
        id: "cert-1",
        kind: "certificate",
        name: "证书.pdf",
        sizeLabel: "1.0 MB",
        mimeHint: "pdf",
      },
    ],
    reportFiles: [],
    asDraft: false,
    ...overrides,
  };
}

describe("training achievement repository", () => {
  beforeEach(() => {
    resetTrainingAchievementMockData();
  });

  it("filters achievements by status, type and semester", async () => {
    const reviewing = await trainingAchievementRepository.list(
      "bureau-001",
      { status: "district-reviewing", type: "", semester: "", title: "" },
      1,
      10,
    );
    expect(reviewing.total).toBe(1);
    expect(reviewing.list[0]?.title).toContain("核心素养");

    const training = await trainingAchievementRepository.list(
      "bureau-001",
      { status: "", type: "training", semester: "", title: "" },
      1,
      10,
    );
    expect(training.total).toBe(1);
    expect(training.list[0]?.levelLabel).toBe("省级");

    const spring = await trainingAchievementRepository.list(
      "bureau-001",
      { status: "", type: "", semester: "2026-spring", title: "" },
      1,
      10,
    );
    expect(spring.total).toBe(3);
  });

  it("returns detail with attachments and audit timeline", async () => {
    const detail = await trainingAchievementRepository.detail("bureau-001", "ach-001");
    expect(detail).toMatchObject({
      code: "YX2026090015",
      title: "基于核心素养的单元整体教学研究",
      status: "district-reviewing",
      teacherName: "张三",
    });
    expect(detail?.attachments.length).toBeGreaterThan(0);
    expect(detail?.auditRecords[0]?.title).toContain("学校初审");
  });

  it("creates a submitted achievement at the top of the list", async () => {
    const created = await trainingAchievementRepository.create(
      "bureau-001",
      sampleInput({ title: "新建教学成果样例" }),
    );
    expect(created.status).toBe("school-reviewing");
    expect(created.levelLabel).toBe("市级 / 二等");
    expect(created.declaredScore).toBe(8);

    const list = await trainingAchievementRepository.list(
      "bureau-001",
      { status: "", type: "", semester: "", title: "新建教学成果样例" },
      1,
      10,
    );
    expect(list.total).toBe(1);
    expect(list.list[0]?.id).toBe(created.id);
  });

  it("rejects submit without attachments and allows draft", async () => {
    await expect(
      trainingAchievementRepository.create(
        "bureau-001",
        sampleInput({ certificateFiles: [], reportFiles: [], asDraft: false }),
      ),
    ).rejects.toThrow("请至少上传一项证明材料");

    const draft = await trainingAchievementRepository.create(
      "bureau-001",
      sampleInput({
        title: "草稿成果",
        certificateFiles: [],
        reportFiles: [],
        asDraft: true,
      }),
    );
    expect(draft.status).toBe("draft");
  });

  it("updates a rejected achievement for resubmit", async () => {
    const updated = await trainingAchievementRepository.update(
      "bureau-001",
      "ach-003",
      sampleInput({
        title: "小学语文情境教学实践研究（修订）",
        type: "research-award",
        levelId: "city-third",
      }),
    );
    expect(updated.title).toContain("修订");
    expect(updated.status).toBe("school-reviewing");
    expect(updated.auditRecords[0]?.title).toBe("修改重提");
  });
});
