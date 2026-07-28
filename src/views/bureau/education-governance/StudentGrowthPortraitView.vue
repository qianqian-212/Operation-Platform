<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import AcademicDevelopmentPanel from "@/features/student-growth-portrait/components/AcademicDevelopmentPanel.vue";
import DataOverviewPanel from "@/features/student-growth-portrait/components/DataOverviewPanel.vue";
import PortraitFilterBar from "@/features/student-growth-portrait/components/PortraitFilterBar.vue";
import RegionalOverviewPanel from "@/features/student-growth-portrait/components/RegionalOverviewPanel.vue";
import RegionalPortraitBoundaryPanel from "@/features/student-growth-portrait/components/RegionalPortraitBoundaryPanel.vue";
import SchoolComparisonPanel from "@/features/student-growth-portrait/components/SchoolComparisonPanel.vue";
import TopicAnalysisPanel from "@/features/student-growth-portrait/components/TopicAnalysisPanel.vue";
import TrendFollowUpPanel from "@/features/student-growth-portrait/components/TrendFollowUpPanel.vue";
import type { EducationStage, PortraitDataset, PortraitQuery } from "@/features/student-growth-portrait/data-contract";
import {
  pageCapabilityForTopic,
  type StudentGrowthPageCapability,
} from "@/features/student-growth-portrait/page-capability-matrix";
import {
  regionalPortraitAnchorByKey,
  regionalPortraitAnchorMatrix,
  type RegionalPortraitAnchorCapability,
  type RegionalPortraitAnchorStatus,
} from "@/features/student-growth-portrait/regional-portrait-anchor-matrix";
import { runtimeStudentGrowthPortraitRepository } from "@/features/student-growth-portrait/runtime-student-growth-portrait-repository";
import {
  studentGrowthTopicByKey,
} from "@/features/student-growth-portrait/topic-navigation";
import {
  virtualPortraitDataMetadata,
  virtualPortraitSchoolNames,
} from "@/features/student-growth-portrait/virtual-portrait-raw-data-source";

const activeAnchor = ref("regional-overview");
const academicYear = ref("2025-2026学年");
const semester = ref("第一学期");
const stage = ref("全部学段");
const grade = ref("全部年级");
const loading = ref(false);
const dataDrawerVisible = ref(false);
const dataset = ref<PortraitDataset>();
let requestController: AbortController | undefined;
let requestVersion = 0;

const pageCapabilityRows = computed(() => regionalPortraitAnchorMatrix.map((anchor) => ({
  label: anchor.label,
  status: anchor.status,
  limitation: anchor.limitation ?? "可按已注册指标与质量门槛展示区域聚合结果。",
})));
const selectedStudentCount = computed(() => (
  dataset.value?.metrics.find((metric) => metric.key === "enrolled-student-count")?.value ?? 0
));
const comprehensiveCapabilities = [
  "five-education",
  "sports-health",
  "honor",
  "behavior",
  "practice",
  "daily-evaluation",
].map((topic) => pageCapabilityForTopic(topic as StudentGrowthPageCapability["topic"]))
  .filter((capability): capability is StudentGrowthPageCapability => Boolean(capability));

function topicForCapability(capability: StudentGrowthPageCapability) {
  return studentGrowthTopicByKey.get(capability.topic);
}

function selectAnchor(anchor: RegionalPortraitAnchorCapability) {
  activeAnchor.value = anchor.key;
}

function anchorCapability(key: string) {
  const anchor = regionalPortraitAnchorByKey.get(key);
  if (!anchor) throw new Error(`未注册区域画像锚点：${key}`);
  return anchor;
}

function capabilityStatusLabel(status: RegionalPortraitAnchorStatus) {
  return { enabled: "可用", limited: "部分可用", planned: "待接入" }[status];
}

function capabilityStatusType(status: RegionalPortraitAnchorStatus): "success" | "warning" | "info" {
  return status === "enabled" ? "success" : status === "limited" ? "warning" : "info";
}

function toQuery(): PortraitQuery {
  const stageByLabel: Record<string, EducationStage | undefined> = {
    小学: "primary",
    初中: "junior",
    高中: "senior",
  };
  return {
    tenantId: "bureau-local-demo",
    academicYears: [academicYear.value.replace("学年", "")],
    terms: [semester.value === "第一学期" ? "first" : "second"],
    educationStages: stageByLabel[stage.value] ? [stageByLabel[stage.value]!] : undefined,
    grades: grade.value === "全部年级" ? undefined : [grade.value],
  };
}

