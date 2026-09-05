// src/api/studentEnrollmentApi.ts
import type {
  StudentEnrollment,
  CreateEnrollmentWithPaymentData,
  UpdateEnrollmentData,
  UpdatePaymentData,
  UpdateScoreData,
  UpdateBothData,
  ScoreData
} from "@/types/studentEnrollment";
import { ApiError } from "./teacherApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Create enrollment with payment (and optional score)
 * POST /student-enrollment-payment
 */
export const createEnrollmentWithPayment = async (
  data: CreateEnrollmentWithPaymentData
): Promise<StudentEnrollment> => {
  const response = await fetch(`${API_URL}/student-enrollment-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create enrollment. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;

      if (errorData.message && typeof errorData.message === 'string') {
        if (errorData.message.includes('already enrolled')) {
          errorMessage = 'This student is already enrolled in this course.';
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

  const result: StudentEnrollment = await response.json();
  return result;
};

/**
 * Get all enrollments with payments and scores
 * GET /student-enrollment-payment
 */
export const getEnrollments = async (): Promise<StudentEnrollment[]> => {
  const response = await fetch(`${API_URL}/student-enrollment-payment`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch enrollments. Status: ${response.status}`,
      response.status
    );
  }

  const data: StudentEnrollment[] = await response.json();
  return data;
};

/**
 * Get enrollment by ID with payment and score
 * GET /student-enrollment-payment/{id}
 */
export const getEnrollmentById = async (id: string): Promise<StudentEnrollment> => {
  const response = await fetch(`${API_URL}/student-enrollment-payment/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch enrollment. Status: ${response.status}`,
      response.status
    );
  }

  const data: StudentEnrollment = await response.json();
  return data;
};

/**
 * Get enrollments by student ID
 * GET /student-enrollment-payment/student/{studentId}
 */
export const getEnrollmentsByStudent = async (studentId: string): Promise<StudentEnrollment[]> => {
  const response = await fetch(`${API_URL}/student-enrollment-payment/student/${studentId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch enrollments for student. Status: ${response.status}`,
      response.status
    );
  }

  const data: StudentEnrollment[] = await response.json();
  return data;
};

/**
 * Delete enrollment, payment and score
 * DELETE /student-enrollment-payment/{id}
 */
export const deleteEnrollment = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/student-enrollment-payment/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete enrollment. Status: ${response.status}`;

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
 * Update enrollment only
 * PATCH /student-enrollment-payment/{id}/enrollment
 */
export const updateEnrollmentOnly = async (
  id: string,
  data: UpdateEnrollmentData
): Promise<StudentEnrollment> => {
  const response = await fetch(`${API_URL}/student-enrollment-payment/${id}/enrollment`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update enrollment. Status: ${response.status}`;
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

  const result: StudentEnrollment = await response.json();
  return result;
};

/**
 * Update payment only
 * PATCH /student-enrollment-payment/{id}/payment
 */
export const updatePaymentOnly = async (
  id: string,
  data: UpdatePaymentData
): Promise<StudentEnrollment> => {
  const response = await fetch(`${API_URL}/student-enrollment-payment/${id}/payment`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update payment. Status: ${response.status}`;
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

  const result: StudentEnrollment = await response.json();
  return result;
};

/**
 * Update score only
 * PATCH /student-enrollment-payment/{id}/score
 */
export const updateScoreOnly = async (
  id: string,
  data: UpdateScoreData
): Promise<StudentEnrollment> => {
  const response = await fetch(`${API_URL}/student-enrollment-payment/${id}/score`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update score. Status: ${response.status}`;
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

  const result: StudentEnrollment = await response.json();
  return result;
};

/**
 * Get score by enrollment ID
 * GET /student-enrollment-payment/{id}/score
 */
export const getScoreByEnrollment = async (id: string): Promise<ScoreData> => {
  const response = await fetch(`${API_URL}/student-enrollment-payment/${id}/score`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch score. Status: ${response.status}`,
      response.status
    );
  }

  const data: ScoreData = await response.json();
  return data;
};

/**
 * Get all scores by student ID
 * GET /student-enrollment-payment/scores/student/{studentId}
 */
export const getScoresByStudent = async (studentId: string): Promise<ScoreData[]> => {
  const response = await fetch(`${API_URL}/student-enrollment-payment/scores/student/${studentId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch scores for student. Status: ${response.status}`,
      response.status
    );
  }

  const data: ScoreData[] = await response.json();
  return data;
};

/**
 * Update both enrollment and payment
 * PATCH /student-enrollment-payment/{id}/both
 */
export const updateBoth = async (
  id: string,
  data: UpdateBothData
): Promise<StudentEnrollment> => {
  const response = await fetch(`${API_URL}/student-enrollment-payment/${id}/both`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update enrollment and payment. Status: ${response.status}`;
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

  const result: StudentEnrollment = await response.json();
  return result;
};