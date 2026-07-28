<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import {
  Building2,
  ChartNoAxesCombined,
  CircleCheckBig,
  LayoutDashboard,
  Lightbulb,
  Network,
  Search,
  Target,
  TrendingUp,
  TriangleAlert,
  Users,
} from "@lucide/vue";
import { ElMessage } from "element-plus";
import PageFilterBar from "@/components/PageFilterBar.vue";
import NewPortraitChart from "@/features/new-student-growth-portrait/NewPortraitChart.vue";
import {
  createGroupSchoolOption,
  createTrendOption,
  gapTrendOption,
  groupScaleOption,
  groupStructureOption,
  heatmapOption,
  measureOption,
  migrationOption,
  schoolDistributionOption,
  schoolQuadrantOption,
  schoolTypeOption,
  supportFunnelOption,
  urbanRuralOption,
} from "@/features/new-student-growth-portrait/chart-options";
import {
  equityMetrics,
  findings,
  focusSchools,
  groupStats,
  overviewMetrics,
  portraitAnchors,
  schoolRows,
  supportRows,
  supportStats,
} from "@/features/new-student-growth-portrait/data";

const activeAnchor = ref<(typeof portraitAnchors)[number]["key"]>("regional-overview");
const stage = ref("全部学段");
const grade = ref("全部年级");
const schoolType = ref("全部学校");
const term = ref("2025—2026下学期");
const trendMode = ref<"综合趋势" | "分学段">("综合趋势");
const selectedGroup = ref("critical");
const schoolKeyword = ref("");
const appliedScope = ref("全部学段 · 全部年级 · 全部学校");

const anchorIcons = {
  "regional-overview": LayoutDashboard,
  "student-groups": Users,
  "school-development": Building2,
  "regional-equity": Network,
  "growth-support": Target,
};

const metricIcons = [Users, TrendingUp, ChartNoAxesCombined, TriangleAlert, CircleCheckBig];
const trendOption = computed(() => createTrendOption(trendMode.value === "分学段"));
const groupSchoolOption = computed(() => createGroupSchoolOption(selectedGroup.value));
const filteredSchoolRows = computed(() => {
  const keyword = schoolKeyword.value.trim();
  return keyword ? schoolRows.filter((row) => row.school.includes(keyword) || row.type.includes(keyword)) : schoolRows;
});

let observer: IntersectionObserver | null = null;

function goToAnchor(anchor: (typeof portraitAnchors)[number]["key"]) {
  activeAnchor.value = anchor;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(anchor)?.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
}

function applyFilters() {
  appliedScope.value = `${stage.value} · ${grade.value} · ${schoolType.value}`;
  ElMessage.success(`已更新统计范围：${appliedScope.value}`);
}

function resetFilters() {
  stage.value = "全部学段";
  grade.value = "全部年级";
  schoolType.value = "全部学校";
  term.value = "2025—2026下学期";
  appliedScope.value = "全部学段 · 全部年级 · 全部学校";
  ElMessage.info("已恢复默认统计范围");
}

function notify(message: string) {
  ElMessage.success(message);
}

function attentionTagType(level: string) {
  if (level === "高关注") return "danger";
  if (level === "较高关注") return "warning";
  return "info";
}

function developmentTagType(status: string) {
  if (status === "优势发展" || status === "稳定进步") return "success";
  if (status === "重点关注") return "warning";
  if (status === "专项支持") return "danger";
  return "primary";
}

function supportTagType(status: string) {
  if (status === "成效良好") return "success";
  if (status === "需要优化") return "warning";
  if (status === "重点督导") return "danger";
  return "primary";
}

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visibleEntry) {
      activeAnchor.value = visibleEntry.target.id as (typeof portraitAnchors)[number]["key"];
    }
  }, {
    rootMargin: "-96px 0px -58% 0px",
    threshold: [0.08, 0.25, 0.5],
  });
  portraitAnchors.forEach(({ key }) => {
    const section = document.getElementById(key);
    if (section) observer?.observe(section);
  });
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});
</script>

