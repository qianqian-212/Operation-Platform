import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import WorkbenchAllianceOverview from "@/features/workbench/components/WorkbenchAllianceOverview.vue";
import { allianceOverviewData } from "@/features/workbench/workbench-alliance-overview-data";
import type { TenantInfo } from "@/types/user";

const school: TenantInfo = {
  id: "school-alliance",
  name: "联盟测试学校",
  shortName: "测试学校",
  type: "school",
  enabled: true,
};

describe("WorkbenchAllianceOverview", () => {
  it("reuses the campus stats layout for alliance metrics", () => {
    const data = allianceOverviewData({
      tenant: school,
      userId: "user-a",
      profile: "admin",
    });
    const wrapper = mount(WorkbenchAllianceOverview, { props: { data } });

    expect(wrapper.get("#alliance-overview-title").text()).toBe("联盟数据总览");
    expect(wrapper.findAll(".stats-items li")).toHaveLength(4);
    expect(wrapper.findAll(".stats-items li").map((item) => item.get("span").text()))
      .toEqual(["教研联盟", "参与学校", "跨校活动", "参与教师"]);
    expect(wrapper.findAll(".stats-items li").map((item) => item.get("small").text()))
      .toEqual(["个联盟使用中", "共12所学校", "本年度开展", "跨校参与"]);
    expect(wrapper.find(".alliance-metric").exists()).toBe(false);
  });
});
