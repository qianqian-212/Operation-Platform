import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { flushPromises, mount } from "@vue/test-utils";
import ElementPlus, { ElMessage } from "element-plus";
import { createMemoryHistory, createRouter } from "vue-router";
import { resetManagedCourseMockData } from "@/features/layered-training-course-manage/mock-data";
import { useUserStore } from "@/stores/user";
import LayeredTrainingCourseFormView from "@/views/bureau/ai-teacher-development/LayeredTrainingCourseFormView.vue";
import LayeredTrainingCourseManageView from "@/views/bureau/ai-teacher-development/LayeredTrainingCourseManageView.vue";

const listPath = "/bureau/ai-teacher-development/layered-training/courses";

async function mountPage(path: string, component: object) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { name: "courses", path: listPath, component: LayeredTrainingCourseManageView },
      { name: "create", path: `${listPath}/create`, component: LayeredTrainingCourseFormView },
      { name: "editor", path: `${listPath}/:id`, component: LayeredTrainingCourseFormView },
    ],
  });
  await router.push(path);
  await router.isReady();
  return {
    router,
    wrapper: mount(component, {
      global: {
        plugins: [ElementPlus, router],
        stubs: { teleport: true, transition: false },
      },
    }),
  };
}

describe("layered training course manage views", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useUserStore().currentTenant.id = "bureau-001";
    resetManagedCourseMockData();
  });

  it("renders the catalog and opens the upload form", async () => {
    const { wrapper, router } = await mountPage(listPath, LayeredTrainingCourseManageView);
    await flushPromises();
    expect(wrapper.text()).toContain("课程列表");
    expect(wrapper.text()).toContain("新增课程");
    expect(wrapper.text()).toContain("新课标大单元教学设计");
    expect(wrapper.text()).toContain("搜索");
    expect(wrapper.text()).toContain("提交审核");
    const create = wrapper.findAll("button").find((item) => item.text() === "新增课程");
    await create?.trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.path).toBe(`${listPath}/create`);
  });

  it("keeps an empty submission on the form and saves a titled draft", async () => {
    const warning = vi.spyOn(ElMessage, "warning").mockReturnValue({ close() {} });
    const { wrapper, router } = await mountPage(`${listPath}/create`, LayeredTrainingCourseFormView);
    await flushPromises();
    expect(wrapper.text()).toContain("上传课程");
    const submit = wrapper.findAll("button").find((item) => item.text() === "提交审核");
    await submit?.trigger("click");
    await flushPromises();
    expect(warning).toHaveBeenCalledWith("请输入课程名称");
    expect(router.currentRoute.value.path).toBe(`${listPath}/create`);

    const title = wrapper.find("input");
    await title.setValue("区域教研入门");
    const draft = wrapper.findAll("button").find((item) => item.text() === "保存草稿");
    await draft?.trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.path).toBe(listPath);
    warning.mockRestore();
  });
});
