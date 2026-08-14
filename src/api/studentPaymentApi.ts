// src/api/studentPaymentApi.ts
import type { 
  StudentPayment, 
  CreateStudentPaymentData, 
  UpdateStudentPaymentData,
  StudentEnrollment 
} from "@/types/studentPayment";
import { ApiError } from "./teacherApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Get all student payments
 */
export const getStudentPayments = async (): Promise<StudentPayment[]> => {
  const response = await fetch(`${API_URL}/student-payments`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch student payments. Status: ${response.status}`,
      response.status
    );
  }

  const data: StudentPayment[] = await response.json();
  return data;
};

/**
 * Get a single student payment by ID
 */
export const getStudentPaymentById = async (id: string): Promise<StudentPayment> => {
  const response = await fetch(`${API_URL}/student-payments/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch student payment. Status: ${response.status}`,
      response.status
    );
  }

  const data: StudentPayment = await response.json();
  return data;
};

/**
 * Get all payments for a specific enrollment
 */
export const getPaymentsByEnrollment = async (enrollmentId: string): Promise<StudentPayment[]> => {
  const response = await fetch(`${API_URL}/student-payments/enrollment/${enrollmentId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch payments for enrollment. Status: ${response.status}`,
      response.status
    );
  }

  const data: StudentPayment[] = await response.json();
  return data;
};

/**
 * Create a new student payment
 */
export const createStudentPayment = async (
  payment: CreateStudentPaymentData
): Promise<StudentPayment> => {
  const response = await fetch(`${API_URL}/student-payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payment),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create student payment. Status: ${response.status}`;
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

  const data: StudentPayment = await response.json();
  return data;
};

/**
 * Update a student payment by ID
 */
export const updateStudentPayment = async (
  id: string,
  payment: UpdateStudentPaymentData
): Promise<StudentPayment> => {
  const response = await fetch(`${API_URL}/student-payments/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payment),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update student payment. Status: ${response.status}`;
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

  const data: StudentPayment = await response.json();
  return data;
};

/**
 * Delete a student payment by ID
 */
export const deleteStudentPayment = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/student-payments/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete student payment. Status: ${response.status}`;

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
 * Get student enrollments (for dropdown selection)
 */
export const getStudentEnrollments = async (): Promise<StudentEnrollment[]> => {
  const response = await fetch(`${API_URL}/students/enrollments`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch student enrollments. Status: ${response.status}`,
      response.status
    );
  }

  const data: StudentEnrollment[] = await response.json();
  return data;
};