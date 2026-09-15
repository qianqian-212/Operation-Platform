<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="1080px"
    align-center
    append-to-body
    destroy-on-close
    class="org-member-picker-dialog"
    @closed="handleClosed"
  >
    <OrgMemberPickerMemberBody
      v-if="mode === 'person'"
      v-model:keyword="keyword"
      :orgs="memberOrgs"
      :people="visiblePeople"
      :selected-ids="tempIds"
      :expanded-ids="expandedIds"
      :active-key="activeKey"
      :groups="selectedPersonGroups"
      :locked-ids="lockedIds"
      @focus="activeKey = $event"
      @toggle-expand="toggleExpand"
      @toggle-org="toggleOrg"
      @toggle-ids="toggleIds"
      @toggle="togglePerson"
      @toggle-all="toggleVisiblePeople"
      @remove="(id) => togglePerson(id, false)"
      @remove-org="(orgId) => toggleOrg(orgId, false)"
      @clear="clearSelected"
    />
    <OrgMemberPickerSchoolBody
      v-else
      v-model:selected-ids="tempIds"
      v-model:lead-id="tempLeadId"
      :schools="schools"
      :left-desc="leftDesc"
      :right-desc="rightDesc"
      :root-label="rootLabel"
    />

    <template #footer>
      <div class="picker-footer" :class="{ 'is-end': mode === 'person' || !footerNote }">
        <span v-if="mode === 'school' && footerNote" class="footer-note">{{ footerNote }}</span>
        <div class="footer-actions">
          <el-button @click="visible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确认({{ tempIds.length }})</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import OrgMemberPickerMemberBody from "@/components/org-member-picker/OrgMemberPickerMemberBody.vue";
import OrgMemberPickerSchoolBody from "@/components/org-member-picker/OrgMemberPickerSchoolBody.vue";
import {
  buildMemberOrgs,
  groupSelectedPeople,
  mergeIds,
  orgKey,
} from "@/components/org-member-picker/org-member-picker-tree";
import type {
  OrgMemberPickerPerson,
  OrgMemberPickerPersonResult,
  OrgMemberPickerSchool,
  OrgMemberPickerSchoolResult,
} from "@/components/org-member-picker/types";

defineOptions({ name: "OrgMemberPickerDialog" });

const props = withDefaults(
  defineProps<{
    /** 弹窗标题 */
    title: string;
    /** school=选组织；person=选人员 */
    mode: "school" | "person";
    /** 人员是否多选 */
    multiple?: boolean;
    /** 学校候选项 */
    schools?: OrgMemberPickerSchool[];
    /** 人员候选项 */
    people?: OrgMemberPickerPerson[];
    /** 人员模式下可选组织 */
    orgIds?: string[];
    /** 牵头校 ID，用于人员模式标记 */
    leadOrgId?: string | null;
    /** 初始已选 ID */
    modelValue?: string[];
    /** 人员模式下初始已选学校 */
    selectedOrgIds?: string[];
    /** 学校模式下初始牵头校 */
    leadId?: string | null;
    /** 不可取消的锁定人员 */
    lockedIds?: string[];
    /** 左侧说明 */
    leftDesc?: string;
    /** 右侧说明 */
    rightDesc?: string;
    /** 底部提示 */
    footerNote?: string;
    /** 根节点名称 */
    rootLabel?: string;
    /** 最少选择数量 */
    minCount?: number;
  }>(),
  {
    multiple: true,
    schools: () => [],
    people: () => [],
    orgIds: () => [],
    leadOrgId: null,
    modelValue: () => [],
    selectedOrgIds: () => [],
    leadId: null,
    lockedIds: () => [],
    leftDesc: "",
    rightDesc: "",
    footerNote: "",
    rootLabel: "当前教育局",
    minCount: 1,
  },
);

const visible = defineModel<boolean>("visible", { required: true });
const emit = defineEmits<{
  confirm: [payload: OrgMemberPickerSchoolResult | OrgMemberPickerPersonResult];
}>();

const keyword = ref("");
const tempIds = ref<string[]>([]);
const tempOrgIds = ref<string[]>([]);
const tempLeadId = ref<string | null>(null);
const expandedIds = ref<string[]>([]);
const activeKey = ref("");

const memberOrgs = computed(() =>
  buildMemberOrgs(props.schools, props.people, props.orgIds),
);
const activeOrg = computed(() =>
  memberOrgs.value.find((org) => activeKey.value === orgKey(org.id) || activeKey.value.startsWith(`group:${org.id}:`)),
);
const visiblePeople = computed(() => filterVisiblePeople());
const selectedPersonGroups = computed(() =>
  groupSelectedPeople(tempIds.value, props.people, tempOrgIds.value, props.schools),
);

