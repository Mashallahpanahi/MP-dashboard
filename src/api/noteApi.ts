// src/api/noteApi.ts
import { ApiError } from "./teacherApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ============================================
// TYPES
// ============================================
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

// ============================================
// GET ALL NOTES
// ============================================
export const getNotes = async (): Promise<Note[]> => {
  const response = await fetch(`${API_URL}/nodes`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch notes. Status: ${response.status}`,
      response.status
    );
  }

  const result: NotesListResponse | Note[] = await response.json();

  // Handle both shapes:
  //   1. { success, message, data: [...] }
  //   2. [ ... ]  (raw array)
  if (Array.isArray(result)) return result;
  return result.data || [];
};

// ============================================
// CREATE NOTE
// ============================================
export const createNote = async (content: string): Promise<Note> => {
  const response = await fetch(`${API_URL}/nodes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create note. Status: ${response.status}`;
    try {
      const err = await response.json();
      if (err.message) errorMessage = err.message;
    } catch {
      /* keep default */
    }
    throw new ApiError(errorMessage, response.status);
  }

  const result: NoteResponse = await response.json();

  // Handle both response shapes (wrapped or raw)
  if (result.data) return result.data;
  return result as unknown as Note;
};

// ============================================
// UPDATE NOTE
// ============================================
export const updateNote = async (
  id: string,
  content: string
): Promise<Note> => {
  const response = await fetch(`${API_URL}/nodes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update note. Status: ${response.status}`;
    try {
      const err = await response.json();
      if (err.message) errorMessage = err.message;
    } catch {
      /* keep default */
    }
    throw new ApiError(errorMessage, response.status);
  }

  const result: NoteResponse = await response.json();
  if (result.data) return result.data;
  return result as unknown as Note;
};

// ============================================
// DELETE NOTE
// ============================================
export const deleteNote = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/nodes/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete note. Status: ${response.status}`;
    try {
      const err = await response.json();
      if (err.message) errorMessage = err.message;
    } catch {
      /* keep default */
    }
    throw new ApiError(errorMessage, response.status);
  }
};