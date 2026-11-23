// src/api/teacherApi.ts
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const TEACHERS_URL = `${API_URL}/teachers`;

/* ================================================================== */
/* ApiError — KEPT HERE. Every other api file imports it.            */
/* ================================================================== */

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

/* ================================================================== */
/* Types — inlined from src/types/teacher.ts                          */
/* ================================================================== */

export interface Teacher {
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

export interface CreateTeacherData {
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  email?: string;   // optional (per types/teacher.ts)
  address?: string; // optional (per types/teacher.ts)
  salaryType: string;
  salaryAmount: number;
  feePercentage: number;
  hireDate: string;
  isActive: boolean;
}

export interface UpdateTeacherData extends Partial<CreateTeacherData> {
  id?: string;
}

/* ================================================================== */
/* Inline helpers (same pattern as studentApi / etc.)                 */
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
/* Shared error mapper — preserves the old Prisma-constraint logic   */
/* ================================================================== */

const mapTeacherConstraintError = (msg: string, verb: "registered" | "registeredByAnother"): string => {
  const lower = msg.toLowerCase();
  const isPhone =
    msg.includes("UQ_9c5ae9e15a042292bb8d83ca34c") ||
    (lower.includes("duplicate key") && lower.includes("phone"));
  const isEmail =
    msg.includes("UQ_6c6e1c4b7c9c8e9d2f8e9d2f8e9d2f8e") ||
    (lower.includes("duplicate key") && lower.includes("email"));

  if (isPhone) {
    return verb === "registered"
      ? "This phone number is already registered. Please use a different phone number."
      : "This phone number is already registered by another teacher. Please use a different phone number.";
  }
  if (isEmail) {
    return verb === "registered"
      ? "This email address is already registered. Please use a different email address."
      : "This email address is already registered by another teacher. Please use a different email address.";
  }
  if (lower.includes("duplicate key") && (lower.includes("phone") || lower.includes("email"))) {
    return "The phone number or email address is already registered. Please use unique values.";
  }
  return msg;
};

/* ================================================================== */
/* Query hooks                                                        */
/* ================================================================== */

/** GET /teachers */
export const useTeachers = () => useRawQuery<Teacher[]>(TEACHERS_URL);

/** GET /teachers/active */
export const useActiveTeachers = () =>
  useRawQuery<Teacher[]>(`${TEACHERS_URL}/active`);

/** GET /teachers/:id */
export const useTeacherById = (id: string, enabled = true) =>
  useRawQuery<Teacher>(id ? `${TEACHERS_URL}/${id}` : null, enabled && !!id);

/* ================================================================== */
/* Mutation hooks                                                     */
/* ================================================================== */

/** POST /teachers */
export const useCreateTeacher = () => {
  const { data, message, loading, error, send } = useRawMutation<Teacher>();

  const createTeacher = (teacher: CreateTeacherData) =>
    send("post", TEACHERS_URL, teacher, {
      customErrorMap: (m) => mapTeacherConstraintError(m, "registered"),
    });

  return { createData: data, message, loading, error, createTeacher };
};

/** PATCH /teachers/:id */
export const useUpdateTeacher = () => {
  const { data, message, loading, error, send } = useRawMutation<Teacher>();

  const updateTeacher = (id: string, teacher: Partial<CreateTeacherData>) =>
    send("patch", `${TEACHERS_URL}/${id}`, teacher, {
      customErrorMap: (m) => mapTeacherConstraintError(m, "registeredByAnother"),
    });

  return { updateData: data, message, loading, error, updateTeacher };
};

/** DELETE /teachers/:id */
export const useDeleteTeacher = () => {
  const { data, message, loading, error, send } = useRawMutation<void>();
  const remove = (id: string) => send("delete", `${TEACHERS_URL}/${id}`);
  return { deleteData: data, message, loading, error, remove };
};

/**
 * PATCH /teachers/:id/status
 *
 * Endpoint is a sub-path (`/status`), so we build the full URL directly
 * rather than going through the generic `useUpdate` trick.
 */
export const useUpdateTeacherStatus = () => {
  const { data, message, loading, error, send } = useRawMutation<Teacher>();

  const updateStatus = (id: string, isActive: boolean) =>
    send("patch", `${TEACHERS_URL}/${id}/status`, { isActive });

  return { updateData: data, message, loading, error, updateStatus };
};