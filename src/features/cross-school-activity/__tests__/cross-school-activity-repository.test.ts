import { beforeEach, describe, expect, it } from "vitest";
import { crossSchoolActivityRepository } from "@/features/cross-school-activity/cross-school-activity-repository";
import {
  createActivityMockRow,
  listActivityMockRows,
  resetActivityMockData,
} from "@/features/cross-school-activity/mock-data";
import { resetAllianceMockData } from "@/features/teaching-research-alliance/mock-data";

describe("cross-school activity repository", () => {
  beforeEach(() => {
    resetAllianceMockData();
    resetActivityMockData();
  });

  it("filters activities by type, status and alliance", async () => {
    const prep = await crossSchoolActivityRepository.list(
      "bureau-001",
      { name: "", type: "lesson-prep", status: "", allianceId: "" },
      1,
      10,
    );
    expect(prep.list.every((row) => row.type === "lesson-prep")).toBe(true);
    expect(prep.total).toBe(2);

    const archived = await crossSchoolActivityRepository.list(
      "bureau-001",
      { name: "", type: "", status: "archived", allianceId: "" },
      1,
      10,
    );
    expect(archived.total).toBe(1);
    expect(archived.list[0]?.name).toContain("英语阅读");

    const east = await crossSchoolActivityRepository.list(
      "bureau-001",
      { name: "西沙", type: "", status: "", allianceId: "alliance-east" },
      1,
      10,
    );
    expect(east.total).toBe(1);
    expect(east.list[0]?.leadSchoolName).toBe("阳光小学");
  });

  it("returns activity detail with participants and overview fields", async () => {
    const detail = await crossSchoolActivityRepository.detail("bureau-001", "activity-chinese");
    expect(detail).toMatchObject({
      name: "跨校集体备课·小学语文三年级《富饶的西沙群岛》",
      type: "lesson-prep",
      location: "阳光小学·教研楼302（线上同步）",
      initiatorName: "陈豪东",
      allianceName: "城东学区教研联盟",
    });
    expect(detail?.participants).toHaveLength(9);
    expect(detail?.tasks[0]).toMatchObject({
      name: "主备教案·第一课时",
      ownerName: "陈豪东",
      kind: "file",
      status: "final",
    });
  });

  it("creates a lesson-prep activity and places it at the top of the list", async () => {
    const created = await crossSchoolActivityRepository.create("bureau-001", {
      name: "跨校集体备课·四年级习作",
      type: "lesson-prep",
      allianceId: "alliance-east",
      scheduledAt: "2026-09-12 14:00",
      location: "阳光小学·教研楼201",
      description: "围绕四年级习作开展跨校集体备课。",
      leadSchoolId: "school-sunshine",
      memberSchoolIds: ["school-sunshine", "school-wende"],
      teacherIds: ["teacher-chenhaodong", "teacher-wangfang"],
      topic: {
        stage: "小学",
        subject: "语文",
        grade: "四年级",
        title: "写景习作",
        period: "1课时",
        textbookVersion: "统编版",
        chapter: "第一单元",
      },
      tasks: [
        {
          id: "task-plan",
          name: "主备教案",
          source: "custom",
          requireFile: true,
          assignees: [{ teacherId: "teacher-chenhaodong", role: "lead" }],
          note: "",
        },
      ],
      observation: null,
    });

    expect(created.status).toBe("ongoing");
    expect(created.schoolCount).toBe(2);
    expect(created.participantCount).toBe(2);
    expect(created.allianceName).toBe("城东学区教研联盟");
    expect(listActivityMockRows()[0]?.id).toBe(created.id);
  });

  it("rejects incomplete create payloads", async () => {
    await expect(
      crossSchoolActivityRepository.create("bureau-001", {
        name: "",
        type: "lesson-prep",
        allianceId: "",
        scheduledAt: "",
        location: "",
        description: "",
        leadSchoolId: "",
        memberSchoolIds: [],
        teacherIds: [],
        topic: null,
        tasks: [],
        observation: null,
      }),
    ).rejects.toThrow("活动主题不能为空");
  });

  it("builds a defensive create payload through mock helper", () => {
    const row = createActivityMockRow({
      name: "跨校听评课·科学实验",
      type: "lesson-observation",
      allianceId: "",
      scheduledAt: "2026-09-01 09:00",
      location: "翠竹小学",
      description: "",
      leadSchoolId: "school-cuizhu",
      memberSchoolIds: ["school-cuizhu", "school-wende"],
      teacherIds: ["teacher-jiangning"],
      topic: null,
      tasks: [],
      observation: {
        courseName: "观察水的浮力",
        instructorId: "teacher-jiangning",
        instructorName: "蒋宁",
        scheduledAt: "2026-09-01 09:00",
        method: "线下听课",
        grade: "四年级",
        subject: "科学",
        courseType: "实验课",
        reviewerId: "teacher-liuchen",
        reviewerName: "刘晨",
        reviewMethod: "议课研讨",
        assessmentTemplate: "小学科学评课模板",
        materials: [],
      },
    });
    expect(row.leadSchoolName).toBe("翠竹小学");
    expect(row.allianceName).toBe("未归属联盟");
  });

  it("saves observation settings onto an existing activity", async () => {
    const saved = await crossSchoolActivityRepository.saveObservation("bureau-001", "activity-chinese", {
      courseName: "富饶的西沙群岛",
      instructorId: "teacher-chenhaodong",
      instructorName: "陈豪东",
      scheduledAt: "2026-08-10 09:00",
      method: "线下听课",
      grade: "三年级",
      subject: "语文",
      courseType: "新授课",
      reviewerId: "teacher-wangfang",
      reviewerName: "王芳",
      reviewMethod: "线下评课",
      assessmentTemplate: "小学语文评课模板",
      materials: [{ id: "mat-1", name: "教案.docx", sizeLabel: "10.2K" }],
    });
    expect(saved.observation?.courseName).toBe("富饶的西沙群岛");
    expect(saved.observation?.reviewMethod).toBe("线下评课");
    const detail = await crossSchoolActivityRepository.detail("bureau-001", "activity-chinese");
    expect(detail?.observation?.instructorName).toBe("陈豪东");
  });
});
