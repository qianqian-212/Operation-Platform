<template>
  <el-dialog v-model="visible" title="导入记录" width="640px" class="lt-group-dialog">
    <el-table v-if="records.length > 0" :data="records" border>
      <el-table-column prop="importedAt" label="导入时间" min-width="160" />
      <el-table-column prop="fileName" label="文件名" min-width="180" />
      <el-table-column prop="groupCount" label="分组数" width="90" align="center" />
      <el-table-column prop="memberCount" label="成员数" width="90" align="center" />
    </el-table>
    <el-empty v-else description="暂无导入记录" />
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { LayeredTrainingGroupImportRecord } from "@/features/layered-training-group/types";

defineOptions({ name: "LayeredTrainingGroupImportHistoryDialog" });

defineProps<{
  /** 已完成的导入记录，按时间倒序 */
  records: LayeredTrainingGroupImportRecord[];
}>();

const visible = defineModel<boolean>({ required: true });
</script>
