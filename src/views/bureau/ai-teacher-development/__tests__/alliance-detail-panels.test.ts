import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import { getAllianceMockDetail } from "@/features/teaching-research-alliance/mock-data";
import AllianceDetailMemberSchools from "@/views/bureau/ai-teacher-development/AllianceDetailMemberSchools.vue";
import AllianceDetailSummaryCard from "@/views/bureau/ai-teacher-development/AllianceDetailSummaryCard.vue";
import AllianceSpaceDiscussionList from "@/views/bureau/ai-teacher-development/AllianceSpaceDiscussionList.vue";
import AllianceSpaceDocumentList from "@/views/bureau/ai-teacher-development/AllianceSpaceDocumentList.vue";

const detail = getAllianceMockDetail("alliance-east");
if (!detail) throw new Error("missing alliance seed");

describe("alliance detail panels", () => {
  it("shows three overview metrics and opens the member school dialog", async () => {
    const wrapper = mount(AllianceDetailSummaryCard, {
      props: { detail },
      global: { plugins: [ElementPlus] },
    });
    expect(wrapper.text()).toContain("成员学校");
    expect(wrapper.text()).toContain("教研活动");
    expect(wrapper.text()).toContain("参与教师");
    expect(wrapper.text()).not.toContain("活动产出率");
    expect(wrapper.text()).not.toContain("成果产出率");
    await wrapper.get(".metric-action").trigger("click");
    expect(wrapper.emitted("view-schools")).toHaveLength(1);
  });

  it("renders member schools in a dialog", () => {
    const wrapper = mount(AllianceDetailMemberSchools, {
      props: { schools: detail.memberSchools, visible: true },
      global: { plugins: [ElementPlus] },
    });
    expect(wrapper.findComponent({ name: "ElDialog" }).props("title")).toBe("成员学校");
    expect(wrapper.findComponent({ name: "ElDialog" }).props("modelValue")).toBe(true);
  });

  it("adds view and download actions to space documents", async () => {
    const wrapper = mount(AllianceSpaceDocumentList, {
      props: { documents: detail.documents },
      global: { plugins: [ElementPlus] },
    });
    const actions = wrapper.findAll(".action-link");
    expect(actions[0]?.text()).toBe("查看");
    expect(actions[1]?.text()).toBe("下载");
    await actions[0]?.trigger("click");
    expect(wrapper.emitted("view")?.[0]).toEqual([detail.documents[0]?.title]);
  });

  it("renders discussion rows with initiator and status", () => {
    const wrapper = mount(AllianceSpaceDiscussionList, {
      props: { discussions: detail.discussions },
      global: { plugins: [ElementPlus] },
    });
    expect(wrapper.text()).toContain("小学语文阅读理解如何分层指导");
    expect(wrapper.text()).toContain("发起人：陈豪东（阳光小学）");
    expect(wrapper.text()).toContain("热议中");
    expect(wrapper.text()).toContain("已总结");
    expect(wrapper.text()).toContain("讨论中");
  });
});
