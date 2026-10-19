<template>
  <section class="fd-rate fd-card">
    <div class="fd-rate-layout">
      <img class="fd-rate-art" :src="rateStar" alt="" />
      <div class="fd-rate-main">
        <h2 class="fd-rate-title">学完了？来打个分、写个评价吧</h2>
        <p class="fd-rate-hint">您的评分与文字评价将帮助更多教师选择优质课程，也会影响区域精品课程排行榜</p>
        <div class="fd-rate-stars fd-stars">
          <el-rate v-model="score" />
          <span class="fd-score-text">{{ score }}分</span>
        </div>
        <el-input
          v-model="comment"
          type="textarea"
          :rows="3"
          maxlength="500"
          show-word-limit
          placeholder="撰写您的学习评价，例如：课程内容、案例实用性、讲解方式等（选填，最多500字）"
        />
        <div class="fd-submit">
          <el-button type="primary" @click="submit">提交评分与评价</el-button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import rateStar from "@/assets/school-layered-training/rate-star.png";

defineOptions({ name: "SchoolLayeredTrainingFeaturedRatePanel" });

const score = ref(4);
const comment = ref("");

function submit() {
  if (!score.value) {
    ElMessage.warning("请先打分");
    return;
  }
  ElMessage.success("已提交评分与评价");
}
</script>
