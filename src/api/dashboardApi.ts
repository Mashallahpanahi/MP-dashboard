// src/api/dashboardApi.ts
import type { StudentStatistics } from "@/types/dashboard";
import { ApiError } from "./teacherApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
      response.status
    );
  }

  const result = await response.json();
  return result.data || result;
};

// ============================================
// ✅ NEW: Dashboard Report
// ============================================

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
}

export interface DashboardReportFilters {
  fromDate: string | null;
  toDate: string | null;
}

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
  toDate?: string
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