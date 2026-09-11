// src/api/scoreApi.ts
import { ApiError } from "./teacherApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ============================================
// TYPES
// ============================================

export interface StudentScore {
  id: string;
  studentId: string;
  bookId: string;
  teacherId: string;
  midtermScore: number;
  finalScore: number;
  totalScore: number;
  date: string;
  time: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  // Enriched fields
  student?: any;
  book?: any;
  teacher?: any;
}

export interface CreateStudentScoreData {
  studentId: string;
  bookId: string;
  teacherId: string;
  midtermScore?: number;
  finalScore?: number;
  totalScore?: number;
  date?: string;
  time?: string;
  notes?: string;
}

export interface UpdateStudentScoreData {
  midtermScore?: number;
  finalScore?: number;
  totalScore?: number;
  date?: string;
  time?: string;
  notes?: string;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get all student scores
 * GET /student-scores
 */
export const getStudentScores = async (): Promise<StudentScore[]> => {
  const response = await fetch(`${API_URL}/student-scores`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch student scores. Status: ${response.status}`,
      response.status
    );
  }

  const result = await response.json();
  // Handle the response structure: { success, message, data, count }
  return result.data || result;
};

/**
 * Get scores by student ID
 * GET /student-scores/student/{studentId}
 */
export const getScoresByStudent = async (studentId: string): Promise<StudentScore[]> => {
  const response = await fetch(`${API_URL}/student-scores/student/${studentId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch student scores. Status: ${response.status}`,
      response.status
    );
  }

  const result = await response.json();
  // Handle the response structure: { success, message, data, count }
  return result.data || result;
};

/**
 * Get student score by ID
 * GET /student-scores/{id}
 */
export const getStudentScoreById = async (id: string): Promise<StudentScore> => {
  const response = await fetch(`${API_URL}/student-scores/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch student score. Status: ${response.status}`,
      response.status
    );
  }

  const result = await response.json();
  return result.data || result;
};

/**
 * Get scores by book ID
 * GET /student-scores/book/{bookId}
 */
export const getScoresByBook = async (bookId: string): Promise<StudentScore[]> => {
  const response = await fetch(`${API_URL}/student-scores/book/${bookId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch book scores. Status: ${response.status}`,
      response.status
    );
  }

  const result = await response.json();
  return result.data || result;
};

/**
 * Get scores by teacher ID
 * GET /student-scores/teacher/{teacherId}
 */
export const getScoresByTeacher = async (teacherId: string): Promise<StudentScore[]> => {
  const response = await fetch(`${API_URL}/student-scores/teacher/${teacherId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch teacher scores. Status: ${response.status}`,
      response.status
    );
  }

  const result = await response.json();
  return result.data || result;
};

/**
 * Create a new student score
 * POST /student-scores
 */
export const createStudentScore = async (
  data: CreateStudentScoreData
): Promise<StudentScore> => {
  const response = await fetch(`${API_URL}/student-scores`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create student score. Status: ${response.status}`;
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
 * Bulk create student scores
 * POST /student-scores/bulk
 */
export const bulkCreateStudentScores = async (
  data: CreateStudentScoreData[]
): Promise<StudentScore[]> => {
  const response = await fetch(`${API_URL}/student-scores/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to bulk create student scores. Status: ${response.status}`;
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
 * Update a student score
 * PATCH /student-scores/{id}
 */
export const updateStudentScore = async (
  id: string,
  data: UpdateStudentScoreData
): Promise<StudentScore> => {
  const response = await fetch(`${API_URL}/student-scores/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update student score. Status: ${response.status}`;
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
 * Delete a student score
 * DELETE /student-scores/{id}
 */
export const deleteStudentScore = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/student-scores/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete student score. Status: ${response.status}`;

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