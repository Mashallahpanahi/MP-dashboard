// src/api/bookApi.ts
import { useFetch } from "@/hooks/useFetch";
import { useCreate } from "@/hooks/useCreate";
import { useUpdate } from "@/hooks/useUpdate";
import { useDelete } from "@/hooks/useDelete";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const BOOKS_URL = `${API_URL}/books`;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface Book {
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
  levelOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookData {
  code?: string;
  name: string;
  levelOrder: number;
  durationWeeks: number;
  passingScore: number;
  description?: string;
  level?: string;
  category?: string;
  author?: string;
  publisher?: string;
  isbn?: string;
  bookPrice?: number;
  totalLessons?: number;
  totalHours?: number;
  isActive?: boolean;
}

export interface UpdateBookData extends Partial<CreateBookData> {
  id?: string;
}

/* ------------------------------------------------------------------ */
/* Query hooks                                                         */
/* ------------------------------------------------------------------ */

/** GET /books — all books (including inactive) */
export const useBooks = () => useFetch<Book[]>(BOOKS_URL);

/** GET /books/active — active books only */
export const useActiveBooks = () => useFetch<Book[]>(`${BOOKS_URL}/active`);

/** GET /books/level/:levelOrder */
export const useBooksByLevel = (levelOrder: number, enabled = true) =>
  useFetch<Book[]>(`${BOOKS_URL}/level/${levelOrder}`, enabled);

/** GET /books/:id */
export const useBookById = (id: string, enabled = true) =>
  useFetch<Book>(`${BOOKS_URL}/${id}`, enabled && !!id);

/* ------------------------------------------------------------------ */
/* Mutation hooks                                                      */
/* ------------------------------------------------------------------ */

/** POST /books */
export const useCreateBook = () => useCreate<Book>(BOOKS_URL);

/** PATCH /books/:id */
export const useUpdateBook = () => useUpdate<Book>(BOOKS_URL);

/** DELETE /books/:id */
export const useDeleteBook = () => useDelete<Book>(BOOKS_URL);

/**
 * PATCH /books/:id/status
 *
 * `useUpdate` appends `/${id}` to the base URL, so we pass `"<id>/status"`
 * as the "id" to hit the correct route.
 */
export const useUpdateBookStatus = () => {
  const { update, ...rest } = useUpdate<Book>(BOOKS_URL);

  const updateStatus = (id: string, isActive: boolean) =>
    update(`${id}/status`, { isActive });

  return { ...rest, updateStatus };
};