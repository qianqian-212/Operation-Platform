<template>
  <article
    class="excellent-card"
    role="button"
    tabindex="0"
    @click="emit('open')"
    @keyup.enter="emit('open')"
  >
    <div class="cover" :class="`is-${item.coverTheme}`">
      <span v-if="item.featured" class="featured-badge">
        <el-icon :size="12"><StarFilled /></el-icon>
        加精
      </span>
      <el-icon class="cover-icon" :size="40"><component :is="coverIcon" /></el-icon>
    </div>
    <div class="card-body">
      <h2 class="card-title">{{ item.title }}</h2>
      <div class="card-meta">
        <span class="author">
          <el-icon :size="14"><User /></el-icon>
          {{ item.teacherName }} · {{ item.schoolName }}
        </span>
        <span class="likes">
          <svg class="heart-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 21s-6.7-4.35-9.33-7.4C.7 11.3 1.1 7.8 3.8 6.1c2-1.3 4.5-.7 5.9 1.1L12 9.7l2.3-2.5c1.4-1.8 3.9-2.4 5.9-1.1 2.7 1.7 3.1 5.2 1.13 7.5C18.7 16.65 12 21 12 21z"
            />
          </svg>
          {{ item.likeCount }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Collection,
  Document,
  Medal,
  Opportunity,
  Reading,
  School,
  StarFilled,
  Trophy,
  User,
} from "@element-plus/icons-vue";
import {
  EXCELLENT_ACHIEVEMENT_COVER_ICON,
  type ExcellentAchievementCard,
} from "@/features/school-excellent-achievements/types";

defineOptions({ name: "SchoolExcellentAchievementCard" });

const props = defineProps<{
  /** 成果卡片 */
  item: ExcellentAchievementCard;
}>();

const emit = defineEmits<{
  open: [];
}>();

const coverIcon = computed(() => {
  const key = EXCELLENT_ACHIEVEMENT_COVER_ICON[props.item.coverTheme];
  if (key === "trophy") return Trophy;
  if (key === "document") return Document;
  if (key === "school") return School;
  if (key === "medal") return Medal;
  if (key === "reading") return Reading;
  if (key === "opportunity") return Opportunity;
  return Collection;
});
</script>

<style scoped>
.excellent-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: box-shadow 0.2s ease;
}

.excellent-card:hover,
.excellent-card:focus-visible {
  outline: none;
  box-shadow: 0 4px 16px color-mix(in srgb, var(--color-title) 8%, transparent);
}

.cover {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 140px;
  flex-shrink: 0;
}

.cover.is-violet {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-chart-violet) 80%, var(--color-white)),
    var(--color-chart-purple)
  );
}
.cover.is-rose {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-error) 55%, var(--color-white)),
    color-mix(in srgb, var(--color-error) 80%, var(--color-chart-lilac))
  );
}
.cover.is-cyan {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-primary-line) 70%, var(--color-white)),
    var(--color-primary)
  );
}
.cover.is-green {
  background: linear-gradient(
    135deg,
    var(--color-chart-mint),
    color-mix(in srgb, var(--color-chart-green) 85%, var(--color-title))
  );
}
.cover.is-coral {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-warning) 65%, var(--color-white)),
    color-mix(in srgb, var(--color-error) 70%, var(--color-warning))
  );
}
.cover.is-lilac {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--color-chart-lilac) 45%, var(--color-white)),
    var(--color-chart-lilac)
  );
}

.featured-badge {
  position: absolute;
  top: var(--spacing-12);
  right: var(--spacing-12);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--color-warning);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  line-height: 18px;
}

.cover-icon {
  color: var(--color-white);
  filter: drop-shadow(0 2px 6px color-mix(in srgb, var(--color-title) 20%, transparent));
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
  padding: var(--spacing-16);
}

.card-title {
  margin: 0;
  min-height: 44px;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 22px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-8);
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
}

.author,
.likes {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.author {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.likes {
  color: var(--color-error);
  flex-shrink: 0;
}

.heart-icon {
  width: 14px;
  height: 14px;
  fill: currentColor;
  flex-shrink: 0;
}
</style>