<template>
  <div class="new-student-portrait">
    <header class="new-student-portrait__intro">
      <div>
        <div class="new-student-portrait__eyebrow">
          <ElTag size="small" effect="plain">新页面</ElTag>
          <span>区域学生发展治理视角</span>
        </div>
        <h1>新学生成长画像</h1>
        <p>从区域整体质量出发，连续观察学生群体结构、学校发展差异、教育均衡与成长支持成效。</p>
      </div>
      <div class="new-student-portrait__coverage">
        <span class="new-student-portrait__coverage-label">当前数据覆盖</span>
        <strong>54 所学校 · 86,420 名学生</strong>
        <ElProgress :percentage="96.8" :show-text="false" :stroke-width="6" />
      </div>
    </header>

    <PageFilterBar class="portrait-filter" aria-label="学生发展画像统计范围">
      <label class="portrait-filter__field">
        <span>学段：</span>
        <ElSelect v-model="stage" aria-label="学段" class="portrait-filter__select">
          <ElOption label="全部学段" value="全部学段" />
          <ElOption label="小学" value="小学" />
          <ElOption label="初中" value="初中" />
          <ElOption label="高中" value="高中" />
        </ElSelect>
      </label>
      <label class="portrait-filter__field">
        <span>年级：</span>
        <ElSelect v-model="grade" aria-label="年级" class="portrait-filter__select">
          <ElOption label="全部年级" value="全部年级" />
          <ElOption label="七年级" value="七年级" />
          <ElOption label="八年级" value="八年级" />
          <ElOption label="九年级" value="九年级" />
        </ElSelect>
      </label>
      <label class="portrait-filter__field">
        <span>学校：</span>
        <ElSelect v-model="schoolType" aria-label="学校类型" class="portrait-filter__select portrait-filter__select--wide">
          <ElOption label="全部学校" value="全部学校" />
          <ElOption label="城区学校" value="城区学校" />
          <ElOption label="乡镇学校" value="乡镇学校" />
          <ElOption label="九年一贯制" value="九年一贯制" />
        </ElSelect>
      </label>
      <label class="portrait-filter__field portrait-filter__field--term">
        <span>学期：</span>
        <ElSelect v-model="term" aria-label="学期" class="portrait-filter__select portrait-filter__select--term">
          <ElOption label="2025—2026下学期" value="2025—2026下学期" />
          <ElOption label="2025—2026上学期" value="2025—2026上学期" />
          <ElOption label="2024—2025下学期" value="2024—2025下学期" />
        </ElSelect>
      </label>
      <template #actions>
        <ElButton type="primary" :icon="Search" @click="applyFilters">查询</ElButton>
        <ElButton @click="resetFilters">重置</ElButton>
        <span class="portrait-filter__updated">数据更新至 2026-07-26 23:30</span>
      </template>
    </PageFilterBar>

    <div class="new-student-portrait__workspace">
      <nav class="portrait-anchor-nav" aria-label="新学生成长画像内容锚点">
        <div class="portrait-anchor-nav__title">内容导航</div>
        <a
          v-for="anchor in portraitAnchors"
          :key="anchor.key"
          :href="`#${anchor.key}`"
          :aria-current="activeAnchor === anchor.key ? 'location' : undefined"
          :class="{ 'is-active': activeAnchor === anchor.key }"
          @click.prevent="goToAnchor(anchor.key)"
        >
          <span class="portrait-anchor-nav__icon">
            <component :is="anchorIcons[anchor.key]" :size="16" :stroke-width="1.8" />
          </span>
          <span class="portrait-anchor-nav__copy">
            <strong>{{ anchor.label }}</strong>
          </span>
        </a>
        <div class="portrait-anchor-nav__scope">
          <span>当前范围</span>
          <strong>{{ appliedScope }}</strong>
        </div>
      </nav>

      <main class="new-student-portrait__content">
        <section id="regional-overview" class="portrait-section" aria-labelledby="regional-overview-title">
          <div class="portrait-section__heading">
            <div>
              <span class="portrait-section__index">01 · OVERVIEW</span>
              <h2 id="regional-overview-title">区域发展总览</h2>
              <p>汇总区域规模、发展水平、重点群体及学校差异，统一当前统计范围。</p>
            </div>
          </div>

          <div class="portrait-metrics">
            <article
              v-for="(metric, index) in overviewMetrics"
              :key="metric.label"
              class="portrait-metric"
            >
              <div class="portrait-metric__top">
                <span>{{ metric.label }}</span>
                <span class="portrait-metric__icon">
                  <component :is="metricIcons[index]" :size="18" />
                </span>
              </div>
              <strong>{{ metric.value }}<small>{{ metric.unit }}</small></strong>
              <div class="portrait-metric__bottom">
                <span :class="metric.trendDirection === 'positive' ? 'is-positive' : 'is-negative'">{{ metric.trend }}</span>
                <small>较上学期</small>
              </div>
            </article>
          </div>

          <div class="portrait-grid portrait-grid--2-1">
            <article class="portrait-panel">
              <header class="portrait-panel__header">
                <div>
                  <h3>区域学生发展趋势</h3>
                  <p>学业增值按学生本期标准分减基期标准分后取区域均值；及格率与低分率按参考学生去重统计。</p>
                </div>
                <ElRadioGroup v-model="trendMode" size="small">
                  <ElRadioButton label="综合趋势" value="综合趋势" />
                  <ElRadioButton label="分学段" value="分学段" />
                </ElRadioGroup>
              </header>
              <div class="portrait-panel__chart">
                <NewPortraitChart :option="trendOption" ariaLabelText="区域学生发展近六学期趋势" />
              </div>
            </article>

            <article class="portrait-panel">
              <header class="portrait-panel__header">
                <div>
                  <h3>区域智能摘要</h3>
                  <p>仅归纳当前筛选范围内达到统计发布门槛的变化。</p>
                </div>
                <ElButton link type="primary" @click="notify('已重新生成当前范围摘要')">重新生成</ElButton>
              </header>
              <div class="portrait-summary">
                <div class="portrait-summary__title"><Lightbulb :size="16" /> 本期核心判断</div>
                <p>区域学生整体发展保持稳定，学业增值指数较上学期提升 2.6%。八年级英语及格临界群体有所扩大，乡镇学校数学低分率仍高于区域均值。</p>
              </div>
              <div class="portrait-findings">
                <div v-for="finding in findings" :key="finding.title" class="portrait-finding" :class="`is-${finding.tone}`">
                  <span />
                  <div><strong>{{ finding.title }}</strong><p>{{ finding.text }}</p></div>
                </div>
              </div>
            </article>
          </div>

          <div class="portrait-grid portrait-grid--3-2">
            <article class="portrait-panel">
              <header class="portrait-panel__header">
                <div><h3>学生群体结构</h3><p>按当前水平与连续两期变化方向互斥分组，每名学生只计入一个主群体。</p></div>
                <ElTag size="small" effect="plain">动态群体</ElTag>
              </header>
              <div class="portrait-panel__chart">
                <NewPortraitChart :option="groupStructureOption" ariaLabelText="区域学生群体结构占比" />
              </div>
            </article>
            <article class="portrait-panel">
              <header class="portrait-panel__header">
                <div><h3>学校发展四象限</h3><p>横轴为综合发展指数，纵轴为学业增值，气泡面积对应学生规模。</p></div>
                <ElButton link type="primary" @click="goToAnchor('school-development')">查看全部</ElButton>
              </header>
              <div class="portrait-panel__chart">
                <NewPortraitChart :option="schoolQuadrantOption" ariaLabelText="学校综合发展指数与学业增值四象限" />
              </div>
            </article>
          </div>

          <article class="portrait-panel">
            <header class="portrait-panel__header">
              <div><h3>重点关注学校</h3><p>由临界群体变化、校际差异和支持改善率联合识别，并保留触发原因。</p></div>
            </header>
            <ElTable :data="focusSchools" row-key="school" stripe aria-label="重点关注学校列表">
              <ElTableColumn column-key="school" label="学校" min-width="190">
                <template #default="{ row }"><strong class="portrait-table__school">{{ row.school }}</strong><small class="portrait-table__meta">{{ row.type }} · {{ row.students }} 名学生</small></template>
              </ElTableColumn>
              <ElTableColumn prop="issue" label="主要关注问题" min-width="220" />
              <ElTableColumn prop="group" label="关联群体" min-width="140" />
              <ElTableColumn prop="value" label="当前值" width="100" />
              <ElTableColumn prop="delta" label="较上学期" width="100" />
              <ElTableColumn column-key="level" label="关注等级" width="110">
                <template #default="{ row }"><ElTag :type="attentionTagType(row.level)" size="small">{{ row.level }}</ElTag></template>
              </ElTableColumn>
              <ElTableColumn prop="action" label="建议动作" min-width="180" />
            </ElTable>
          </article>
        </section>

        <section id="student-groups" class="portrait-section" aria-labelledby="student-groups-title">
          <div class="portrait-section__heading">
            <div><span class="portrait-section__index">02 · COHORTS</span><h2 id="student-groups-title">学生群体画像</h2><p>统计群体规模、校内占比和跨学期迁移，区域端不展示学生名单。</p></div>
          </div>
          <div class="portrait-mini-stats">
            <article v-for="item in groupStats" :key="item.label"><span>{{ item.label }}</span><strong>{{ item.value }}</strong><small>{{ item.note }}</small></article>
          </div>
          <div class="portrait-grid portrait-grid--half">
            <article class="portrait-panel">
              <header class="portrait-panel__header"><div><h3>重点群体规模</h3><p>按学生唯一标识去重，同一学生只进入一个主群体。</p></div></header>
              <div class="portrait-panel__chart portrait-panel__chart--tall"><NewPortraitChart :option="groupScaleOption" ariaLabelText="重点学生群体规模" /></div>
            </article>
            <article class="portrait-panel">
              <header class="portrait-panel__header"><div><h3>群体阶段迁移</h3><p>连接宽度表示同一批学生从上期群体流向本期群体的人数。</p></div></header>
              <div class="portrait-panel__chart portrait-panel__chart--tall">
                <NewPortraitChart :option="migrationOption" ariaLabelText="学生群体上学期至本学期阶段迁移桑基图" />
              </div>
            </article>
          </div>
          <article class="portrait-panel">
            <header class="portrait-panel__header">
              <div><h3>群体学校分布</h3><p>学校群体占比 = 该群体学生数 ÷ 学校当前统计范围学生数。</p></div>
              <ElSelect v-model="selectedGroup" aria-label="选择学生群体" style="width: 180px">
                <ElOption label="及格临界群体" value="critical" />
                <ElOption label="持续下降群体" value="decline" />
                <ElOption label="高投入低成效" value="effort" />
              </ElSelect>
            </header>
            <div class="portrait-panel__chart portrait-panel__chart--tall"><NewPortraitChart :option="groupSchoolOption" ariaLabelText="所选学生群体学校分布" /></div>
          </article>
        </section>

        <section id="school-development" class="portrait-section" aria-labelledby="school-development-title">
          <div class="portrait-section__heading">
            <div><span class="portrait-section__index">03 · SCHOOLS</span><h2 id="school-development-title">学校发展画像</h2><p>分开比较学校当前水平与起点校正后的变化，避免只按平均分判断。</p></div>
          </div>
          <div class="portrait-grid portrait-grid--2-1">
            <article class="portrait-panel">
              <header class="portrait-panel__header"><div><h3>学校发展分布</h3><p>学业增值 = 本期学生标准分 − 基期学生标准分，再汇总为学校均值。</p></div></header>
              <div class="portrait-panel__chart portrait-panel__chart--tall"><NewPortraitChart :option="schoolDistributionOption" ariaLabelText="学校发展区域分布" /></div>
            </article>
            <article class="portrait-panel">
              <header class="portrait-panel__header"><div><h3>区域学校结构</h3><p>按学校主数据中的办学类型去重统计，共 54 所。</p></div></header>
              <div class="portrait-panel__chart portrait-panel__chart--tall"><NewPortraitChart :option="schoolTypeOption" ariaLabelText="区域学校类型结构" /></div>
            </article>
          </div>
          <article class="portrait-panel">
            <header class="portrait-panel__header">
              <div><h3>学校发展列表</h3><p>发展指数、学业增值与支持覆盖率分别计算，不合并为单一排名。</p></div>
              <ElInput v-model="schoolKeyword" :prefix-icon="Search" clearable placeholder="搜索学校" aria-label="搜索学校" style="width: 220px" />
            </header>
            <ElTable :data="filteredSchoolRows" row-key="school" stripe aria-label="学校发展列表">
              <ElTableColumn type="index" label="排序" width="68" />
              <ElTableColumn column-key="school" label="学校" min-width="180"><template #default="{ row }"><strong class="portrait-table__school">{{ row.school }}</strong><small class="portrait-table__meta">{{ row.type }}</small></template></ElTableColumn>
              <ElTableColumn prop="index" label="发展指数" width="105" sortable />
              <ElTableColumn prop="valueAdd" label="学业增值" width="105" sortable />
              <ElTableColumn prop="critical" label="临界群体占比" width="130" sortable />
              <ElTableColumn prop="support" label="支持覆盖率" width="115" sortable />
              <ElTableColumn prop="trend" label="趋势" width="110" />
              <ElTableColumn column-key="status" label="综合状态" width="120"><template #default="{ row }"><ElTag :type="developmentTagType(row.status)" size="small">{{ row.status }}</ElTag></template></ElTableColumn>
              <ElTableColumn column-key="actions" label="操作" width="96"><template #default="{ row }"><ElButton link type="primary" @click="notify(`已打开 ${row.school} 画像摘要`)">查看画像</ElButton></template></ElTableColumn>
            </ElTable>
          </article>
        </section>

        <section id="regional-equity" class="portrait-section" aria-labelledby="regional-equity-title">
          <div class="portrait-section__heading">
            <div><span class="portrait-section__index">04 · EQUITY</span><h2 id="regional-equity-title">区域均衡分析</h2><p>在同一统计范围内比较校际、城乡、片区和同类学校差异。</p></div>
          </div>
          <div class="portrait-metrics">
            <article v-for="(metric, index) in equityMetrics" :key="metric.label" class="portrait-metric">
              <div class="portrait-metric__top"><span>{{ metric.label }}</span><span class="portrait-metric__icon"><component :is="metricIcons[index]" :size="18" /></span></div>
              <strong>{{ metric.value }}<small>{{ metric.unit }}</small></strong>
              <div class="portrait-metric__bottom"><span :class="metric.trendDirection === 'positive' ? 'is-positive' : 'is-negative'">{{ metric.trend }}</span><small>差异变化</small></div>
            </article>
          </div>
          <div class="portrait-grid portrait-grid--half">
            <article class="portrait-panel"><header class="portrait-panel__header"><div><h3>城乡学校发展对比</h3><p>分别计算城乡学校指标均值，差值使用百分点呈现。</p></div></header><div class="portrait-panel__chart portrait-panel__chart--tall"><NewPortraitChart :option="urbanRuralOption" ariaLabelText="城乡学校发展指标对比" /></div></article>
            <article class="portrait-panel"><header class="portrait-panel__header"><div><h3>校际差距变化</h3><p>校际差异采用学校得分率的变异系数，数值越低表示越均衡。</p></div></header><div class="portrait-panel__chart portrait-panel__chart--tall"><NewPortraitChart :option="gapTrendOption" ariaLabelText="校际和城乡差异指数变化" /></div></article>
          </div>
          <article class="portrait-panel">
            <header class="portrait-panel__header"><div><h3>片区发展热力矩阵</h3><p>单元格为片区内学校指标均值，颜色越深表示数值越高。</p></div></header>
            <div class="portrait-panel__chart portrait-panel__chart--tall">
              <NewPortraitChart :option="heatmapOption" ariaLabelText="五个片区的五类发展指标热力矩阵" />
            </div>
          </article>
        </section>

        <section id="growth-support" class="portrait-section" aria-labelledby="growth-support-title">
          <div class="portrait-section__heading">
            <div><span class="portrait-section__index">05 · SUPPORT</span><h2 id="growth-support-title">成长支持成效</h2><p>从识别、纳入、执行、改善到稳定保持，观察支持闭环是否真正生效。</p></div>
            <ElButton @click="notify('已打开指标口径说明')">指标口径</ElButton>
          </div>
          <div class="portrait-mini-stats">
            <article v-for="item in supportStats" :key="item.label"><span>{{ item.label }}</span><strong>{{ item.value }}</strong><small>{{ item.note }}</small></article>
          </div>
          <div class="portrait-grid portrait-grid--half">
            <article class="portrait-panel"><header class="portrait-panel__header"><div><h3>支持闭环转化</h3><p>每层人数以上一环节为基数，追踪识别、纳入、完成、改善与稳定保持。</p></div></header><div class="portrait-panel__chart portrait-panel__chart--tall"><NewPortraitChart :option="supportFunnelOption" ariaLabelText="成长支持闭环转化漏斗" /></div></article>
            <article class="portrait-panel"><header class="portrait-panel__header"><div><h3>不同措施改善效果</h3><p>改善率 = 措施后退出重点群体人数 ÷ 完成该措施人数。</p></div></header><div class="portrait-panel__chart portrait-panel__chart--tall"><NewPortraitChart :option="measureOption" ariaLabelText="不同成长支持措施改善效果" /></div></article>
          </div>
          <article class="portrait-panel">
            <header class="portrait-panel__header"><div><h3>学校支持成效</h3><p>支持覆盖率 = 已纳入支持人数 ÷ 学校重点群体人数。</p></div></header>
            <ElTable :data="supportRows" row-key="school" stripe aria-label="学校成长支持成效">
              <ElTableColumn prop="school" label="学校" min-width="170" />
              <ElTableColumn prop="target" label="重点群体规模" width="125" />
              <ElTableColumn column-key="coverage" label="支持覆盖率" min-width="170"><template #default="{ row }"><ElProgress :percentage="row.coverage" :stroke-width="7" /></template></ElTableColumn>
              <ElTableColumn prop="completion" label="措施完成率" width="120" />
              <ElTableColumn prop="improve" label="群体改善率" width="120" />
              <ElTableColumn prop="stable" label="稳定保持率" width="120" />
              <ElTableColumn column-key="status" label="状态" width="110"><template #default="{ row }"><ElTag :type="supportTagType(row.status)" size="small">{{ row.status }}</ElTag></template></ElTableColumn>
            </ElTable>
          </article>
        </section>

      </main>
    </div>
  </div>
