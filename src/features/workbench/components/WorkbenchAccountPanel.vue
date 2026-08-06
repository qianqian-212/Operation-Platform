<template>
  <div class="account-panel">
    <section class="account-header" aria-label="个人资料">
      <div class="account-banner" aria-hidden="true" />
      <div class="account-profile">
        <div class="account-avatar-wrap">
          <span class="account-avatar" aria-hidden="true">{{ data.initials }}</span>
          <span v-if="data.verified" class="account-verified" aria-hidden="true">
            <BadgeCheck :size="18" :stroke-width="2" />
          </span>
          <span v-if="data.verified" class="sr-only">已认证</span>
        </div>
        <div class="account-profile-copy">
          <div class="account-name-row">
            <strong>{{ data.name }}</strong>
            <span class="account-badge">
              <span class="account-badge-dot" aria-hidden="true" />
              {{ data.badgeLabel }}
            </span>
          </div>
          <p class="account-email" :title="data.account">{{ data.account }}</p>
        </div>
      </div>
    </section>

    <section class="account-section" aria-labelledby="account-units-title">
      <div class="account-section-header">
        <h3 id="account-units-title">任职单位</h3>
        <button type="button" class="account-text-action" @click="notifyLinkUnit">
          <Plus :size="16" :stroke-width="2" aria-hidden="true" />
          关联单位
        </button>
      </div>

      <div
        v-if="data.organizations.length"
        ref="carouselElement"
        class="org-carousel"
        tabindex="0"
        aria-roledescription="轮播"
        aria-label="任职单位列表"
        @keydown="handleCarouselKeydown"
      >
        <article
          v-for="organization in data.organizations"
          :key="organization.id"
          class="org-card"
          :class="{ 'is-active': organization.active }"
        >
          <div class="org-card-body">
            <div class="org-card-topline">
              <strong :title="organization.orgName">{{ organization.orgName }}</strong>
              <span class="org-status">{{ organization.meta }}</span>
            </div>
            <p class="org-role">{{ organization.roleName }}</p>
          </div>
        </article>
      </div>
      <el-empty v-else description="暂无任职单位" :image-size="48" />
    </section>

    <section class="account-section account-goals" aria-labelledby="account-goals-title">
      <div class="account-section-header">
        <h3 id="account-goals-title">本周目标</h3>
        <button
          type="button"
          class="account-icon-action"
          aria-label="更多目标操作"
          @click="notifyGoalsMenu"
        >
          <EllipsisVertical :size="18" :stroke-width="2" aria-hidden="true" />
        </button>
      </div>

      <ul v-if="data.goals.length" class="goal-list">
        <li v-for="goal in data.goals" :key="goal.id" :class="`tone-${goal.tone}`">
          <span class="goal-icon" aria-hidden="true">
            <component :is="resolveMenuIcon(goal.icon)" />
          </span>
          <div class="goal-body">
            <div class="goal-topline">
              <span class="goal-title">{{ goal.title }}</span>
              <span class="goal-remaining">{{ goal.remainingLabel }}</span>
            </div>
            <div
              class="goal-track"
              role="progressbar"
              :aria-valuenow="goal.progress"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="`${goal.title}完成进度 ${goal.progress}%`"
            >
              <span class="goal-fill" :style="{ width: `${clampedProgress(goal.progress)}%` }" />
            </div>
          </div>
        </li>
      </ul>
      <el-empty v-else description="暂无本周目标" :image-size="48" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { BadgeCheck, EllipsisVertical, Plus } from "@lucide/vue";
import { ElMessage } from "element-plus";
import { resolveMenuIcon } from "@/components/menu-icons";
import type { WorkbenchAccountPanelData } from "@/features/workbench/types";

const props = defineProps<{ data: WorkbenchAccountPanelData }>();

const carouselElement = ref<HTMLElement | null>(null);

function clampedProgress(value: number) {
  return Math.max(0, Math.min(100, value));
}

