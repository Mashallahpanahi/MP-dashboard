// src/api/monthlyFeeApi.ts
import { useFetch } from "@/hooks/useFetch";
import { useCreate } from "@/hooks/useCreate";
import { useUpdate } from "@/hooks/useUpdate";
import { useDelete } from "@/hooks/useDelete";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const MONTHLY_FEES_URL = `${API_URL}/monthly-fees`;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface MonthlyFee {
  id: string;
  bookId: string;
  book: {
    id: string;
    code: string;
    name: string;
    levelOrder: number;
    durationWeeks: number;
    passingScore: number;
    description: string;
    level: string;
    category: string;
    author: string;
    publisher: string;
    isbn: string;
    bookPrice: number;
    totalLessons: number;
    totalHours: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  month: number;
  fee: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMonthlyFeeData {
  bookId: string;
  month: number;
  fee: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateMonthlyFeeData {
  bookId?: string;
  month?: number;
  fee?: number;
  description?: string;
  isActive?: boolean;
}

export interface BulkCreateMonthlyFeeData {
  bookId: string;
  month: number;
  fee: number;
  description?: string;
  isActive?: boolean;
}

/* ------------------------------------------------------------------ */
/* Query hooks                                                         */
/* ------------------------------------------------------------------ */

/** GET /monthly-fees — all monthly fees */
export const useMonthlyFees = () => useFetch<MonthlyFee[]>(MONTHLY_FEES_URL);

/** GET /monthly-fees/active — active monthly fees only */
export const useActiveMonthlyFees = () =>
  useFetch<MonthlyFee[]>(`${MONTHLY_FEES_URL}/active`);

/** GET /monthly-fees/month/:month */
export const useMonthlyFeesByMonth = (month: number, enabled = true) =>
  useFetch<MonthlyFee[]>(
    `${MONTHLY_FEES_URL}/month/${month}`,
    enabled && month > 0,
  );

/** GET /monthly-fees/book/:bookId */
export const useMonthlyFeesByBook = (bookId: string, enabled = true) =>
  useFetch<MonthlyFee[]>(
    `${MONTHLY_FEES_URL}/book/${bookId}`,
    enabled && !!bookId,
  );

/** GET /monthly-fees/payment — fees shaped for payment calculation */
export const useFeeForPayment = () =>
  useFetch<MonthlyFee[]>(`${MONTHLY_FEES_URL}/payment`);

/** GET /monthly-fees/:id */
export const useMonthlyFeeById = (id: string, enabled = true) =>
  useFetch<MonthlyFee>(`${MONTHLY_FEES_URL}/${id}`, enabled && !!id);

/* ------------------------------------------------------------------ */
/* Mutation hooks                                                      */
/* ------------------------------------------------------------------ */

/** POST /monthly-fees */
export const useCreateMonthlyFee = () =>
  useCreate<MonthlyFee>(MONTHLY_FEES_URL);

/** POST /monthly-fees/bulk — response is an array of created fees */
export const useBulkCreateMonthlyFees = () =>
  useCreate<MonthlyFee[]>(`${MONTHLY_FEES_URL}/bulk`);

/** PATCH /monthly-fees/:id */
export const useUpdateMonthlyFee = () =>
  useUpdate<MonthlyFee>(MONTHLY_FEES_URL);

/** DELETE /monthly-fees/:id */
export const useDeleteMonthlyFee = () =>
  useDelete<MonthlyFee>(MONTHLY_FEES_URL);
