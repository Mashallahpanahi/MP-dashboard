// src/api/studentPaymentApi.ts
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const PAYMENTS_URL = `${API_URL}/student-payments`;
const STUDENT_ENROLLMENTS_URL = `${API_URL}/students/enrollments`;

/* ================================================================== */
/* Types — inlined from src/types/studentPayment.ts                   */
/* ================================================================== */

export interface StudentPayment {
  id: string;
  studentEnrollment: {
    id: string;
    student: {
      id: string;
      studentNumber: string;
      firstName: string;
      lastName: string;
      gender: string;
      phone: string;
      parentPhone: string;
      address: string;
      birthDate: string;
      registrationDate: string;
      status: string;
      notes: string;
    };
    teacher: {
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
    };
    book: {
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
    };
    timetable: string;
    tuitionFee: number;
    discount: number;
    finalFee: number;
    startDate: string;
    expectedEndDate: string;
    completedDate: string;
    status: string;
    finalScore: number;
    attendancePercentage: number;
    remarks: string;
  };
  amount: number;
  discount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentDate: string;
  paymentMethod: "Cash" | "Bank" | "Online" | "Cheque";
  receiptNumber: string;
  status: "Paid" | "Partial" | "Unpaid" | "Overdue";
  notes: string;
}

export interface CreateStudentPaymentData {
  studentEnrollmentId: string;
  amount: number;
  discount?: number;
  paidAmount: number;
  paymentDate: string;
  paymentMethod: "Cash" | "Bank" | "Online" | "Cheque";
  receiptNumber?: string;
  status: "Paid" | "Partial" | "Unpaid" | "Overdue";
  notes?: string;
}

export interface UpdateStudentPaymentData extends Partial<CreateStudentPaymentData> {
  id?: string;
}

export interface StudentEnrollment {
  id: string;
  student: {
    id: string;
    studentNumber: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  book: {
    id: string;
    code: string;
    name: string;
    level: string;
  };
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  };
  tuitionFee: number;
  discount: number;
  finalFee: number;
  status: string;
  startDate: string;
  expectedEndDate: string;
}

/* ================================================================== */
/* Inline helpers (same pattern as studentApi / studentEnrollmentApi) */
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
      setError(extractErrMessage(err, "Something went wrong"));
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

/** GET /student-payments */
export const useStudentPayments = () =>
  useRawQuery<StudentPayment[]>(PAYMENTS_URL);

/** GET /student-payments/:id */
export const useStudentPaymentById = (id: string, enabled = true) =>
  useRawQuery<StudentPayment>(
    id ? `${PAYMENTS_URL}/${id}` : null,
    enabled && !!id,
  );

/** GET /student-payments/enrollment/:enrollmentId */
export const usePaymentsByEnrollment = (enrollmentId: string, enabled = true) =>
  useRawQuery<StudentPayment[]>(
    enrollmentId ? `${PAYMENTS_URL}/enrollment/${enrollmentId}` : null,
    enabled && !!enrollmentId,
  );

/** GET /students/enrollments — for dropdown selection */
export const useStudentEnrollments = () =>
  useRawQuery<StudentEnrollment[]>(STUDENT_ENROLLMENTS_URL);

/* ================================================================== */
/* Mutation hooks                                                     */
/* ================================================================== */

/** POST /student-payments */
export const useCreateStudentPayment = () => {
  const { data, message, loading, error, send } = useRawMutation<StudentPayment>();
  const createStudentPayment = (payment: CreateStudentPaymentData) =>
    send("post", PAYMENTS_URL, payment);
  return { createData: data, message, loading, error, createStudentPayment };
};

/** PATCH /student-payments/:id */
export const useUpdateStudentPayment = () => {
  const { data, message, loading, error, send } = useRawMutation<StudentPayment>();
  const updateStudentPayment = (id: string, payment: UpdateStudentPaymentData) =>
    send("patch", `${PAYMENTS_URL}/${id}`, payment);
  return { updateData: data, message, loading, error, updateStudentPayment };
};

/** DELETE /student-payments/:id */
export const useDeleteStudentPayment = () => {
  const { data, message, loading, error, send } = useRawMutation<void>();
  const remove = (id: string) => send("delete", `${PAYMENTS_URL}/${id}`);
  return { deleteData: data, message, loading, error, remove };
};