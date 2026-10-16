import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { flushPromises, mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { resetLayeredTrainingCourseReviewMockData } from "@/features/layered-training-course-review/mock-data";
import { resetLayeredTrainingGroupMockData } from "@/features/layered-training-group/mock-data";
import { useUserStore } from "@/stores/user";
import LayeredTrainingGroupView from "@/views/bureau/ai-teacher-development/LayeredTrainingGroupView.vue";

function dropdownAction(label: string) {
  const menu = [...document.querySelectorAll(".el-dropdown-menu")].find(
    (item) => item.textContent?.trim() === label,
  );
  const action = menu?.querySelector(".el-dropdown-menu__item");
  if (!menu || !action) throw new Error(`缺少菜单「${label}」`);
  return { menu, action };
}

function mountView() {
  return mount(LayeredTrainingGroupView, {
    attachTo: document.body,
    global: { plugins: [[ElementPlus, { locale: zhCn }]] },
  });
}

describe("layered training group view", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    setActivePinia(createPinia());
    useUserStore().currentTenant.id = "bureau-001";
    resetLayeredTrainingGroupMockData();
    resetLayeredTrainingCourseReviewMockData();
  });

  it("shows the selected group members and blocks deleting a linked group", async () => {
    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.text()).toContain("新教师培养组");
    expect(wrapper.text()).toContain("张晓晓");
    expect(wrapper.text()).toContain("13800000000");
    expect(wrapper.text()).toContain("共 12 条");

    const linked = dropdownAction("已关联课程，不可删除");
    expect(linked.menu.querySelectorAll(".el-dropdown-menu__item")).toHaveLength(1);
    expect(linked.action.classList.contains("is-disabled")).toBe(true);

    const free = dropdownAction("删除");
    expect(free.menu.querySelectorAll(".el-dropdown-menu__item")).toHaveLength(1);
    expect(free.action.classList.contains("is-disabled")).toBe(false);
    wrapper.unmount();
  });

  it("creates a group and keeps the page on that group", async () => {
    const wrapper = mountView();
    await flushPromises();

    const create = wrapper.findAll("button").find((button) => button.text().includes("新增分组"));
    expect(create).toBeTruthy();
    await create?.trigger("click");
    await flushPromises();
    const input = document.querySelector<HTMLInputElement>(".el-dialog input");
    if (!input) throw new Error("缺少分组名称输入框");
    input.value = "名师工作室组";
    input.dispatchEvent(new Event("input"));
    const confirm = [...document.querySelectorAll("button")].find((button) => button.textContent === "确认");
    if (!confirm) throw new Error("缺少确认按钮");
    confirm.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await flushPromises();

    expect(wrapper.text()).toContain("名师工作室组");
    expect(wrapper.text()).toContain("暂无成员");
    wrapper.unmount();
  });
});