</template>

<style scoped>
.new-student-portrait {
  display: grid;
  min-width: 0;
  gap: var(--spacing-16);
  color: var(--color-title);
}

.new-student-portrait__intro,
.portrait-filter,
.portrait-panel,
.portrait-metric,
.portrait-mini-stats article {
  border: 0;
  background: var(--color-white);
}

.new-student-portrait__intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-24);
  padding: var(--spacing-20) var(--spacing-24);
  border-radius: var(--radius-md);
}

.new-student-portrait__eyebrow {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
}

.new-student-portrait__intro h1 {
  margin-top: var(--spacing-8);
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
}

.new-student-portrait__intro p {
  margin-top: var(--spacing-6);
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.new-student-portrait__coverage {
  width: 280px;
  padding-left: var(--spacing-24);
}

.new-student-portrait__coverage-label,
.portrait-filter__updated {
  display: block;
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
}

.new-student-portrait__coverage strong {
  display: block;
  margin: var(--spacing-6) 0 var(--spacing-8);
  font-size: var(--font-size-md);
}

.portrait-filter {
  border: 0;
  border-radius: var(--radius-md);
}

.portrait-filter__field {
  display: flex;
  width: 200px;
  height: 32px;
  flex: none;
  align-items: center;
  color: var(--color-title);
  font-size: var(--font-size-md);
}

.portrait-filter__field--term { width: 230px; }
.portrait-filter__field > span { flex: none; white-space: nowrap; }
.portrait-filter__select { min-width: 0; flex: 1; }

.new-student-portrait__workspace {
  display: grid;
  grid-template-columns: 188px minmax(0, 1fr);
  align-items: start;
  gap: var(--spacing-16);
  min-width: 0;
}

.portrait-anchor-nav {
  position: sticky;
  top: var(--spacing-16);
  display: grid;
  gap: var(--spacing-4);
  padding: var(--spacing-12);
  border: 0;
  border-radius: var(--radius-md);
  background: var(--color-white);
}

.portrait-anchor-nav__title {
  padding: var(--spacing-4) var(--spacing-8) var(--spacing-8);
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
}

.portrait-anchor-nav a {
  display: flex;
  align-items: center;
  gap: var(--spacing-10);
  min-height: 48px;
  padding: var(--spacing-8);
  border-radius: var(--radius-md);
  color: var(--color-body);
  text-decoration: none;
  transition: background-color .16s ease, color .16s ease;
}

.portrait-anchor-nav a:hover,
.portrait-anchor-nav a.is-active {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.portrait-anchor-nav a:focus-visible {
  outline: 2px solid var(--color-primary-line-light);
  outline-offset: 1px;
}

.portrait-anchor-nav__icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-md);
  background: var(--color-bg-muted);
}

