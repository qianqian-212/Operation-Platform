<template>
  <div v-loading="loading" class="archive-page">
    <div class="archive-filters">
      <label class="filter-field">
        <span>学期：</span>
        <el-select v-model="query.semester" placeholder="请选择">
          <el-option v-for="item in ARCHIVE_SEMESTER_OPTIONS" :key="item" :label="item" :value="item" />
        </el-select>
      </label>
      <label class="filter-field">
        <span>教育局：</span>
        <el-select v-model="query.bureau" placeholder="请选择">
          <el-option v-for="item in ARCHIVE_BUREAU_OPTIONS" :key="item" :label="item" :value="item" />
        </el-select>
      </label>
    </div>

    <template v-if="profile">
      <section class="archive-card">
        <header class="archive-profile">
          <span class="archive-avatar">{{ avatarText }}</span>
          <h1 class="archive-name">{{ profile.name }}</h1>
          <p class="archive-meta">{{ profileMeta }}</p>
        </header>
        <div class="archive-stats">
          <article v-for="card in statCards" :key="card.label" class="archive-stat">
            <p class="archive-stat-label">{{ card.label }}</p>
            <p class="archive-stat-value">{{ card.value }}</p>
            <p class="archive-stat-hint">{{ card.hint }}</p>
          </article>
        </div>
      </section>

      <section class="archive-card">
        <h2 class="archive-heading">在学课程</h2>
        <p v-if="progress.length === 0" class="study-empty">当前没有在学课程</p>
        <ul v-else class="study-list">
          <li v-for="item in progress" :key="item.id" class="study-item">
            <span class="study-mark"><FileText aria-hidden="true" /></span>
            <div class="study-main">
              <div class="study-head">
                <p class="study-title">{{ item.title }}</p>
                <button type="button" class="study-continue" @click="continueStudy(item.courseId)">
                  继续学习
                  <ChevronRight aria-hidden="true" />
                </button>
              </div>
              <p class="study-time">最后学习时间：{{ item.lastStudy }}</p>
              <div class="study-meter">
                <el-progress
                  class="study-bar"
                  :percentage="item.progress"
                  :show-text="false"
                  :stroke-width="6"
                />
                <span class="study-percent">{{ item.progress }}%</span>
              </div>
            </div>
          </li>
        </ul>
      </section>

      <div class="archive-columns">
        <section class="archive-card">
          <h2 class="archive-heading">已完成课程</h2>
          <div class="table-block">
            <el-table class="archive-table" :data="pagedCompleted" border>
              <el-table-column prop="title" label="课程名称" min-width="160" show-overflow-tooltip />
              <el-table-column label="学分" width="72">
                <template #default="{ row }: { row: SchoolTrainingArchiveCourse }">{{ row.credit }}</template>
              </el-table-column>
              <el-table-column prop="completedAt" label="完成时间" width="120" />
              <el-table-column label="评分" width="140">
                <template #default="{ row }: { row: SchoolTrainingArchiveCourse }">
                  <el-rate :model-value="row.stars" disabled />
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-if="completed.length > pageSize" class="archive-pager">
            <el-pagination
              v-model:current-page="page"
              v-model:page-size="pageSize"
              :total="completed.length"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              background
            />
          </div>
        </section>

        <section class="archive-card">
          <h2 class="archive-heading">学分认定记录</h2>
          <div class="table-block">
            <el-table :data="credits" border>
              <el-table-column prop="title" label="课程/活动" min-width="140" show-overflow-tooltip />
              <el-table-column prop="kind" label="类型" width="96" />
              <el-table-column label="学分" width="72">
                <template #default="{ row }: { row: SchoolTrainingArchiveCredit }">{{ row.credit }}</template>
              </el-table-column>
              <el-table-column prop="recognizedAt" label="认定时间" width="120" />
              <el-table-column label="认定状态" width="100" align="center">
                <template #default="{ row }: { row: SchoolTrainingArchiveCredit }">
                  <StatusTag color="green">{{ row.status }}</StatusTag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { ChevronRight, FileText } from "@lucide/vue";
import StatusTag from "@/components/StatusTag.vue";
import {
  ARCHIVE_BUREAU_OPTIONS,
  ARCHIVE_SEMESTER_OPTIONS,
  archiveAvatarText,
  archiveProfileStats,
  type SchoolTrainingArchiveCourse,
  type SchoolTrainingArchiveCredit,
} from "@/features/school-layered-training-archive/types";
import { useSchoolTrainingArchiveStore } from "@/stores/school-layered-training-archive";

defineOptions({ name: "SchoolLayeredTrainingArchiveView" });

const featuredPath = "/ai-teacher-development/layered-training/featured";
const router = useRouter();
const store = useSchoolTrainingArchiveStore();
const { loading, query, profile, completed, progress, credits } = storeToRefs(store);
const page = ref(1);
const pageSize = ref(10);
const avatarText = computed(() => archiveAvatarText(profile.value?.name ?? ""));
const profileMeta = computed(() => {
  const current = profile.value;
  if (!current) return "";
  return [current.schoolName, current.subject, current.jobTitle, current.developmentStage].join(" · ");
});
const statCards = computed(() => (profile.value ? archiveProfileStats(profile.value) : []));
const pagedCompleted = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  return completed.value.slice(start, start + pageSize.value);
});

watch([completed, pageSize], () => {
  page.value = 1;
}, { flush: "post" });

function continueStudy(courseId: string) {
  void router.push(`${featuredPath}/${courseId}`);
}

onMounted(() => {
  void store.load();
});
</script>

<style scoped src="./school-layered-training-archive.css"></style>
