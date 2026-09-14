<template>
  <article
    ref="cardElement"
    class="workbench-widget"
    :class="[
      `tone-${definition?.tone ?? 'neutral'}`,
      {
        'is-editing': editable,
        'is-simple': layoutMode === 'simple',
        'is-simple-flow': simpleLayoutType === 'flow',
        'is-user-overview': definition?.kind === 'user-overview',
        'is-account-panel': definition?.kind === 'account-panel',
        'is-agent': definition?.kind === 'agent',
        'is-stats': definition?.kind === 'stats',
        'is-alliance-overview': definition?.kind === 'alliance-overview',
        'is-quick-links': definition?.kind === 'quick-links',
        'is-intrinsic-height': definition?.heightPolicy.mode === 'intrinsic',
      },
    ]"
  >
    <header v-if="showsBuiltinHeader" class="widget-header">
      <h2>{{ definition?.title ?? "工作台组件" }}</h2>
      <button
        v-if="headerActionLabel"
        type="button"
        class="widget-header-action"
        @click="handleHeaderAction"
      >
        <span>{{ headerActionLabel }}</span>
        <el-icon aria-hidden="true"><ArrowRight /></el-icon>
      </button>
    </header>

    <div v-if="editable" class="widget-edit-chrome">
      <div
        class="widget-edit-btn widget-drag-handle"
        role="button"
        tabindex="0"
        draggable="true"
        aria-label="拖动组件"
        @dragstart="handleDragStart"
        @dragend="handleDragEnd"
      >
        <el-icon><Rank /></el-icon>
      </div>
      <button
        v-if="hasSettings"
        type="button"
        class="widget-edit-btn"
        aria-label="组件设置"
        @click="emit('openSettings')"
      >
        <el-icon><Setting /></el-icon>
      </button>
      <el-dropdown trigger="click" @command="handleCommand">
        <button type="button" class="widget-edit-btn" aria-label="组件操作">
          <el-icon><MoreFilled /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu v-if="layoutMode === 'simple' && simpleLayoutType === 'columns'">
            <el-dropdown-item command="move-backward">向前移动</el-dropdown-item>
            <el-dropdown-item command="move-forward">向后移动</el-dropdown-item>
            <el-dropdown-item divided command="move-primary">移到主列</el-dropdown-item>
            <el-dropdown-item command="move-secondary">移到辅列</el-dropdown-item>
            <el-dropdown-item divided command="hide">隐藏组件</el-dropdown-item>
          </el-dropdown-menu>
          <el-dropdown-menu v-else-if="layoutMode === 'simple'">
            <el-dropdown-item command="move-backward">向前移动</el-dropdown-item>
            <el-dropdown-item command="move-forward">向后移动</el-dropdown-item>
            <el-dropdown-item divided command="span-3">半行 · 双列</el-dropdown-item>
            <el-dropdown-item command="span-6">整行 · 单列</el-dropdown-item>
            <el-dropdown-item divided command="hide">隐藏组件</el-dropdown-item>
          </el-dropdown-menu>
          <el-dropdown-menu v-else>
            <el-dropdown-item command="move-left">向左移动</el-dropdown-item>
            <el-dropdown-item command="move-right">向右移动</el-dropdown-item>
            <el-dropdown-item command="move-up">向上移动</el-dropdown-item>
            <el-dropdown-item command="move-down">向下移动</el-dropdown-item>
            <el-dropdown-item divided command="size-small">窄宽度</el-dropdown-item>
            <el-dropdown-item command="size-medium">标准宽度</el-dropdown-item>
            <el-dropdown-item command="size-large">宽宽度</el-dropdown-item>
            <el-dropdown-item
              divided
              command="row-span-1"
              :disabled="classicRowSpan === 1"
            >
              占 1 行
            </el-dropdown-item>
            <el-dropdown-item command="row-span-2" :disabled="classicRowSpan === 2">
              跨 2 行
            </el-dropdown-item>
            <el-dropdown-item command="row-span-3" :disabled="classicRowSpan === 3">
              跨 3 行
            </el-dropdown-item>
            <el-dropdown-item command="row-span-4" :disabled="classicRowSpan === 4">
              跨 4 行
            </el-dropdown-item>
            <el-dropdown-item divided command="hide">隐藏组件</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="widget-body">
      <el-skeleton v-if="loading" :rows="3" animated />
      <div v-else-if="errorMessage" class="widget-error">
        <span>{{ errorMessage }}</span>
        <el-button link type="primary" @click="retryLoadData">重新加载</el-button>
      </div>
      <div v-else-if="data" ref="contentMeasureElement" class="widget-content-measure">
        <WorkbenchWidgetContent
          :data="data"
          :calendar-context="calendarContext"
        />
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { ArrowRight, MoreFilled, Rank, Setting } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import WorkbenchWidgetContent from "@/features/workbench/components/WorkbenchWidgetContent.vue";
import { attachWorkbenchDragPreview, releaseWorkbenchDragPreview } from "@/features/workbench/workbench-drag-preview";
import {
  workbenchHeaderActionLabel,
  workbenchHeaderActionNotice,
} from "@/features/workbench/workbench-header-action";
import type {
  SimpleWorkbenchLayoutType,
  WorkbenchLayoutMode,
  WorkbenchWidgetAction,
  WorkbenchWidgetData,
  WorkbenchWidgetItem,
} from "@/features/workbench/types";
import { useWorkbenchStore } from "@/stores/workbench";

