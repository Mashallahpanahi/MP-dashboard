// src/api/dashboardApi.ts
import type { StudentStatistics } from "@/types/dashboard";
import { ApiError } from "./teacherApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Get student statistics
 * GET /students/statistics
 */
export const getStudentStatistics = async (): Promise<StudentStatistics> => {
  const response = await fetch(`${API_URL}/students/statistics`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch student statistics. Status: ${response.status}`,
      response.status
    );
  }

  const result = await response.json();
  // Handle wrapped response: { success, message, data: {...} }
  return result.data || result;
};