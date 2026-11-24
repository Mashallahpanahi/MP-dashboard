// src/api/bookFeeApi.ts
import { useFetch } from "@/hooks/useFetch";
import { useCreate } from "@/hooks/useCreate";
import { useUpdate } from "@/hooks/useUpdate";
import { useDelete } from "@/hooks/useDelete";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const BOOK_FEES_URL = `${API_URL}/book-fees`;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface BookFee {
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
  fee: number;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookFeeData {
  bookId: string;
  fee: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateBookFeeData {
  bookId?: string;
  fee?: number;
  description?: string;
  isActive?: boolean;
}

/* ------------------------------------------------------------------ */
/* Query hooks                                                         */
/* ------------------------------------------------------------------ */

/** GET /book-fees — all book fees */
export const useBookFees = () => useFetch<BookFee[]>(BOOK_FEES_URL);

/** GET /book-fees/:id */
export const useBookFeeById = (id: string, enabled = true) =>
  useFetch<BookFee>(`${BOOK_FEES_URL}/${id}`, enabled && !!id);

/** GET /book-fees/book/:bookId */
export const useBookFeeByBook = (bookId: string, enabled = true) =>
  useFetch<BookFee>(`${BOOK_FEES_URL}/book/${bookId}`, enabled && !!bookId);

/* ------------------------------------------------------------------ */
/* Mutation hooks                                                      */
/* ------------------------------------------------------------------ */

/** POST /book-fees */
export const useCreateBookFee = () => useCreate<BookFee>(BOOK_FEES_URL);

/** PATCH /book-fees/:id */
export const useUpdateBookFee = () => useUpdate<BookFee>(BOOK_FEES_URL);

/** DELETE /book-fees/:id */
export const useDeleteBookFee = () => useDelete<BookFee>(BOOK_FEES_URL);

/**
 * PATCH /book-fees/:id/status
 *
 * `useUpdate` builds `${url}/${id}`, so pass `"<id>/status"` as the "id"
 * to hit the status endpoint.
 */
export const useUpdateBookFeeStatus = () => {
  const { update, ...rest } = useUpdate<BookFee>(BOOK_FEES_URL);

  const updateStatus = (id: string, isActive: boolean) =>
    update(`${id}/status`, { isActive });

  return { ...rest, updateStatus };
};