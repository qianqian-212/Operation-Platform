<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { runtimeStudentGrowthArchiveRepository } from "@/features/student-growth-archive/runtime-student-growth-archive-repository";

const route = useRoute();
const router = useRouter();
const studentName = ref("");

const studentId = computed(() => {
  const value = route.params.studentId;
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] ?? "" : "";
});

onMounted(async () => {
  if (!studentId.value) return;
  const student = await runtimeStudentGrowthArchiveRepository.getStudent(studentId.value);
  studentName.value = student?.name ?? "";
});

function handleBack() {
  void router.push("/bureau/education-governance/student-growth-archive");
}
</script>

<template>
  <div class="detail-page">
    <div class="breadcrumb-bar">
      <ElBreadcrumb separator="/">
        <ElBreadcrumbItem :to="{ path: '/bureau/education-governance/student-growth-archive' }">
          学生成长档案
        </ElBreadcrumbItem>
        <ElBreadcrumbItem>学生个人档案</ElBreadcrumbItem>
      </ElBreadcrumb>
    </div>

    <div class="detail-card">
      <ElEmpty :image-size="96">
        <template #description>
          <div class="empty-copy">
            <strong>学生个人档案开发中</strong>
            <p>
              {{ studentName ? `${studentName}（${studentId}）` : studentId || "当前学生" }}
              的个人成长档案详情将在后续迭代接入。
            </p>
          </div>
        </template>
        <ElButton type="primary" @click="handleBack">返回学生列表</ElButton>
      </ElEmpty>
    </div>
  </div>
</template>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  min-height: 0;
  gap: var(--spacing-16);
}

.breadcrumb-bar {
  flex-shrink: 0;
  padding: var(--spacing-12) var(--spacing-16);
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border);
}

.detail-card {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-white);
  border-radius: var(--radius-md);
  padding: var(--spacing-24);
}

.empty-copy {
  display: grid;
  gap: var(--spacing-8);
  max-width: 420px;
  margin-bottom: var(--spacing-16);
  text-align: center;
}

.empty-copy strong {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}

.empty-copy p {
  margin: 0;
  font-size: var(--font-size-md);
  color: var(--color-body);
  line-height: var(--line-height-md);
}
</style>
