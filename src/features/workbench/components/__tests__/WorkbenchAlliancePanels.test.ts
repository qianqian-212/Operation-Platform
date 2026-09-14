import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import WorkbenchAllianceList from "@/features/workbench/components/WorkbenchAllianceList.vue";
import WorkbenchCrossSchoolActivities from "@/features/workbench/components/WorkbenchCrossSchoolActivities.vue";
import WorkbenchEffectEvaluation from "@/features/workbench/components/WorkbenchEffectEvaluation.vue";
import {
  allianceListData,
  crossSchoolActivitiesData,
  effectEvaluationData,
} from "@/features/workbench/workbench-alliance-panels-data";

describe("school alliance panel widgets", () => {
  it("renders alliance list cards with stats", () => {
    const wrapper = mount(WorkbenchAllianceList, {
      props: { data: allianceListData() },
      global: { plugins: [ElementPlus] },
    });

    expect(wrapper.findAll(".alliance-list-card")).toHaveLength(3);
    expect(wrapper.get(".alliance-list-topline strong").text()).toBe("城东学区教研联盟");
    expect(wrapper.findAll(".alliance-list-stats dd").map((item) => item.text()).slice(0, 3))
      .toEqual(["10", "20", "120"]);
    expect(wrapper.get(".alliance-list-meta").text()).toContain("管理员：李明华");
    expect(wrapper.get(".alliance-list-meta").text()).toContain("2026-07-12 创建");
  });

  it("renders effect evaluation comparison bars and summary", () => {
    const wrapper = mount(WorkbenchEffectEvaluation, {
      props: { data: effectEvaluationData() },
      global: { plugins: [ElementPlus] },
    });

    expect(wrapper.findAll(".effect-metric")).toHaveLength(3);
    expect(wrapper.get(".effect-metric h3").text()).toBe("竞赛获奖（年度）");
    expect(wrapper.findAll(".effect-series")).toHaveLength(6);
    expect(wrapper.get(".effect-summary > p").text()).toBe("竞赛获奖均值");
    expect(wrapper.findAll(".effect-summary dd")[0]?.text()).toBe("8.25次");
    expect(wrapper.findAll(".effect-summary dd")[1]?.text()).toBe("2.25次");
    expect(wrapper.get(".effect-summary .is-increase dd").text()).toBe("267%");
  });

  it("renders recent cross-school activities with status-first cards", async () => {
    const wrapper = mount(WorkbenchCrossSchoolActivities, {
      props: { data: crossSchoolActivitiesData() },
      global: { plugins: [ElementPlus] },
    });

    expect(wrapper.findAll(".activity-card")).toHaveLength(3);
    expect(wrapper.get(".activity-meta").text()).toContain("进行中");
    expect(wrapper.get(".activity-meta small").text()).toContain("阳光小学牵头");
    expect(wrapper.get(".activity-card > strong").text()).toContain("跨校集体备课");
    await wrapper.get(".activity-card").trigger("click");
    expect(wrapper.get(".activity-card").classes()).toContain("workbench-surface-card");
  });
});
