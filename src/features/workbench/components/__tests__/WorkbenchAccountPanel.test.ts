import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import WorkbenchAccountPanel from "@/features/workbench/components/WorkbenchAccountPanel.vue";

describe("WorkbenchAccountPanel", () => {
  it("renders adapted profile, organizations, and weekly goals", () => {
    const wrapper = mount(WorkbenchAccountPanel, {
      props: {
        data: {
          kind: "account-panel",
          name: "罗吴航",
          initials: "罗",
          account: "luowuhang@example.com",
          badgeLabel: "管理员",
          verified: true,
          organizations: [
            {
              id: "org-1",
              orgName: "示范中学",
              roleName: "管理员",
              tenantTypeLabel: "学校",
              meta: "当前",
              active: true,
            },
          ],
          goals: [
            {
              id: "tasks",
              title: "待办处理",
              remainingLabel: "还剩 3 项",
              progress: 58,
              tone: "primary",
              icon: "ClipboardList",
            },
          ],
        },
      },
      global: { plugins: [ElementPlus] },
    });

    expect(wrapper.text()).toContain("罗吴航");
    expect(wrapper.text()).toContain("管理员");
    expect(wrapper.text()).toContain("任职单位");
    expect(wrapper.text()).toContain("关联单位");
    expect(wrapper.text()).toContain("示范中学");
    expect(wrapper.text()).not.toContain("所属组织");
    expect(wrapper.text()).not.toContain("学校");
    expect(wrapper.text()).toContain("本周目标");
    expect(wrapper.text()).toContain("待办处理");
    expect(wrapper.get('[role="progressbar"]').attributes("aria-valuenow")).toBe("58");
  });
});
