// src/api/noteApi.ts
import { useFetch } from "@/hooks/useFetch";
import { useCreate } from "@/hooks/useCreate";
import { useUpdate } from "@/hooks/useUpdate";
import { useDelete } from "@/hooks/useDelete";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const NOTES_URL = `${API_URL}/nodes`; // backend route is /nodes — kept as-is

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotesListResponse {
  success: boolean;
  message: string;
  data: Note[];
  count: number;
}

export interface NoteResponse {
  success?: boolean;
  message?: string;
  data?: Note;
  id?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* ------------------------------------------------------------------ */
/* Query hooks                                                         */
/* ------------------------------------------------------------------ */

/** GET /nodes — all notes */
export const useNotes = () => useFetch<Note[]>(NOTES_URL);

/* ------------------------------------------------------------------ */
/* Mutation hooks                                                      */
/* ------------------------------------------------------------------ */

/** POST /nodes — payload: { content: string } */
export const useCreateNote = () => useCreate<Note>(NOTES_URL);

/** PATCH /nodes/:id — payload: { content: string } */
export const useUpdateNote = () => useUpdate<Note>(NOTES_URL);

/** DELETE /nodes/:id */
export const useDeleteNote = () => useDelete<Note>(NOTES_URL);