// src/api/studentApi.ts
import type {
  Student,
  CreateStudentData,
  UpdateStudentData,
  StudentEnrollment,
  CreateEnrollmentData,
  UpdateEnrollmentData,
  LevelUpInfo,
  LevelUpResponse,
} from "@/types/student";
import { ApiError } from "./teacherApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ============================================
// STUDENT CRUD OPERATIONS
// ============================================

/**
 * Get all students
 * GET /students
 */
export const getStudents = async (): Promise<Student[]> => {
  const response = await fetch(`${API_URL}/students`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch students. Status: ${response.status}`,
      response.status
    );
  }

  const data: Student[] = await response.json();
  return data;
};

/**
 * Get a single student by ID
 * GET /students/{id}
 */
export const getStudentById = async (id: string): Promise<Student> => {
  const response = await fetch(`${API_URL}/students/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch student. Status: ${response.status}`,
      response.status
    );
  }

  const data: Student = await response.json();
  return data;
};

/**
 * Create a new student with image upload
 * POST /students
 * Uses FormData for file upload
 */
export const createStudent = async (
  data: FormData
): Promise<Student> => {
  const response = await fetch(`${API_URL}/students`, {
    method: "POST",
    body: data, // FormData for file upload - DO NOT set Content-Type header
  });

  if (!response.ok) {
    let errorMessage = `Failed to create student. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;

      if (errorData.message && typeof errorData.message === 'string') {
        if (errorData.message.includes('duplicate') && 
            errorData.message.toLowerCase().includes('studentnumber')) {
          errorMessage = 'This student number is already registered. Please use a different number.';
        } else if (errorData.message.includes('duplicate') && 
                   errorData.message.toLowerCase().includes('phone')) {
          errorMessage = 'This phone number is already registered. Please use a different phone number.';
        } else if (errorData.message.toLowerCase().includes('phone')) {
          errorMessage = 'Phone number must start with 07 and be 10 digits.';
        } else if (errorData.message.toLowerCase().includes('image')) {
          errorMessage = 'Student image is required. Please upload a valid image file (jpg, jpeg, png).';
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

  const result: Student = await response.json();
  return result;
};

/**
 * Update a student by ID
 * PATCH /students/{id}
 */
// src/api/studentApi.ts - Update the updateStudent function

/**
 * ✅ FIXED: Update a student by ID - Supports both FormData (with image) and JSON
 * PATCH /students/{id}
 */
export const updateStudent = async (
  id: string,
  data: FormData | UpdateStudentData
): Promise<Student> => {
  const isFormData = data instanceof FormData;
  
  console.log('🔵 updateStudent called with ID:', id);
  console.log('🔵 isFormData:', isFormData);

  // ✅ For FormData, DON'T set Content-Type header (browser sets it with boundary)
  const headers: HeadersInit = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}/students/${id}`, {
    method: "PATCH",
    headers: headers,
    body: isFormData ? data : JSON.stringify(data),
  });

  console.log('🟡 Response status:', response.status);

  if (!response.ok) {
    let errorMessage = `Failed to update student. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;
      console.log('🔴 Error response:', errorData);

      if (errorData.message && typeof errorData.message === 'string') {
        if (errorData.message.includes('duplicate') && 
            errorData.message.toLowerCase().includes('phone')) {
          errorMessage = 'This phone number is already registered by another student. Please use a different phone number.';
        } else if (errorData.message.includes('not found')) {
          errorMessage = 'Student not found. Please refresh and try again.';
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

  const updatedStudent: Student = await response.json();
  console.log('🟢 Update successful:', updatedStudent);
  return updatedStudent;
};
/**
 * Delete a student by ID
 * DELETE /students/{id}
 */
export const deleteStudent = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/students/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete student. Status: ${response.status}`;

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
 * Search students by name, phone, or studentNumber
 * GET /students/search
 */
export const searchStudents = async (query: string): Promise<Student[]> => {
  const response = await fetch(`${API_URL}/students/search?q=${encodeURIComponent(query)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to search students. Status: ${response.status}`,
      response.status
    );
  }

  const data: Student[] = await response.json();
  return data;
};

// ============================================
// ENROLLMENT OPERATIONS
// ============================================

/**
 * Get all enrollments of a student
 * GET /students/{studentId}/enrollments
 */
export const getStudentEnrollments = async (studentId: string): Promise<StudentEnrollment[]> => {
  const response = await fetch(`${API_URL}/students/${studentId}/enrollments`, {
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
 * Enroll a student in a new course (first registration)
 * POST /students/enroll
 */
export const enrollStudent = async (
  enrollment: CreateEnrollmentData
): Promise<StudentEnrollment> => {
  const response = await fetch(`${API_URL}/students/enroll`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(enrollment),
  });

  if (!response.ok) {
    let errorMessage = `Failed to enroll student. Status: ${response.status}`;
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

  const data: StudentEnrollment = await response.json();
  return data;
};

/**
 * Update an enrollment
 * PATCH /students/enrollments/{enrollmentId}
 */
export const updateEnrollment = async (
  enrollmentId: string,
  enrollment: UpdateEnrollmentData
): Promise<StudentEnrollment> => {
  const response = await fetch(`${API_URL}/students/enrollments/${enrollmentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(enrollment),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update enrollment. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;

      if (errorData.message && typeof errorData.message === 'string') {
        if (Array.isArray(errorData.message)) {
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

  const data: StudentEnrollment = await response.json();
  return data;
};

// ============================================
// LEVEL UP OPERATIONS
// ============================================

/**
 * Get info for level-up (previous enrollment, eligibility, next book)
 * GET /students/{studentId}/level-up-info
 */
export const getLevelUpInfo = async (studentId: string): Promise<LevelUpInfo> => {
  const response = await fetch(`${API_URL}/students/${studentId}/level-up-info`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to get level-up info. Status: ${response.status}`,
      response.status
    );
  }

  const data: LevelUpInfo = await response.json();
  return data;
};

/**
 * Level up a student (automatically finds the next book)
 * POST /students/level-up
 */
export const levelUpStudent = async (studentId: string): Promise<LevelUpResponse> => {
  const response = await fetch(`${API_URL}/students/level-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ studentId }),
  });

  if (!response.ok) {
    let errorMessage = `Failed to level up student. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;

      if (errorData.message && typeof errorData.message === 'string') {
        if (errorData.message.includes('not eligible')) {
          errorMessage = 'Student is not eligible for level up. Please check prerequisites.';
        } else if (errorData.message.includes('no next book')) {
          errorMessage = 'No next book available for level up.';
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

  const data: LevelUpResponse = await response.json();
  return data;
};