function scrollToOrganization(index: number) {
  const root = carouselElement.value;
  const card = root?.children[index] as HTMLElement | undefined;
  if (!root || !card) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  card.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    inline: "start",
    block: "nearest",
  });
}

function handleCarouselKeydown(event: KeyboardEvent) {
  const root = carouselElement.value;
  const lastIndex = props.data.organizations.length - 1;
  if (!root || lastIndex < 0) return;

  const firstCard = root.children[0] as HTMLElement | undefined;
  if (!firstCard) return;
  const styles = getComputedStyle(root);
  const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
  const cardWidth = firstCard.offsetWidth + gap;
  const currentIndex = Math.max(
    0,
    Math.min(lastIndex, Math.round(root.scrollLeft / Math.max(cardWidth, 1))),
  );

  switch (event.key) {
    case "ArrowRight":
      event.preventDefault();
      scrollToOrganization(Math.min(lastIndex, currentIndex + 1));
      break;
    case "ArrowLeft":
      event.preventDefault();
      scrollToOrganization(Math.max(0, currentIndex - 1));
      break;
    case "Home":
      event.preventDefault();
      scrollToOrganization(0);
      break;
    case "End":
      event.preventDefault();
      scrollToOrganization(lastIndex);
      break;
    default:
      break;
  }
}

function notifyLinkUnit() {
  ElMessage.info("关联单位即将开放");
}

function notifyGoalsMenu() {
  ElMessage.info("目标管理即将开放");
}
</script>

<style scoped>
.account-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-24);
  padding-bottom: var(--spacing-20);
}

.account-header {
  display: flex;
  flex-direction: column;
}

.account-banner {
  height: 96px;
  margin: var(--spacing-8);
  background:
    linear-gradient(
      135deg,
      color-mix(in srgb, var(--color-primary-light) 92%, var(--color-white)) 0%,
      color-mix(in srgb, var(--color-primary) 12%, var(--color-bg-page)) 100%
    );
  border-radius: var(--radius-md);
}

.account-profile {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
  padding: 0 var(--spacing-20);
  margin-top: -48px;
}

.account-avatar-wrap {
  position: relative;
  width: 80px;
  height: 80px;
}

.account-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  color: var(--color-primary);
  font-size: 28px;
  font-weight: var(--font-weight-semibold);
  background: var(--color-white);
  border: 3px solid var(--color-white);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-s);
}

.account-verified {
  position: absolute;
  right: 2px;
  bottom: 2px;
  display: inline-flex;
  color: var(--color-primary);
  background: var(--color-white);
  border-radius: var(--radius-full);
}

.account-profile-copy {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  min-width: 0;
}

.account-name-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-8);
}

.account-name-row strong {
  color: var(--color-title);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-lg);
}

.account-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-6);
  min-height: 24px;
  padding: 2px var(--spacing-8);
  color: var(--color-body);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-xs);
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.account-badge-dot {
  width: 6px;
  height: 6px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
}

.account-email {
  margin: 0;
  overflow: hidden;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
  padding: 0 var(--spacing-20);
}

.account-goals {
  padding-top: var(--spacing-8);
  border-top: 1px solid var(--color-border);
}

.account-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-12);
}

.account-section-header h3 {
  margin: 0;
  color: var(--color-title);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-md);
}

.account-text-action,
.account-icon-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  padding: 0;
  color: var(--color-secondary);
  font: inherit;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  background: transparent;
  border: 0;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition-property: color, background-color;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}

.account-text-action {
  min-height: 36px;
  padding-inline: var(--spacing-8);
}

.account-icon-action {
  width: 36px;
  height: 36px;
}

.account-text-action:hover,
.account-icon-action:hover {
  color: var(--color-primary);
  background: var(--color-bg-page);
}

.account-text-action:focus-visible,
.account-icon-action:focus-visible,
.org-carousel:focus-visible {
  outline: 2px solid var(--color-primary-line-light);
  outline-offset: 2px;
}

