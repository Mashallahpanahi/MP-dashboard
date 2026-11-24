// src/api/otherExpenseApi.ts
import { useFetch } from "@/hooks/useFetch";
import { useCreate } from "@/hooks/useCreate";
import { useUpdate } from "@/hooks/useUpdate";
import { useDelete } from "@/hooks/useDelete";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const OTHER_EXPENSES_URL = `${API_URL}/other-expenses`;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface OtherExpense {
  id: string;
  amount: number | string;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOtherExpenseData {
  amount: number;
  description: string;
  date: string;
}

export interface UpdateOtherExpenseData {
  amount?: number;
  description?: string;
  date?: string;
}

export interface LastMonthTotal {
  month: string;
  monthNumber: number;
  year: number;
  fromDate: string;
  toDate: string;
  totalExpenses: number;
  count: number;
  expenses: OtherExpense[];
}

export interface ExpenseHistory {
  fromDate: string;
  toDate: string;
  totalExpenses: number;
  count: number;
  expenses: OtherExpense[];
}

/* ------------------------------------------------------------------ */
/* Query hooks                                                         */
/* ------------------------------------------------------------------ */

/** GET /other-expenses */
export const useOtherExpenses = () =>
  useFetch<OtherExpense[]>(OTHER_EXPENSES_URL);

/** GET /other-expenses/total-last-month */
export const useTotalLastMonth = () =>
  useFetch<LastMonthTotal>(`${OTHER_EXPENSES_URL}/total-last-month`);

/** GET /other-expenses/history?fromDate=…&toDate=… */
export const useExpenseHistory = (
  params: { fromDate: string; toDate: string },
  enabled = true,
) => {
  const q = new URLSearchParams({
    fromDate: params.fromDate,
    toDate: params.toDate,
  }).toString();

  return useFetch<ExpenseHistory>(
    `${OTHER_EXPENSES_URL}/history?${q}`,
    enabled && !!params.fromDate && !!params.toDate,
  );
};

/** GET /other-expenses/:id */
export const useOtherExpenseById = (id: string, enabled = true) =>
  useFetch<OtherExpense>(`${OTHER_EXPENSES_URL}/${id}`, enabled && !!id);

/* ------------------------------------------------------------------ */
/* Mutation hooks                                                      */
/* ------------------------------------------------------------------ */

/** POST /other-expenses */
export const useCreateOtherExpense = () =>
  useCreate<OtherExpense>(OTHER_EXPENSES_URL);

/** PATCH /other-expenses/:id */
export const useUpdateOtherExpense = () =>
  useUpdate<OtherExpense>(OTHER_EXPENSES_URL);

/** DELETE /other-expenses/:id */
export const useDeleteOtherExpense = () =>
  useDelete<OtherExpense>(OTHER_EXPENSES_URL);