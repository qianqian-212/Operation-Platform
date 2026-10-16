<template>
  <div class="page-wrapper">
    <div class="page-body">
      <PageFilterBar class="review-filter" show-reset @search="handleSearch" @reset="handleReset">
        <div class="form-item">
          <span class="form-label">类型：</span>
          <el-select v-model="filterForm.kind" placeholder="全部类型" clearable>
            <el-option
              v-for="item in MANAGED_COURSE_KIND_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
        <div class="form-item">
          <span class="form-label">状态：</span>
          <el-select v-model="filterForm.reviewStatus" placeholder="全部状态" clearable>
            <el-option
              v-for="item in MANAGED_COURSE_STATUS_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </PageFilterBar>

      <div class="toolbar">
        <h1 class="toolbar-title">课程列表</h1>
        <el-button type="primary" :icon="Plus" @click="openCreate">新增课程</el-button>
      </div>

      <div class="table-wrapper">
        <el-table v-loading="loading" :data="rows" border>
          <el-table-column prop="title" label="课程名称" min-width="220" show-overflow-tooltip />
          <el-table-column label="类型" width="110">
            <template #default="{ row }: { row: ManagedCourseRow }">
              {{ MANAGED_COURSE_KIND_MAP[row.kind].label }}
            </template>
          </el-table-column>
          <el-table-column prop="lessonCountLabel" label="课时" width="80" />
          <el-table-column prop="subject" label="学科" width="90" />
          <el-table-column label="学段" width="90">
            <template #default="{ row }: { row: ManagedCourseRow }">
              {{ MANAGED_COURSE_STAGE_MAP[row.stage].label }}
            </template>
          </el-table-column>
          <el-table-column prop="updatedAt" label="更新时间" width="120" />
          <el-table-column label="审核状态" width="110">
            <template #default="{ row }: { row: ManagedCourseRow }">
              <StatusTag :color="MANAGED_COURSE_STATUS_MAP[row.reviewStatus].tagColor">
                {{ MANAGED_COURSE_STATUS_MAP[row.reviewStatus].label }}
              </StatusTag>
            </template>
          </el-table-column>
          <el-table-column label="上架状态" width="110">
            <template #default="{ row }: { row: ManagedCourseRow }">
              <StatusTag :color="MANAGED_COURSE_SHELF_MAP[row.shelfStatus].tagColor">
                {{ MANAGED_COURSE_SHELF_MAP[row.shelfStatus].label }}
              </StatusTag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right" align="right" header-align="right">
            <template #default="{ row }: { row: ManagedCourseRow }">
              <div class="row-actions">
                <button
                  v-for="action in row.actions"
                  :key="action"
                  type="button"
                  class="action-link"
                  @click="handleAction(row, action)"
                >
                  {{ MANAGED_COURSE_ACTION_LABEL[action] }}
                </button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="total > 10" class="pagination-bar">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="(page: number) => void courseStore().setPage(page)"
          @size-change="(size: number) => void courseStore().setPageSize(size)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import PageFilterBar from "@/components/PageFilterBar.vue";
import StatusTag from "@/components/StatusTag.vue";
import {
  MANAGED_COURSE_ACTION_LABEL,
  MANAGED_COURSE_KIND_MAP,
  MANAGED_COURSE_KIND_OPTIONS,
  MANAGED_COURSE_SHELF_MAP,
  MANAGED_COURSE_STAGE_MAP,
  MANAGED_COURSE_STATUS_MAP,
  MANAGED_COURSE_STATUS_OPTIONS,
  type ManagedCourseAction,
  type ManagedCourseRow,
  type ManagedCourseShelfAction,
} from "@/features/layered-training-course-manage/types";
import {
  useLayeredTrainingCourseManageStore,
  useSchoolLayeredTrainingCourseManageStore,
} from "@/stores/layered-training-course-manage";

defineOptions({ name: "LayeredTrainingCourseManageView" });

const props = withDefaults(
  defineProps<{
    /** bureau 保留上下架；school 只保留查看、编辑、提交和删除 */
    audience?: "bureau" | "school";
  }>(),
  { audience: "bureau" },
);

const router = useRouter();
const bureauStore = useLayeredTrainingCourseManageStore();
const schoolStore = useSchoolLayeredTrainingCourseManageStore();

function courseStore() {
  return props.audience === "school" ? schoolStore : bureauStore;
}

const listPath = computed(() =>
  props.audience === "school"
    ? "/ai-teacher-development/layered-training/courses"
    : "/bureau/ai-teacher-development/layered-training/courses",
);
const loading = computed(() => courseStore().loading);
const rows = computed(() => courseStore().rows);
const total = computed(() => courseStore().total);
const filterForm = computed(() => courseStore().filterForm);
const currentPage = computed({
  get: () => courseStore().currentPage,
  set: (value: number) => {
    courseStore().currentPage = value;
  },
});
const pageSize = computed({
  get: () => courseStore().pageSize,
  set: (value: number) => {
    courseStore().pageSize = value;
  },
});

onMounted(() => {
  void courseStore().loadList();
});

function handleSearch() {
  void courseStore().search();
}

function handleReset() {
  void courseStore().resetFilter();
}

function openCreate() {
  void router.push(`${listPath.value}/create`);
}

function openCourse(id: string, edit: boolean) {
  const query = edit ? { mode: "edit" } : undefined;
  void router.push({ path: `${listPath.value}/${id}`, query });
}

function isShelfAction(action: ManagedCourseAction): action is ManagedCourseShelfAction {
  return action === "publish" || action === "unpublish" || action === "republish";
}

async function handleAction(row: ManagedCourseRow, action: ManagedCourseAction) {
  if (action === "view") return openCourse(row.id, false);
  if (action === "edit") return openCourse(row.id, true);
  if (action === "delete") return removeCourse(row);
  try {
    if (action === "submit") await courseStore().submit(row.id);
    else if (isShelfAction(action)) await courseStore().setShelf(row.id, action);
    ElMessage.success(action === "submit" ? "已提交审核" : "上架状态已更新");
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "操作失败");
  }
}

async function removeCourse(row: ManagedCourseRow) {
  try {
    await ElMessageBox.confirm(`确认删除课程「${row.title}」？`, "删除课程", {
      type: "warning",
      confirmButtonText: "删除",
      cancelButtonText: "取消",
    });
  } catch {
    return;
  }
  try {
    await courseStore().remove(row.id);
    ElMessage.success("已删除");
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "删除失败");
  }
}
</script>

<style scoped src="./layered-training-list.css"></style>

<style scoped>
.page-body > :deep(.review-filter.page-filter-bar) {
  margin-right: calc(-1 * var(--spacing-24));
  margin-left: calc(-1 * var(--spacing-24));
  padding: 0 var(--spacing-24) var(--spacing-16);
  border-bottom: 1px solid var(--color-border);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-16);
  margin-top: var(--spacing-16);
  margin-bottom: var(--spacing-16);
}

.toolbar-title {
  margin: 0;
  color: var(--color-title);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: 24px;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  width: 100%;
  gap: var(--spacing-12);
}

.action-link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>
