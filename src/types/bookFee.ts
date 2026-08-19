// src/types/bookFee.ts

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