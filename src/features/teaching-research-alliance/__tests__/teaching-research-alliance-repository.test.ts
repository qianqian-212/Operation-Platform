import { beforeEach, describe, expect, it } from "vitest";
import {
  createAllianceMockRow,
  listAllianceMockRows,
  resetAllianceMockData,
  setAllianceMockStatus,
} from "@/features/teaching-research-alliance/mock-data";
import { teachingResearchAllianceRepository } from "@/features/teaching-research-alliance/teaching-research-alliance-repository";

describe("teaching research alliance repository", () => {
  beforeEach(() => {
    resetAllianceMockData();
  });

  it("returns overview stats for all alliances", async () => {
    const result = await teachingResearchAllianceRepository.list(
      "bureau-001",
      { name: "", status: "" },
      1,
      10,
    );
    expect(result.stats).toEqual({
      allianceCount: 3,
      schoolCount: 9,
      activityCount: 51,
      teacherCount: 379,
    });
  });
  it("filters alliances by name and status", async () => {
    const byName = await teachingResearchAllianceRepository.list(
      "bureau-001",
      { name: "城东", status: "" },
      1,
      10,
    );
    expect(byName.total).toBe(1);
    expect(byName.list[0]?.name).toBe("城东学区教研联盟");

    const disabled = await teachingResearchAllianceRepository.list(
      "bureau-001",
      { name: "", status: "disabled" },
      1,
      10,
    );
    expect(disabled.total).toBe(1);
    expect(disabled.list[0]?.status).toBe("disabled");
  });

  it("creates an alliance with an exclusive space name", async () => {
    const created = await teachingResearchAllianceRepository.create("bureau-001", {
      name: "滨海片区教研联盟",
      leadSchoolId: "school-sunshine",
      adminId: "teacher-liminghua",
      memberSchoolIds: ["school-sunshine", "school-wende"],
      teacherIds: ["teacher-liminghua", "teacher-wangfang"],
      description: "面向滨海片区的跨校教研协作。",
    });

    expect(created.spaceName).toBe("滨海片区教研联盟空间");
    expect(created.status).toBe("active");
    expect(created.memberSchoolCount).toBe(2);
    expect(listAllianceMockRows()[0]?.id).toBe(created.id);
  });

  it("returns alliance detail with member schools and activities", async () => {
    const detail = await teachingResearchAllianceRepository.detail(
      "bureau-001",
      "alliance-east",
    );
    expect(detail).toMatchObject({
      name: "城东学区教研联盟",
      description: "城东学区六校联合，以小学语文、初中数学为突破口开展跨校教研。",
      space: { title: "城东学区专属空间", documentCount: 12 },
      performance: { participationRate: 88, outputRate: 72 },
    });
    expect(detail?.memberSchools).toHaveLength(6);
    expect(detail?.memberSchools[0]).toMatchObject({
      name: "阳光小学",
      role: "lead",
    });
    expect(detail?.activities[0]?.status).toBe("ongoing");
    expect(detail?.documents[0]?.title).toContain("富饶的西沙群岛");
    expect(detail?.discussions[0]?.status).toBe("hot");
  });

  it("toggles alliance status", async () => {
    const target = listAllianceMockRows()[0]!;
    expect(setAllianceMockStatus(target.id, "disabled")).toBe(true);
    expect(await teachingResearchAllianceRepository.detail("bureau-001", target.id)).toMatchObject({
      status: "disabled",
    });
  });

  it("builds a defensive create payload through mock helper", () => {
    const row = createAllianceMockRow({
      name: "测试联盟",
      leadSchoolId: "school-yucai",
      adminId: "teacher-zhangwei",
      memberSchoolIds: ["school-yucai"],
      teacherIds: ["teacher-zhangwei"],
      description: "",
    });
    expect(row.leadSchoolName).toBe("育才中学");
    expect(row.adminName).toBe("张伟");
  });
});
