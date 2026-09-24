import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { mount, flushPromises } from "@vue/test-utils";
import ElementPlus from "element-plus";
import { createMemoryHistory, createRouter } from "vue-router";
import { resetActivityMockData } from "@/features/cross-school-activity/mock-data";
import { resetLessonObservationMockData } from "@/features/lesson-observation/mock-data";
import { resetAllianceMockData } from "@/features/teaching-research-alliance/mock-data";
import { useUserStore } from "@/stores/user";
import AchievementSharingView from "@/views/bureau/ai-teacher-development/AchievementSharingView.vue";
import CollectiveLessonPrepView from "@/views/bureau/ai-teacher-development/CollectiveLessonPrepView.vue";
import CrossSchoolActivityView from "@/views/bureau/ai-teacher-development/CrossSchoolActivityView.vue";
import LessonObservationView from "@/views/bureau/ai-teacher-development/LessonObservationView.vue";
import CrossSchoolTeamDetailView from "@/views/school/ai-teacher-development/CrossSchoolTeamDetailView.vue";
import CrossSchoolTeamView from "@/views/school/ai-teacher-development/CrossSchoolTeamView.vue";

const activityPath = "/ai-teacher-development/cross-school-research/activities";
const prepPath = "/ai-teacher-development/cross-school-research/lesson-prep";
const observationPath = "/ai-teacher-development/cross-school-research/lesson-observation";
const sharingPath = "/ai-teacher-development/cross-school-research/achievement-sharing";
const teamPath = "/ai-teacher-development/cross-school-research/teams";

async function mountPage(component: unknown, path: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: activityPath, component: CrossSchoolActivityView },
      { path: `${activityPath}/create`, component: { template: "<div>create</div>" } },
      { path: `${activityPath}/:id`, component: { template: "<div>detail</div>" } },
      { path: prepPath, component: CollectiveLessonPrepView },
      { path: observationPath, component: LessonObservationView },
      { path: `${observationPath}/:id`, component: { template: "<div>detail</div>" } },
      { path: sharingPath, component: AchievementSharingView },
      { path: teamPath, component: CrossSchoolTeamView },
      { path: `${teamPath}/:id`, component: CrossSchoolTeamDetailView },
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

describe("school cross-school research views", () => {
  beforeEach(() => {
    resetAllianceMockData();
    resetActivityMockData();
    resetLessonObservationMockData();
    setActivePinia(createPinia());
    useUserStore().currentTenant.id = "school-001";
  });

  it("reuses bureau activity list under school paths", async () => {
    const { wrapper, router } = await mountPage(CrossSchoolActivityView, activityPath);
    await flushPromises();
    expect(wrapper.get(".toolbar-title").text()).toBe("活动管理");
    expect(wrapper.text()).toContain("创建活动");
    const detail = wrapper.findAll(".action-link").find((item) => item.text() === "详情");
    expect(detail).toBeTruthy();
    await detail?.trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.path).toMatch(`${activityPath}/`);
    expect(router.currentRoute.value.path.startsWith("/bureau/")).toBe(false);
  });

  it("reuses bureau lesson observation under school paths", async () => {
    const { wrapper, router } = await mountPage(LessonObservationView, observationPath);
    await flushPromises();
    expect(wrapper.get(".toolbar-title").text()).toBe("跨校听评课");
    const detail = wrapper.findAll(".action-link").find((item) => item.text() === "详情");
    await detail?.trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.path).toMatch(`${observationPath}/`);
    expect(router.currentRoute.value.path.startsWith("/bureau/")).toBe(false);
  });

  it("reuses collective lesson prep workspace for school", async () => {
    const { wrapper } = await mountPage(CollectiveLessonPrepView, prepPath);
    await flushPromises();
    expect(wrapper.get("h1").text()).toBe("集体备课管理");
    expect(wrapper.text()).toContain("备课总数");
    expect(wrapper.text()).toContain("发起备课");
    expect(wrapper.findAll(".prep-card").length).toBeGreaterThan(0);
  });

  it("reuses achievement sharing workspace for school", async () => {
    const { wrapper } = await mountPage(AchievementSharingView, sharingPath);
    await flushPromises();
    expect(wrapper.get("h1").text()).toBe("成果共享");
    expect(wrapper.text()).toContain("成果总数");
    expect(wrapper.findAll(".share-card").length).toBeGreaterThan(0);
  });

  it("renders cross-school team list and opens detail", async () => {
    const { wrapper, router } = await mountPage(CrossSchoolTeamView, teamPath);
    await flushPromises();
    expect(wrapper.text()).toContain("跨校活动");
    expect(wrapper.text()).toContain("教研团队");
    expect(wrapper.text()).toContain("小学语文跨校教研团队");
    const detail = wrapper.findAll("button.action-link").find((item) => item.text() === "详情");
    await detail?.trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.path).toBe(`${teamPath}/team-1`);
  });

  it("renders team detail with members and activities", async () => {
    const { wrapper, router } = await mountPage(CrossSchoolTeamDetailView, `${teamPath}/team-1`);
    await flushPromises();
    expect(wrapper.text()).toContain("团队成员");
    expect(wrapper.text()).toContain("加入教师");
    expect(wrapper.text()).toContain("团队活动");
    expect(wrapper.text()).toContain("团队成果");
    const view = wrapper.findAll("button.action-link").find((item) => item.text() === "查看");
    await view?.trigger("click");
    await flushPromises();
    expect(router.currentRoute.value.path).toMatch(`${activityPath}/`);
  });
});
