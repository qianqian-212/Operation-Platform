import { beforeEach, describe, expect, it } from "vitest";
import { resetManagedCourseMockData } from "@/features/layered-training-course-manage/mock-data";
import { layeredTrainingCourseManageRepository } from "@/features/layered-training-course-manage/layered-training-course-manage-repository";
import { resetSchoolManagedCourseMockData } from "@/features/layered-training-course-manage/mock-data";
import { schoolLayeredTrainingCourseManageRepository } from "@/features/layered-training-course-manage/school-layered-training-course-manage-repository";
import {
  emptyManagedCourseForm,
  type ManagedCourseForm,
} from "@/features/layered-training-course-manage/types";

const tenantId = "bureau-001";

function draftForm(overrides: Partial<ManagedCourseForm> = {}): ManagedCourseForm {
  return {
    ...emptyManagedCourseForm(),
    title: "区域教研入门",
    creditText: "2",
    summary: "帮助新教师了解区域教研的基本流程。",
    lessons: [
      {
        id: "draft-lesson-test",
        title: "开场说明",
        fileName: "第1讲视频.mp4",
        durationMinutes: 32,
      },
    ],
    ...overrides,
  };
}

describe("layered training course manage repository", () => {
  beforeEach(() => {
    resetManagedCourseMockData();
  });

  it("lists the seeded catalog in design order", async () => {
    const result = await layeredTrainingCourseManageRepository.list(tenantId, {
      kind: "",
      reviewStatus: "",
      page: 1,
      pageSize: 10,
    });
    expect(result.total).toBe(23);
    expect(result.rows[0]).toMatchObject({
      id: "ltm-001",
      title: "新课标大单元教学设计",
      lessonCountLabel: "6讲",
      actions: ["unpublish", "edit", "delete"],
    });
    expect(result.rows[1]?.actions).toEqual(["view", "delete"]);
    expect(result.rows[2]?.actions).toEqual(["submit", "edit", "delete"]);
    expect(result.rows[3]?.actions).toEqual(["edit", "delete"]);
    expect(result.rows[6]?.actions).toEqual(["republish", "edit", "delete"]);
  });

  it("filters by kind and review status", async () => {
    const result = await layeredTrainingCourseManageRepository.list(tenantId, {
      kind: "document",
      reviewStatus: "draft",
      page: 1,
      pageSize: 10,
    });
    expect(result.rows.every((row) => row.kind === "document" && row.reviewStatus === "draft")).toBe(
      true,
    );
    expect(result.rows.some((row) => row.id === "ltm-003")).toBe(true);
  });

  it("submits a complete draft and rejects an incomplete one", async () => {
    const submitted = await layeredTrainingCourseManageRepository.submit(tenantId, "ltm-003");
    expect(submitted.reviewStatus).toBe("pending");
    const created = await layeredTrainingCourseManageRepository.save(
      tenantId,
      "",
      draftForm({ summary: "", creditText: "" }),
      "draft",
    );
    await expect(layeredTrainingCourseManageRepository.submit(tenantId, created.id)).rejects.toThrow(
      "请输入课程学分",
    );
  });

  it("moves approved courses between shelf states", async () => {
    const offline = await layeredTrainingCourseManageRepository.setShelf(tenantId, "ltm-001", "unpublish");
    expect(offline.shelfStatus).toBe("offline");
    const published = await layeredTrainingCourseManageRepository.setShelf(
      tenantId,
      "ltm-001",
      "republish",
    );
    expect(published.shelfStatus).toBe("published");
  });

  it("creates a draft and refuses to edit a pending course", async () => {
    const created = await layeredTrainingCourseManageRepository.save(
      tenantId,
      "",
      draftForm(),
      "draft",
    );
    expect(created.id).toBe("ltm-024");
    expect(created.reviewStatus).toBe("draft");
    expect(created.shelfStatus).toBe("unpublished");
    await expect(
      layeredTrainingCourseManageRepository.save(tenantId, "ltm-002", draftForm(), "draft"),
    ).rejects.toThrow("待审核课程不可编辑");
  });

  it("removes a course from the catalog", async () => {
    await layeredTrainingCourseManageRepository.remove(tenantId, "ltm-004");
    const result = await layeredTrainingCourseManageRepository.list(tenantId, {
      kind: "",
      reviewStatus: "",
      page: 1,
      pageSize: 50,
    });
    expect(result.total).toBe(22);
    expect(result.rows.some((row) => row.id === "ltm-004")).toBe(false);
  });

  it("keeps the same rows for schools and omits shelf actions", async () => {
    resetSchoolManagedCourseMockData();
    const result = await schoolLayeredTrainingCourseManageRepository.list("school-001", {
      kind: "",
      reviewStatus: "",
      page: 1,
      pageSize: 10,
    });
    expect(result.rows[0]).toMatchObject({
      title: "新课标大单元教学设计",
      actions: ["edit", "delete"],
    });
    expect(result.rows[1]?.actions).toEqual(["view", "delete"]);
    expect(result.rows[2]?.actions).toEqual(["submit", "edit", "delete"]);
    expect(result.rows[6]?.actions).toEqual(["edit", "delete"]);
    await expect(
      schoolLayeredTrainingCourseManageRepository.setShelf("school-001", "ltm-001", "unpublish"),
    ).rejects.toThrow("学校端不支持上下架");
  });
});
