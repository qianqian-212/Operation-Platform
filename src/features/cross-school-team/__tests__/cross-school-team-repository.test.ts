import { describe, expect, it } from "vitest";
import { crossSchoolTeamRepository } from "@/features/cross-school-team/cross-school-team-repository";

function emptyFilter() {
  return { allianceId: "", subject: "", name: "" };
}

describe("cross-school team repository", () => {
  it("lists twelve teams with design stats", async () => {
    const result = await crossSchoolTeamRepository.list("school-001", emptyFilter(), 1, 10);
    expect(result.stats).toEqual({
      activityCount: 3,
      teamCount: 12,
      teacherCount: 3,
      achievementCount: 6,
    });
    expect(result.total).toBe(12);
    expect(result.list).toHaveLength(10);
    expect(result.list[0]?.name).toBe("小学语文跨校教研团队");
  });

  it("filters by alliance and keyword", async () => {
    const alliances = await crossSchoolTeamRepository.listAlliances("school-001");
    expect(alliances.length).toBeGreaterThan(0);
    const filtered = await crossSchoolTeamRepository.list(
      "school-001",
      { allianceId: alliances[0]!.id, subject: "语文", name: "小学语文" },
      1,
      20,
    );
    expect(filtered.list.length).toBeGreaterThan(0);
    expect(filtered.list.every((row) => row.allianceId === alliances[0]!.id)).toBe(true);
  });

  it("returns detail with members, activities and achievements", async () => {
    const detail = await crossSchoolTeamRepository.getDetail("school-001", "team-1");
    expect(detail).toMatchObject({
      id: "team-1",
      name: "小学语文跨校教研团队",
    });
    expect(detail?.members.length).toBeGreaterThan(0);
    expect(detail?.activities.length).toBeGreaterThan(0);
    expect(detail?.achievements.length).toBeGreaterThan(0);
  });
});