.portrait-anchor-nav a.is-active .portrait-anchor-nav__icon {
  background: var(--color-white);
}

.portrait-anchor-nav__copy {
  line-height: 1.2;
}

.portrait-anchor-nav__copy strong {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.portrait-anchor-nav__scope {
  display: grid;
  gap: var(--spacing-4);
  margin-top: var(--spacing-8);
  padding: var(--spacing-8);
  border-radius: var(--radius-md);
  background: var(--color-bg-muted);
}

.portrait-anchor-nav__scope span { color: var(--color-secondary); font-size: var(--font-size-xs); }
.portrait-anchor-nav__scope strong { color: var(--color-body); font-size: var(--font-size-xs); font-weight: 500; line-height: 18px; }

.new-student-portrait__content {
  display: grid;
  min-width: 0;
  gap: var(--spacing-24);
}

.portrait-section {
  display: grid;
  min-width: 0;
  gap: var(--spacing-16);
  scroll-margin-top: var(--spacing-16);
}

.portrait-section + .portrait-section {
  padding-top: var(--spacing-24);
}

.portrait-section__heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--spacing-16);
}

.portrait-section__index {
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .08em;
}

.portrait-section__heading h2 {
  margin-top: var(--spacing-4);
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
}

.portrait-section__heading p,
.portrait-panel__header p {
  margin-top: var(--spacing-4);
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
}

