// src/api/studentApi.ts
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ================================================================== */
/* Types — inlined from src/types/student.ts + extras                 */
/* ================================================================== */

export interface Student {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string | null;
  gender: "Male" | "Female";
  phone: string;
  parentPhone: string | null;
  address: string | null;
  birthDate: string | null;
  registrationDate: string;
  status: "Active" | "Inactive" | "Graduated";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentData {
  studentNumber?: string;
  firstName: string;
  lastName?: string | null;
  gender: "Male" | "Female";
  phone?: string;
  parentPhone?: string | null;
  address?: string | null;
  birthDate?: string | null;
  status?: "Active" | "Inactive" | "Graduated";
  notes?: string | null;
}

export interface UpdateStudentData {
  studentNumber?: string;
  firstName?: string;
  lastName?: string | null;
  gender?: "Male" | "Female";
  phone?: string;
  parentPhone?: string | null;
  address?: string | null;
  birthDate?: string | null;
  status?: "Active" | "Inactive" | "Graduated";
  notes?: string | null;
}

export interface EnrollmentTeacher {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentBook {
  id: string;
  code: string;
  name: string;
  description: string;
  level: string;
  category: string;
  author: string;
  publisher: string;
  isbn: string;
  bookPrice: number;
  durationWeeks: number;
  totalLessons: number;
  totalHours: number;
  passingScore: number;
  isActive: boolean;
  levelOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentEnrollment {
  id: string;
  student: Student;
  teacher: EnrollmentTeacher;
  book: EnrollmentBook;
  timetable: string;
  tuitionFee: number;
  discount: number;
  finalFee: number;
  startDate: string;
  expectedEndDate: string;
  completedDate: string | null;
  status: "Studying" | "Completed" | "Dropped" | "Pending";
  finalScore: number;
  attendancePercentage: number;
  remarks: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEnrollmentData {
  studentId: string;
  teacherId: string;
  bookId: string;
  timetable: string;
  tuitionFee: number;
  discount?: number;
  finalFee?: number;
  startDate: string;
  expectedEndDate: string;
  remarks?: string;
}

export interface UpdateEnrollmentData {
  timetable?: string;
  discount?: number;
  remarks?: string;
  status?: "Studying" | "Completed" | "Dropped" | "Pending";
  finalScore?: number;
  attendancePercentage?: number;
}

export interface LevelUpInfo {
  previousEnrollment: StudentEnrollment | null;
  isEligible: boolean;
  nextBook: { id: string; name: string; code: string; level: string } | null;
  message: string;
}

export interface LevelUpResponse {
  newEnrollment: StudentEnrollment;
  message: string;
}

/* ---------- find-students-for-scoring ---------- */

export interface FindStudentsForScoringParams {
  teacherId: string;
  bookId: string;
  classId?: string;
  time?: string;
  fromDate?: string;
  toDate?: string;
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

/* ---------- bulk update scores ---------- */

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

/* ---------- filtered students ---------- */

export interface FilteredStudentEnrollment {
  id: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    salaryType: string;
  };
  book: { id: string; name: string; levelOrder: number; bookPrice: string };
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

/* ---------- paginated / unenrolled / search ---------- */

export interface SearchStudentResponse {
  success: boolean;
  message: string;
  data: Student | Student[];
  count?: number;
}

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

/* ================================================================== */
/* Inline helpers                                                     */
/* ================================================================== */

const extractErrMessage = (err: any, fallback: string): string => {
  const m = err?.response?.data?.message;
  if (Array.isArray(m)) return m.join(", ");
  if (typeof m === "string") return m;
  return err?.message || fallback;
};

/**
 * Query hook that returns the FULL response body as `data`.
 * Works for raw bodies (`Student[]`) AND wrapped bodies
 * (`{ success, message, data, filters, count, pagination }`).
 */
function useRawQuery<T>(url: string | null, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!url && enabled);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!enabled || !url) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);

