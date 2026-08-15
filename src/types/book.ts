// src/types/book.ts

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
  code?: string;           // Optional
  name: string;            // Required
  levelOrder: number;      // Required
  durationWeeks: number;   // Required
  passingScore: number;    // Required
  description?: string;    // Optional
  level?: string;          // Optional
  category?: string;       // Optional
  author?: string;         // Optional
  publisher?: string;      // Optional
  isbn?: string;           // Optional
  bookPrice?: number;      // Optional
  totalLessons?: number;   // Optional
  totalHours?: number;     // Optional
  isActive?: boolean;      // Optional
}

export interface UpdateBookData extends Partial<CreateBookData> {
  id?: string;
}