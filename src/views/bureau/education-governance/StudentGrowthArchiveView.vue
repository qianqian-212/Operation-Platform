<script setup lang="ts">
import { onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import type { EducationStage, EnrollmentStatus } from "@/features/student-growth-portrait/data-contract";
import {
  educationStageLabels,
  enrollmentStatusLabels,
  type ArchiveStudentRow,
} from "@/features/student-growth-archive/types";
import PageFilterBar from "@/components/PageFilterBar.vue";
import { useStudentGrowthArchiveStore } from "@/stores/student-growth-archive";

const router = useRouter();
const archiveStore = useStudentGrowthArchiveStore();
const {
  filterDraft,
  pagination,
  treeSearch,
  treeData,
  expandedKeys,
  selectedSchoolId,
  currentTreeNodeKey,
  classOptions,
  gradeOptions,
  tableData,
  toolbarTitle,
  loading,
  treeLoading,
} = storeToRefs(archiveStore);

watch(treeSearch, () => {
  void archiveStore.loadTree({ ensureSchoolSelection: true });
});

onMounted(() => {
  void archiveStore.ensureInitialized();
});

function handleViewDetail(row: ArchiveStudentRow) {
  void router.push(`/bureau/education-governance/student-growth-archive/${row.studentId}`);
}
</script>

<template>
  <div class="page-wrapper">
    <aside class="tree-panel" aria-label="辖区学校">
      <div class="tree-search">
        <ElInput
          v-model="treeSearch"
          clearable
          placeholder="搜索学校"
          aria-label="搜索学校"
        />
      </div>
      <div v-loading="treeLoading" class="tree-scroll">
        <ElTree
          :key="`${expandedKeys.join('|')}:${currentTreeNodeKey ?? ''}`"
          :data="treeData"
          node-key="id"
          :props="{ label: 'label', children: 'children', disabled: 'disabled' }"
          :default-expanded-keys="expandedKeys"
          :current-node-key="currentTreeNodeKey"
          highlight-current
          :expand-on-click-node="false"
          @node-click="archiveStore.handleTreeNodeClick"
        >
          <template #default="{ data }">
            <span
              class="tree-node-label"
              :class="{
                'is-school': data.kind === 'school',
                'is-selected': data.schoolId === selectedSchoolId,
              }"
            >
              {{ data.label }}
            </span>
          </template>
        </ElTree>
      </div>
    </aside>

    <section class="content-panel">
      <PageFilterBar class="content-filter">
        <div class="form-item">
          <span class="form-label">学段：</span>
          <ElSelect
            v-model="filterDraft.stage"
            aria-label="学段"
            @change="archiveStore.onStageDraftChange"
          >
            <ElOption label="全部学段" value="all" />
            <ElOption
              v-for="(label, value) in educationStageLabels"
              :key="value"
              :label="label"
              :value="value"
            />
          </ElSelect>
        </div>
        <div class="form-item">
          <span class="form-label">年级：</span>
          <ElSelect
            v-model="filterDraft.grade"
            aria-label="年级"
            :disabled="!selectedSchoolId"
          >
            <ElOption label="全部年级" value="全部年级" />
            <ElOption
              v-for="grade in gradeOptions"
              :key="grade"
              :label="grade"
              :value="grade"
            />
          </ElSelect>
        </div>
        <div class="form-item">
          <span class="form-label">班级：</span>
          <ElSelect
            v-model="filterDraft.classId"
            aria-label="班级"
            clearable
            placeholder="全部班级"
            :disabled="!selectedSchoolId"
          >
            <ElOption
              v-for="item in classOptions"
              :key="item.classId"
              :label="item.className"
              :value="item.classId"
            />
          </ElSelect>
        </div>
        <div class="form-item">
          <span class="form-label">学籍状态：</span>
          <ElSelect v-model="filterDraft.enrollmentStatus" aria-label="学籍状态">
            <ElOption label="全部状态" value="all" />
            <ElOption
              v-for="(label, value) in enrollmentStatusLabels"
              :key="value"
              :label="label"
              :value="value"
            />
          </ElSelect>
        </div>
        <div class="form-item">
          <span class="form-label">关键词：</span>
          <ElInput
            v-model="filterDraft.keyword"
            aria-label="关键词"
            clearable
            placeholder="姓名或学号"
          />
        </div>
        <template #actions>
          <ElButton type="primary" :loading="loading" @click="archiveStore.applyFilters">
            查询
          </ElButton>
          <ElButton :disabled="loading" @click="archiveStore.resetFilters">重置</ElButton>
        </template>
      </PageFilterBar>

      <div class="table-panel">
        <div class="toolbar">
          <span class="toolbar-title">{{ toolbarTitle }}</span>
          <span class="toolbar-hint">筛选仅作用于当前学校学生列表</span>
        </div>

        <div class="table-wrapper">
          <ElEmpty
            v-if="!selectedSchoolId"
            description="当前辖区暂无学校"
            :image-size="72"
          />
          <ElTable
            v-else
            v-loading="loading"
            :data="tableData"
            row-key="studentId"
            stripe
            border
            aria-label="学生列表"
          >
            <ElTableColumn
              type="index"
              label="序号"
              width="64"
              align="center"
              fixed="left"
              :index="(index: number) => (pagination.currentPage - 1) * pagination.pageSize + index + 1"
            />
            <ElTableColumn
              prop="name"
              column-key="name"
              label="姓名"
              min-width="100"
              fixed="left"
              show-overflow-tooltip
            />
            <ElTableColumn
              prop="studentNo"
              column-key="studentNo"
              label="学号"
              min-width="120"
              show-overflow-tooltip
            />
            <ElTableColumn
              prop="educationStage"
              column-key="educationStage"
              label="学段"
              width="88"
            >
              <template #default="{ row }">
                {{ educationStageLabels[row.educationStage as EducationStage] }}
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="grade"
              column-key="grade"
              label="年级"
              width="96"
              show-overflow-tooltip
            />
            <ElTableColumn
              prop="className"
              column-key="className"
              label="班级"
              width="88"
              show-overflow-tooltip
            />
            <ElTableColumn
              prop="enrollmentStatus"
              column-key="enrollmentStatus"
              label="学籍状态"
              width="100"
            >
              <template #default="{ row }">
                {{ enrollmentStatusLabels[row.enrollmentStatus as EnrollmentStatus] }}
              </template>
            </ElTableColumn>
            <ElTableColumn label="操作" fixed="right" width="112">
              <template #default="{ row }">
                <button type="button" class="action-link" @click="handleViewDetail(row)">
                  查看详情
                </button>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>

        <div v-if="selectedSchoolId" class="pagination-bar">
          <ElPagination
            :current-page="pagination.currentPage"
            :page-size="pagination.pageSize"
            background
            layout="total, sizes, prev, pager, next"
            :total="pagination.total"
            :page-sizes="[10, 20, 50]"
            @update:current-page="archiveStore.setPage"
            @update:page-size="archiveStore.setPageSize"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  height: 100%;
  min-width: 0;
  min-height: 0;
  background: var(--color-white);
}

