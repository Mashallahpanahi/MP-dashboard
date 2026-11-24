// src/api/scoreApi.ts
import { useFetch } from "@/hooks/useFetch";
import { useCreate } from "@/hooks/useCreate";
import { useUpdate } from "@/hooks/useUpdate";
import { useDelete } from "@/hooks/useDelete";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const SCORES_URL = `${API_URL}/student-scores`;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface StudentScore {
  id: string;
  studentId: string;
  bookId: string;
  teacherId: string;
  midtermScore: number;
  finalScore: number;
  totalScore: number;
  date: string;
  time: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  // Enriched fields
  student?: any;
  book?: any;
  teacher?: any;
}

export interface CreateStudentScoreData {
  studentId: string;
  bookId: string;
  teacherId: string;
  midtermScore?: number;
  finalScore?: number;
  totalScore?: number;
  date?: string;
  time?: string;
  notes?: string;
}

export interface UpdateStudentScoreData {
  midtermScore?: number;
  finalScore?: number;
  totalScore?: number;
  date?: string;
  time?: string;
  notes?: string;
}

/* ------------------------------------------------------------------ */
/* Query hooks                                                         */
/* ------------------------------------------------------------------ */

/** GET /student-scores — all scores */
export const useStudentScores = () =>
  useFetch<StudentScore[]>(SCORES_URL);

/** GET /student-scores/student/:studentId */
export const useScoresByStudent = (studentId: string, enabled = true) =>
  useFetch<StudentScore[]>(
    `${SCORES_URL}/student/${studentId}`,
    enabled && !!studentId,
  );

/** GET /student-scores/:id */
export const useStudentScoreById = (id: string, enabled = true) =>
  useFetch<StudentScore>(`${SCORES_URL}/${id}`, enabled && !!id);

/** GET /student-scores/book/:bookId */
export const useScoresByBook = (bookId: string, enabled = true) =>
  useFetch<StudentScore[]>(
    `${SCORES_URL}/book/${bookId}`,
    enabled && !!bookId,
  );

/** GET /student-scores/teacher/:teacherId */
export const useScoresByTeacher = (teacherId: string, enabled = true) =>
  useFetch<StudentScore[]>(
    `${SCORES_URL}/teacher/${teacherId}`,
    enabled && !!teacherId,
  );

/* ------------------------------------------------------------------ */
/* Mutation hooks                                                      */
/* ------------------------------------------------------------------ */

/** POST /student-scores */
export const useCreateStudentScore = () =>
  useCreate<StudentScore>(SCORES_URL);

/** POST /student-scores/bulk — response is an array of created scores */
export const useBulkCreateStudentScores = () =>
  useCreate<StudentScore[]>(`${SCORES_URL}/bulk`);

/** PATCH /student-scores/:id */
export const useUpdateStudentScore = () =>
  useUpdate<StudentScore>(SCORES_URL);

/** DELETE /student-scores/:id */
export const useDeleteStudentScore = () =>
  useDelete<StudentScore>(SCORES_URL);