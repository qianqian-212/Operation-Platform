<template>
  <span class="meta-icon" aria-hidden="true" :style="{ '--meta-icon': `url(${iconSrc})` }" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import activityIcon from "@/assets/collective-lesson-prep/activity.png";
import chapterIcon from "@/assets/collective-lesson-prep/chapter.png";
import leadIcon from "@/assets/collective-lesson-prep/lead.png";
import peopleIcon from "@/assets/collective-lesson-prep/people.png";

defineOptions({ name: "CollectiveLessonPrepMetaIcon" });

const props = defineProps<{
  /** 卡片元信息图标 */
  name: "activity" | "chapter" | "lead" | "people";
}>();

const iconSrc = computed(() => {
  if (props.name === "activity") return activityIcon;
  if (props.name === "chapter") return chapterIcon;
  if (props.name === "lead") return leadIcon;
  return peopleIcon;
});
</script>

<style scoped>
.meta-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  background-color: var(--color-secondary);
  -webkit-mask: var(--meta-icon) center / contain no-repeat;
  mask: var(--meta-icon) center / contain no-repeat;
}
</style>