function filterVisiblePeople() {
  const q = keyword.value.trim();
  const org = activeOrg.value;
  if (!org) return [];
  const prefix = `group:${org.id}:`;
  const groupName = activeKey.value.startsWith(prefix) ? activeKey.value.slice(prefix.length) : "";
  const source = groupName
    ? org.groups.find((group) => group.name === groupName)?.people ?? []
    : org.people;
  if (!q) return source;
  return source.filter(
    (person) => person.name.includes(q) || person.meta.includes(q) || person.orgName.includes(q),
  );
}

function toggleExpand(orgId: string) {
  expandedIds.value = expandedIds.value.includes(orgId)
    ? expandedIds.value.filter((id) => id !== orgId)
    : [...expandedIds.value, orgId];
}

function toggleIds(ids: string[], checked: boolean) {
  tempIds.value = mergeIds(tempIds.value, ids, checked);
  if (checked) includeOrgsOfPeople(ids);
}

function togglePerson(id: string, checked: boolean) {
  if (props.lockedIds.includes(id)) return;
  if (!props.multiple) {
    tempIds.value = checked ? [id] : [];
    if (checked) includeOrgsOfPeople([id]);
    return;
  }
  tempIds.value = mergeIds(tempIds.value, [id], checked);
  if (checked) includeOrgsOfPeople([id]);
}

function toggleOrg(orgId: string, checked: boolean) {
  const ids = props.people
    .filter((person) => person.orgId === orgId && !props.lockedIds.includes(person.id))
    .map((person) => person.id);
  tempIds.value = mergeIds(tempIds.value, ids, checked);
  tempOrgIds.value = mergeIds(tempOrgIds.value, [orgId], checked);
  if (checked && !expandedIds.value.includes(orgId)) {
    expandedIds.value = [...expandedIds.value, orgId];
  }
}

function includeOrgsOfPeople(personIds: readonly string[]) {
  const orgIds = props.people
    .filter((person) => personIds.includes(person.id))
    .map((person) => person.orgId);
  tempOrgIds.value = mergeIds(tempOrgIds.value, orgIds, true);
}

function toggleVisiblePeople(checked: boolean) {
  const ids = visiblePeople.value
    .map((person) => person.id)
    .filter((id) => !props.lockedIds.includes(id));
  toggleIds(ids, checked);
}

function clearSelected() {
  tempIds.value = [...props.lockedIds];
  tempOrgIds.value = props.people
    .filter((person) => props.lockedIds.includes(person.id))
    .map((person) => person.orgId);
  if (props.mode === "school") tempLeadId.value = null;
}

function syncFromProps() {
  tempIds.value = [...props.modelValue];
  tempOrgIds.value = props.selectedOrgIds.length
    ? [...props.selectedOrgIds]
    : Array.from(new Set(includeOrgsFromSelection()));
  tempLeadId.value = props.leadId;
  keyword.value = "";
  const firstOrg = memberOrgs.value[0];
  expandedIds.value = firstOrg ? [firstOrg.id] : [];
  activeKey.value = firstOrg ? orgKey(firstOrg.id) : "";
}

function includeOrgsFromSelection() {
  return props.people
    .filter((person) => props.modelValue.includes(person.id))
    .map((person) => person.orgId);
}

function handleConfirm() {
  if (props.mode === "school") {
    if (tempIds.value.length < props.minCount) {
      ElMessage.error(`请至少选择 ${props.minCount} 项`);
      return;
    }
    if (!tempLeadId.value) {
      ElMessage.error("请在已选学校中设置牵头校");
      return;
    }
    emit("confirm", { selectedIds: [...tempIds.value], leadId: tempLeadId.value });
    visible.value = false;
    return;
  }
  if (tempOrgIds.value.length === 0) {
    ElMessage.error("请至少选择 1 所学校");
    return;
  }
  if (tempIds.value.length < props.minCount) {
    ElMessage.error(`请至少选择 ${props.minCount} 项`);
    return;
  }
  emit("confirm", { selectedIds: [...tempIds.value], orgIds: [...tempOrgIds.value] });
  visible.value = false;
}

function handleClosed() {
  keyword.value = "";
}

watch(
  () => visible.value,
  (open) => {
    if (open) syncFromProps();
  },
  { flush: "post" },
);
</script>

<style scoped src="./org-member-picker-dialog.css"></style>

<style>
.el-overlay-dialog .org-member-picker-dialog.el-dialog {
  height: min(720px, 88vh);
}

.el-overlay-dialog .org-member-picker-dialog .el-dialog__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
</style>
