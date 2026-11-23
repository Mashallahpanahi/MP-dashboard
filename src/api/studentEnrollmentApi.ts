// src/api/studentEnrollmentApi.ts
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const BASE_URL = `${API_URL}/student-enrollment-payment`;

/* ================================================================== */
/* Types — inlined from src/types/studentEnrollment.ts               */
/* ================================================================== */

export interface StudentEnrollment {
  id: string;
  studentId: string;
  bookId: string;
  classId: string;
  teacherId: string;
  startDate: string;
  endDate: string;
  time: string | null;
  status: "Studying" | "Completed" | "Dropped" | "Pending";
  result: "Passed" | "Failed" | "Pending" | "In Progress";
  fee: number;
  discount: number;
  finalFee: number;
  date: string;
  paymentStatus: "Paid" | "Pending" | "Partially Paid" | "Overdue";
  score: number | null;
  scoreDate: string | null;
  scoreTime: string | null;
  scoreNotes: string | null;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    studentNumber: string;
    phone: string;
  };
  book: {
    id: string;
    name: string;
    code: string;
    level: string;
    levelOrder: number;
  };
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  class: {
    id: string;
    name: string;
    block: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnrollmentWithPaymentData {
  studentId: string;
  bookId: string;
  classId: string;
  teacherId: string;
  startDate: string;
  endDate: string;
  time?: string;
  status?: "Studying" | "Completed" | "Dropped" | "Pending";
  result?: "Passed" | "Failed" | "Pending" | "In Progress";
  fee: number;
  discount?: number;
  finalFee: number;
  date: string;
  paymentStatus?: "Paid" | "Pending" | "Partially Paid" | "Overdue";
  score?: number;
  scoreDate?: string;
  scoreTime?: string;
  scoreNotes?: string;
}

export interface UpdateEnrollmentData {
  studentId?: string;
  bookId?: string;
  classId?: string;
  teacherId?: string;
  startDate?: string;
  endDate?: string;
  time?: string;
  status?: "Studying" | "Completed" | "Dropped" | "Pending";
  result?: "Passed" | "Failed" | "Pending" | "In Progress";
}

export interface UpdatePaymentData {
  fee?: number;
  discount?: number;
  finalFee?: number;
  date?: string;
  paymentStatus?: "Paid" | "Pending" | "Partially Paid" | "Overdue";
}

export interface UpdateScoreData {
  score?: number;
  scoreDate?: string;
  scoreTime?: string;
  scoreNotes?: string;
}

export interface UpdateBothData {
  studentId?: string;
  bookId?: string;
  classId?: string;
  teacherId?: string;
  startDate?: string;
  endDate?: string;
  time?: string;
  status?: "Studying" | "Completed" | "Dropped" | "Pending";
  result?: "Passed" | "Failed" | "Pending" | "In Progress";
  fee?: number;
  discount?: number;
  finalFee?: number;
  date?: string;
  paymentStatus?: "Paid" | "Pending" | "Partially Paid" | "Overdue";
}

export interface ScoreData {
  id: string;
  enrollmentId: string;
  score: number;
  scoreDate: string;
  scoreTime: string;
  scoreNotes: string;
}

/* ---------- enrollment history ---------- */

export interface EnrollmentScore {
  id: string;
  midtermScore: string | number | null;
  finalScore: string | number | null;
  totalScore: string | number | null;
  scoreDate: string | null;
  scoreTime: string | null;
  scoreNotes: string | null;
}

export interface EnrollmentHistoryRecord {
  enrollmentId: string;
  studentId: string;
  studentNumber: string;
  studentName: string;
  studentLastName: string;
  teacherId: string;
  teacherName: string;
  teacherLastName: string;
  bookId: string;
  bookName: string;
  bookLevelOrder: number;
  classId: string;
  className: string;
  classBlock: string;
  time: string;
  startDate: string;
  endDate: string;
  enrollmentStatus: string;
  result: string;
  fee: string | number;
  discount: string | number;
  finalFee: string | number;
  paymentDate: string;
  paymentStatus: string;
  score: EnrollmentScore | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentHistorySummary {
  totalEnrollments: number;
  totalAmount: number;
  paidCount: number;
  pendingCount: number;
  scoredCount: number;
  averageTotalScore: number;
}

export interface EnrollmentHistoryStudent {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  phone: string;
  image: string | null;
  fatherName: string | null;
  fatherPhone: string | null;
  gender: string;
  status: string;
  notes: string | null;
}

export interface EnrollmentHistoryResponse {
  success: boolean;
  message: string;
  count: number;
  data: {
    student: EnrollmentHistoryStudent;
    summary: EnrollmentHistorySummary;
    history: EnrollmentHistoryRecord[];
  };
}

/* ================================================================== */
/* Inline helpers (same as studentApi.ts)                             */
/* ================================================================== */

const extractErrMessage = (err: any, fallback: string): string => {
  const m = err?.response?.data?.message;
  if (Array.isArray(m)) return m.join(", ");
  if (typeof m === "string") return m;
  return err?.message || fallback;
};

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

function useRawMutation<T>() {
  const [data, setData] = useState<T | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (
    method: "post" | "patch" | "delete",
    url: string,
    body?: Record<string, unknown>,
    opts: { customErrorMap?: (m: string) => string } = {},
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await axios.request<T>({
        method,
        url,
        headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
        data: body,
      });
      setData(res.data);
      setMessage((res.data as any)?.message ?? null);
      return true;
    } catch (err: any) {
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

/** GET /student-enrollment-payment/history/student/:studentId */
export const useEnrollmentHistory = (studentId: string, enabled = true) =>
  useRawQuery<EnrollmentHistoryResponse>(
    studentId ? `${BASE_URL}/history/student/${studentId}` : null,
    enabled && !!studentId,
  );

/** GET /student-enrollment-payment */
export const useEnrollments = () => useRawQuery<StudentEnrollment[]>(BASE_URL);

/** GET /student-enrollment-payment/:id */
export const useEnrollmentById = (id: string, enabled = true) =>
  useRawQuery<StudentEnrollment>(id ? `${BASE_URL}/${id}` : null, enabled && !!id);

/** GET /student-enrollment-payment/student/:studentId */
export const useEnrollmentsByStudent = (studentId: string, enabled = true) =>
  useRawQuery<StudentEnrollment[]>(
    studentId ? `${BASE_URL}/student/${studentId}` : null,
    enabled && !!studentId,
  );

/** GET /student-enrollment-payment/:id/score */
export const useScoreByEnrollment = (id: string, enabled = true) =>
  useRawQuery<ScoreData>(id ? `${BASE_URL}/${id}/score` : null, enabled && !!id);

/** GET /student-enrollment-payment/scores/student/:studentId */
export const useScoresByStudent = (studentId: string, enabled = true) =>
  useRawQuery<ScoreData[]>(
    studentId ? `${BASE_URL}/scores/student/${studentId}` : null,
    enabled && !!studentId,
  );

/* ================================================================== */
/* Mutation hooks                                                     */
/* ================================================================== */

/** POST /student-enrollment-payment */
export const useCreateEnrollmentWithPayment = () => {
  const { data, message, loading, error, send } = useRawMutation<StudentEnrollment>();

  const createEnrollmentWithPayment = (payload: CreateEnrollmentWithPaymentData) =>
    send("post", BASE_URL, payload, {
      customErrorMap: (m) =>
        m.includes("already enrolled")
          ? "This student is already enrolled in this course."
          : m,
    });

  return { createData: data, message, loading, error, createEnrollmentWithPayment };
};

/** DELETE /student-enrollment-payment/:id */
export const useDeleteEnrollment = () => {
  const { data, message, loading, error, send } = useRawMutation<void>();
  const remove = (id: string) => send("delete", `${BASE_URL}/${id}`);
  return { deleteData: data, message, loading, error, remove };
};

/** PATCH /student-enrollment-payment/:id/enrollment */
export const useUpdateEnrollmentOnly = () => {
  const { data, message, loading, error, send } = useRawMutation<StudentEnrollment>();
  const updateEnrollmentOnly = (id: string, payload: UpdateEnrollmentData) =>
    send("patch", `${BASE_URL}/${id}/enrollment`, payload);
  return { updateData: data, message, loading, error, updateEnrollmentOnly };
};

/** PATCH /student-enrollment-payment/:id/payment */
export const useUpdatePaymentOnly = () => {
  const { data, message, loading, error, send } = useRawMutation<StudentEnrollment>();
  const updatePaymentOnly = (id: string, payload: UpdatePaymentData) =>
    send("patch", `${BASE_URL}/${id}/payment`, payload);
  return { updateData: data, message, loading, error, updatePaymentOnly };
};

/** PATCH /student-enrollment-payment/:id/score */
export const useUpdateScoreOnly = () => {
  const { data, message, loading, error, send } = useRawMutation<StudentEnrollment>();
  const updateScoreOnly = (id: string, payload: UpdateScoreData) =>
    send("patch", `${BASE_URL}/${id}/score`, payload);
  return { updateData: data, message, loading, error, updateScoreOnly };
};

/** PATCH /student-enrollment-payment/:id/both */
export const useUpdateBoth = () => {
  const { data, message, loading, error, send } = useRawMutation<StudentEnrollment>();
  const updateBoth = (id: string, payload: UpdateBothData) =>
    send("patch", `${BASE_URL}/${id}/both`, payload);
  return { updateData: data, message, loading, error, updateBoth };
};