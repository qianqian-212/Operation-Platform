<template>
  <section>
    <div class="panel-header">
      <h2 class="panel-title">归档管理</h2>
    </div>
    <ul v-if="detail.archives.length" class="archive-list">
      <li v-for="item in detail.archives" :key="item.id" class="archive-item">
        <h3 class="archive-title">{{ item.title }}</h3>
        <p class="meta-line">
          <span>{{ ARCHIVE_KIND_MAP[item.kind] }}</span>
          <span>{{ item.authorName }}</span>
          <span>{{ item.createdAt }}</span>
        </p>
      </li>
    </ul>
    <el-empty v-else description="暂无活动反思或成果沉淀" />
  </section>
</template>

<script setup lang="ts">
import {
  ARCHIVE_KIND_MAP,
  type CrossSchoolActivityDetail,
} from "@/features/cross-school-activity/types";

defineOptions({ name: "ActivityDetailArchive" });

defineProps<{
  /** 活动详情 */
  detail: CrossSchoolActivityDetail;
}>();
</script>

<style scoped src="./activity-detail-view.css"></style>
