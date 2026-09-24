import {
  getCrossSchoolTeamDetail,
  listCrossSchoolTeamAlliances,
  listCrossSchoolTeamRows,
} from "@/features/cross-school-team/mock-data";
import type {
  AllianceOption,
  CrossSchoolTeamDetail,
  CrossSchoolTeamFilter,
  CrossSchoolTeamListResult,
  CrossSchoolTeamRow,
  CrossSchoolTeamStats,
} from "@/features/cross-school-team/types";
import { emptyTeamStats } from "@/features/cross-school-team/types";

export interface CrossSchoolTeamRepository {
  listAlliances(tenantId: string): Promise<AllianceOption[]>;
  list(
    tenantId: string,
    filter: CrossSchoolTeamFilter,
    page: number,
    pageSize: number,
  ): Promise<CrossSchoolTeamListResult>;
  getDetail(tenantId: string, id: string): Promise<CrossSchoolTeamDetail | null>;
}

function summarize(rows: readonly CrossSchoolTeamRow[]): CrossSchoolTeamStats {
  return {
    activityCount: 3,
    teamCount: rows.length,
    teacherCount: 3,
    achievementCount: 6,
  };
}

function matchesFilter(row: CrossSchoolTeamRow, filter: CrossSchoolTeamFilter) {
  if (filter.allianceId && row.allianceId !== filter.allianceId) return false;
  if (filter.subject && row.subject !== filter.subject) return false;
  const keyword = filter.name.trim();
  if (!keyword) return true;
  return row.name.includes(keyword) || row.leadTeacherName.includes(keyword);
}

const localRepository: CrossSchoolTeamRepository = {
  async listAlliances(_tenantId) {
    return listCrossSchoolTeamAlliances();
  },

  async list(_tenantId, filter, page, pageSize) {
    const all = listCrossSchoolTeamRows();
    const filtered = all.filter((row) => matchesFilter(row, filter));
    const start = Math.max(0, (page - 1) * pageSize);
    return {
      stats: summarize(all),
      total: filtered.length,
      list: filtered.slice(start, start + pageSize).map((row) => ({ ...row })),
    };
  },

  async getDetail(_tenantId, id) {
    const detail = getCrossSchoolTeamDetail(id);
    return detail ? structuredClone(detail) : null;
  },
};

export const crossSchoolTeamRepository: CrossSchoolTeamRepository = localRepository;

export function emptyCrossSchoolTeamStats() {
  return emptyTeamStats();
}
