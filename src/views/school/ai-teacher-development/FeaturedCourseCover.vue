<template>
  <img class="cover-art" :src="source" alt="" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import backboneCover from "@/assets/featured-covers/backbone.png";
import expertCover from "@/assets/featured-covers/expert.png";
import peerCover from "@/assets/featured-covers/peer.png";
import regionalCover from "@/assets/featured-covers/regional.png";
import type { FeaturedCourse } from "@/features/school-layered-training-featured/types";

defineOptions({ name: "FeaturedCourseCover" });

const props = defineProps<{
  /** 推荐封面色调，空值使用区域精品插画 */
  tone: FeaturedCourse["recommendTone"];
}>();

const covers = {
  primary: backboneCover,
  success: peerCover,
  warning: expertCover,
  violet: regionalCover,
  "": regionalCover,
};

const source = computed(() => covers[props.tone]);
</script>

<style scoped>
.cover-art {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
