import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import WorkbenchWidgetContent from "@/features/workbench/components/WorkbenchWidgetContent.vue";

describe("WorkbenchWidgetContent quick links", () => {
  it("groups internal pages by top-level menu tabs", async () => {
    const wrapper = mount(WorkbenchWidgetContent, {
      props: {
        data: {
          kind: "quick-links",
          items: [
            {
              id: "school-entry",
              name: "学校管理",
              kind: "internal",
              target: "/school",
              icon: "School",
              iconAccent: null,
              moduleId: "module-school",
              moduleName: "学校管理",
              moduleIcon: "School",
            },
            {
              id: "notice-entry",
              name: "通知公告",
              kind: "internal",
              target: "/notice",
              icon: "Bell",
              iconAccent: "red",
              moduleId: "module-service",
              moduleName: "公共服务",
              moduleIcon: "LayoutGrid",
            },
          ],
        },
      },
      global: {
        stubs: {
          RouterLink: {
            template: "<a><slot /></a>",
          },
        },
      },
    });

    expect(wrapper.get(".quick-link-name").text()).toBe("学校管理");
    expect(wrapper.findAll(".quick-link-name")).toHaveLength(1);
    expect(wrapper.get(".quick-navigation-icon").classes()).toContain("accent-blue");
    expect(wrapper.get(".quick-navigation-icon svg").classes()).toContain("lucide-school");
    const tabs = wrapper.findAll('[role="tab"]');
    expect(tabs.map((tab) => tab.text())).toEqual(["学校管理", "公共服务"]);
    await tabs[1]!.trigger("click");
    expect(wrapper.get(".quick-link-name").text()).toBe("通知公告");
    expect(wrapper.get(".quick-navigation-icon").classes()).toContain("accent-red");
  });

  it("renders list widgets as spaced cards instead of divided rows", () => {
    const wrapper = mount(WorkbenchWidgetContent, {
      props: {
        data: {
          kind: "list",
          items: [
            { id: "alert-1", title: "门禁离线", meta: "今天", label: "告警", tone: "danger" },
            { id: "alert-2", title: "设备恢复", meta: "昨天", tone: "success" },
          ],
        },
      },
    });

    expect(wrapper.find(".widget-list").exists()).toBe(false);
    expect(wrapper.findAll(".item-card")).toHaveLength(2);
    expect(wrapper.get(".item-card strong").text()).toBe("门禁离线");
  });
});
