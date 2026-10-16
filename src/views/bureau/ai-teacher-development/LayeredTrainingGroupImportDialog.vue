<template>
  <el-dialog v-model="visible" title="导入名单" width="720px" destroy-on-close class="lt-group-dialog">
    <div class="lt-group-import">
      <el-upload
        drag
        :auto-upload="false"
        :show-file-list="false"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        :on-change="handleFile"
      >
        <el-icon class="lt-group-upload-icon"><UploadFilled /></el-icon>
        <p class="lt-group-upload-text">
          将Excel文件拖到此处，或<span class="lt-group-upload-link">点击上传</span>
        </p>
      </el-upload>
      <p v-if="fileName" class="lt-group-file-name">{{ fileName }}</p>
    </div>
    <section class="lt-group-guide">
      <h3>导入表格样式说明</h3>
      <p>
        每个分组名称对应Excel中的一个Sheet（工作表），Sheet名称即分组名称。每个Sheet含三列，以手机号码保证教师唯一：
      </p>
      <table class="lt-group-sample">
        <thead>
          <tr>
            <th>学校名称(校区)</th>
            <th>老师姓名</th>
            <th>手机号码</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>第一小学</td>
            <td>张晓晓</td>
            <td>13800000001</td>
          </tr>
          <tr>
            <td>第二小学</td>
            <td>李芳</td>
            <td>13800000002</td>
          </tr>
        </tbody>
      </table>
    </section>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { UploadFilled } from "@element-plus/icons-vue";
import { ElMessage, type UploadFile } from "element-plus";
import { parseGroupWorkbook } from "@/features/layered-training-group/parse-group-workbook";
import type { LayeredTrainingGroupImportPayload } from "@/features/layered-training-group/types";

defineOptions({ name: "LayeredTrainingGroupImportDialog" });

defineProps<{
  /** 确认请求进行中 */
  saving: boolean;
}>();

const visible = defineModel<boolean>({ required: true });
const emit = defineEmits<{ confirm: [payload: LayeredTrainingGroupImportPayload] }>();
const fileName = ref("");
const file = ref<File | null>(null);

watch(
  visible,
  (open) => {
    if (!open) return;
    fileName.value = "";
    file.value = null;
  },
  { flush: "post" },
);

function handleFile(upload: UploadFile) {
  const raw = upload.raw;
  if (!raw) return;
  if (!raw.name.toLowerCase().endsWith(".xlsx")) {
    ElMessage.error("请上传 .xlsx 文件");
    return;
  }
  file.value = raw;
  fileName.value = raw.name;
}

async function handleConfirm() {
  const selected = file.value;
  if (!selected) {
    ElMessage.warning("请先选择 Excel 文件");
    return;
  }
  try {
    const sheets = await parseGroupWorkbook(await selected.arrayBuffer());
    emit("confirm", { fileName: selected.name, sheets });
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法读取 Excel 文件";
    ElMessage.error(message);
  }
}
</script>
