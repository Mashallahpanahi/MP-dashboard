// src/api/dashboardApi.ts
import { useFetch } from "@/hooks/useFetch";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface ActiveStudent {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  image: string | null;
  fatherName: string;
  fatherPhone: string | null;
  gender: "Male" | "Female";
  status: "Active" | "Inactive" | "Graduated";
  studentNumber: string;
  registrationDate: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentStatistics {
  totalStudents: number;
  totalActive: number;
  totalGraduated: number;
  totalInactive: number;
  activeStudents: ActiveStudent[];
}

/** UI-state helper (kept here because types/ is being removed). */
export interface DashboardStats {
  studentStats: StudentStatistics | null;
  loading: boolean;
  error: string;
}

export interface DashboardByMonthFilters {
  month?: number;
  monthName?: string;
  year?: number;
  fromDate?: string;
  toDate?: string;
  mode?: "month" | "range";
}

export interface DashboardReportFilters {
  month?: number;
  monthName?: string;
  year?: number;
  fromDate?: string;
  toDate?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  defaultRange?: string;
  breakdownYear?: number;
  mode?: string;
}

export interface DashboardMonthlyBreakdown {
  month: number;
  monthName: string;
  income: number;
  payrollExpenses: number;
  otherExpenses: number;
  totalExpenses: number;
  benefit: number;
}

export interface DashboardReportData {
  totalStudents: number;
  totalActiveStudents: number;
  totalInactiveStudents: number;
  totalEnrolledStudents: number;
  totalActiveTeachers: number;
  totalIncome: number;
  totalPayrollExpenses: number;
  totalOtherExpenses: number;
  totalExpenses: number;
  totalBenefit: number;
  monthlyBreakdown?: DashboardMonthlyBreakdown[];
}

export interface DashboardByMonthResponse {
  success: boolean;
  message: string;
  filters: DashboardByMonthFilters;
  data: DashboardReportData;
}

export interface DashboardReportResponse {
  success: boolean;
  message: string;
  filters: DashboardReportFilters;
  data: DashboardReportData;
}

export interface DashboardByMonthParams {
  month?: number;
  year?: number;
  fromDate?: string;
  toDate?: string;
}

export interface DashboardReportParams {
  fromDate?: string;
  toDate?: string;
}

/* ------------------------------------------------------------------ */
/* URL builders                                                        */
/* ------------------------------------------------------------------ */

const buildByMonthUrl = (params: DashboardByMonthParams): string => {
  const q = new URLSearchParams();

  if (params.fromDate && params.toDate) {
    q.append("fromDate", params.fromDate);
    q.append("toDate", params.toDate);
  } else if (params.month) {
    q.append("month", String(params.month));
    if (params.year) q.append("year", String(params.year));
  }

  const qs = q.toString();
  return `${API_URL}/dashboard-report/by-month${qs ? `?${qs}` : ""}`;
};

const buildReportUrl = (params: DashboardReportParams): string => {
  const q = new URLSearchParams();
  if (params.fromDate) q.append("fromDate", params.fromDate);
  if (params.toDate) q.append("toDate", params.toDate);

  const qs = q.toString();
  return `${API_URL}/dashboard-report${qs ? `?${qs}` : ""}`;
};

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/**
 * GET /students/statistics
 * Works whether the backend returns raw `StudentStatistics`
 * or `{ data: StudentStatistics }` — `useFetch`'s fallback handles both.
 */
export const useStudentStatistics = (enabled = true) =>
  useFetch<StudentStatistics>(`${API_URL}/students/statistics`, enabled);

/**
 * GET /dashboard-report/by-month
 *
 * Priority (server-side):
 *   1. fromDate + toDate → range
 *   2. month (+ year)    → single month
 *
 * `params` becomes part of the URL — the hook refetches automatically
 * when any of its values change.
 */
export const useDashboardReportByMonth = (
  params: DashboardByMonthParams,
  enabled = true,
) => {
  const url = buildByMonthUrl(params);
  return useFetch<DashboardByMonthResponse>(
    url,
    enabled,
    (raw) => raw as DashboardByMonthResponse,
  );
};

/**
 * GET /dashboard-report
 *
 * Pass `{ fromDate, toDate }` for a custom range, or `{}` for the
 * server default range.
 */
export const useDashboardReport = (
  params: DashboardReportParams = {},
  enabled = true,
) => {
  const url = buildReportUrl(params);
  return useFetch<DashboardReportResponse>(
    url,
    enabled,
    (raw) => raw as DashboardReportResponse,
  );
};