// src/api/teacherPayrollApi.ts
import type { 
  TeacherPayroll, 
  CreateTeacherPayrollData, 
  UpdateTeacherPayrollData,
  TeacherPayrollSummary,
  AddPaymentData,
  Teacher,
  UnpaidSalaryRecord
} from "@/types/teacherPayroll";
import { ApiError } from "./teacherApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Get teachers who did not receive salary
 * GET /teacher-payroll/without-salary
 */
export const getUnpaidSalaries = async (): Promise<UnpaidSalaryRecord[]> => {
  const response = await fetch(`${API_URL}/teacher-payroll/without-salary`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to fetch unpaid salaries. Status: ${response.status}`;
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

  const result = await response.json();
  return Array.isArray(result) ? result : (result.data || []);
};

/**
 * Get all payroll records
 * GET /teacher-payroll
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

  const result = await response.json();
  return Array.isArray(result) ? result : (result.data || []);
};

/**
 * Get payroll summary
 * GET /teacher-payroll/summary
 */
export const getTeacherPayrollSummary = async (): Promise<TeacherPayrollSummary> => {
  const response = await fetch(`${API_URL}/teacher-payroll/summary`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch payroll summary. Status: ${response.status}`,
      response.status
    );
  }

  const result = await response.json();
  return result.data || result;
};

/**
 * Get a single payroll record by ID
 * GET /teacher-payroll/{id}
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

  const result = await response.json();
  return result.data || result;
};

/**
 * Get payroll records by teacher ID
 * GET /teacher-payroll/teacher/{teacherId}
 */
export const getPayrollsByTeacher = async (teacherId: string): Promise<TeacherPayroll[]> => {
  const response = await fetch(`${API_URL}/teacher-payroll/teacher/${teacherId}`, {
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

  const result = await response.json();
  return Array.isArray(result) ? result : (result.data || []);
};

/**
 * Get payroll records by status
 * GET /teacher-payroll/status/{status}
 */
export const getPayrollsByStatus = async (status: string): Promise<TeacherPayroll[]> => {
  const response = await fetch(`${API_URL}/teacher-payroll/status/${status}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch payrolls by status. Status: ${response.status}`,
      response.status
    );
  }

  const result = await response.json();
  return Array.isArray(result) ? result : (result.data || []);
};

/**
 * ✅ Create a payroll record
 * POST /teacher-payroll
 */
export const createTeacherPayroll = async (
  data: CreateTeacherPayrollData
): Promise<TeacherPayroll> => {
  console.log('📤 createTeacherPayroll called with:', data);

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

  const result = await response.json();
  return result.data || result;
};

/**
 * ✅ Update a payroll record
 * PATCH /teacher-payroll/{id}
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

  const result = await response.json();
  return result.data || result;
};

/**
 * Add payment to payroll
 * PATCH /teacher-payroll/{id}/add-payment
 */
export const addPaymentToPayroll = async (
  id: string,
  data: AddPaymentData
): Promise<TeacherPayroll> => {
  const response = await fetch(`${API_URL}/teacher-payroll/${id}/add-payment`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to add payment. Status: ${response.status}`;
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

  const result = await response.json();
  return result.data || result;
};

/**
 * Delete a payroll record
 * DELETE /teacher-payroll/{id}
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
 * GET /teachers
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