const props = defineProps<{
  item: WorkbenchWidgetItem;
  editable: boolean;
  layoutMode?: WorkbenchLayoutMode;
  simpleLayoutType?: SimpleWorkbenchLayoutType;
}>();

const emit = defineEmits<{
  action: [action: WorkbenchWidgetAction];
  openSettings: [];
  heightChange: [height: number];
  dragStart: [event: DragEvent];
  dragEnd: [];
}>();

const workbenchStore = useWorkbenchStore();
const loading = ref(true);
const cardElement = ref<HTMLElement | null>(null);
const contentMeasureElement = ref<HTMLElement | null>(null);
const errorMessage = ref("");
const data = ref<WorkbenchWidgetData | null>(null);
const definition = computed(() => workbenchStore.definitionFor(props.item.widgetKey));
const calendarContext = computed(() => workbenchStore.context ? {
  tenant: { ...workbenchStore.context.tenant },
  userId: workbenchStore.context.userId,
  profile: workbenchStore.context.profile,
} : undefined);
const hasSettings = computed(
  () => props.item.settings.kind !== "none" && definition.value?.kind !== "quick-links",
);
const showsBuiltinHeader = computed(() => {
  const kind = definition.value?.kind;
  return kind !== "user-overview"
    && kind !== "account-panel"
    && kind !== "agent"
    && kind !== "stats"
    && kind !== "alliance-overview";
});
const headerActionLabel = computed(() => workbenchHeaderActionLabel(data.value));
const classicRowSpan = computed(() => "h" in props.item ? props.item.h : 1);
let loadRequestId = 0;
let contentResizeObserver: ResizeObserver | null = null;
let contentMutationObserver: MutationObserver | null = null;
let measurementFrame = 0;

function reportPreferredHeight() {
  cancelAnimationFrame(measurementFrame);
  measurementFrame = requestAnimationFrame(() => {
    const card = cardElement.value;
    const content = contentMeasureElement.value;
    if (!card || !content) return;
    const body = content.closest<HTMLElement>(".widget-body");
    if (!body) return;
    const bodyStyle = getComputedStyle(body);
    const verticalPadding = Number.parseFloat(bodyStyle.paddingTop) +
      Number.parseFloat(bodyStyle.paddingBottom);
    const headerHeight = card.querySelector<HTMLElement>(".widget-header")?.offsetHeight ?? 0;
    const contentHeight = Math.max(content.scrollHeight, content.getBoundingClientRect().height);
    emit("heightChange", Math.ceil(headerHeight + verticalPadding + contentHeight + 2));
  });
}

function observeMeasuredContent(element: HTMLElement | null) {
  contentResizeObserver?.disconnect();
  contentMutationObserver?.disconnect();
  contentResizeObserver = null;
  contentMutationObserver = null;
  if (!element) return;
  contentResizeObserver = new ResizeObserver(reportPreferredHeight);
  contentResizeObserver.observe(element);
  contentMutationObserver = new MutationObserver(reportPreferredHeight);
  contentMutationObserver.observe(element, { childList: true, subtree: true, characterData: true });
  reportPreferredHeight();
}

async function loadData(force = false) {
  const requestId = ++loadRequestId;
  loading.value = true;
  errorMessage.value = "";
  try {
    const nextData = await workbenchStore.loadWidgetData(props.item, { force });
    if (requestId !== loadRequestId) return;
    data.value = nextData;
  } catch (error) {
    if (requestId !== loadRequestId) return;
    errorMessage.value = error instanceof Error ? error.message : "组件数据加载失败";
  } finally {
    if (requestId === loadRequestId) loading.value = false;
  }
}

function retryLoadData() {
  void loadData(true);
}

function handleCommand(command: WorkbenchWidgetAction) {
  emit("action", command);
}

function handleHeaderAction() {
  const kind = definition.value?.kind;
  if (!kind) return;
  ElMessage.info(workbenchHeaderActionNotice(kind));
}

