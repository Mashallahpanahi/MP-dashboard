// src/api/classApi.ts
import { useFetch } from "@/hooks/useFetch";
import { useCreate } from "@/hooks/useCreate";
import { useUpdate } from "@/hooks/useUpdate";
import { useDelete } from "@/hooks/useDelete";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const CLASSES_URL = `${API_URL}/classes`;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface Class {
  id: string;
  className: string;
  block: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassData {
  className: string;
  block?: string | null;
  isActive?: boolean;
}

export interface UpdateClassData extends Partial<CreateClassData> {
  id?: string;
}

/* ------------------------------------------------------------------ */
/* Query hooks                                                         */
/* ------------------------------------------------------------------ */

/** GET /classes — all classes */
export const useClasses = () => useFetch<Class[]>(CLASSES_URL);

/** GET /classes/active — active classes only */
export const useActiveClasses = () => useFetch<Class[]>(`${CLASSES_URL}/active`);

/** GET /classes/:id */
export const useClassById = (id: string, enabled = true) =>
  useFetch<Class>(`${CLASSES_URL}/${id}`, enabled && !!id);

/* ------------------------------------------------------------------ */
/* Mutation hooks                                                      */
/* ------------------------------------------------------------------ */

/** POST /classes */
export const useCreateClass = () => useCreate<Class>(CLASSES_URL);

/** PATCH /classes/:id */
export const useUpdateClass = () => useUpdate<Class>(CLASSES_URL);

/** DELETE /classes/:id */
export const useDeleteClass = () => useDelete<Class>(CLASSES_URL);

/**
 * PATCH /classes/:id/status
 *
 * `useUpdate` builds `${url}/${id}`, so pass `"<id>/status"` as the "id"
 * to hit the status endpoint.
 */
export const useUpdateClassStatus = () => {
  const { update, ...rest } = useUpdate<Class>(CLASSES_URL);

  const updateStatus = (id: string, isActive: boolean) =>
    update(`${id}/status`, { isActive });

  return { ...rest, updateStatus };
};