.tree-panel {
  display: flex;
  flex-direction: column;
  width: 260px;
  min-width: 220px;
  min-height: 0;
  border-right: 1px solid var(--color-border);
  padding: var(--spacing-16);
  gap: var(--spacing-12);
  background: var(--color-white);
}

.tree-search {
  flex-shrink: 0;
}

.tree-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.tree-node-label {
  font-size: var(--font-size-md);
  color: var(--color-body);
  line-height: var(--line-height-md);
}

.tree-node-label.is-school {
  color: var(--color-title);
}

.tree-node-label.is-selected {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.content-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.content-filter {
  border-bottom: 1px solid var(--color-border);
}

.form-item {
  display: flex;
  align-items: center;
  height: 32px;
  width: 280px;
  flex-shrink: 0;
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

.table-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: var(--spacing-24);
  gap: var(--spacing-16);
}

.toolbar {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-16);
  flex-shrink: 0;
}

.toolbar-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-title);
  line-height: 24px;
}

.toolbar-hint {
  font-size: var(--font-size-sm);
  color: var(--color-secondary);
  line-height: var(--line-height-sm, 20px);
}

.table-wrapper {
  flex: 0 1 auto;
  min-height: 0;
  overflow: auto;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.table-wrapper :deep(.el-empty) {
  margin: auto;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.action-link {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-primary);
  font-size: var(--font-size-md);
  line-height: var(--line-height-md);
  cursor: pointer;
}

.action-link:hover {
  color: var(--color-primary-hover);
}
</style>
