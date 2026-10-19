<template>
  <div v-loading="loading" class="list-panel">
    <PageFilterBar show-reset @search="handleSearch" @reset="handleReset">
      <div class="form-item">
        <span class="form-label">学科：</span>
        <el-select v-model="catalogQuery.subject" placeholder="全部学科" clearable>
          <el-option v-for="item in FEATURED_SUBJECT_OPTIONS" :key="item" :label="item" :value="item" />
        </el-select>
      </div>
      <div class="form-item">
        <span class="form-label">学段：</span>
        <el-select v-model="catalogQuery.stage" placeholder="全部学段" clearable>
          <el-option v-for="item in FEATURED_STAGE_OPTIONS" :key="item" :label="item" :value="item" />
        </el-select>
      </div>
      <div class="form-item">
        <span class="form-label">适用：</span>
        <el-select v-model="catalogQuery.eligibility" placeholder="全部课程" clearable>
          <el-option label="可修" value="eligible" />
          <el-option label="不可修" value="ineligible" />
        </el-select>
      </div>
    </PageFilterBar>
    <div class="table-block">
    <el-table :data="catalog" border>
      <el-table-column prop="title" label="课程名称" min-width="240" show-overflow-tooltip />
      <el-table-column prop="subject" label="学科" width="90" />
      <el-table-column prop="stage" label="学段" width="90" />
      <el-table-column label="学分" width="90">
        <template #default="{ row }: { row: FeaturedCourse }">{{ featuredCreditText(row.credit) }}</template>
      </el-table-column>
      <el-table-column prop="rating" label="评分" width="80" />
      <el-table-column label="学习人数" width="110">
        <template #default="{ row }: { row: FeaturedCourse }">{{ row.learnerCount }}人</template>
      </el-table-column>
      <el-table-column label="适用性" width="100">
        <template #default="{ row }: { row: FeaturedCourse }">
          <StatusTag :color="row.eligible ? 'green' : 'gray'">{{ featuredEligibleLabel(row.eligible) }}</StatusTag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }: { row: FeaturedCourse }">
          <el-button v-if="row.eligible" type="primary" link @click="openCourse(row.id)">查看详情</el-button>
          <el-button v-else disabled link>不可选</el-button>
        </template>
      </el-table-column>
    </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import PageFilterBar from "@/components/PageFilterBar.vue";
import StatusTag from "@/components/StatusTag.vue";
import {
  FEATURED_STAGE_OPTIONS,
  FEATURED_SUBJECT_OPTIONS,
  featuredCreditText,
  featuredEligibleLabel,
  type FeaturedCourse,
} from "@/features/school-layered-training-featured/types";
import { useSchoolFeaturedCourseStore } from "@/stores/school-layered-training-featured";

defineOptions({ name: "SchoolLayeredTrainingFeaturedCatalog" });

const router = useRouter();
const store = useSchoolFeaturedCourseStore();
const { loading, catalogQuery, catalog } = storeToRefs(store);

function openCourse(id: string) {
  void router.push(`/ai-teacher-development/layered-training/featured/${id}`);
}

function handleSearch() {
  void store.searchCatalog();
}

function handleReset() {
  void store.resetCatalog();
}
</script>

<style scoped src="./school-layered-training.css"></style>
