<template>
  <div class="detail-page page-with-breadcrumb">
    <div class="breadcrumb-bar">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: listPath }">跨校团队</el-breadcrumb-item>
        <el-breadcrumb-item>团队详情</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div v-loading="loading" class="detail-body">
      <template v-if="detail">
        <section class="summary-card">
          <div class="title-row">
            <h1 class="summary-title">{{ detail.name }}</h1>
            <StatusTag :color="TEAM_STATUS_MAP[detail.status].tagColor">
              {{ TEAM_STATUS_MAP[detail.status].label }}
            </StatusTag>
          </div>
          <p class="meta-line">
            <span>{{ detail.allianceName }}</span>
            <span>学科：{{ detail.subject }}</span>
            <span>
              负责人：{{ detail.leadTeacherName }}（{{ detail.leadSchoolName }}）
            </span>
          </p>
          <p class="description">{{ detail.description }}</p>
        </section>

        <section class="panel-card">
          <div class="panel-header">
            <h2 class="panel-title">团队成员</h2>
            <el-button type="primary" :icon="Plus">加入教师</el-button>
          </div>
          <el-table :data="detail.members" stripe border>
            <el-table-column label="序号" width="72" align="center">
              <template #default="{ $index }">{{ $index + 1 }}</template>
            </el-table-column>
            <el-table-column prop="name" label="姓名" width="100" show-overflow-tooltip />
            <el-table-column prop="schoolName" label="学校" min-width="120" show-overflow-tooltip />
            <el-table-column prop="subject" label="学科" width="90" show-overflow-tooltip />
            <el-table-column prop="title" label="职称" width="110" show-overflow-tooltip />
            <el-table-column label="角色" width="100" align="center">
              <template #default="{ row }: { row: CrossSchoolTeamMember }">
                <StatusTag :color="TEAM_MEMBER_ROLE_MAP[row.role].tagColor">
                  {{ TEAM_MEMBER_ROLE_MAP[row.role].label }}
                </StatusTag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="88" fixed="right">
              <template #default="{ row }: { row: CrossSchoolTeamMember }">
                <button
                  v-if="row.role !== 'lead'"
                  type="button"
                  class="action-danger"
                  @click="handleRemove(row)"
                >
                  移除
                </button>
                <span v-else class="action-placeholder">—</span>
              </template>
            </el-table-column>
          </el-table>
        </section>

        <section class="panel-card">
          <div class="panel-header">
            <h2 class="panel-title">团队活动</h2>
          </div>
          <el-table :data="detail.activities" stripe border>
            <el-table-column label="序号" width="72" align="center">
              <template #default="{ $index }">{{ $index + 1 }}</template>
            </el-table-column>
            <el-table-column label="活动名称" min-width="260" show-overflow-tooltip>
              <template #default="{ row }: { row: CrossSchoolTeamActivity }">
                <button type="button" class="action-link" @click="handleViewActivity(row)">
                  {{ row.name }}
                </button>
              </template>
            </el-table-column>
            <el-table-column label="类型" width="110">
              <template #default="{ row }: { row: CrossSchoolTeamActivity }">
                <StatusTag color="blue">{{ row.typeLabel }}</StatusTag>
              </template>
            </el-table-column>
            <el-table-column prop="scheduledAt" label="时间" width="160" show-overflow-tooltip />
            <el-table-column
              prop="leadSchoolName"
              label="牵头学校"
              width="120"
              show-overflow-tooltip
            />
            <el-table-column label="状态" width="100">
              <template #default="{ row }: { row: CrossSchoolTeamActivity }">
                <StatusTag :color="TEAM_ACTIVITY_STATUS_MAP[row.status].tagColor">
                  {{ TEAM_ACTIVITY_STATUS_MAP[row.status].label }}
                </StatusTag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="88" fixed="right">
              <template #default="{ row }: { row: CrossSchoolTeamActivity }">
                <button type="button" class="action-link" @click="handleViewActivity(row)">
                  查看
                </button>
              </template>
            </el-table-column>
          </el-table>
        </section>

        <section class="panel-card">
          <div class="panel-header">
            <h2 class="panel-title">团队成果</h2>
          </div>
          <div class="achievement-grid">
            <article
              v-for="item in detail.achievements"
              :key="item.id"
              class="achievement-card"
            >
              <el-icon class="achievement-icon" :size="28" aria-hidden="true">
                <Document />
              </el-icon>
              <div class="achievement-copy">
                <h3 class="achievement-title">{{ item.title }}</h3>
                <p class="achievement-meta">
                  <span>{{ item.publishedAt }}</span>
                  <span>共享 {{ item.shareCount }} 次</span>
                </p>
              </div>
            </article>
          </div>
        </section>
      </template>
      <el-empty v-else-if="!loading" description="未找到该团队" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Document, Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import StatusTag from "@/components/StatusTag.vue";
import {
  TEAM_ACTIVITY_STATUS_MAP,
  TEAM_MEMBER_ROLE_MAP,
  TEAM_STATUS_MAP,
  type CrossSchoolTeamActivity,
  type CrossSchoolTeamDetail,
  type CrossSchoolTeamMember,
} from "@/features/cross-school-team/types";
import { useCrossSchoolTeamStore } from "@/stores/cross-school-team";

defineOptions({ name: "CrossSchoolTeamDetailView" });

const listPath = "/ai-teacher-development/cross-school-research/teams";
const activityBasePath = "/ai-teacher-development/cross-school-research/activities";
const route = useRoute();
const router = useRouter();
const teamStore = useCrossSchoolTeamStore();
const loading = ref(false);
const detail = ref<CrossSchoolTeamDetail | null>(null);

function handleViewActivity(activity: CrossSchoolTeamActivity) {
  void router.push(`${activityBasePath}/${activity.id}`);
}

function handleRemove(member: CrossSchoolTeamMember) {
  ElMessage.info(`移除「${member.name}」即将开放`);
}

async function loadDetail() {
  const id = String(route.params.id ?? "");
  if (!id) {
    detail.value = null;
    return;
  }
  loading.value = true;
  try {
    detail.value = (await teamStore.loadDetail(id)) ?? null;
  } finally {
    loading.value = false;
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
.detail-body {
  flex: 1;
  overflow: auto;
  margin: 0 var(--spacing-24) var(--spacing-24);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
}

.summary-card,
.panel-card {
  background: var(--color-white);
  border-radius: var(--radius-sm);
  padding: var(--spacing-24);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-12);
  min-width: 0;
}

.summary-card {
  border-radius: var(--radius-lg);
}

.title-row,
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-12);
  flex-wrap: wrap;
}

.summary-title,
.panel-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}

.meta-line,
.description,
.achievement-meta {
  margin: 0;
  color: var(--color-body);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-md);
}

.meta-line,
.achievement-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-16);
}

.action-link,
.action-danger {
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: var(--font-size-md);
  cursor: pointer;
  white-space: nowrap;
}

.action-link {
  color: var(--color-primary);
}

.action-link:hover {
  color: var(--color-primary-hover);
}

.action-danger {
  color: var(--color-error);
}

.action-danger:hover {
  color: var(--color-error-dark-text);
}

.action-placeholder {
  color: var(--color-secondary);
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-16);
}

.achievement-card {
  display: flex;
  gap: var(--spacing-12);
  padding: var(--spacing-16);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-subtle);
}

.achievement-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.achievement-copy {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  min-width: 0;
}

.achievement-title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-title);
  line-height: var(--line-height-md);
}

@media (max-width: 1100px) {
  .achievement-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .achievement-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
