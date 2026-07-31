import { expect, test, type Page } from "@playwright/test";

async function switchToBureauTenant(page: Page) {
  await page.goto("/workbench");
  await page
    .getByRole("button", { name: /体育东路小学海明学校|天河区第二实验小学/ })
    .click();
  await page.getByRole("menuitem", { name: "体验区教育局", exact: true }).click();
}

test("学生成长画像连续展示八段可追溯区域分析并通过锚点定位", async ({ page }) => {
  await switchToBureauTenant(page);
  await page.goto("/bureau/education-governance/student-growth-portrait");

  await expect(page.locator(".student-growth-portrait-page__intro")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "学生成长画像", exact: true })).toHaveCount(0);
  const navigation = page.getByRole("navigation", { name: "学生成长画像内容锚点" });
  const filterBar = page.locator(".portrait-filter");
  await expect(filterBar).toHaveCSS("position", "sticky");
  await expect(filterBar).toHaveCSS("top", "0px");
  await expect(navigation).toHaveCSS("position", "sticky");
  await expect(navigation).toHaveCSS("top", "80px");
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
  await expect(page.getByRole("img", {
    name: /五育评价.+评价表一级指标评价等级热力图/,
  })).toHaveCount(3);
  await expect(page.getByRole("heading", { name: "专题与发展报告", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^导出/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /生成.*报告/ })).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: "学校类型" })).toHaveCount(0);
  await expect(page.locator(".portrait-filter__updated")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "学生群体画像" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "学校发展画像" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "成长支持成效" })).toHaveCount(0);
  for (const label of [
    "五育评价对比维度",
    "运动健康对比维度",
    "荣誉发展对比维度",
    "行为习惯对比维度",
    "实践活动对比维度",
  ]) {
    await expect(page.getByRole("radiogroup", { name: label })).toBeAttached();
  }
  await expect(page.getByRole("radiogroup", { name: "日常评价对比维度" })).toHaveCount(0);

  const firstPanel = page.locator(".portrait-panel").first();
  await expect(firstPanel).toHaveCSS("border-top-style", "none");
  await expect(firstPanel).toHaveCSS("border-radius", "4px");

  await expect(page.getByRole("heading", { name: "国家评价框架对齐" })).toBeVisible();
  await expect(page.getByRole("link", { name: /GB\/T 44099-2024/ })).toBeHidden();
  await page.getByRole("button", { name: /国家评价框架对齐/ }).click();
  await expect(page.getByRole("link", { name: /GB\/T 44099-2024/ })).toHaveAttribute("href", /openstd\.samr\.gov\.cn/);
  await expect(page.locator("#regional-overview .portrait-metric")).toHaveCount(7);
  await expect(
    page.locator("#regional-overview .portrait-metric").filter({ hasText: "区域学生总数" }),
  ).toContainText("缺少历史学籍快照");
  const fiveEducationMetric = page.locator("#regional-overview .portrait-metric").filter({
    hasText: "成长评价覆盖率",
  });
  await expect(fiveEducationMetric).toContainText(/同比 \+\d+\.\d{2} 个百分点/);
  await expect(fiveEducationMetric).not.toContainText("环比");
  await expect(fiveEducationMetric.locator(".portrait-metric__changes")).toHaveClass(/is-up/);
  await expect(page.locator("#sports-health")).toContainText(
    /同比 [+-]?\d+\.\d{2}(?:%| 个百分点)/,
  );
  await expect(page.locator("#sports-health .regional-quality-domain__metric-group").filter({
    has: page.getByRole("heading", { name: "阳光长跑", exact: true }),
  })).toContainText(
    /同比 [+-]?\d+\.\d{2}%/,
  );
  await expect(page.locator("#sports-health .regional-quality-domain__metrics small.is-up").first())
    .toBeAttached();
  await expect(page.getByRole("heading", { name: "综合素质数据总览" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "当前学业口径" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "区域观察口径" })).toHaveCount(0);

  await expect(page.getByRole("combobox", { name: "统考分析年级" })).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: "统考分析科目" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "统考学业质量对比", exact: true })).toBeVisible();
  const academicGradeComparison = page.locator("#regional-overview .portrait-panel").filter({
    has: page.getByRole("heading", { name: "统考学业质量对比", exact: true }),
  });
  await expect(academicGradeComparison).toContainText("成绩记录覆盖不足时在下方单独提示");
  await expect(academicGradeComparison).not.toContainText("折线为同场考试成绩覆盖率");
  await expect(page.getByRole("img", { name: /统考年级质量对比/ })).toBeVisible();
  await expect(page.locator("#regional-overview")).toContainText("各年级分别统计，不跨年级合并");

  await page.getByRole("combobox", { name: "学段", exact: true }).focus();
  await page.getByRole("combobox", { name: "学段", exact: true }).press("ArrowDown");
  await page.getByRole("option", { name: "小学", exact: true }).click();
  await page.getByRole("combobox", { name: "年级", exact: true }).focus();
  await page.getByRole("combobox", { name: "年级", exact: true }).press("ArrowDown");
  await page.getByRole("option", { name: "四年级", exact: true }).click();
  await page.getByRole("button", { name: "查询", exact: true }).click();
  await expect(
    page.locator("#regional-overview .portrait-metric").filter({ hasText: "区域学生总数" }).locator("strong"),
  ).toContainText("72");
  await expect(page.locator("#regional-overview")).not.toContainText("有效学籍去重");
  await expect(page.getByRole("img", { name: /统考年级质量对比/ })).toBeVisible();

  await page.getByRole("combobox", { name: "统考分析科目" }).focus();
  await page.getByRole("combobox", { name: "统考分析科目" }).press("ArrowDown");
  await expect(page.getByRole("option", { name: "科学", exact: true })).toHaveCount(0);
  await page.keyboard.press("Escape");

  await page.getByRole("combobox", { name: "学段", exact: true }).focus();
  await page.getByRole("combobox", { name: "学段", exact: true }).press("ArrowDown");
  await page.getByRole("option", { name: "初中", exact: true }).click();
  await page.getByRole("combobox", { name: "年级", exact: true }).focus();
  await page.getByRole("combobox", { name: "年级", exact: true }).press("ArrowDown");
  await page.getByRole("option", { name: "七年级", exact: true }).click();
  await page.getByRole("button", { name: "查询", exact: true }).click();
  await page.getByRole("combobox", { name: "统考分析科目" }).focus();
  await page.getByRole("combobox", { name: "统考分析科目" }).press("ArrowDown");
  await expect(page.getByRole("option", { name: "科学", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("combobox", { name: "学期", exact: true }).focus();
  await page.getByRole("combobox", { name: "学期", exact: true }).press("ArrowDown");
  await page.getByRole("option", { name: "2024—2025下学期", exact: true }).click();
  await page.getByRole("button", { name: "查询", exact: true }).click();
  await expect(fiveEducationMetric).toContainText("同比 暂无可比");

  await page.locator("#regional-overview").getByRole("button", { name: "同比变化：同比说明" }).first().hover();
  await expect(page.locator(".el-popper:visible").getByText("对照上一学年同一学期")).toBeVisible();
  await expect(page.locator(".el-popper:visible").getByText("不发布相邻学期环比")).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(page.locator(".el-popper:visible").getByText("对照上一学年同一学期")).toHaveCount(0);

  await page.locator("#regional-overview")
    .getByRole("button", { name: "区域发展总览指标口径：指标口径" })
    .hover();
  const overviewMetricPopover = page.locator(".el-popper:visible").filter({
    hasText: "至少有一条有效成长评价的学生数",
  });
  await expect(overviewMetricPopover.getByText("成长评价覆盖率", { exact: true })).toBeVisible();
  await expect(overviewMetricPopover).toContainText(/当前范围：\d+ ÷ \d+ = \d+(\.\d+)?%/);
  await page.mouse.move(0, 0);

  await page.locator("#regional-overview").getByRole("button", { name: "学业质量得分率：得分率口径" }).first().hover();
  const academicPopover = page.locator(".el-popper:visible").filter({ hasText: "7,860÷10,000=78.6%" });
  await expect(academicPopover.getByText("国家依据")).toBeVisible();
  await expect(academicPopover.getByText("地方规则")).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(page.locator(".el-popper:visible").filter({ hasText: "7,860÷10,000=78.6%" })).toHaveCount(0);

  const academicSubjectSelect = page.getByRole("combobox", { name: "统考分析科目" });
  await academicSubjectSelect.focus();
  await academicSubjectSelect.press("ArrowDown");
  await page.getByRole("option", { name: "数学", exact: true }).click();
  await expect(page.getByRole("img", { name: "数学统考学业质量阶段对比" })).toBeVisible();
  await expect(page.getByRole("img", { name: "数学统考年级质量对比" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "区域趋势年级" })).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: "区域趋势科目" })).toHaveCount(0);

  await navigation.getByRole("link", { name: /五育评价/ }).click();
  await expect(page.locator("#five-education")).toBeInViewport();
  await expect(page.getByRole("img", { name: "五育评价年级对比" })).toBeVisible();
  await expect(page.locator("#five-education")).toContainText("成长评价覆盖率");
  await expect(page.locator("#five-education")).toContainText("参评学生数");
  await expect(page.locator("#five-education")).toContainText("评价结果数");
  await expect(page.locator("#five-education")).toContainText("使用评价表");
  await expect(page.getByRole("img", {
    name: "五育评价初中评价表一级指标评价等级热力图",
  })).toBeVisible();
  await page.getByRole("button", { name: "一级指标评价等级构成说明：统计说明" }).hover();
  await expect(page.locator(".el-popper:visible").getByText("学期切换")).toBeVisible();
  await expect(page.locator(".el-popper:visible").getByText(
    "某等级占比 = 该等级评价数 ÷ 本指标全部评价数。",
  )).toBeVisible();
  await expect(page.locator(".el-popper:visible").getByText("学校横评")).toBeVisible();
  await expect(page.locator(".el-popper:visible").getByText(
    /A校 72÷120=60%，B校 45÷100=45%，C校 44÷80=55%/,
  )).toBeVisible();
  await page.mouse.move(500, 400);
  await expect(page.locator(".el-popper:visible")).toHaveCount(0);
  await page.getByRole("button", { name: "查看当前学期评价表" }).hover();
  await expect(page.locator(".el-popper:visible").getByText("当前学期评价表")).toBeVisible();
  await expect(page.locator(".el-popper:visible").getByText("初中评价表")).toBeVisible();
  await expect(page.locator(".el-popper:visible").getByText("小学评价表")).toHaveCount(0);
  await expect(page.locator(".el-popper:visible").getByText("高中评价表")).toHaveCount(0);
  await page.mouse.move(0, 0);
  await expect(page.locator("#five-education")).toContainText("同比");
  await expect(page.locator("#five-education")).not.toContainText("数据完整 · 覆盖");
  await expect(page.getByRole("radiogroup", { name: "五育评价对比维度" })).toBeVisible();
  await page.locator("#five-education").getByText("按学校", { exact: true }).click();
  await expect(page.getByRole("img", { name: "五育评价学校对比" })).toBeVisible();
  await page.locator("#five-education").getByRole("button", { name: "五育评价观察口径：观察口径" }).hover();
  const fiveEducationObservation = page.locator(".el-popper:visible").filter({
    hasText: "至少有一条有效成长评价的学生数",
  });
  await expect(fiveEducationObservation.getByText("成长评价覆盖率", { exact: true })).toBeVisible();
  await expect(fiveEducationObservation.getByText("参评学生数", { exact: true })).toBeVisible();
  await expect(fiveEducationObservation.getByText("评价结果数", { exact: true })).toBeVisible();
  await expect(fiveEducationObservation.getByText("使用评价表", { exact: true })).toBeVisible();
  await page.mouse.move(0, 0);

  await navigation.getByRole("link", { name: /运动健康/ }).click();
  await expect(page.locator("#sports-health")).toBeInViewport();
  await expect(page.locator("#sports-health")).not.toContainText("学生总数");
  await expect(page.locator("#sports-health")).toContainText("体测与运动参与");
  await expect(page.locator("#sports-health")).toContainText("体测覆盖率");
  await expect(page.locator("#sports-health")).not.toContainText("体测有效记录覆盖率");
  await expect(page.locator("#sports-health")).toContainText("运动目标完成率");
  await expect(page.locator("#sports-health")).toContainText("初中达标率");
  await expect(page.locator("#sports-health")).toContainText("阳光长跑");
  await expect(page.locator("#sports-health")).toContainText("累计运动路程");
  await expect(page.locator("#sports-health")).toContainText("累计运动人次");
  await expect(page.locator("#sports-health")).toContainText("人均运动时长");
  await expect(page.locator("#sports-health")).toContainText("同比");
  await expect(page.locator("#sports-health")).not.toContainText("数据完整 · 覆盖");
  await expect(page.locator("#sports-health")).not.toContainText("仅汇总当前筛选范围内标记为有效的跑步记录");
  await expect(page.locator("#sports-health .regional-quality-domain__run-summary")).toHaveCount(0);
  const smartSportsPopupPromise = page.waitForEvent("popup");
  await page.locator("#sports-health").getByRole("button", { name: "查看更多", exact: true }).click();
  const smartSportsPopup = await smartSportsPopupPromise;
  await expect(smartSportsPopup).toHaveURL(
    /\/bureau\/ai-precision-teaching\/smart-sports\/cockpit\?tenantId=bureau-001/,
  );
  await smartSportsPopup.close();
  await page.locator("#sports-health").getByRole("button", { name: "运动健康观察口径：观察口径" }).hover();
  await expect(page.locator(".el-popper:visible").getByText("当前边界")).toBeVisible();
  await page.mouse.move(0, 0);

  await navigation.getByRole("link", { name: /行为习惯/ }).click();
  await expect(page.locator("#behavior")).toBeInViewport();
  await expect(page.getByRole("radiogroup", { name: "行为习惯统计周期" })).toBeVisible();
  await expect(page.locator("#behavior")).toContainText("近 30 天入馆次数");
  await expect(page.locator("#behavior")).toContainText("生均泡馆时长");
  await expect(page.locator("#behavior")).toContainText("近 30 天借阅册数");
  await expect(page.locator("#behavior")).toContainText("近 30 天借阅次数");
  await page.getByRole("radiogroup", { name: "行为习惯统计周期" })
    .locator("label")
    .filter({ hasText: "近 7 天" })
    .click();
  await expect(page.locator("#behavior")).toContainText("近 7 天入馆次数");
  await expect(page.locator("#behavior")).toContainText("近 7 天借阅册数");
  await expect(page.locator("#behavior")).toContainText("近 7 天借阅次数");
  await expect(page.getByRole("img", {
    name: /行为习惯图书借阅类别统计，共 \d+ 册/,
  })).toBeVisible();

  await navigation.getByRole("link", { name: /实践活动/ }).click();
  await expect(page.locator("#practice")).toBeInViewport();
  await expect(page.locator("#practice")).toContainText("实践活动参与率");
  await expect(page.locator("#practice")).toContainText("生均有效活动次数");
  await expect(page.locator("#practice")).toContainText("生均参与类型数");
  await expect(page.locator("#practice")).toContainText("活动类型覆盖率");
  await expect(page.getByRole("heading", { name: "实践活动参与结构 · 年级热力图" })).toBeVisible();
  await expect(page.locator("#practice")).toContainText("颜色越深表示参与率越高");
  await expect(page.locator("#practice")).toContainText("该年级有效在籍学生数");
  await expect(page.locator("#practice")).toContainText("虚线为当前范围均值");
  await expect(page.getByRole("img", { name: "实践活动七类参与率年级热力图" })).toBeVisible();

  await navigation.getByRole("link", { name: /荣誉发展/ }).click();
  await expect(page.locator("#honor")).toBeInViewport();
  await expect(page.locator("#honor .regional-quality-domain__metrics"))
    .not.toContainText("荣誉学生覆盖率");
  await expect(page.locator("#honor")).toContainText("国家级获奖数");
  await expect(page.locator("#honor")).toContainText("省级获奖数");
  await expect(page.locator("#honor")).toContainText("市级获奖数");
  await expect(page.getByRole("img", { name: /荣誉发展奖项类型数量统计，共 \d+ 项/ })).toBeVisible();
  await expect(page.getByRole("img", { name: /荣誉发展奖项级别数量统计，共 \d+ 项/ })).toBeVisible();
  await expect(page.getByRole("img", { name: /荣誉发展奖项等级数量统计，共 \d+ 项/ })).toBeVisible();

  await navigation.getByRole("link", { name: /日常评价/ }).click();
  await expect(page.locator("#daily-evaluation")).toBeInViewport();
  await expect(page.getByRole("img", { name: "七年级日常评价构成" })).toBeVisible();
  await expect(page.locator("#daily-evaluation")).toContainText("表扬与待改进记录构成");
  await expect(page.locator("#daily-evaluation")).toContainText("日常评价记录覆盖率");
  await expect(page.getByRole("heading", { name: "七年级日常评价构成" })).toBeVisible();
  await expect(page.locator("#daily-evaluation")).toContainText("环图展示当前年级表扬与待改进记录构成");

  await navigation.getByRole("link", { name: /区域数据覆盖/ }).click();
  await expect(page.locator("#data-coverage")).toBeInViewport();
  await expect(page.getByRole("img", { name: "区域各学生发展领域数据覆盖率" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "数据源接入与质量明细" })).toHaveCount(0);
  await expect(page.locator('[aria-label="区域数据源覆盖明细"]')).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "数据发布边界" })).toHaveCount(0);
  await expect(page.locator("#data-coverage")).not.toContainText("城乡、片区、学校类型");
  await expect(page.getByRole("heading", { name: "数据来源说明" })).toBeVisible();
  await expect(page.locator("#data-coverage")).toContainText("各校单个学生的个人档案模块与学生成长数据");
  await expect(page.locator("#data-coverage")).toContainText("参照智慧体育大屏现有字段体系");
  const calculationTable = page.locator('[aria-label="学生成长画像指标计算口径"]');
  await expect(calculationTable).toBeVisible();
  await expect(calculationTable.locator("tbody tr")).toHaveCount(42);
  await expect(calculationTable).toContainText("区域平均得分率");
  await expect(calculationTable).toContainText("一级指标评价等级占比");
  await expect(calculationTable).toContainText("奖项类型、级别与等级构成");
  await expect(calculationTable).toContainText("图书借阅类别构成");
  await expect(calculationTable).toContainText("志愿活动参与率");
  await expect(calculationTable).toContainText("待改进评价占比");
  await expect(calculationTable).not.toContainText("体测覆盖率");
});
