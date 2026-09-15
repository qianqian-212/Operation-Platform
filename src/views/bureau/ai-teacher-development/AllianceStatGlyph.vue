<template>
  <img class="stat-glyph" :src="src" alt="" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import bookOpenIcon from "@/assets/teaching-research-alliance/book-open.png";
import peoplesIcon from "@/assets/teaching-research-alliance/peoples.png";
import schoolIcon from "@/assets/teaching-research-alliance/school.png";
import topicDiscussionIcon from "@/assets/teaching-research-alliance/topic-discussion.png";

defineOptions({ name: "AllianceStatGlyph" });

const props = defineProps<{
  /** 统计卡图标 */
  name: "alliances" | "schools" | "activities" | "teachers";
}>();

const icons = {
  alliances: bookOpenIcon,
  schools: schoolIcon,
  activities: topicDiscussionIcon,
  teachers: peoplesIcon,
};

const src = computed(() => icons[props.name]);
</script>

<style scoped>
.stat-glyph {
  width: 20px;
  height: 20px;
  display: block;
}
</style>
