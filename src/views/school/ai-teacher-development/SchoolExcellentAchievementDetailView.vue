<template>
  <div class="detail-page page-with-breadcrumb">
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: listPath }">优秀成果展示</el-breadcrumb-item>
        <el-breadcrumb-item>成果详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div v-loading="detailLoading" class="detail-layout">
      <template v-if="detail">
        <div class="detail-main">
          <header class="detail-header">
            <div class="header-top">
              <h1 class="detail-title">{{ detail.title }}</h1>
              <el-button class="like-btn" @click="handleLike">
                <svg class="heart-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 21s-6.7-4.35-9.33-7.4C.7 11.3 1.1 7.8 3.8 6.1c2-1.3 4.5-.7 5.9 1.1L12 9.7l2.3-2.5c1.4-1.8 3.9-2.4 5.9-1.1 2.7 1.7 3.1 5.2 1.13 7.5C18.7 16.65 12 21 12 21z"
                  />
                </svg>
                点赞 {{ detail.likeCount }}
              </el-button>
            </div>
            <div class="tag-row">
              <span class="honor-tag">
                <el-icon :size="12"><StarFilled /></el-icon>
                {{ detail.honorLabel }}
              </span>
              <span class="type-tag">{{ TRAINING_ACHIEVEMENT_TYPE_MAP[detail.type].label }}</span>
              <span class="stage-tag">{{ detail.stage }}{{ detail.subject }}</span>
            </div>
            <p class="detail-meta">
              {{ detail.teacherName }} · {{ detail.schoolName }} · {{ detail.publishedAt }} 发布 ·
              <el-icon class="meta-icon" :size="14"><View /></el-icon>
              {{ detail.viewCount.toLocaleString("zh-CN") }} 次浏览
            </p>
          </header>

          <section class="panel-card">
            <h2 class="panel-title">成果摘要</h2>
            <p class="panel-text">{{ detail.abstract }}</p>
          </section>

          <section class="panel-card">
            <h2 class="panel-title">附件材料</h2>
            <ul v-if="detail.attachments.length" class="file-list">
              <li v-for="file in detail.attachments" :key="file.id" class="file-row">
                <el-icon class="file-icon" :size="18"><Document /></el-icon>
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ file.sizeLabel }}</span>
                <span class="action-link" @click="handleDownload(file.name)">下载查看</span>
              </li>
            </ul>
            <p v-else class="panel-text">暂无附件</p>
          </section>

          <section class="panel-card">
            <h2 class="panel-title">作者信息</h2>
            <div class="author-row">
              <div class="avatar" aria-hidden="true">{{ detail.teacherName.slice(0, 1) }}</div>
              <div>
                <p class="author-name">{{ detail.teacherName }}</p>
                <p class="author-sub">
                  {{ detail.schoolName }} · {{ detail.subject }} · {{ detail.stage }}
                </p>
              </div>
            </div>
          </section>
        </div>
      </template>
      <el-empty v-else-if="!detailLoading" description="未找到该成果" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { Document, StarFilled, View } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { TRAINING_ACHIEVEMENT_TYPE_MAP } from "@/features/training-achievement/types";
import { useSchoolExcellentAchievementsStore } from "@/stores/school-excellent-achievements";

defineOptions({ name: "SchoolExcellentAchievementDetailView" });

const listPath = "/ai-teacher-development/teaching-monitoring/excellent-achievements";
const route = useRoute();
const excellentStore = useSchoolExcellentAchievementsStore();
const { detail, detailLoading } = storeToRefs(excellentStore);

function handleDownload(name: string) {
  ElMessage.success(`已准备下载：${name}`);
}

async function handleLike() {
  if (!detail.value) return;
  await excellentStore.toggleLike(detail.value.id);
  ElMessage.success(detail.value.liked ? "已点赞" : "已取消点赞");
}

async function loadDetail() {
  const id = String(route.params.id ?? "");
  if (!id) {
    detail.value = null;
    return;
  }
  try {
    await excellentStore.loadDetail(id);
  } catch {
    detail.value = null;
  }
}

onMounted(() => {
  void loadDetail();
});

watch(
  () => route.params.id,
  () => {
    void loadDetail();
  },
  { flush: "post" },
);
</script>

<style scoped>
.detail-layout {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-16);
  margin: 0 var(--spacing-24) var(--spacing-24);
  overflow: auto;
}

.detail-main {
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
  flex-shrink: 0;
}

.detail-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
  padding: var(--spacing-24);
  background: var(--color-white);
  border-radius: var(--radius-lg);
}

.header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-16);
}

.detail-title {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 32px;
}

.like-btn {
  flex-shrink: 0;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-8);
}

.honor-tag,
.type-tag,
.stage-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  line-height: 20px;
}

.honor-tag {
  background: var(--color-success-light);
  color: var(--color-success);
}

.type-tag {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.stage-tag {
  background: color-mix(in srgb, var(--color-primary-line) 18%, var(--color-white));
  color: var(--color-primary-dark-text);
}

.detail-meta {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
}

.meta-icon {
  vertical-align: -2px;
}

.panel-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
  padding: var(--spacing-24);
  background: var(--color-white);
  border-radius: var(--radius-lg);
}

.panel-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}

.panel-text {
  margin: 0;
  color: var(--color-body);
  font-size: var(--font-size-md);
  line-height: 1.7;
}

.file-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.file-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-12);
  padding: var(--spacing-12) var(--spacing-16);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
}

.file-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.file-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-title);
}

.file-size {
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
  flex-shrink: 0;
}

.action-link {
  color: var(--color-primary);
  cursor: pointer;
  flex-shrink: 0;
}

.action-link:hover {
  color: var(--color-primary-hover);
}

.author-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-12);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--color-chart-violet) 16%, var(--color-white));
  color: var(--color-chart-violet);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

.author-name {
  margin: 0;
  color: var(--color-title);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}

.author-sub {
  margin: 4px 0 0;
  color: var(--color-secondary);
  font-size: var(--font-size-sm);
}

.heart-icon {
  width: 14px;
  height: 14px;
  margin-right: 6px;
  fill: var(--color-error);
  vertical-align: -2px;
}
</style>
