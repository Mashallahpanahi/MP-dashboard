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
import { useAuthStore } from "@/store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";




// ============================================
// ADD STUDENTS SCORES
// ============================================

export interface FindStudentsForScoringParams {
  teacherId: string;       // required
  bookId: string;          // required
  classId?: string;        // optional
  time?: string;           // optional
  fromDate?: string;       // optional
  toDate?: string;         // optional
}

export interface StudentForScoring {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentLastName: string;
  studentNumber: string;
  studentImage: string | null;
  studentFatherName: string | null;
  teacherId: string;
  teacherName: string;
  teacherLastName: string;
  bookId: string;
  bookName: string;
  bookLevelOrder: number;
  passingScore: number;
  classId: string | null;
  className: string | null;
  classBlock: string | null;
  time: string | null;
  startDate: string;
  endDate: string;
  enrollmentStatus: string;
  result: string;
  midtermScore: number | null;
  finalScore: number | null;
  totalScore: number | null;
  scoreId: string | null;
}

export interface FindStudentsForScoringResponse {
  success: boolean;
  message: string;
  count: number;
  filters: {
    teacherId: string;
    bookId: string;
    classId: string | null;
    time: string | null;
    fromDate: string | null;
    toDate: string | null;
  };
  data: StudentForScoring[];
}

/**
 * Find students for scoring
 * GET /add-students-scores/find-students
 */
export const findStudentsForScoring = async (
  params: FindStudentsForScoringParams
): Promise<FindStudentsForScoringResponse> => {
  const query = new URLSearchParams();
  query.append("teacherId", params.teacherId);
  query.append("bookId", params.bookId);
  if (params.classId) query.append("classId", params.classId);
  if (params.time) query.append("time", params.time);
  if (params.fromDate) query.append("fromDate", params.fromDate);
  if (params.toDate) query.append("toDate", params.toDate);

  const response = await fetch(
    `${API_URL}/add-students-scores/find-students?${query.toString()}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    let errorMessage = `Failed to find students. Status: ${response.status}`;
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


// ============================================
// BULK UPDATE STUDENT SCORES
// ============================================

export interface BulkScoreItem {
  studentId: string;
  bookId: string;
  teacherId: string;
  midtermScore?: number | null;
  finalScore?: number | null;
  notes?: string;
}

export interface BulkUpdateScoresResponse {
  success: boolean;
  message: string;
  data?: any;
  count?: number;
}

/**
 * Bulk update (or create) student scores
 * POST /add-students-scores/bulk-update
 */
export const bulkUpdateStudentScores = async (
  scores: BulkScoreItem[]
): Promise<BulkUpdateScoresResponse> => {
  const response = await fetch(`${API_URL}/add-students-scores/bulk-update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scores }),
  });

  const result = await response.json();

  if (!response.ok || result.success === false) {
    const errorMessage =
      result?.message || `Failed to update scores. Status: ${response.status}`;
    throw new ApiError(errorMessage, response.status, result);
  }

  return result;
};

// ============================================
// FILTERED STUDENTS (Advanced Filter)
// ============================================

export interface FilteredStudentEnrollment {
  id: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    salaryType: string;
  };
  book: {
    id: string;
    name: string;
    levelOrder: number;
    bookPrice: string;
  };
  classId: string;
  time: string;
  startDate: string;
  endDate: string;
  status: string;
  result: string;
  payment: {
    id: string;
    fee: string;
    discount: string;
    finalFee: string;
    status: string;
    date: string;
  } | null;
}

export interface FilteredStudent {
  student: Student;
  enrollments: FilteredStudentEnrollment[];
}

export interface FilteredStudentsResponse {
  success: boolean;
  message: string;
  data: FilteredStudent[];
  count: number;
  filters: {
    teacherId: string | null;
    bookId: string | null;
    time: string | null;
    fromDate: string | null;
    toDate: string | null;
  };
}

export interface FilterStudentsParams {
  teacherId?: string;
  bookId?: string;
  time?: string;
  fromDate?: string;
  toDate?: string;
}

/**
 * Filter students with optional filters (teacher, book, time, date range)
 * GET /filter-search-student/filter
 *
 * All filters are OPTIONAL. Only students with enrollments will be returned.
 *
 * @param params - Filter parameters (all optional)
 */
export const getFilteredStudents = async (
  params: FilterStudentsParams
): Promise<FilteredStudentsResponse> => {
  const query = new URLSearchParams();
  if (params.teacherId) query.append("teacherId", params.teacherId);
  if (params.bookId) query.append("bookId", params.bookId);
  if (params.time) query.append("time", params.time);
  if (params.fromDate) query.append("fromDate", params.fromDate);
  if (params.toDate) query.append("toDate", params.toDate);

  const queryString = query.toString();
  const url = queryString
    ? `${API_URL}/filter-search-student/filter?${queryString}`
    : `${API_URL}/filter-search-student/filter`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const { message, details } = await extractErrorMessage(
      response,
      `Failed to filter students. Status: ${response.status}`
    );
    throw new ApiError(message, response.status, details);
  }

  return response.json();
};

