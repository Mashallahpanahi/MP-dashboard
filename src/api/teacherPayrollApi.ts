// src/api/teacherPayrollApi.ts
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const PAYROLL_URL = `${API_URL}/teacher-payroll`;
const TEACHERS_URL = `${API_URL}/teachers`;

/* ================================================================== */
/* Types — inlined from src/types/teacherPayroll.ts                   */
/* ================================================================== */

export interface TeacherPayroll {
  id: string;
  teacherId: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
    salaryType: "Fixed" | "PerStudent";
    salaryAmount: number;
    feePercentage: number;
    hireDate: string;
    isActive: boolean;
  };
  month: number;
  year: number;
  baseSalary: number;
  paidAmount: number;
  remainingSalary: number;
  date: string;
  status: "Completed" | "Not Completed";
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherPayrollData {
  teacherId: string;
  month: number;
  year: number;
  baseSalary: number;
  paidAmount?: number;
  remainingSalary?: number;
  date?: string;
  status?: "Completed" | "Not Completed";
  notes?: string;
}

export interface UpdateTeacherPayrollData {
  teacherId?: string;
  month?: number;
  year?: number;
  baseSalary?: number;
  paidAmount?: number;
  remainingSalary?: number;
  date?: string;
  status?: "Completed" | "Not Completed";
  notes?: string;
}

export interface TeacherPayrollSummary {
  totalBaseSalary: number;
  totalPaidAmount: number;
  totalRemainingSalary: number;
  totalRecords: number;
  completedCount: number;
  notCompletedCount: number;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  salaryType: "Fixed" | "PerStudent";
  salaryAmount: number;
  feePercentage: number;
  isActive: boolean;
}

export interface AddPaymentData {
  amount: number;
  date?: string;
  notes?: string;
}

export interface UnpaidStudentDetail {
  studentId: string;
  studentName: string;
  studentLastName: string;
  finalFee: number;
  teacherShare: number;
}

export interface UnpaidSalaryRecord {
  teacherId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  salaryType: string;
  salaryAmount: number | string;
  feePercentage: number | string;
  hireDate: string;
  month: string;
  monthNumber?: number;
  year: number;
  monthKey: string;
  message: string;
  calculatedSalary?: number | null;
  enrolledStudents?: number | null;
  studentDetails?: UnpaidStudentDetail[] | null;
}

/* ================================================================== */
/* Inline helpers — same pattern + optional `select` transformer      */
/* ================================================================== */

const extractErrMessage = (err: any, fallback: string): string => {
  const m = err?.response?.data?.message;
  if (Array.isArray(m)) return m.join(", ");
  if (typeof m === "string") return m;
  return err?.message || fallback;
};

// Mirrors: Array.isArray(result) ? result : (result.data || [])
const asArray = <T>(r: any): T[] => (Array.isArray(r) ? r : r?.data ?? []);

// Mirrors: result.data || result
const asSingle = <T>(r: any): T => (r?.data ?? r) as T;

function useRawQuery<T>(
  url: string | null,
  enabled = true,
  select?: (raw: any) => T,
) {
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
      .get(url)
      .then((res) => {
        if (!alive) return;
        setData(select ? select(res.data) : (res.data as T));
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
    opts: { select?: (raw: any) => T } = {},
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await axios.request({
        method,
        url,
        headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
        data: body,
      });
      setData(opts.select ? opts.select(res.data) : (res.data as T));
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

/** GET /teacher-payroll/without-salary */
export const useUnpaidSalaries = () =>
  useRawQuery<UnpaidSalaryRecord[]>(
    `${PAYROLL_URL}/without-salary`,
    true,
    asArray<UnpaidSalaryRecord>,
  );

/** GET /teacher-payroll */
export const useTeacherPayrolls = () =>
  useRawQuery<TeacherPayroll[]>(
    PAYROLL_URL,
    true,
    asArray<TeacherPayroll>,
  );

/** GET /teacher-payroll/summary */
export const useTeacherPayrollSummary = () =>
  useRawQuery<TeacherPayrollSummary>(
    `${PAYROLL_URL}/summary`,
    true,
    asSingle<TeacherPayrollSummary>,
  );

/** GET /teacher-payroll/:id */
export const useTeacherPayrollById = (id: string, enabled = true) =>
  useRawQuery<TeacherPayroll>(
    id ? `${PAYROLL_URL}/${id}` : null,
    enabled && !!id,
    asSingle<TeacherPayroll>,
  );

/** GET /teacher-payroll/teacher/:teacherId */
export const usePayrollsByTeacher = (teacherId: string, enabled = true) =>
  useRawQuery<TeacherPayroll[]>(
    teacherId ? `${PAYROLL_URL}/teacher/${teacherId}` : null,
    enabled && !!teacherId,
    asArray<TeacherPayroll>,
  );

/** GET /teacher-payroll/status/:status */
export const usePayrollsByStatus = (status: string, enabled = true) =>
  useRawQuery<TeacherPayroll[]>(
    status ? `${PAYROLL_URL}/status/${status}` : null,
    enabled && !!status,
    asArray<TeacherPayroll>,
  );

/** GET /teachers — for dropdown selection */
export const useTeachers = () =>
  useRawQuery<Teacher[]>(TEACHERS_URL); // raw array, no select needed

/* ================================================================== */
/* Mutation hooks                                                     */
/* ================================================================== */

/** POST /teacher-payroll */
export const useCreateTeacherPayroll = () => {
  const { data, message, loading, error, send } = useRawMutation<TeacherPayroll>();
  const createTeacherPayroll = (payload: CreateTeacherPayrollData) =>
    send("post", PAYROLL_URL, payload, { select: asSingle<TeacherPayroll> });
  return { createData: data, message, loading, error, createTeacherPayroll };
};

/** PATCH /teacher-payroll/:id */
export const useUpdateTeacherPayroll = () => {
  const { data, message, loading, error, send } = useRawMutation<TeacherPayroll>();
  const updateTeacherPayroll = (id: string, payload: UpdateTeacherPayrollData) =>
    send("patch", `${PAYROLL_URL}/${id}`, payload, { select: asSingle<TeacherPayroll> });
  return { updateData: data, message, loading, error, updateTeacherPayroll };
};

/** PATCH /teacher-payroll/:id/add-payment */
export const useAddPaymentToPayroll = () => {
  const { data, message, loading, error, send } = useRawMutation<TeacherPayroll>();
  const addPaymentToPayroll = (id: string, payload: AddPaymentData) =>
    send("patch", `${PAYROLL_URL}/${id}/add-payment`, payload, {
      select: asSingle<TeacherPayroll>,
    });
  return { updateData: data, message, loading, error, addPaymentToPayroll };
};

/** DELETE /teacher-payroll/:id */
export const useDeleteTeacherPayroll = () => {
  const { data, message, loading, error, send } = useRawMutation<void>();
  const remove = (id: string) => send("delete", `${PAYROLL_URL}/${id}`);
  return { deleteData: data, message, loading, error, remove };
};