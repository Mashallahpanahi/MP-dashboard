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
  bookPrice: number; // This is a number in the type
  durationWeeks: number;
  totalLessons: number;
  totalHours: number;
  passingScore: number;
  isActive: boolean;
  levelOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookData {
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
  isActive: boolean;
}

export interface UpdateBookData extends Partial<CreateBookData> {
  id?: string;
}