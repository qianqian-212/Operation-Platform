<template>
  <div class="page-wrapper featured-page">
    <div class="page-body featured-body">
      <section class="tabs-card is-joined">
        <el-tabs v-model="tab" class="page-tabs" @tab-change="handleTabChange">
          <el-tab-pane
            v-for="item in FEATURED_COURSE_TABS"
            :key="item.name"
            :label="item.label"
            :name="item.name"
          />
        </el-tabs>
      </section>
      <SchoolLayeredTrainingFeaturedRecommend v-if="tab === 'recommend'" />
      <SchoolLayeredTrainingFeaturedCatalog v-else-if="tab === 'catalog'" />
      <SchoolLayeredTrainingFeaturedLearning v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import type { TabPaneName } from "element-plus";
import { FEATURED_COURSE_TABS, type FeaturedCourseTab } from "@/features/school-layered-training-featured/types";
import { useSchoolFeaturedCourseStore } from "@/stores/school-layered-training-featured";
import SchoolLayeredTrainingFeaturedCatalog from "./SchoolLayeredTrainingFeaturedCatalog.vue";
import SchoolLayeredTrainingFeaturedLearning from "./SchoolLayeredTrainingFeaturedLearning.vue";
import SchoolLayeredTrainingFeaturedRecommend from "./SchoolLayeredTrainingFeaturedRecommend.vue";

defineOptions({ name: "SchoolLayeredTrainingFeaturedView" });

const store = useSchoolFeaturedCourseStore();
const { tab } = storeToRefs(store);

function loadTab(name: FeaturedCourseTab) {
  if (name === "catalog") return store.loadCatalog();
  if (name === "learning") return store.loadLearning();
  return store.loadRecommend();
}

function handleTabChange(name: TabPaneName) {
  if (name === "recommend" || name === "catalog" || name === "learning") void loadTab(name);
}

onMounted(() => {
  void loadTab(tab.value);
});
</script>

<style scoped src="./school-layered-training.css"></style>
