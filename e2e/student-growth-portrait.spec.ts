import { expect, test, type Locator, type Page } from "@playwright/test";

async function switchToBureauTenant(page: Page) {
  await page.goto("/workbench");
  await page
    .getByRole("button", { name: /体育东路小学海明学校|天河区第二实验小学/ })
    .click();
  await page.getByRole("menuitem", { name: "体验区教育局", exact: true }).click();
}

async function expectStandardTable(table: Locator) {
  await expect(table).toBeVisible();
  await expect(table).toHaveClass(/el-table--border/);
  await expect(table).toHaveClass(/el-table--striped/);
}

test("区域学生发展画像以单页锚点组织群体聚合，并只展示可追溯能力", async ({ page }) => {
  await switchToBureauTenant(page);
  await page.goto("/bureau/education-governance/student-growth-portrait");

  await expect(page.getByText("当前为虚拟数据源", { exact: false })).toBeVisible();
  await expect(page.getByText("不得用于业务决策", { exact: false })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "学年", exact: true })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "学期", exact: true })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "学段", exact: true })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "年级", exact: true })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "学校范围" })).toHaveCount(0);
  await expect(page.getByRole("menuitem", { name: "成长培育", exact: true })).toHaveCount(0);
  await expect(page.getByText("五育均衡指数", { exact: true })).toHaveCount(0);
  await expect(page.getByText("学业进步指数", { exact: true })).toHaveCount(0);

  const anchorNavigation = page.getByRole("navigation", { name: "区域学生发展画像内容锚点" });
  await expect(anchorNavigation).toHaveCSS("position", "sticky");
  await expect(anchorNavigation.getByRole("link")).toHaveCount(10);
  await expect(anchorNavigation.getByRole("link").filter({ hasText: "学业发展画像" })).toContainText("部分可用");
  await expect(anchorNavigation.getByRole("link").filter({ hasText: "学生群体画像" })).toContainText("待接入");
  await expect(anchorNavigation.getByRole("link", { name: "区域发展总览", exact: true })).toBeVisible();
  await expect(anchorNavigation.getByRole("link", { name: "学校发展画像", exact: true })).toBeVisible();
  await expect(anchorNavigation.getByRole("link").filter({ hasText: "AI 分析助手" })).toContainText("待接入");

  await page.getByRole("button", { name: "数据说明", exact: true }).click();
  const dataDrawer = page.getByRole("dialog", { name: "数据与指标说明" });
  await expect(dataDrawer.getByText("单页锚点能力范围", { exact: true })).toBeVisible();
  await expect(dataDrawer.getByText("部分可用", { exact: true }).first()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dataDrawer).toBeHidden();

  await anchorNavigation.getByRole("link", { name: "学校发展画像", exact: true }).click();
  const schoolComparison = page.getByLabel("学校聚合指标对照");
  await expectStandardTable(schoolComparison.locator(".el-table"));
  await expect(schoolComparison.getByText("成长目标完成率", { exact: true })).toBeVisible();
  await expect(schoolComparison.getByText("AI 体锻参与", { exact: true })).toBeVisible();
  await expect(schoolComparison.getByText("五育均衡", { exact: true })).toHaveCount(0);

  await anchorNavigation.getByRole("link", { name: "区域发展总览", exact: true }).click();
  const dataOverview = page.getByLabel("数据总览");
  await expectStandardTable(dataOverview.locator(".el-table").first());
  await expect(dataOverview.getByText("实践活动参与率", { exact: true })).toBeVisible();
  await expect(dataOverview.getByText("统考成绩记录覆盖率", { exact: true })).toBeVisible();
  await expect(dataOverview.getByText("统考数据", { exact: true })).toBeVisible();
  await expectStandardTable(dataOverview.locator(".el-table").nth(1));
  await expect(dataOverview.getByText("期末统考", { exact: false }).first()).toBeVisible();

  const attention = page.getByLabel("区域数据关注");
  await expectStandardTable(attention.locator(".el-table"));
  await expect(attention.getByText("数据覆盖率", { exact: false })).toBeVisible();
  await expect(attention.getByText("跟进中", { exact: true })).toHaveCount(0);

  await anchorNavigation.getByRole("link").filter({ hasText: "综合素质画像" }).click();
  const fiveEducation = page.getByLabel("五育评价专题分析");
  await expectStandardTable(fiveEducation.locator(".el-table"));
  await expect(fiveEducation.locator("dt", { hasText: "成长目标完成率" })).toBeVisible();
  const explanation = fiveEducation.getByRole("button", { name: "查看评价记录分布说明" });
  await explanation.hover();
  await expect(page.getByRole("tooltip")).toContainText("不构成学生或学校的综合评分");

  await anchorNavigation.getByRole("link").filter({ hasText: "学业发展画像" }).click();
  const academic = page.getByLabel("区域学业质量分析");
  await expect(academic.getByRole("combobox", { name: "学业分析学段" })).toBeVisible();
  await expect(academic.getByRole("combobox", { name: "学业分析学科" })).toBeVisible();
  await expect(academic.getByRole("combobox", { name: "学业分析考试类型" })).toBeVisible();
  await expect(academic.locator("dt", { hasText: "平均得分率" })).toBeVisible();
  await expect(academic.locator("dt", { hasText: "标准分" })).toBeVisible();
  await expect(academic.locator("dt", { hasText: "优秀率" })).toBeVisible();
  await expect(academic.locator("dt", { hasText: "及格率" })).toBeVisible();
  await expect(academic.locator("dt", { hasText: "低分率" })).toBeVisible();
  await expect(academic.getByText("分数段分布", { exact: true })).toBeVisible();
  await expect(academic.getByText("各学科质量水平", { exact: true })).toBeVisible();
  await expect(academic.getByText("期中—期末得分率变化", { exact: true })).toBeVisible();
  await expect(academic.getByText("校际质量结构", { exact: true })).toBeVisible();
  await expectStandardTable(academic.locator(".el-table"));
  await expect(academic.getByText("学校类型、城乡片区：待学校主数据", { exact: true })).toBeVisible();

  await anchorNavigation.getByRole("link").filter({ hasText: "学生群体画像" }).click();
  const cohort = page.getByLabel("学生群体画像能力边界");
  await expect(cohort.getByText("当前不发布业务结论", { exact: true })).toBeVisible();
  await expect(cohort.getByText("群体定义与阈值版本", { exact: true })).toBeVisible();

  await anchorNavigation.getByRole("link").filter({ hasText: "AI 分析助手" }).click();
  const aiAnalysis = page.getByLabel("AI 分析助手能力边界");
  await expect(aiAnalysis.getByText("禁止查询学生姓名", { exact: false })).toBeVisible();
});
