import { expect, test, type Page } from "@playwright/test";

async function switchToBureauTenant(page: Page) {
  await page.goto("/workbench");
  await page
    .getByRole("button", { name: /体育东路小学海明学校|天河区第二实验小学/ })
    .click();
  await page.getByRole("menuitem", { name: "体验区教育局", exact: true }).click();
}

test("新学生成长画像连续展示八段可追溯区域分析并通过锚点定位", async ({ page }) => {
  await switchToBureauTenant(page);
  await page.goto("/bureau/education-governance/new-student-growth-portrait");

  await expect(page.getByRole("heading", { name: "新学生成长画像", exact: true })).toBeVisible();
  const navigation = page.getByRole("navigation", { name: "新学生成长画像内容锚点" });
  await expect(navigation).toHaveCSS("position", "sticky");
  await expect(navigation.getByRole("link")).toHaveCount(8);
  await expect(navigation).not.toContainText("内容导航");
  await expect(navigation).not.toContainText("当前范围");
  await expect(page.locator(".portrait-section__index")).toHaveCount(0);

  for (const heading of [
    "区域发展总览",
    "五育评价",
    "运动健康",
    "荣誉发展",
    "行为习惯",
    "实践活动",
    "日常评价",
    "区域数据覆盖",
  ]) {
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeAttached();
  }
  await expect(page.getByRole("heading", { name: "专题与发展报告", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^导出/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /生成.*报告/ })).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: "学校类型" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "学生群体画像" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "学校发展画像" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "成长支持成效" })).toHaveCount(0);

  const firstPanel = page.locator(".portrait-panel").first();
  await expect(firstPanel).toHaveCSS("border-top-style", "none");
  await expect(firstPanel).toHaveCSS("border-radius", "4px");

  await expect(page.getByRole("heading", { name: "国家评价框架对齐" })).toBeVisible();
  await expect(page.getByRole("link", { name: /GB\/T 44099-2024/ })).toBeHidden();
  await page.getByRole("button", { name: /国家评价框架对齐/ }).click();
  await expect(page.getByRole("link", { name: /GB\/T 44099-2024/ })).toHaveAttribute("href", /openstd\.samr\.gov\.cn/);
  await expect(page.locator("#regional-overview .portrait-metric")).toHaveCount(9);
  await expect(
    page.locator("#regional-overview .portrait-metric").filter({ hasText: "区域学生总数" }),
  ).toContainText("缺少历史学籍快照");
  const fiveEducationMetric = page.locator("#regional-overview .portrait-metric").filter({
    hasText: "五育评价覆盖率",
  });
  await expect(fiveEducationMetric).toContainText("同比 +33.33%");
  await expect(fiveEducationMetric).not.toContainText("环比");
  await expect(fiveEducationMetric.locator(".portrait-metric__changes")).toHaveClass(/is-up/);
  await expect(page.getByRole("heading", { name: "综合素质数据总览" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "当前学业口径" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "区域观察口径" })).toHaveCount(0);

  await expect(page.getByRole("combobox", { name: "统考分析年级" })).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: "统考分析科目" })).toBeVisible();
  await expect(
    page.locator("#regional-overview .portrait-metric").filter({ hasText: "平均得分率（统考）" }),
  ).not.toContainText("—%");
  await expect(
    page.locator("#regional-overview .portrait-metric").filter({ hasText: "平均得分率（统考）" }).locator("strong"),
  ).not.toHaveText(/^—$/);

  await page.locator("#regional-overview").getByRole("button", { name: "同比变化：同比说明" }).hover();
  await expect(page.locator(".el-popper:visible").getByText("对照上一学年同一学期")).toBeVisible();
  await expect(page.locator(".el-popper:visible").getByText("不发布相邻学期环比")).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(page.locator(".el-popper:visible").getByText("对照上一学年同一学期")).toHaveCount(0);

  await page.locator("#regional-overview").getByRole("button", { name: "学业质量得分率：计算说明" }).hover();
  const academicPopover = page.locator(".el-popper:visible").filter({ hasText: "7,860÷10,000=78.6%" });
  await expect(academicPopover.getByText("国家依据")).toBeVisible();
  await expect(academicPopover.getByText("地方规则")).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(page.locator(".el-popper:visible").filter({ hasText: "7,860÷10,000=78.6%" })).toHaveCount(0);

  const academicSubjectSelect = page.getByRole("combobox", { name: "统考分析科目" });
  await academicSubjectSelect.focus();
  await academicSubjectSelect.press("ArrowDown");
  await page.getByRole("option", { name: "数学", exact: true }).click();
  await expect(page.getByRole("img", { name: "数学统考学业质量趋势" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "区域趋势年级" })).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: "区域趋势科目" })).toHaveCount(0);

  await navigation.getByRole("link", { name: /五育评价/ }).click();
  await expect(page.locator("#five-education")).toBeInViewport();
  await expect(page.getByRole("img", { name: "五育评价评价等级分布" })).toBeVisible();
  await expect(page.locator("#five-education")).toContainText("不合成为学生或学校综合总分");
  await page.locator("#five-education").getByRole("button", { name: "五育评价观察口径：观察口径" }).hover();
  await expect(page.locator(".el-popper:visible").getByText("分子 / 分母")).toBeVisible();
  await page.mouse.move(0, 0);

  await navigation.getByRole("link", { name: /运动健康/ }).click();
  await expect(page.locator("#sports-health")).toBeInViewport();
  await page.locator("#sports-health").getByRole("button", { name: "运动健康观察口径：观察口径" }).hover();
  await expect(page.locator(".el-popper:visible").getByText("当前边界")).toBeVisible();
  await page.mouse.move(0, 0);

  await navigation.getByRole("link", { name: /区域数据覆盖/ }).click();
  await expect(page.locator("#data-coverage")).toBeInViewport();
  await expect(page.getByRole("img", { name: "区域各学生发展领域数据覆盖率" })).toBeVisible();
  await expect(page.locator('[aria-label="区域数据源覆盖明细"]')).toContainText("有效学生数");
  await expect(page.locator("#data-coverage")).toContainText("城乡、片区、学校类型");
  await expect(page.locator("#data-coverage")).toContainText("不计算分类差异与均衡指数");
});
