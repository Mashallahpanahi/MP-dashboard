// src/api/teacherPayrollApi.ts
import type { 
  TeacherPayroll, 
  CreateTeacherPayrollData, 
  UpdateTeacherPayrollData,
  GeneratePayrollDto,
  Teacher
} from "@/types/teacherPayroll";
import { ApiError } from "./teacherApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Get all payroll records
 */
export const getTeacherPayrolls = async (): Promise<TeacherPayroll[]> => {
  const response = await fetch(`${API_URL}/teacher-payroll`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch teacher payrolls. Status: ${response.status}`,
      response.status
    );
  }

  const data: TeacherPayroll[] = await response.json();
  return data;
};

/**
 * Get a single payroll record by ID
 */
export const getTeacherPayrollById = async (id: string): Promise<TeacherPayroll> => {
  const response = await fetch(`${API_URL}/teacher-payroll/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch teacher payroll. Status: ${response.status}`,
      response.status
    );
  }

  const data: TeacherPayroll = await response.json();
  return data;
};

/**
 * Generate payroll for a teacher for a specific month
 */
export const generateTeacherPayroll = async (
  data: GeneratePayrollDto
): Promise<TeacherPayroll> => {
  const response = await fetch(`${API_URL}/teacher-payroll/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to generate teacher payroll. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;
      if (errorData.message && typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      } else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      }
    } catch {
      // Keep the default error message
    }

    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  const result: TeacherPayroll = await response.json();
  return result;
};

/**
 * Create a payroll record manually
 */
export const createTeacherPayroll = async (
  data: CreateTeacherPayrollData
): Promise<TeacherPayroll> => {
  const response = await fetch(`${API_URL}/teacher-payroll`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create teacher payroll. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;
      if (errorData.message && typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      } else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      }
    } catch {
      // Keep the default error message
    }

    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  const result: TeacherPayroll = await response.json();
  return result;
};

/**
 * Update a payroll record
 */
export const updateTeacherPayroll = async (
  id: string,
  data: UpdateTeacherPayrollData
): Promise<TeacherPayroll> => {
  const response = await fetch(`${API_URL}/teacher-payroll/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update teacher payroll. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;
      if (errorData.message && typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      } else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      }
    } catch {
      // Keep the default error message
    }

    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  const result: TeacherPayroll = await response.json();
  return result;
};

/**
 * Delete a payroll record
 */
export const deleteTeacherPayroll = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/teacher-payroll/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete teacher payroll. Status: ${response.status}`;

    try {
      const errorData = await response.json();
      if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Keep the default error message
    }

    throw new ApiError(errorMessage, response.status);
  }
};

/**
 * Get all teachers (for dropdown selection)
 */
export const getTeachers = async (): Promise<Teacher[]> => {
  const response = await fetch(`${API_URL}/teachers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch teachers. Status: ${response.status}`,
      response.status
    );
  }

  const data: Teacher[] = await response.json();
  return data;
};