<template>
  <section class="panel-card">
    <h2 class="panel-title">审核记录</h2>
    <ol class="audit-timeline">
      <li
        v-for="record in records"
        :key="record.id"
        class="timeline-item"
        :data-tone="record.tone"
      >
        <div class="timeline-dot" />
        <div class="timeline-content">
          <div class="timeline-head">
            <span class="timeline-title">{{ record.title }}</span>
            <span class="timeline-time">{{ record.occurredAt }}</span>
          </div>
          <p class="timeline-actor">{{ record.actorLabel }}</p>
          <div v-if="record.comment" class="timeline-comment">{{ record.comment }}</div>
        </div>
      </li>
    </ol>
    <el-empty v-if="!records.length" description="暂无审核记录" :image-size="72" />
  </section>
</template>

<script setup lang="ts">
import type { TrainingAchievementAuditRecord } from "@/features/training-achievement/types";

defineOptions({ name: "AchievementAuditPanel" });

defineProps<{
  /** 审核时间线 */
  records: TrainingAchievementAuditRecord[];
}>();
</script>

<style scoped>
.panel-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}

.audit-timeline {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 16px 1fr;
  gap: var(--spacing-12);
  padding-bottom: var(--spacing-20);
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-item:not(:last-child)::before {
  content: "";
  position: absolute;
  left: 7px;
  top: 16px;
  bottom: 0;
  width: 2px;
  background: var(--color-border);
}

.timeline-dot {
  width: 12px;
  height: 12px;
  margin-top: 4px;
  border-radius: 50%;
  background: var(--color-primary);
  justify-self: center;
}

.timeline-item[data-tone="success"] .timeline-dot {
  background: var(--color-success);
}

.timeline-item[data-tone="danger"] .timeline-dot {
  background: var(--color-error);
}

.timeline-item[data-tone="neutral"] .timeline-dot {
  background: var(--color-secondary);
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  min-width: 0;
}

.timeline-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-8);
}

.timeline-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
}

.timeline-time,
.timeline-actor {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-secondary);
  line-height: var(--line-height-md);
}

.timeline-comment {
  margin-top: var(--spacing-4);
  padding: var(--spacing-12);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  color: var(--color-body);
  font-size: var(--font-size-md);
  line-height: 1.6;
}
</style>

<style scoped src="./achievement-detail-view.css"></style>
