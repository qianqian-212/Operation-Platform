import { expect, test, type Page } from "@playwright/test";

async function switchToBureauTenant(page: Page) {
  await page.goto("/workbench");
  await page
    .getByRole("button", { name: /体育东路小学海明学校|天河区第二实验小学/ })
    .click();
  await page.getByRole("menuitem", { name: "体验区教育局", exact: true }).click();
}

test("新学生成长画像连续展示五段区域分析并通过锚点定位", async ({ page }) => {
  await switchToBureauTenant(page);
  await page.goto("/bureau/education-governance/new-student-growth-portrait");

  await expect(page.getByRole("heading", { name: "新学生成长画像", exact: true })).toBeVisible();
  const navigation = page.getByRole("navigation", { name: "新学生成长画像内容锚点" });
  await expect(navigation).toHaveCSS("position", "sticky");
  await expect(navigation.getByRole("link")).toHaveCount(5);
  await expect(navigation).not.toContainText("01");

  for (const heading of [
    "区域发展总览",
    "学生群体画像",
    "学校发展画像",
    "区域均衡分析",
    "成长支持成效",
  ]) {
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeAttached();
  }
  await expect(page.getByRole("heading", { name: "专题与发展报告", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^导出/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /生成.*报告/ })).toHaveCount(0);

  const firstPanel = page.locator(".portrait-panel").first();
  await expect(firstPanel).toHaveCSS("border-top-style", "none");
  await expect(firstPanel).toHaveCSS("border-radius", "4px");

  await navigation.getByRole("link", { name: /学校发展画像/ }).click();
  await expect(page.locator("#school-development")).toBeInViewport();
  await expect(navigation.getByRole("link", { name: /学校发展画像/ })).toHaveAttribute("aria-current", "location");

  await page.getByRole("textbox", { name: "搜索学校" }).fill("南岭");
  const schoolTable = page.locator('[aria-label="学校发展列表"]');
  await expect(schoolTable.getByText("南岭镇中心学校")).toBeVisible();
  await expect(schoolTable.getByText("启明中学")).toHaveCount(0);

  await navigation.getByRole("link", { name: /学生群体画像/ }).click();
  await expect(page.locator("#student-groups")).toBeInViewport();
  const groupPanel = page.locator(".portrait-panel").filter({
    has: page.getByRole("heading", { name: "群体学校分布", exact: true }),
  });
  await groupPanel.locator(".el-select__wrapper").click();
  await page.getByRole("option", { name: "高投入低成效" }).click();
  await expect(page.getByRole("img", { name: "所选学生群体学校分布" })).toBeVisible();
  await expect(page.getByRole("img", { name: "学生群体上学期至本学期阶段迁移桑基图" })).toBeVisible();

  await navigation.getByRole("link", { name: /区域均衡分析/ }).click();
  await expect(page.getByRole("img", { name: "五个片区的五类发展指标热力矩阵" })).toBeVisible();
});