export interface SearchStudentResponse {
  success: boolean;
  message: string;
  data: Student | Student[];
  count?: number;
}
// ============================================
// RESPONSE TYPES
// ============================================

export interface PaginatedStudentsResponse {
  success: boolean;
  message: string;
  data: Student[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnenrolledStudentsResponse {
  success: boolean;
  message: string;
  data: Student[];
  count: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract a readable error message from an API error response
 */
const extractErrorMessage = async (
  response: Response,
  defaultMessage: string
): Promise<{ message: string; details: unknown }> => {
  let errorMessage = defaultMessage;
  let errorDetails = null;

  try {
    const errorData = await response.json();
    errorDetails = errorData;

    if (errorData.message) {
      if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      } else if (typeof errorData.message === "string") {
        errorMessage = errorData.message;
      }
    }
  } catch {
    // Keep default error message if JSON parsing fails
  }

  return { message: errorMessage, details: errorDetails };
};

// ============================================
// FILTER & SEARCH OPERATIONS
// ============================================

/**
 * Get all students with pagination
 * GET /filter-search-student/paginated
 *
 * @param page - Page number (default: 1)
 * @param limit - Number of students per page (default: 20)
 * @param fromDate - Optional start date (YYYY-MM-DD)
 * @param toDate - Optional end date (YYYY-MM-DD)
 */
export const getPaginatedStudents = async (
  page: number = 1,
  limit: number = 20,
  fromDate?: string,
  toDate?: string
): Promise<PaginatedStudentsResponse> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (fromDate) params.append("fromDate", fromDate);
  if (toDate) params.append("toDate", toDate);

  const response = await fetch(
    `${API_URL}/filter-search-student/paginated?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const { message, details } = await extractErrorMessage(
      response,
      `Failed to fetch paginated students. Status: ${response.status}`
    );
    throw new ApiError(message, response.status, details);
  }

  return response.json();
};

/**
 * Get all unenrolled students (not enrolled in any course)
 * GET /filter-search-student/unenrolled
 *
 * @param fromDate - Optional start date (YYYY-MM-DD)
 * @param toDate - Optional end date (YYYY-MM-DD)
 */
export const getUnenrolledStudents = async (
  fromDate?: string,
  toDate?: string
): Promise<UnenrolledStudentsResponse> => {
  const params = new URLSearchParams();
  if (fromDate) params.append("fromDate", fromDate);
  if (toDate) params.append("toDate", toDate);

  const queryString = params.toString();
  const url = queryString
    ? `${API_URL}/filter-search-student/unenrolled?${queryString}`
    : `${API_URL}/filter-search-student/unenrolled`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const { message, details } = await extractErrorMessage(
      response,
      `Failed to fetch unenrolled students. Status: ${response.status}`
    );
    throw new ApiError(message, response.status, details);
  }

  return response.json();
};

/**
 * Search students by name (fuzzy search - handles spelling mistakes)
 * GET /filter-search-student/search/name
 *
 * @param name - Name to search for
 */
export const searchStudentsByName = async (
  name: string
): Promise<UnenrolledStudentsResponse> => {
  const response = await fetch(
    `${API_URL}/filter-search-student/search/name?name=${encodeURIComponent(
      name
    )}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const { message, details } = await extractErrorMessage(
      response,
      `Failed to search students. Status: ${response.status}`
    );
    throw new ApiError(message, response.status, details);
  }

  return response.json();
};

/**
 * Search student by student number
 * GET /filter-search-student/search/student-number
 *
 * @param studentNumber - Student number to search for
 */
export const searchStudentByNumber = async (
  studentNumber: string
): Promise<UnenrolledStudentsResponse> => {
  const response = await fetch(
    `${API_URL}/filter-search-student/search/student-number?studentNumber=${encodeURIComponent(
      studentNumber
    )}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const { message, details } = await extractErrorMessage(
      response,
      `Failed to search student. Status: ${response.status}`
    );
    throw new ApiError(message, response.status, details);
  }

  return response.json();
};

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
 *
 * @param id - Student ID
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
 * Requires Bearer token in Authorization header.
 *
 * @param data - FormData containing student data + image
 */
export const createStudent = async (data: FormData): Promise<Student> => {
  // ✅ Get a valid (non-expired) token from the store
  const token = useAuthStore.getState().getToken();

  if (!token) {
    throw new ApiError(
      "You must be logged in to register a student. Please login again.",
      401
    );
  }

  const response = await fetch(`${API_URL}/students`, {
    method: "POST",
    headers: {
      // ✅ DO NOT set Content-Type — browser sets it with boundary for FormData
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: data,
  });

  if (!response.ok) {
    // If token expired on the server side → force logout
    if (response.status === 401) {
      useAuthStore.getState().logout();
      throw new ApiError(
        "Session expired. Please login again to continue.",
        401
      );
    }

    let errorMessage = `Failed to create student. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;

      if (errorData.message && typeof errorData.message === "string") {
        if (
          errorData.message.includes("duplicate") &&
          errorData.message.toLowerCase().includes("studentnumber")
        ) {
          errorMessage =
            "This student number is already registered. Please use a different number.";
        } else if (
          errorData.message.includes("duplicate") &&
          errorData.message.toLowerCase().includes("phone")
        ) {
          errorMessage =
            "This phone number is already registered. Please use a different phone number.";
        } else if (errorData.message.toLowerCase().includes("phone")) {
          errorMessage = "Phone number must start with 07 and be 10 digits.";
        } else if (errorData.message.toLowerCase().includes("image")) {
          errorMessage =
            "Student image is required. Please upload a valid image file (jpg, jpeg, png).";
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
 * Supports both FormData (with image) and JSON
 *
 * @param id - Student ID
 * @param data - FormData (with image) or UpdateStudentData (JSON)
 */
export const updateStudent = async (
  id: string,
  data: FormData | UpdateStudentData
): Promise<Student> => {
  const isFormData = data instanceof FormData;

  console.log("🔵 updateStudent called with ID:", id);
  console.log("🔵 isFormData:", isFormData);

  // For FormData, DON'T set Content-Type header (browser sets it with boundary)
  const headers: HeadersInit = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}/students/${id}`, {
    method: "PATCH",
    headers: headers,
    body: isFormData ? data : JSON.stringify(data),
  });

  console.log("🟡 Response status:", response.status);

  if (!response.ok) {
    let errorMessage = `Failed to update student. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;
      console.log("🔴 Error response:", errorData);

      if (errorData.message && typeof errorData.message === "string") {
        if (
          errorData.message.includes("duplicate") &&
          errorData.message.toLowerCase().includes("phone")
        ) {
          errorMessage =
            "This phone number is already registered by another student. Please use a different phone number.";
        } else if (errorData.message.includes("not found")) {
          errorMessage = "Student not found. Please refresh and try again.";
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
  console.log("🟢 Update successful:", updatedStudent);
  return updatedStudent;
};

/**
 * Delete a student by ID
 * DELETE /students/{id}
 *
 * @param id - Student ID
 */
export const deleteStudent = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/students/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const { message } = await extractErrorMessage(
      response,
      `Failed to delete student. Status: ${response.status}`
    );
    throw new ApiError(message, response.status);
  }
};

/**
 * Search students by name, phone, or studentNumber
 * GET /students/search
 *
 * @param query - Search query
 */
export const searchStudents = async (query: string): Promise<Student[]> => {
  const response = await fetch(
    `${API_URL}/students/search?q=${encodeURIComponent(query)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

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
 *
 * @param studentId - Student ID
 */
export const getStudentEnrollments = async (
  studentId: string
): Promise<StudentEnrollment[]> => {
  const response = await fetch(
    `${API_URL}/students/${studentId}/enrollments`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

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
 *
 * @param enrollment - Enrollment data
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

      if (errorData.message && typeof errorData.message === "string") {
        if (errorData.message.includes("already enrolled")) {
          errorMessage = "This student is already enrolled in this course.";
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
 *
 * @param enrollmentId - Enrollment ID
 * @param enrollment - Updated enrollment data
 */
export const updateEnrollment = async (
  enrollmentId: string,
  enrollment: UpdateEnrollmentData
): Promise<StudentEnrollment> => {
  const response = await fetch(
    `${API_URL}/students/enrollments/${enrollmentId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(enrollment),
    }
  );

  if (!response.ok) {
    const { message, details } = await extractErrorMessage(
      response,
      `Failed to update enrollment. Status: ${response.status}`
    );
    throw new ApiError(message, response.status, details);
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
 *
 * @param studentId - Student ID
 */
export const getLevelUpInfo = async (
  studentId: string
): Promise<LevelUpInfo> => {
  const response = await fetch(
    `${API_URL}/students/${studentId}/level-up-info`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

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
 *
 * @param studentId - Student ID
 */
export const levelUpStudent = async (
  studentId: string
): Promise<LevelUpResponse> => {
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

      if (errorData.message && typeof errorData.message === "string") {
        if (errorData.message.includes("not eligible")) {
          errorMessage =
            "Student is not eligible for level up. Please check prerequisites.";
        } else if (errorData.message.includes("no next book")) {
          errorMessage = "No next book available for level up.";
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