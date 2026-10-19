import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { flushPromises, mount } from "@vue/test-utils";
import ElementPlus from "element-plus";
import { createMemoryHistory, createRouter } from "vue-router";
import { resetSchoolManagedCourseMockData } from "@/features/layered-training-course-manage/mock-data";
import { resetSchoolFeaturedCourseMockData } from "@/features/school-layered-training-featured/mock-data";
import { useUserStore } from "@/stores/user";
import SchoolLayeredTrainingArchiveView from "@/views/school/ai-teacher-development/SchoolLayeredTrainingArchiveView.vue";
import SchoolLayeredTrainingCourseManageView from "@/views/school/ai-teacher-development/SchoolLayeredTrainingCourseManageView.vue";
import SchoolLayeredTrainingFeaturedDetailView from "@/views/school/ai-teacher-development/SchoolLayeredTrainingFeaturedDetailView.vue";
import SchoolLayeredTrainingFeaturedView from "@/views/school/ai-teacher-development/SchoolLayeredTrainingFeaturedView.vue";

const coursePath = "/ai-teacher-development/layered-training/courses";
const featuredPath = "/ai-teacher-development/layered-training/featured";
const archivePath = "/ai-teacher-development/layered-training/archive";

async function mountPage(path: string, component: object) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: coursePath, component: SchoolLayeredTrainingCourseManageView },
      { path: `${coursePath}/create`, component: SchoolLayeredTrainingCourseManageView },
      { path: featuredPath, component: SchoolLayeredTrainingFeaturedView },
      { path: `${featuredPath}/:id`, component: SchoolLayeredTrainingFeaturedDetailView },
      { path: archivePath, component: SchoolLayeredTrainingArchiveView },
    ],
  });
  await router.push(path);
  await router.isReady();
  return {
    router,
    wrapper: mount(component, {
      global: { plugins: [ElementPlus, router], stubs: { teleport: true, transition: false } },
    }),
  };
}

describe("school layered training views", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    useUserStore().currentTenant.id = "school-001";
    resetSchoolManagedCourseMockData();
    resetSchoolFeaturedCourseMockData();
  });

  it("renders the school course catalog without shelf actions", async () => {
    const { wrapper } = await mountPage(coursePath, SchoolLayeredTrainingCourseManageView);
    await flushPromises();
    expect(wrapper.text()).toContain("课程列表");
    expect(wrapper.text()).toContain("新课标大单元教学设计");
    expect(wrapper.text()).toContain("搜索");
    const actions = wrapper.findAll("button").map((item) => item.text());
    expect(actions).toContain("编辑");
    expect(actions).not.toContain("下架");
    expect(actions).not.toContain("重新上架");
  });

  it("renders featured recommendations and the learning list", async () => {
    const { wrapper } = await mountPage(featuredPath, SchoolLayeredTrainingFeaturedView);
    await flushPromises();
    expect(wrapper.text()).toContain("精选推荐");
    expect(wrapper.text()).toContain("新课标下的大单元教学设计与实践");
    expect(wrapper.text()).toContain("排行榜Top10");
    expect(wrapper.text()).not.toContain("为你推荐");
    const learning = wrapper.findAll(".el-tabs__item").find((item) => item.text() === "在修课程");
    await learning?.trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("继续学习");
    expect(wrapper.text()).toContain("进度缓慢");
  });

  it("renders the featured course detail from the design", async () => {
    const { wrapper } = await mountPage(`${featuredPath}/sfc-001`, SchoolLayeredTrainingFeaturedDetailView);
    await flushPromises();
    expect(wrapper.text()).toContain("新课标下的大单元教学设计与实践");
    expect(wrapper.text()).toContain("第1讲：大单元教学理念解读");
    expect(wrapper.text()).toContain("试看 · 选课后解锁全部 6 讲");
    expect(wrapper.text()).toContain("35%");
    expect(wrapper.text()).toContain("教师评价 (120)");
    expect(wrapper.text()).toContain("王教授");
    expect(wrapper.text()).toContain("提交评分与评价");
  });

  it("renders the training archive for the current semester", async () => {
    const { wrapper } = await mountPage(archivePath, SchoolLayeredTrainingArchiveView);
    await flushPromises();
    expect(wrapper.text()).toContain("张晓晓");
    expect(wrapper.text()).toContain("实验小学 · 语文 · 一级教师 · 骨干型教师");
    expect(wrapper.text()).toContain("已完成课程");
    expect(wrapper.text()).toContain("在学课程");
    expect(wrapper.text()).toContain("已认定");
    expect(wrapper.text()).toContain("作文教学创新与实践");
    expect(wrapper.text()).toContain("4.6");
    expect(wrapper.text()).toContain("已评价8门课程");
  });
});