.org-carousel {
  display: flex;
  gap: var(--spacing-12);
  padding-inline-end: var(--spacing-32);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.org-carousel::-webkit-scrollbar {
  display: none;
}

.org-card {
  position: relative;
  display: flex;
  width: min(232px, 82%);
  min-height: 96px;
  flex: 0 0 auto;
  overflow: hidden;
  background: var(--color-bg-page);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  scroll-snap-align: start;
}

.org-card::before {
  position: absolute;
  top: var(--spacing-12);
  bottom: var(--spacing-12);
  inset-inline-start: 0;
  width: 3px;
  background: transparent;
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
  content: "";
}

.org-card.is-active {
  background: var(--color-primary-light);
  border-color: var(--color-primary-line-light);
}

.org-card.is-active::before {
  background: var(--color-primary);
}

.org-card-body {
  display: grid;
  align-content: center;
  gap: var(--spacing-6);
  min-width: 0;
  padding: var(--spacing-14) var(--spacing-14) var(--spacing-14) var(--spacing-16);
}

.org-card-topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-8);
  min-width: 0;
}

.org-card-topline strong {
  min-width: 0;
  overflow: hidden;
  color: var(--color-title);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-md);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.org-status {
  flex-shrink: 0;
  color: var(--color-secondary);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-xs);
}

.org-card.is-active .org-status {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.org-role {
  margin: 0;
  overflow: hidden;
  color: var(--color-body);
  font-size: var(--font-size-xs);
  line-height: var(--line-height-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goal-list {
  display: grid;
  padding: 0;
  margin: 0;
  gap: var(--spacing-12);
  list-style: none;
}

.goal-list li {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-12);
  padding: var(--spacing-14);
  border-radius: var(--radius-lg);
}

.goal-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: var(--radius-full);
}

.goal-icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.goal-body {
  display: grid;
  min-width: 0;
  flex: 1;
  gap: var(--spacing-8);
}

.goal-topline {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-12);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
}

.goal-title {
  min-width: 0;
  font-weight: var(--font-weight-medium);
}

.goal-remaining {
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.goal-track {
  height: 8px;
  overflow: hidden;
  background: color-mix(in srgb, currentColor 16%, transparent);
  border-radius: var(--radius-full);
}

.goal-fill {
  display: block;
  height: 100%;
  max-width: 100%;
  background: currentColor;
  border-radius: var(--radius-full);
}

.tone-primary {
  color: var(--color-primary-dark-text);
  background: var(--color-primary-light);
}

.tone-primary .goal-icon {
  color: var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 14%, var(--color-white));
}

.tone-success {
  color: var(--color-success-dark-text);
  background: var(--color-success-light);
}

.tone-success .goal-icon {
  color: var(--color-success-dark-text);
  background: color-mix(in srgb, var(--color-success) 16%, var(--color-white));
}

.tone-warning {
  color: var(--color-warning-dark-text);
  background: var(--color-warning-light);
}

.tone-warning .goal-icon {
  color: var(--color-warning-dark-text);
  background: color-mix(in srgb, var(--color-warning) 16%, var(--color-white));
}

.tone-danger {
  color: var(--color-error-dark-text);
  background: var(--color-error-light);
}

.tone-danger .goal-icon {
  color: var(--color-error-dark-text);
  background: color-mix(in srgb, var(--color-error) 14%, var(--color-white));
}

.tone-neutral {
  color: var(--color-body);
  background: var(--color-bg-soft);
}

.tone-neutral .goal-icon {
  color: var(--color-secondary);
  background: var(--color-white);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip: rect(0, 0, 0, 0);
}

@media (prefers-reduced-motion: reduce) {
  .account-text-action,
  .account-icon-action {
    transition: none;
  }

  .org-carousel {
    scroll-behavior: auto;
  }
}
</style>