    axios
      .get<T>(url)
      .then((res) => {
        if (alive) setData(res.data);
      })
      .catch((err) => {
        if (alive) setError(extractErrMessage(err, "Something went wrong"));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [url, trigger, enabled]);

  return { data, loading, error, refetch: () => setTrigger((n) => n + 1) };
}

/**
 * Mutation hook that returns the FULL response body as `data`.
 * Supports FormData, JSON, auth token injection, 401 logout,
 * and "200 OK but success:false" detection.
 */
function useRawMutation<T>() {
  const [data, setData] = useState<T | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (
    method: "post" | "patch" | "delete",
    url: string,
    body?: FormData | object,
    opts: { auth?: boolean; customErrorMap?: (m: string) => string } = {},
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const headers: Record<string, string> = { Accept: "application/json" };

      if (opts.auth) {
        const token = useAuthStore.getState().getToken();
        if (!token) {
          setError("You must be logged in. Please login again.");
          setLoading(false);
          return false;
        }
        headers["Authorization"] = `Bearer ${token}`;
      }

      const isFormData = body instanceof FormData;
      if (!isFormData && body !== undefined) {
        headers["Content-Type"] = "application/json";
      }

      const res = await axios.request<T>({ method, url, headers, data: body });

      // Some endpoints return 200 with success:false (e.g. bulk-update).
      const obj = res.data as any;
      if (obj && obj.success === false) {
        const rawMsg =
          typeof obj.message === "string" ? obj.message : "Request failed";
        setError(opts.customErrorMap ? opts.customErrorMap(rawMsg) : rawMsg);
        return false;
      }

      setData(res.data);
      setMessage(obj?.message ?? null);
      return true;
    } catch (err: any) {
      if (err?.response?.status === 401 && opts.auth) {
        useAuthStore.getState().logout();
        setError("Session expired. Please login again to continue.");
        return false;
      }
      const rawMsg = extractErrMessage(err, "Something went wrong");
      setError(opts.customErrorMap ? opts.customErrorMap(rawMsg) : rawMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { data, message, loading, error, send };
}

/* ================================================================== */
/* Query hooks                                                        */
/* ================================================================== */

/** GET /students */
export const useStudents = () => useRawQuery<Student[]>(`${API_URL}/students`);

/** GET /students/:id */
export const useStudentById = (id: string, enabled = true) =>
  useRawQuery<Student>(
    id ? `${API_URL}/students/${id}` : null,
    enabled && !!id,
  );

/** GET /students/search?q=... */
export const useSearchStudents = (query: string, enabled = true) =>
  useRawQuery<Student[]>(
    query ? `${API_URL}/students/search?q=${encodeURIComponent(query)}` : null,
    enabled && !!query,
  );

/** GET /students/:studentId/enrollments */
export const useStudentEnrollments = (studentId: string, enabled = true) =>
  useRawQuery<StudentEnrollment[]>(
    studentId ? `${API_URL}/students/${studentId}/enrollments` : null,
    enabled && !!studentId,
  );

/** GET /students/:studentId/level-up-info */
export const useLevelUpInfo = (studentId: string, enabled = true) =>
  useRawQuery<LevelUpInfo>(
    studentId ? `${API_URL}/students/${studentId}/level-up-info` : null,
    enabled && !!studentId,
  );

/** GET /filter-search-student/paginated */
export const usePaginatedStudents = (
  params: {
    page?: number;
    limit?: number;
    fromDate?: string;
    toDate?: string;
  } = {},
  enabled = true,
) => {
  const q = new URLSearchParams();
  q.append("page", String(params.page ?? 1));
  q.append("limit", String(params.limit ?? 20));
  if (params.fromDate) q.append("fromDate", params.fromDate);
  if (params.toDate) q.append("toDate", params.toDate);
  return useRawQuery<PaginatedStudentsResponse>(
    `${API_URL}/filter-search-student/paginated?${q.toString()}`,
    enabled,
  );
};

/** GET /filter-search-student/unenrolled */
export const useUnenrolledStudents = (
  params: { fromDate?: string; toDate?: string } = {},
  enabled = true,
) => {
  const q = new URLSearchParams();
  if (params.fromDate) q.append("fromDate", params.fromDate);
  if (params.toDate) q.append("toDate", params.toDate);
  const qs = q.toString();
  return useRawQuery<UnenrolledStudentsResponse>(
    `${API_URL}/filter-search-student/unenrolled${qs ? `?${qs}` : ""}`,
    enabled,
  );
};

/** GET /filter-search-student/search/name */
export const useSearchStudentsByName = (name: string, enabled = true) =>
  useRawQuery<UnenrolledStudentsResponse>(
    name
      ? `${API_URL}/filter-search-student/search/name?name=${encodeURIComponent(name)}`
      : null,
    enabled && !!name,
  );

/** GET /filter-search-student/search/student-number */
export const useSearchStudentByNumber = (
  studentNumber: string,
  enabled = true,
) =>
  useRawQuery<UnenrolledStudentsResponse>(
    studentNumber
      ? `${API_URL}/filter-search-student/search/student-number?studentNumber=${encodeURIComponent(studentNumber)}`
      : null,
    enabled && !!studentNumber,
  );

/** GET /filter-search-student/filter */
export const useFilteredStudents = (
  params: FilterStudentsParams = {},
  enabled = true,
) => {
  const q = new URLSearchParams();
  if (params.teacherId) q.append("teacherId", params.teacherId);
  if (params.bookId) q.append("bookId", params.bookId);
  if (params.time) q.append("time", params.time);
  if (params.fromDate) q.append("fromDate", params.fromDate);
  if (params.toDate) q.append("toDate", params.toDate);
  const qs = q.toString();
  return useRawQuery<FilteredStudentsResponse>(
    `${API_URL}/filter-search-student/filter${qs ? `?${qs}` : ""}`,
    enabled,
  );
};

/** GET /add-students-scores/find-students */
export const useFindStudentsForScoring = (
  params: FindStudentsForScoringParams,
  enabled = true,
) => {
  const q = new URLSearchParams();
  q.append("teacherId", params.teacherId);
  q.append("bookId", params.bookId);
  if (params.classId) q.append("classId", params.classId);
  if (params.time) q.append("time", params.time);
  if (params.fromDate) q.append("fromDate", params.fromDate);
  if (params.toDate) q.append("toDate", params.toDate);
  return useRawQuery<FindStudentsForScoringResponse>(
    `${API_URL}/add-students-scores/find-students?${q.toString()}`,
    enabled && !!params.teacherId && !!params.bookId,
  );
};

/* ================================================================== */
/* Mutation hooks                                                     */
/* ================================================================== */

/** POST /students  (FormData + auth + 401 logout) */
export const useCreateStudent = () => {
  const { data, message, loading, error, send } = useRawMutation<Student>();

  const createStudent = (formData: FormData) =>
    send("post", `${API_URL}/students`, formData, {
      auth: true,
      customErrorMap: (m) => {
        const lower = m.toLowerCase();
        if (m.includes("duplicate") && lower.includes("studentnumber"))
          return "This student number is already registered. Please use a different number.";
        if (m.includes("duplicate") && lower.includes("phone"))
          return "This phone number is already registered. Please use a different phone number.";
        if (lower.includes("phone"))
          return "Phone number must start with 07 and be 10 digits.";
        if (lower.includes("image"))
          return "Student image is required. Please upload a valid image file (jpg, jpeg, png).";
        return m;
      },
    });

  return { createData: data, message, loading, error, createStudent };
};

/** PATCH /students/:id  (FormData or JSON) */
export const useUpdateStudent = () => {
  const { data, message, loading, error, send } = useRawMutation<Student>();

  const updateStudent = (id: string, body: FormData | UpdateStudentData) =>
    send("patch", `${API_URL}/students/${id}`, body, {
      customErrorMap: (m) => {
        const lower = m.toLowerCase();
        if (m.includes("duplicate") && lower.includes("phone"))
          return "This phone number is already registered by another student. Please use a different phone number.";
        if (m.includes("not found"))
          return "Student not found. Please refresh and try again.";
        return m;
      },
    });

  return { updateData: data, message, loading, error, updateStudent };
};

/** DELETE /students/:id */
export const useDeleteStudent = () => {
  const { data, message, loading, error, send } = useRawMutation<void>();
  const remove = (id: string) => send("delete", `${API_URL}/students/${id}`);
  return { deleteData: data, message, loading, error, remove };
};

/** POST /students/enroll */
export const useEnrollStudent = () => {
  const { data, message, loading, error, send } =
    useRawMutation<StudentEnrollment>();
  const enrollStudent = (enrollment: CreateEnrollmentData) =>
    send("post", `${API_URL}/students/enroll`, enrollment, {
      customErrorMap: (m) =>
        m.includes("already enrolled")
          ? "This student is already enrolled in this course."
          : m,
    });
  return { createData: data, message, loading, error, enrollStudent };
};

/** PATCH /students/enrollments/:enrollmentId */
export const useUpdateEnrollment = () => {
  const { data, message, loading, error, send } =
    useRawMutation<StudentEnrollment>();
  const updateEnrollment = (
    enrollmentId: string,
    enrollment: UpdateEnrollmentData,
  ) =>
    send(
      "patch",
      `${API_URL}/students/enrollments/${enrollmentId}`,
      enrollment,
    );
  return { updateData: data, message, loading, error, updateEnrollment };
};

/** POST /students/level-up */
export const useLevelUpStudent = () => {
  const { data, message, loading, error, send } =
    useRawMutation<LevelUpResponse>();
  const levelUpStudent = (studentId: string) =>
    send(
      "post",
      `${API_URL}/students/level-up`,
      { studentId },
      {
        customErrorMap: (m) => {
          if (m.includes("not eligible"))
            return "Student is not eligible for level up. Please check prerequisites.";
          if (m.includes("no next book"))
            return "No next book available for level up.";
          return m;
        },
      },
    );
  return { levelUpData: data, message, loading, error, levelUpStudent };
};

/** POST /add-students-scores/bulk-update */
export const useBulkUpdateStudentScores = () => {
  const { data, message, loading, error, send } =
    useRawMutation<BulkUpdateScoresResponse>();
  const bulkUpdate = (scores: BulkScoreItem[]) =>
    send("post", `${API_URL}/add-students-scores/bulk-update`, { scores });
  return { bulkUpdateData: data, message, loading, error, bulkUpdate };
};
