import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import WorkbenchTaskCenter from "@/features/workbench/components/WorkbenchTaskCenter.vue";
import type { WorkbenchInboxData } from "@/features/workbench/types";

const inbox: WorkbenchInboxData = {
  kind: "inbox",
  items: [
    {
      id: "todo-1",
      title: "审批学生请假申请",
      meta: "今天 16:00",
      label: "待办",
      category: "todo",
      status: "pending",
    },
    {
      id: "notice-1",
      title: "学期家长会材料已开放提交",
      meta: "今天",
      label: "通知",
      category: "notice",
      status: "pending",
    },
  ],
};

describe("WorkbenchTaskCenter", () => {
  it("keeps category tabs and shows cards without a status filter or checkboxes", async () => {
    const wrapper = mount(WorkbenchTaskCenter, {
      props: { data: inbox },
      global: { plugins: [ElementPlus] },
    });

    const panel = wrapper.get('[role="tabpanel"]');
    expect(wrapper.get('[aria-label="消息分类"] [role="tab"][aria-selected="true"]').attributes("aria-controls"))
      .toBe(panel.attributes("id"));
    expect(wrapper.find('[aria-label="待办状态"]').exists()).toBe(false);
    expect(wrapper.find(".el-checkbox").exists()).toBe(false);
    expect(wrapper.findAll(".item-card")).toHaveLength(2);

    const noticeTab = wrapper.findAll('[aria-label="消息分类"] [role="tab"]')
      .find((tab) => tab.text() === "通知消息");
    await noticeTab!.trigger("click");
    expect(wrapper.findAll(".item-card")).toHaveLength(1);
    expect(wrapper.get(".item-card strong").text()).toBe("学期家长会材料已开放提交");
    wrapper.unmount();
  });

  it("points empty category states toward the all tab", async () => {
    const wrapper = mount(WorkbenchTaskCenter, {
      props: { data: { kind: "inbox", items: [] } },
      global: { plugins: [ElementPlus] },
    });

    expect(wrapper.get(".task-empty-title").text()).toBe("暂无事项");
    const dailyTab = wrapper.findAll('[aria-label="消息分类"] [role="tab"]')
      .find((tab) => tab.text() === "日常");
    await dailyTab!.trigger("click");
    expect(wrapper.get(".task-empty-title").text()).toBe("暂无日常事项");
    expect(wrapper.get(".task-empty-hint").text()).toContain("全部");
    wrapper.unmount();
  });
});
