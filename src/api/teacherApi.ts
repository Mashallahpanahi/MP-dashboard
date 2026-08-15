// src/api/teacherApi.ts
import type { Teacher } from "@/types/teacher";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

// Custom error class for API errors
export class ApiError extends Error {
  statusCode?: number;
  details?: any;

  constructor(message: string, statusCode?: number, details?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Get all teachers
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

/**
 * Get all active teachers only
 * GET /teachers/active
 */
export const getActiveTeachers = async (): Promise<Teacher[]> => {
  const response = await fetch(`${API_URL}/teachers/active`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch active teachers. Status: ${response.status}`,
      response.status
    );
  }

  const data: Teacher[] = await response.json();
  return data;
};

/**
 * Get a single teacher by ID
 * GET /teachers/{id}
 */
export const getTeacherById = async (id: string): Promise<Teacher> => {
  const response = await fetch(`${API_URL}/teachers/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch teacher. Status: ${response.status}`,
      response.status
    );
  }

  const data: Teacher = await response.json();
  return data;
};

/**
 * Create a new teacher
 * POST /teachers
 */
export interface CreateTeacherData {
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  salaryType: string;
  salaryAmount: number;
  feePercentage: number;
  hireDate: string;
  isActive: boolean;
}

export const createTeacher = async (
  teacher: CreateTeacherData,
): Promise<Teacher> => {
  const response = await fetch(`${API_URL}/teachers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(teacher),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create teacher. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;

      if (errorData.message && typeof errorData.message === 'string') {
        if (errorData.message.includes('UQ_9c5ae9e15a042292bb8d83ca34c') || 
            errorData.message.toLowerCase().includes('duplicate key') && 
            errorData.message.toLowerCase().includes('phone')) {
          errorMessage = 'This phone number is already registered. Please use a different phone number.';
        } else if (errorData.message.includes('UQ_6c6e1c4b7c9c8e9d2f8e9d2f8e9d2f8e') || 
                 errorData.message.toLowerCase().includes('duplicate key') && 
                 errorData.message.toLowerCase().includes('email')) {
          errorMessage = 'This email address is already registered. Please use a different email address.';
        } else if (errorData.message.toLowerCase().includes('duplicate key') && 
                 (errorData.message.toLowerCase().includes('phone') || 
                  errorData.message.toLowerCase().includes('email'))) {
          errorMessage = 'The phone number or email address is already registered. Please use unique values.';
        } else if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(", ");
        } else {
          errorMessage = errorData.message;
        }
      } else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      }
    } catch {
      // Keep the default error message
    }

    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  const data: Teacher = await response.json();
  return data;
};

/**
 * Update a teacher by ID
 * PATCH /teachers/{id}
 */
export interface UpdateTeacherData extends Partial<CreateTeacherData> {
  id: string;
}

export const updateTeacher = async (
  id: string,
  teacher: Partial<CreateTeacherData>,
): Promise<Teacher> => {
  const response = await fetch(`${API_URL}/teachers/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(teacher),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update teacher. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;

      if (errorData.message && typeof errorData.message === 'string') {
        if (errorData.message.includes('UQ_9c5ae9e15a042292bb8d83ca34c') || 
            errorData.message.toLowerCase().includes('duplicate key') && 
            errorData.message.toLowerCase().includes('phone')) {
          errorMessage = 'This phone number is already registered by another teacher. Please use a different phone number.';
        } else if (errorData.message.includes('UQ_6c6e1c4b7c9c8e9d2f8e9d2f8e9d2f8e') || 
                 errorData.message.toLowerCase().includes('duplicate key') && 
                 errorData.message.toLowerCase().includes('email')) {
          errorMessage = 'This email address is already registered by another teacher. Please use a different email address.';
        } else if (errorData.message.toLowerCase().includes('duplicate key') && 
                 (errorData.message.toLowerCase().includes('phone') || 
                  errorData.message.toLowerCase().includes('email'))) {
          errorMessage = 'The phone number or email address is already registered. Please use unique values.';
        } else if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(", ");
        } else {
          errorMessage = errorData.message;
        }
      } else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      }
    } catch {
      // Keep the default error message
    }

    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  const data: Teacher = await response.json();
  return data;
};

/**
 * Delete a teacher by ID
 * DELETE /teachers/{id}
 */
export const deleteTeacher = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/teachers/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete teacher. Status: ${response.status}`;

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
 * Update teacher activation status
 * PATCH /teachers/{id}/status
 */
export const updateTeacherStatus = async (
  id: string,
  data: { isActive: boolean }
): Promise<Teacher> => {
  const response = await fetch(`${API_URL}/teachers/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update teacher status. Status: ${response.status}`;
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

  const result: Teacher = await response.json();
  return result;
};