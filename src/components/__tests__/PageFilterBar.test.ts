import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import PageFilterBar from "@/components/PageFilterBar.vue";

describe("PageFilterBar", () => {
  it("keeps wrapping layout by default", () => {
    const wrapper = mount(PageFilterBar, {
      global: { plugins: [ElementPlus] },
    });
    expect(wrapper.get(".filter-fields").classes()).not.toContain("is-four-columns");
  });

  it("uses a four-column grid when fourColumns is set", () => {
    const wrapper = mount(PageFilterBar, {
      props: { fourColumns: true, showReset: true },
      slots: { default: '<div class="form-item">类型</div>' },
      global: { plugins: [ElementPlus] },
    });
    expect(wrapper.get(".filter-fields").classes()).toContain("is-four-columns");
    expect(wrapper.get(".filter-actions").text()).toContain("搜索");
    expect(wrapper.get(".filter-actions").text()).toContain("重置");
  });
});