function handleDragStart(event: DragEvent) {
  attachWorkbenchDragPreview(event, {
    title: definition.value?.title ?? "工作台组件",
    subtitle: definition.value?.description ?? "",
  });
  emit("dragStart", event);
}

function handleDragEnd() {
  releaseWorkbenchDragPreview();
  emit("dragEnd");
}

watch(
  () => [
    props.item.widgetKey,
    JSON.stringify(props.item.settings),
    workbenchStore.context?.tenant.id,
    JSON.stringify(workbenchStore.dataIdentity),
    JSON.stringify(workbenchStore.quickLinks),
  ],
  () => void loadData(),
  { immediate: true },
);

watch(contentMeasureElement, observeMeasuredContent, { flush: "post" });
watch(data, () => void nextTick(reportPreferredHeight), { flush: "post" });

onBeforeUnmount(() => {
  releaseWorkbenchDragPreview();
  contentResizeObserver?.disconnect();
  contentMutationObserver?.disconnect();
  cancelAnimationFrame(measurementFrame);
});
</script>

<style scoped>
.workbench-widget {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--color-white);
  border: 0;
  border-radius: var(--workbench-widget-radius);
  transition: background-color 160ms ease;
}

.workbench-widget.is-intrinsic-height {
  height: auto;
}

@media (prefers-reduced-motion: reduce) {
  .workbench-widget,
  .widget-edit-btn {
    transition: none;
  }
}

.workbench-widget.is-editing {
  background: color-mix(in srgb, var(--color-primary-light) 18%, var(--color-white));
}

.workbench-widget.is-simple {
  height: auto;
}

.workbench-widget.is-simple-flow {
  height: 100%;
}

.workbench-widget.is-user-overview .widget-body {
  padding: 0;
}

.workbench-widget.is-account-panel .widget-body {
  padding: 0;
  overflow: auto;
}

.workbench-widget.is-agent {
  background: transparent;
}

.workbench-widget.is-agent.is-editing {
  background: transparent;
}

.workbench-widget.is-agent .widget-body {
  padding: 0;
  overflow: visible;
}

.workbench-widget.is-simple .widget-body {
  overflow: visible;
}

.workbench-widget.is-simple.is-quick-links .widget-body {
  min-height: 280px;
  max-height: 420px;
  flex: 1 1 auto;
  overflow: auto;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-12);
  padding: var(--spacing-16) var(--spacing-20) 0;
}

.workbench-widget.is-editing .widget-header {
  padding-right: 7.5rem;
}

.widget-header h2 {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--color-title);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-lg);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.widget-header-action {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: var(--spacing-2);
  padding: 0;
  color: var(--color-secondary);
  font: inherit;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
  appearance: none;
  background: transparent;
  border: 0;
  outline: none;
  cursor: pointer;
  transition: color 160ms ease;
}

.widget-header-action:hover,
.widget-header-action:active {
  color: var(--color-primary);
}

.widget-header-action:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.widget-header-action :deep(.el-icon) {
  width: 14px;
  height: 14px;
  font-size: 14px;
}

@media (prefers-reduced-motion: reduce) {
  .widget-header-action {
    transition: none;
  }
}

.widget-edit-chrome {
  position: absolute;
  z-index: 4;
  top: var(--spacing-8);
  right: var(--spacing-8);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  pointer-events: none;
}

.widget-edit-chrome > *,
.widget-edit-chrome :deep(.el-dropdown),
.widget-edit-chrome :deep(.el-tooltip__trigger) {
  display: inline-flex;
  pointer-events: auto;
  line-height: 0;
}

.widget-edit-btn {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  color: var(--color-body);
  appearance: none;
  background: var(--color-bg-muted);
  border: 0;
  border-radius: var(--radius-full);
  outline: none;
  cursor: pointer;
  transition: background-color 160ms ease, color 160ms ease;
}

.widget-edit-btn:hover,
.widget-edit-btn:active {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.widget-edit-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.widget-edit-btn :deep(.el-icon) {
  width: 16px;
  height: 16px;
  font-size: 16px;
}

.widget-drag-handle {
  cursor: grab;
}

.widget-drag-handle:active {
  cursor: grabbing;
}

.widget-body {
  container-type: inline-size;
  flex: 1;
  min-height: 0;
  padding: var(--spacing-12) var(--spacing-20) var(--spacing-20);
  overflow: auto;
}

.widget-content-measure {
  min-height: 0;
}

.workbench-widget:not(.is-intrinsic-height) .widget-content-measure {
  min-height: 100%;
}

.widget-error {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100%;
  gap: var(--spacing-8);
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}
</style>
