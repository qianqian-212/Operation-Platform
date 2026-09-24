<template>
  <div class="page-wrapper">
    <CrossSchoolTeamStats :stats="stats" />
    <div class="page-main">
      <PageFilterBar four-columns show-reset @search="handleSearch" @reset="handleReset">
        <div class="form-item">
          <span class="form-label">联盟：</span>
          <el-select v-model="filterForm.allianceId" placeholder="请选择" clearable>
            <el-option
              v-for="alliance in allianceOptions"
              :key="alliance.id"
              :label="alliance.name"
              :value="alliance.id"
            />
          </el-select>
        </div>
        <div class="form-item">
          <span class="form-label">学科：</span>
          <el-select v-model="filterForm.subject" placeholder="请选择" clearable>
            <el-option
              v-for="subject in TEAM_SUBJECT_OPTIONS"
              :key="subject"
              :label="subject"
              :value="subject"
            />
          </el-select>
        </div>
        <div class="form-item">
          <span class="form-label">团队名称：</span>
          <el-input
            v-model="filterForm.name"
            placeholder="请输入"
            clearable
            @keyup.enter="handleSearch"
          />
        </div>
      </PageFilterBar>

      <div class="page-body">
        <div class="table-wrapper">
          <el-table v-loading="loading" :data="tableData" stripe border>
            <el-table-column label="序号" width="72" align="center">
              <template #default="{ $index }">
                {{ (currentPage - 1) * pageSize + $index + 1 }}
              </template>
            </el-table-column>
            <el-table-column label="团队名称" min-width="220" show-overflow-tooltip>
              <template #default="{ row }: { row: CrossSchoolTeamRow }">
                <button type="button" class="action-link" @click="handleViewDetail(row)">
                  {{ row.name }}
                </button>
              </template>
            </el-table-column>
            <el-table-column prop="allianceName" label="所属联盟" min-width="160" show-overflow-tooltip />
            <el-table-column prop="subject" label="学科" width="90" show-overflow-tooltip />
            <el-table-column prop="leadTeacherName" label="负责人" width="100" show-overflow-tooltip />
            <el-table-column prop="memberCount" label="成员数" width="90" align="center" />
            <el-table-column label="操作" fixed="right" width="88">
              <template #default="{ row }: { row: CrossSchoolTeamRow }">
                <button type="button" class="action-link" @click="handleViewDetail(row)">
                  详情
                </button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-bar">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import PageFilterBar from "@/components/PageFilterBar.vue";
import {
  TEAM_SUBJECT_OPTIONS,
  type CrossSchoolTeamRow,
} from "@/features/cross-school-team/types";
import { useCrossSchoolTeamStore } from "@/stores/cross-school-team";
import CrossSchoolTeamStats from "./CrossSchoolTeamStats.vue";

defineOptions({ name: "CrossSchoolTeamView" });

const listBasePath = "/ai-teacher-development/cross-school-research/teams";
const router = useRouter();
const teamStore = useCrossSchoolTeamStore();
const {
  loading,
  tableData,
  allianceOptions,
  filterForm,
  currentPage,
  pageSize,
  total,
  stats,
} = storeToRefs(teamStore);

onMounted(() => {
  void teamStore.loadAlliances();
  void teamStore.loadList();
});

function handleSearch() {
  void teamStore.search();
}

function handleReset() {
  void teamStore.resetFilter();
}

function handleSizeChange(size: number) {
  void teamStore.setPageSize(size);
}

function handlePageChange(page: number) {
  void teamStore.setPage(page);
}

function handleViewDetail(row: CrossSchoolTeamRow) {
  void router.push(`${listBasePath}/${row.id}`);
}
</script>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: var(--spacing-16);
  background: var(--color-bg);
}

.page-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--color-white);
  border-radius: var(--radius-sm);
}

.page-body {
  flex: 1;
  overflow: hidden;
  padding: var(--spacing-24);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-16);
}

.form-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  height: 32px;
  min-width: 0;
}

.form-label {
  font-size: var(--font-size-md);
  color: var(--color-title);
  line-height: var(--line-height-md);
  white-space: nowrap;
  flex-shrink: 0;
}

.form-item :deep(.el-select),
.form-item :deep(.el-input) {
  flex: 1;
  min-width: 0;
  --el-input-height: 32px;
}

.table-wrapper {
  flex: 0 1 auto;
  min-height: 0;
  overflow: auto;
}

.table-wrapper :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.action-link {
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: var(--font-size-md);
  color: var(--color-primary);
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
}

.action-link:hover {
  color: var(--color-primary-hover);
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  padding: var(--spacing-12) 0 0;
  background: var(--color-bg-subtle);
  margin: 0 calc(-1 * var(--spacing-24)) calc(-1 * var(--spacing-24));
  padding-inline: var(--spacing-24);
  padding-bottom: var(--spacing-12);
}
</style>
