<template>
  <el-drawer v-model="visible" size="420px" destroy-on-close :with-header="false">
    <template v-if="detail">
      <header class="drawer-head">
        <div class="avatar" aria-hidden="true">{{ detail.name.slice(0, 1) }}</div>
        <div>
          <h2 class="name">{{ detail.name }}</h2>
          <p class="sub">
            {{ detail.schoolName }} · {{ detail.subject }} · {{ detail.hireYear }}年入职
          </p>
        </div>
        <el-button link class="close-btn" @click="visible = false">关闭</el-button>
      </header>

      <section class="credit-bar">
        <div>
          <p class="metric-label">当前学分</p>
          <p class="metric-value text-success">{{ detail.currentCredits }}</p>
        </div>
        <div>
          <p class="metric-label">据达标</p>
          <p class="metric-value text-warning">{{ detail.shortfallCredits }}</p>
        </div>
        <div class="rate-block">
          <p class="metric-label">完成率</p>
          <el-progress :percentage="detail.completionPercent" :stroke-width="8" />
        </div>
      </section>

      <div class="section-head">
        <h3>{{ detail.yearLabel }}年度学分明细</h3>
        <el-button @click="emit('export')">导出明细</el-button>
      </div>

      <ul class="item-list">
        <li v-for="item in detail.items" :key="item.id" class="credit-item">
          <el-icon :size="20"><Document /></el-icon>
          <div class="item-main">
            <div class="item-title-row">
              <strong>{{ item.title }}</strong>
              <StatusTag :color="item.statusTone === 'green' ? 'green' : 'orange'">
                {{ item.statusLabel }}
              </StatusTag>
            </div>
            <p class="item-meta">
              {{ item.typeLabel }} · {{ item.levelLabel }} {{ item.at }}
            </p>
          </div>
          <span class="credits">+{{ item.credits }}</span>
        </li>
      </ul>
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
.drawer-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-12);
  margin-bottom: var(--spacing-16);
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
  font-weight: var(--font-weight-semibold);
}

.name {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--color-title);
}

.sub {
  margin: var(--spacing-4) 0 0;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.close-btn {
  margin-left: auto;
}

.credit-bar {
  display: grid;
  grid-template-columns: 1fr 1fr 1.4fr;
  gap: var(--spacing-12);
  padding: var(--spacing-16);
  margin-bottom: var(--spacing-16);
  background: var(--color-bg);
  border-radius: var(--radius-md);
}

.metric-label {
  margin: 0;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.metric-value {
  margin: var(--spacing-4) 0 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.text-success { color: var(--color-success); }
.text-warning { color: var(--color-warning); }

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-12);
}

.section-head h3 {
  margin: 0;
  font-size: var(--font-size-md);
  color: var(--color-title);
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
  gap: var(--spacing-8);
  padding: var(--spacing-12);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.item-main {
  flex: 1;
  min-width: 0;
}

.item-title-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
}

.item-meta {
  margin: var(--spacing-4) 0 0;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.credits {
  color: var(--color-success);
  font-weight: var(--font-weight-semibold);
}
</style>