.portrait-metrics {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--spacing-12);
}

.portrait-metric {
  padding: var(--spacing-16);
  border-radius: var(--radius-md);
}

.portrait-metric__top,
.portrait-metric__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-8);
}

.portrait-metric__top { color: var(--color-body); font-size: var(--font-size-sm); }
.portrait-metric__icon { display: grid; place-items: center; width: 34px; height: 34px; border-radius: var(--radius-md); color: var(--color-primary); background: var(--color-primary-light); }
.portrait-metric > strong { display: block; margin-top: var(--spacing-12); font-size: 26px; line-height: 32px; font-weight: 600; }
.portrait-metric > strong small { margin-left: var(--spacing-4); color: var(--color-secondary); font-size: var(--font-size-xs); font-weight: 400; }
.portrait-metric__bottom { margin-top: var(--spacing-10); font-size: var(--font-size-xs); }
.portrait-metric__bottom small { color: var(--color-secondary); }
.is-positive { color: var(--color-success-dark-text); }
.is-negative { color: var(--color-error-dark-text); }

.portrait-grid {
  display: grid;
  min-width: 0;
  gap: var(--spacing-16);
}
.portrait-grid--2-1 { grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr); }
.portrait-grid--3-2 { grid-template-columns: minmax(0, 3fr) minmax(320px, 2fr); }
.portrait-grid--half { grid-template-columns: repeat(2, minmax(0, 1fr)); }

