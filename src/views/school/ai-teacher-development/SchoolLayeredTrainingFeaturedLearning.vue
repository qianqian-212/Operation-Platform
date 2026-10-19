<template>
  <div v-loading="loading" class="list-panel">
    <div class="table-block">
    <el-table :data="learning" border>
      <el-table-column prop="title" label="课程名称" min-width="240" show-overflow-tooltip />
      <el-table-column prop="subject" label="学科" width="90" />
      <el-table-column label="学分" width="90">
        <template #default="{ row }: { row: FeaturedLearningCourse }">{{ featuredCreditText(row.credit) }}</template>
      </el-table-column>
      <el-table-column label="学习进度" min-width="180">
        <template #default="{ row }: { row: FeaturedLearningCourse }">
          <el-progress :percentage="row.progress" :color="row.barColor" :stroke-width="8" />
        </template>
      </el-table-column>
      <el-table-column prop="lastStudy" label="最后学习" width="110" />
      <el-table-column label="状态" width="110">
        <template #default="{ row }: { row: FeaturedLearningCourse }">
          <StatusTag :color="FEATURED_LEARNING_STATUS_MAP[row.status].tagColor">
            {{ FEATURED_LEARNING_STATUS_MAP[row.status].label }}
          </StatusTag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }: { row: FeaturedLearningCourse }">
          <el-button type="primary" link @click="continueCourse(row.courseId)">继续学习</el-button>
        </template>
      </el-table-column>
    </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import StatusTag from "@/components/StatusTag.vue";
import {
  FEATURED_LEARNING_STATUS_MAP,
  featuredCreditText,
  type FeaturedLearningCourse,
} from "@/features/school-layered-training-featured/types";
import { useSchoolFeaturedCourseStore } from "@/stores/school-layered-training-featured";

defineOptions({ name: "SchoolLayeredTrainingFeaturedLearning" });

const router = useRouter();
const store = useSchoolFeaturedCourseStore();
const { loading, learning } = storeToRefs(store);

function continueCourse(courseId: string) {
  void router.push(`/ai-teacher-development/layered-training/featured/${courseId}`);
}
</script>

<style scoped src="./school-layered-training.css"></style>
