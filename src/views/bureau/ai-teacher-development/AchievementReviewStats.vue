<template>
  <section class="stats-grid" aria-label="成果终审统计">
    <article v-for="card in cards" :key="card.key" class="stat-card">
      <span class="stat-icon" :class="`is-${card.key}`" aria-hidden="true">
        <el-icon :size="20"><component :is="card.icon" /></el-icon>
      </span>
      <div class="stat-copy">
        <p class="stat-label">{{ card.label }}</p>
        <p class="stat-value"><strong>{{ card.display }}</strong></p>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  CircleCheck,
  CircleClose,
  Document,
  DocumentChecked,
  DocumentAdd,
  Eye,
  Timer,
  Star,
} from "@element-plus/icons-vue";
import type { AchievementReviewStats } from "@/features/training-achievement-review/types";

defineOptions({ name: "AchievementReviewStats" });

const props = defineProps<{
  /** 概览统计 */
  stats: AchievementReviewStats;
}>();

const cards = computed(() => [
  { key: "pending", label: "待我终审", display: String(props.stats.pendingCount), icon: Timer },
  {
    key: "approved",
    label: "本月已通过",
    display: String(props.stats.approvedThisMonth),
    icon: CircleCheck,
  },
  {
    key: "rejected",
    label: "本月已驳回",
    display: String(props.stats.rejectedThisMonth),
    icon: CircleClose,
  },
  {
    key: "pass",
    label: "通过率",
    display: `${props.stats.passRatePercent}%`,
    icon: DocumentChecked,
  },
  {
    key: "featured",
    label: "已加精成果",
    display: String(props.stats.featuredCount),
    icon: Star,
  },
  {
    key: "featuredMonth",
    label: "本月新增加精",
    display: String(props.stats.featuredThisMonth),
    icon: DocumentAdd,
  },
  { key: "likes", label: "总点赞数", display: String(props.stats.likeCount), icon: Document },
  { key: "views", label: "总浏览量", display: String(props.stats.viewCount), icon: Eye },
]);
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--spacing-12);
  flex-shrink: 0;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-16);
  min-height: 88px;
  padding: var(--spacing-20) var(--spacing-24);
  background: var(--color-white);
  border-radius: var(--radius-lg);
}

.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.stat-icon.is-pending {
  background: var(--color-warning-light);
  color: var(--color-warning);
}
.stat-icon.is-approved,
.stat-icon.is-featured {
  background: var(--color-success-light);
  color: var(--color-success);
}
.stat-icon.is-rejected {
  background: var(--color-error-light);
  color: var(--color-error);
}
.stat-icon.is-pass,
.stat-icon.is-featuredMonth {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
.stat-icon.is-likes {
  background: color-mix(in srgb, var(--color-chart-violet) 12%, var(--color-white));
  color: var(--color-chart-violet);
}
.stat-icon.is-views {
  background: color-mix(in srgb, var(--color-warning) 12%, var(--color-white));
  color: var(--color-warning);
}

.stat-copy {
  min-width: 0;
}

.stat-label {
  margin: 0;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.stat-value {
  margin: var(--spacing-4) 0 0;
  color: var(--color-title);
  font-size: var(--font-size-xl);
  line-height: 28px;
}

.stat-value strong {
  font-weight: var(--font-weight-semibold);
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