.portrait-panel {
  display: grid;
  min-width: 0;
  gap: var(--spacing-16);
  padding: var(--spacing-16);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.portrait-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-16);
}
.portrait-panel__header h3 { font-size: var(--font-size-lg); line-height: var(--line-height-lg); font-weight: 600; }
.portrait-panel__chart { height: 300px; }
.portrait-panel__chart--tall { height: 340px; }

.portrait-summary {
  padding: var(--spacing-14);
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
}
.portrait-summary__title { display: flex; align-items: center; gap: var(--spacing-6); color: var(--color-primary-dark-text); font-size: var(--font-size-sm); font-weight: 600; }
.portrait-summary p { margin-top: var(--spacing-8); color: var(--color-body); font-size: var(--font-size-xs); line-height: 20px; }
.portrait-findings { display: grid; gap: var(--spacing-14); }
.portrait-finding { display: grid; grid-template-columns: 8px 1fr; gap: var(--spacing-10); }
.portrait-finding > span { width: 7px; height: 7px; margin-top: var(--spacing-6); border-radius: var(--radius-full); background: var(--finding-color); }
.portrait-finding.is-success { --finding-color: var(--color-success-dark-text); }
.portrait-finding.is-warning { --finding-color: var(--color-warning-dark-text); }
.portrait-finding.is-danger { --finding-color: var(--color-error-dark-text); }
.portrait-finding strong { font-size: var(--font-size-sm); }
.portrait-finding p { margin-top: var(--spacing-4); color: var(--color-secondary); font-size: var(--font-size-xs); line-height: 18px; }

