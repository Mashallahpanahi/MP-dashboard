// src/api/dashboardApi.ts
import type { StudentStatistics } from "@/types/dashboard";
import { ApiError } from "./teacherApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ============================================
// ✅ Dashboard Report by Month / Date Range
// ============================================

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
  monthlyBreakdown?: {
    month: number;
    monthName: string;
    income: number;
    payrollExpenses: number;
    otherExpenses: number;
    totalExpenses: number;
    benefit: number;
  }[];
}

export interface DashboardByMonthResponse {
  success: boolean;
  message: string;
  filters: DashboardByMonthFilters;
  data: DashboardReportData;
}

/**
 * Get dashboard report by month number OR date range
 * GET /dashboard-report/by-month
 *
 * Priority:
 *   1. fromDate + toDate → range
 *   2. month (+ year)   → month
 *   3. else             → error
 */
export const getDashboardReportByMonth = async (params: {
  month?: number;
  year?: number;
  fromDate?: string;
  toDate?: string;
}): Promise<DashboardByMonthResponse> => {
  const query = new URLSearchParams();
  if (params.fromDate && params.toDate) {
    query.append("fromDate", params.fromDate);
    query.append("toDate", params.toDate);
  } else if (params.month) {
    query.append("month", String(params.month));
    if (params.year) query.append("year", String(params.year));
  }

  const url = `${API_URL}/dashboard-report/by-month?${query.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    let errorMessage = `Failed to fetch report. Status: ${response.status}`;
    try {
      const err = await response.json();
      if (err.message) errorMessage = err.message;
    } catch {
      /* keep default */
    }
    throw new ApiError(errorMessage, response.status);
  }

  return response.json();
};
/**
 * Get student statistics (existing)
 * GET /students/statistics
 */
export const getStudentStatistics = async (): Promise<StudentStatistics> => {
  const response = await fetch(`${API_URL}/students/statistics`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch student statistics. Status: ${response.status}`,
      response.status,
    );
  }

  const result = await response.json();
  return result.data || result;
};

// ============================================
// ✅ Dashboard Report
// ============================================

// ✅ NEW: Monthly breakdown row
export interface DashboardMonthlyBreakdown {
  month: number; // 1-12
  monthName: string; // "January", ...
  income: number;
  payrollExpenses: number;
  otherExpenses: number;
  totalExpenses: number;
  benefit: number;
}

// export interface DashboardReportData {
//   totalStudents: number;
//   totalActiveStudents: number;
//   totalInactiveStudents: number;
//   totalEnrolledStudents: number;
//   totalActiveTeachers: number;
//   totalIncome: number;
//   totalPayrollExpenses: number;
//   totalOtherExpenses: number;
//   totalExpenses: number;
//   totalBenefit: number;
//   // ✅ NEW
//   monthlyBreakdown?: DashboardMonthlyBreakdown[];
// }
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
  monthlyBreakdown?: {
    month: number;
    monthName: string;
    income: number;
    payrollExpenses: number;
    otherExpenses: number;
    totalExpenses: number;
    benefit: number;
  }[];
}

// export interface DashboardReportFilters {
//   fromDate: string | null;
//   toDate: string | null;
//   effectiveFrom?: string | null;      // ✅ optional new fields
//   effectiveTo?: string | null;
//   defaultRange?: string | null;
//   breakdownYear?: number;
// }


export interface DashboardReportResponse {
  success: boolean;
  message: string;
  filters: DashboardReportFilters;
  data: DashboardReportData;
}

/**
 * Get dashboard report
 * GET /dashboard-report
 *
 * @param fromDate - Optional start date (YYYY-MM-DD)
 * @param toDate - Optional end date (YYYY-MM-DD)
 */
export const getDashboardReport = async (
  fromDate?: string,
  toDate?: string,
): Promise<DashboardReportResponse> => {
  const params = new URLSearchParams();
  if (fromDate) params.append("fromDate", fromDate);
  if (toDate) params.append("toDate", toDate);

  const queryString = params.toString();
  const url = queryString
    ? `${API_URL}/dashboard-report?${queryString}`
    : `${API_URL}/dashboard-report`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    let errorMessage = `Failed to fetch dashboard report. Status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.message) errorMessage = errorData.message;
    } catch {
      /* keep default */
    }
    throw new ApiError(errorMessage, response.status);
  }

  return response.json();
};
