<template>
  <section class="lt-group-members">
    <div class="lt-group-member-head">
      <h2 class="lt-group-title">{{ groupName || "自定义分组" }}</h2>
      <div v-if="groupName" class="lt-group-actions">
        <el-button @click="emit('open-history')">导入记录</el-button>
        <el-button :icon="Plus" @click="emit('open-member')">添加成员</el-button>
        <el-button type="primary" :icon="Plus" @click="emit('open-import')">导入名单</el-button>
      </div>
    </div>

    <div v-if="rows.length > 0" class="lt-group-table">
      <el-table :data="rows" border>
        <el-table-column prop="order" label="序号" width="72" align="center" />
        <el-table-column prop="schoolName" label="学校名称" min-width="160" />
        <el-table-column prop="teacherName" label="老师姓名" min-width="140" />
        <el-table-column prop="phone" label="电话号码" min-width="160" />
      </el-table>
    </div>
    <el-empty v-else :description="groupName ? '暂无成员' : '请先新增分组'" />

    <div v-if="total > 10" class="lt-group-pagination">
      <el-pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="(page: number) => emit('update:page', page)"
        @size-change="(size: number) => emit('update:pageSize', size)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Plus } from "@element-plus/icons-vue";
import type { LayeredTrainingGroupMember } from "@/features/layered-training-group/types";

defineOptions({ name: "LayeredTrainingGroupMembers" });

const props = defineProps<{
  /** 当前分组名称，空字符串表示还没有分组 */
  groupName: string;
  /** 当前页成员 */
  members: LayeredTrainingGroupMember[];
  /** 成员总数 */
  total: number;
  /** 当前页码 */
  currentPage: number;
  /** 每页条数 */
  pageSize: number;
}>();

const emit = defineEmits<{
  "update:page": [page: number];
  "update:pageSize": [size: number];
  "open-history": [];
  "open-member": [];
  "open-import": [];
}>();

const rows = computed(() =>
  props.members.map((member, index) => ({
    ...member,
    order: (props.currentPage - 1) * props.pageSize + index + 1,
  })),
);
</script>