.portrait-table__school,
.portrait-table__meta { display: block; }
.portrait-table__school { color: var(--color-title); font-size: var(--font-size-sm); font-weight: 600; }
.portrait-table__meta { margin-top: var(--spacing-2); color: var(--color-secondary); font-size: 11px; }

.portrait-mini-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--spacing-12);
}
.portrait-mini-stats article { display: grid; gap: var(--spacing-6); padding: var(--spacing-16); border-radius: var(--radius-md); }
.portrait-mini-stats span,
.portrait-mini-stats small { color: var(--color-secondary); font-size: var(--font-size-xs); }
.portrait-mini-stats strong { font-size: 21px; line-height: 28px; font-weight: 600; }

@media (max-width: 1380px) {
  .portrait-metrics { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .portrait-grid--2-1,
  .portrait-grid--3-2 { grid-template-columns: minmax(0, 1.5fr) minmax(280px, 1fr); }
  .portrait-filter__updated { max-width: 156px; line-height: 18px; text-align: right; }
}

@media (max-width: 1120px) {
  .new-student-portrait__workspace { grid-template-columns: 1fr; }
  .portrait-anchor-nav { top: 0; z-index: 4; display: flex; overflow-x: auto; padding: var(--spacing-8); }
  .portrait-anchor-nav__title,
  .portrait-anchor-nav__scope { display: none; }
  .portrait-anchor-nav a { min-width: max-content; min-height: 40px; }
  .portrait-anchor-nav__copy { display: block; }
  .portrait-grid--2-1,
  .portrait-grid--3-2,
  .portrait-grid--half { grid-template-columns: 1fr; }
  .portrait-section { scroll-margin-top: 64px; }
}

@media (max-width: 760px) {
  .new-student-portrait__intro,
  .portrait-filter,
  .portrait-section__heading { align-items: flex-start; flex-direction: column; }
  .new-student-portrait__coverage { width: 100%; padding: var(--spacing-16) 0 0; }
  .portrait-filter__updated { margin-top: var(--spacing-8); }
  .portrait-metrics,
  .portrait-mini-stats { grid-template-columns: 1fr; }
  .portrait-filter__field,
  .portrait-filter__field--term { width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .portrait-anchor-nav a { transition: none; }
}
</style>
