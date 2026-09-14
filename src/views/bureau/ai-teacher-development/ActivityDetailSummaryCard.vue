<template>
  <section class="summary-card">
    <div class="title-row">
      <h1 class="summary-title">{{ detail.name }}</h1>
      <StatusTag :color="ACTIVITY_STATUS_MAP[detail.status].tagColor">
        {{ ACTIVITY_STATUS_MAP[detail.status].label }}
      </StatusTag>
    </div>
    <p class="summary-desc">{{ detail.description || "暂无活动说明" }}</p>
    <div class="field-grid">
      <div class="field-item">
        <span class="field-label">活动类型</span>
        <span class="field-value">{{ ACTIVITY_TYPE_MAP[detail.type].label }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">活动时间</span>
        <span class="field-value">{{ detail.scheduledAt }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">活动地点</span>
        <span class="field-value">{{ detail.location || "待补充" }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">牵头学校</span>
        <span class="field-value">{{ detail.leadSchoolName }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">发起人</span>
        <span class="field-value">{{ detail.initiatorName }}</span>
      </div>
      <div class="field-item">
        <span class="field-label">所属联盟</span>
        <span class="field-value">{{ detail.allianceName }}</span>
      </div>
    </div>
    <div class="teacher-block">
      <span class="field-label">参与教师（跨校）</span>
      <div v-if="detail.participants.length" class="teacher-row">
        <ul ref="tagsRef" class="teacher-tags" :class="{ 'is-expanded': expanded }">
          <li v-for="teacher in detail.participants" :key="teacher.id" class="teacher-tag">
            {{ teacher.name }}（{{ teacher.schoolName }}）
          </li>
        </ul>
        <button
          v-if="canToggle"
          type="button"
          class="expand-btn"
          @click="expanded = !expanded"
        >
          {{ expanded ? "收起" : "展开" }}
          <el-icon><ArrowUp v-if="expanded" /><ArrowDown v-else /></el-icon>
        </button>
      </div>
      <p v-else class="field-value">暂无参与教师</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import StatusTag from "@/components/StatusTag.vue";
import {
  ACTIVITY_STATUS_MAP,
  ACTIVITY_TYPE_MAP,
  type CrossSchoolActivityDetail,
} from "@/features/cross-school-activity/types";

defineOptions({ name: "ActivityDetailSummaryCard" });

const props = defineProps<{
  /** 活动详情 */
  detail: CrossSchoolActivityDetail;
}>();

const tagsRef = ref<HTMLElement | null>(null);
const expanded = ref(false);
const overflowing = ref(false);
const canToggle = ref(false);

function measureOverflow() {
  const el = tagsRef.value;
  if (!el || expanded.value) {
    canToggle.value = overflowing.value || expanded.value;
    return;
  }
  overflowing.value = el.scrollHeight > el.clientHeight + 1;
  canToggle.value = overflowing.value;
}

onMounted(() => {
  void nextTick(measureOverflow);
  window.addEventListener("resize", measureOverflow);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", measureOverflow);
});

watch(
  () => props.detail.participants,
  () => {
    expanded.value = false;
    void nextTick(measureOverflow);
  },
  { flush: "post" },
);
</script>

<style scoped src="./activity-detail-view.css"></style>
