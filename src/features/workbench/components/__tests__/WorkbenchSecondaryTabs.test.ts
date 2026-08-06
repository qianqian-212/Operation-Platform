import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import WorkbenchSecondaryTabs from "@/features/workbench/components/WorkbenchSecondaryTabs.vue";

describe("WorkbenchSecondaryTabs", () => {
  it("keeps scrolling and tab state on separate elements", async () => {
    const wrapper = mount(WorkbenchSecondaryTabs, {
      props: {
        modelValue: "all",
        options: [
          { label: "全部应用", value: "all" },
          { label: "协同管理", value: "collaboration" },
        ],
        "onUpdate:modelValue": (value: string) => wrapper.setProps({ modelValue: value }),
      },
      attachTo: document.body,
    });

    expect(wrapper.get(".secondary-tabs-viewport").find('[role="tablist"]').exists()).toBe(true);
    expect(wrapper.get('[data-state="active"]').text()).toBe("全部应用");
    expect(wrapper.get('[role="tab"][aria-selected="true"]').attributes("tabindex")).toBe("0");
    expect(wrapper.get('[role="tab"][aria-selected="false"]').attributes("tabindex")).toBe("-1");

    await wrapper.findAll('[role="tab"]')[1]!.trigger("click");

    expect(wrapper.get('[data-state="active"]').text()).toBe("协同管理");
    expect(wrapper.get('[role="tab"][aria-selected="true"]').text()).toBe("协同管理");
    wrapper.unmount();
  });

  it("moves selection with arrow keys using a roving tabindex", async () => {
    const wrapper = mount(WorkbenchSecondaryTabs, {
      props: {
        modelValue: "all",
        options: [
          { label: "全部应用", value: "all" },
          { label: "协同管理", value: "collaboration" },
          { label: "教务管理", value: "academic" },
        ],
        "onUpdate:modelValue": (value: string) => wrapper.setProps({ modelValue: value }),
      },
      attachTo: document.body,
    });

    await wrapper.get('[role="tablist"]').trigger("keydown", { key: "ArrowRight" });
    expect(wrapper.props("modelValue")).toBe("collaboration");
    expect(wrapper.get('[role="tab"][aria-selected="true"]').text()).toBe("协同管理");

    await wrapper.get('[role="tablist"]').trigger("keydown", { key: "End" });
    expect(wrapper.props("modelValue")).toBe("academic");

    await wrapper.get('[role="tablist"]').trigger("keydown", { key: "Home" });
    expect(wrapper.props("modelValue")).toBe("all");
    wrapper.unmount();
  });

  it("links tabs to a panel id when provided", () => {
    const wrapper = mount(WorkbenchSecondaryTabs, {
      props: {
        modelValue: "all",
        panelId: "quick-nav-panel",
        options: [
          { label: "全部应用", value: "all" },
          { label: "协同管理", value: "collaboration" },
        ],
      },
    });

    expect(wrapper.get('[role="tab"][aria-selected="true"]').attributes("aria-controls")).toBe(
      "quick-nav-panel",
    );
    wrapper.unmount();
  });
});
