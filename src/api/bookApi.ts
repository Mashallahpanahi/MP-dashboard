// src/api/bookApi.ts
import type { Book, CreateBookData, UpdateBookData } from "@/types/book";
import { ApiError } from "./teacherApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Get all books
 */
export const getBooks = async (): Promise<Book[]> => {
  const response = await fetch(`${API_URL}/books`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch books. Status: ${response.status}`,
      response.status
    );
  }

  const data: Book[] = await response.json();
  return data;
};

/**
 * Get a single book by ID
 */
export const getBookById = async (id: string): Promise<Book> => {
  const response = await fetch(`${API_URL}/books/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch book. Status: ${response.status}`,
      response.status
    );
  }

  const data: Book = await response.json();
  return data;
};

/**
 * Create a new book
 */
export const createBook = async (book: CreateBookData): Promise<Book> => {
  const response = await fetch(`${API_URL}/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(book),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create book. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;

      if (errorData.message && typeof errorData.message === 'string') {
        // Check for duplicate code error
        if (errorData.message.includes('duplicate') && 
            errorData.message.toLowerCase().includes('code')) {
          errorMessage = 'This book code is already registered. Please use a different code.';
        }
        // Check for duplicate ISBN error
        else if (errorData.message.includes('duplicate') && 
                 errorData.message.toLowerCase().includes('isbn')) {
          errorMessage = 'This ISBN is already registered. Please use a different ISBN.';
        }
        else if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(", ");
        }
        else {
          errorMessage = errorData.message;
        }
      }
      else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      }
    } catch {
      // Keep the default error message
    }

    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  const data: Book = await response.json();
  return data;
};

/**
 * Update a book by ID
 */
export const updateBook = async (
  id: string,
  book: UpdateBookData
): Promise<Book> => {
  const response = await fetch(`${API_URL}/books/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(book),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update book. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;

      if (errorData.message && typeof errorData.message === 'string') {
        // Check for duplicate code error
        if (errorData.message.includes('duplicate') && 
            errorData.message.toLowerCase().includes('code')) {
          errorMessage = 'This book code is already registered by another book. Please use a different code.';
        }
        // Check for duplicate ISBN error
        else if (errorData.message.includes('duplicate') && 
                 errorData.message.toLowerCase().includes('isbn')) {
          errorMessage = 'This ISBN is already registered by another book. Please use a different ISBN.';
        }
        else if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(", ");
        }
        else {
          errorMessage = errorData.message;
        }
      }
      else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      }
    } catch {
      // Keep the default error message
    }

    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  const data: Book = await response.json();
  return data;
};

/**
 * Delete a book by ID
 */
export const deleteBook = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/books/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete book. Status: ${response.status}`;

    try {
      const errorData = await response.json();

      if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Keep the default error message
    }

    throw new ApiError(errorMessage, response.status);
  }
};