async function queryData(notify = true) {
  requestController?.abort();
  const controller = new AbortController();
  requestController = controller;
  const version = ++requestVersion;
  loading.value = true;
  try {
    const nextDataset = await runtimeStudentGrowthPortraitRepository.query(toQuery(), controller.signal);
    if (version !== requestVersion || controller.signal.aborted) return;
    dataset.value = nextDataset;
    if (notify) ElMessage.success("已按当前筛选条件重新计算虚拟数据集");
  } catch (error) {
    if (controller.signal.aborted) return;
    ElMessage.error(error instanceof Error ? error.message : "学生成长数据加载失败");
  } finally {
    if (version === requestVersion) loading.value = false;
  }
}

onMounted(() => void queryData(false));
onBeforeUnmount(() => requestController?.abort());
</script>

<template>
  <div class="student-growth-portrait" v-loading="loading">
    <PortraitFilterBar
      v-model:academic-year="academicYear"
      v-model:semester="semester"
      v-model:stage="stage"
      v-model:grade="grade"
      @query="queryData()"
      @open-data="dataDrawerVisible = true"
    />

    <ElAlert
      class="student-growth-portrait__source-note"
      :title="`当前为虚拟数据源：${virtualPortraitDataMetadata.datasetVersion}`"
      :description="virtualPortraitDataMetadata.notice"
      type="warning"
      :closable="false"
      show-icon
    />

    <div class="student-growth-portrait__workspace">
      <nav class="student-growth-portrait__topics" aria-label="区域学生发展画像内容锚点">
        <a
          v-for="anchor in regionalPortraitAnchorMatrix"
          :key="anchor.key"
          :href="`#${anchor.key}`"
          :aria-current="activeAnchor === anchor.key ? 'location' : undefined"
          :class="{ 'is-active': activeAnchor === anchor.key }"
          @click="selectAnchor(anchor)"
        >
          <span>{{ anchor.label }}</span>
          <ElTag v-if="anchor.status !== 'enabled'" size="small" :type="capabilityStatusType(anchor.status)" effect="plain">
            {{ capabilityStatusLabel(anchor.status) }}
          </ElTag>
        </a>
      </nav>

      <section class="student-growth-portrait__content">
        <template v-if="dataset">
          <section id="regional-overview" class="student-growth-portrait__anchor-section" aria-label="区域发展总览">
            <RegionalOverviewPanel :dataset="dataset" :school-names="virtualPortraitSchoolNames" />
            <DataOverviewPanel :dataset="dataset" />
            <TrendFollowUpPanel :dataset="dataset" />
          </section>

          <section id="academic-development" class="student-growth-portrait__anchor-section" aria-label="学业发展画像">
            <RegionalPortraitBoundaryPanel :anchor="anchorCapability('academic-development')" :dataset="dataset" />
            <AcademicDevelopmentPanel :dataset="dataset" :school-names="virtualPortraitSchoolNames" />
          </section>

          <section id="student-cohorts" class="student-growth-portrait__anchor-section" aria-label="学生群体画像">
            <RegionalPortraitBoundaryPanel :anchor="anchorCapability('student-cohorts')" :dataset="dataset" />
          </section>

          <section id="school-development" class="student-growth-portrait__anchor-section" aria-label="学校发展画像">
            <SchoolComparisonPanel :dataset="dataset" :school-names="virtualPortraitSchoolNames" />
          </section>

          <section id="regional-balance" class="student-growth-portrait__anchor-section" aria-label="区域均衡分析">
            <RegionalPortraitBoundaryPanel :anchor="anchorCapability('regional-balance')" :dataset="dataset" />
          </section>

          <section id="comprehensive-development" class="student-growth-portrait__anchor-section" aria-label="综合素质画像">
            <RegionalPortraitBoundaryPanel :anchor="anchorCapability('comprehensive-development')" :dataset="dataset" />
            <TopicAnalysisPanel
              v-for="capability in comprehensiveCapabilities"
              :key="capability.key"
              :dataset="dataset"
              :topic="topicForCapability(capability)!"
              :capability="capability"
            />
          </section>

          <section id="growth-support" class="student-growth-portrait__anchor-section" aria-label="成长支持成效">
            <RegionalPortraitBoundaryPanel :anchor="anchorCapability('growth-support')" :dataset="dataset" />
          </section>

          <section id="special-analysis" class="student-growth-portrait__anchor-section" aria-label="专题分析">
            <RegionalPortraitBoundaryPanel :anchor="anchorCapability('special-analysis')" :dataset="dataset" />
          </section>

          <section id="ai-analysis" class="student-growth-portrait__anchor-section" aria-label="AI 分析助手">
            <RegionalPortraitBoundaryPanel :anchor="anchorCapability('ai-analysis')" :dataset="dataset" />
          </section>

          <section id="regional-report" class="student-growth-portrait__anchor-section" aria-label="区域发展报告">
            <RegionalPortraitBoundaryPanel :anchor="anchorCapability('regional-report')" :dataset="dataset" />
          </section>
        </template>
      </section>
    </div>
  </div>

  <ElDrawer v-model="dataDrawerVisible" title="数据与指标说明" size="460px">
    <ElAlert
      title="虚拟数据源已接入计算链路"
      description="页面当前展示由虚拟学生原始事件计算出的聚合结果。接入真实后端时仅替换数据源适配器，页面和计算口径保持不变。"
      type="warning"
      :closable="false"
      show-icon
    />
    <ElDescriptions :column="1" border class="student-growth-data-drawer__descriptions">
      <ElDescriptionsItem label="数据版本">{{ virtualPortraitDataMetadata.datasetVersion }}</ElDescriptionsItem>
      <ElDescriptionsItem label="来源类型">虚拟原始记录（local demo）</ElDescriptionsItem>
      <ElDescriptionsItem label="学校范围">{{ dataset?.schools.length ?? 0 }} 所学校</ElDescriptionsItem>
      <ElDescriptionsItem label="学生范围">{{ selectedStudentCount.toLocaleString() }} 名学生</ElDescriptionsItem>
      <ElDescriptionsItem label="计算时间">{{ dataset?.generatedAt ?? "—" }}</ElDescriptionsItem>
    </ElDescriptions>
    <section class="student-growth-data-drawer__section">
      <h3>指标准入规则</h3>
      <ol>
        <li>每项结果必须有来源记录、分子、分母、覆盖率和规则版本。</li>
        <li>学校差异只展示同口径可聚合或明确标注为校内纵向的指标。</li>
        <li>数据不足时生成待核查信号，不生成原因诊断或综合评分。</li>
        <li>生活、医疗等受限数据需独立授权、最小样本隐藏和审计。</li>
      </ol>
    </section>
    <section class="student-growth-data-drawer__section">
      <h3>单页锚点能力范围</h3>
      <ElTable :data="pageCapabilityRows" row-key="label" border size="small">
        <ElTableColumn prop="label" column-key="label" label="左侧锚点" min-width="130" show-overflow-tooltip />
        <ElTableColumn prop="status" column-key="status" label="状态" width="100">
          <template #default="{ row }">
            <ElTag :type="capabilityStatusType(row.status)" size="small" effect="light">
              {{ capabilityStatusLabel(row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="limitation" column-key="limitation" label="能力边界" min-width="230" show-overflow-tooltip />
      </ElTable>
    </section>
  </ElDrawer>
</template>

<style scoped>
.student-growth-portrait { display: grid; min-width: 0; gap: var(--spacing-16); background: var(--color-bg); }
.student-growth-portrait__source-note { margin: 0; }
.student-growth-portrait__workspace { display: grid; min-width: 0; align-items: start; grid-template-columns: 192px minmax(0, 1fr); gap: var(--spacing-16); }
.student-growth-portrait__topics { position: sticky; top: 0; z-index: 2; display: grid; min-width: 0; min-height: calc(100vh - var(--header-height) - var(--content-padding) - var(--content-padding)); max-height: calc(100vh - var(--header-height) - var(--content-padding) - var(--content-padding)); overflow-x: hidden; overflow-y: auto; align-content: start; border-radius: var(--radius-md); background: var(--color-white); }
.student-growth-portrait__topics > a { display: flex; min-width: 0; min-height: 40px; align-items: center; justify-content: space-between; gap: var(--spacing-8); padding: 0 var(--spacing-16); color: var(--color-body); font-size: var(--font-size-sm); line-height: var(--line-height-md); text-decoration: none; }
.student-growth-portrait__topics > a:hover { color: var(--color-primary); background: var(--color-primary-light); }
.student-growth-portrait__topics > a.is-active { color: var(--color-primary-dark-text); background: var(--color-primary-light); font-weight: var(--font-weight-medium); }
.student-growth-portrait__topics > a:focus-visible { outline: 2px solid var(--color-primary-line-light); outline-offset: -2px; }
.student-growth-portrait__content { display: grid; min-width: 0; max-width: 100%; overflow-x: clip; gap: var(--spacing-16); }
.student-growth-portrait__anchor-section { display: grid; min-width: 0; scroll-margin-top: var(--spacing-16); gap: var(--spacing-16); }
.student-growth-data-drawer__descriptions { margin-top: var(--spacing-20); }
.student-growth-data-drawer__section { margin-top: var(--spacing-24); }
.student-growth-data-drawer__section h3 { margin-bottom: var(--spacing-12); font-size: var(--font-size-lg); }
.student-growth-data-drawer__section ol { display: grid; gap: var(--spacing-8); padding-left: var(--spacing-20); color: var(--color-body); }
@media (max-width: 860px) { .student-growth-portrait__workspace { grid-template-columns: 168px minmax(0, 1fr); } }
</style>
