<template>
  <el-drawer
    v-model="visible"
    :title="detail?.name || '教师学分明细'"
    size="600px"
    destroy-on-close
    class="training-warning-teacher-drawer"
  >
    <template v-if="detail">
      <div class="drawer-body">
        <header class="profile">
          <div class="avatar" aria-hidden="true">{{ detail.name.slice(0, 1) }}</div>
          <div class="profile-copy">
            <h2 class="name">{{ detail.name }}</h2>
            <p class="sub">
              {{ detail.schoolName }} · {{ detail.subject }} · {{ detail.hireYear }}年入职
            </p>
          </div>
        </header>

        <section class="credit-bar" aria-label="学分概览">
          <article class="metric-card">
            <p class="metric-label">当前学分</p>
            <p class="metric-value text-success">{{ detail.currentCredits }}</p>
          </article>
          <article class="metric-card">
            <p class="metric-label">据达标</p>
            <p class="metric-value text-warning">{{ detail.shortfallCredits }}</p>
          </article>
          <article class="metric-card metric-rate">
            <p class="metric-label">完成率</p>
            <div class="rate-row">
              <el-progress
                :percentage="detail.completionPercent"
                :stroke-width="8"
                :show-text="false"
                color="var(--color-warning)"
              />
              <span class="rate-text">{{ detail.completionPercent }}%</span>
            </div>
          </article>
        </section>

        <section class="detail-section">
          <div class="section-head">
            <h3>{{ detail.yearLabel }}年度学分明细</h3>
            <el-button @click="emit('export')">导出明细</el-button>
          </div>

          <ul class="item-list">
            <li v-for="item in detail.items" :key="item.id" class="credit-item">
              <span class="item-icon" aria-hidden="true">
                <el-icon :size="18"><Document /></el-icon>
              </span>
              <div class="item-main">
                <div class="item-title-row">
                  <strong class="item-title">{{ item.title }}</strong>
                  <StatusTag :color="item.statusTone === 'green' ? 'green' : 'orange'">
                    {{ item.statusLabel }}
                  </StatusTag>
                </div>
                <p class="item-meta">
                  {{ item.typeLabel }} · {{ item.levelLabel }} {{ item.at }}
                </p>
              </div>
              <span
                class="credits"
                :class="item.statusTone === 'green' ? 'is-passed' : 'is-pending'"
              >
                +{{ item.credits }}
              </span>
            </li>
          </ul>
        </section>
      </div>
    </template>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="visible = false">关闭</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { Document } from "@element-plus/icons-vue";
import StatusTag from "@/components/StatusTag.vue";
import type { TrainingWarningTeacherDetail } from "@/features/training-warning/types";

defineOptions({ name: "TrainingWarningTeacherDrawer" });

defineProps<{
  /** 教师明细 */
  detail: TrainingWarningTeacherDetail | null;
}>();

const visible = defineModel<boolean>("visible", { required: true });

const emit = defineEmits<{
  export: [];
}>();
</script>

<style scoped>
.drawer-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
}

.profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-12);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-white);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

.profile-copy {
  min-width: 0;
}

.name {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}

.sub {
  margin: var(--spacing-4) 0 0;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
}

.credit-bar {
  display: grid;
  grid-template-columns: 1fr 1fr 1.6fr;
  gap: var(--spacing-12);
}

.metric-card {
  padding: var(--spacing-12) var(--spacing-16);
  background: var(--color-bg);
  border-radius: var(--radius-md);
}

.metric-label {
  margin: 0;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
}

.metric-value {
  margin: var(--spacing-8) 0 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: 28px;
}

.text-success {
  color: var(--color-success);
}

.text-warning {
  color: var(--color-warning);
}

.rate-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  margin-top: var(--spacing-12);
}

.rate-row :deep(.el-progress) {
  flex: 1;
}

.rate-text {
  flex-shrink: 0;
  color: var(--color-title);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
  min-height: 0;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-12);
}

.section-head h3 {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}

.item-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.credit-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-12);
  padding: var(--spacing-12) var(--spacing-16);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-white);
}

.item-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-main {
  flex: 1;
  min-width: 0;
}

.item-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-8);
}

.item-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: var(--line-height-md);
}

.item-meta {
  margin: var(--spacing-4) 0 0;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
}

.credits {
  flex-shrink: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-md);
}

.credits.is-passed {
  color: var(--color-success);
}

.credits.is-pending {
  color: var(--color-secondary);
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
}
</style>

<style>
.training-warning-teacher-drawer.el-drawer .el-drawer__header {
  margin-bottom: 0;
  padding: var(--spacing-16) var(--spacing-24);
  border-bottom: 1px solid var(--color-border);
}

.training-warning-teacher-drawer.el-drawer .el-drawer__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
}

.training-warning-teacher-drawer.el-drawer .el-drawer__body {
  padding: var(--spacing-16) var(--spacing-24);
}

.training-warning-teacher-drawer.el-drawer .el-drawer__footer {
  padding: var(--spacing-12) var(--spacing-24) var(--spacing-16);
  border-top: 1px solid var(--color-border);
}
</style>
