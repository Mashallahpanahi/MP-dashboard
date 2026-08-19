// src/api/bookFeeApi.ts
import type { 
  BookFee, 
  CreateBookFeeData, 
  UpdateBookFeeData 
} from "@/types/bookFee";
import { ApiError } from "./teacherApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Get all book fees
 * GET /book-fees
 */
export const getBookFees = async (): Promise<BookFee[]> => {
  try {
    const response = await fetch(`${API_URL}/book-fees`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new ApiError(
        `Failed to fetch book fees. Status: ${response.status}`,
        response.status
      );
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching book fees:", error);
    return [];
  }
};

/**
 * Get book fee by ID
 * GET /book-fees/{id}
 */
export const getBookFeeById = async (id: string): Promise<BookFee> => {
  const response = await fetch(`${API_URL}/book-fees/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch book fee. Status: ${response.status}`,
      response.status
    );
  }

  const data: BookFee = await response.json();
  return data;
};

/**
 * Get book fee by book ID
 * GET /book-fees/book/{bookId}
 */
export const getBookFeeByBook = async (bookId: string): Promise<BookFee> => {
  const response = await fetch(`${API_URL}/book-fees/book/${bookId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch book fee by book. Status: ${response.status}`,
      response.status
    );
  }

  const data: BookFee = await response.json();
  return data;
};

/**
 * Create a book fee
 * POST /book-fees
 */
export const createBookFee = async (
  data: CreateBookFeeData
): Promise<BookFee> => {
  const response = await fetch(`${API_URL}/book-fees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create book fee. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;
      if (errorData.message && typeof errorData.message === 'string') {
        if (errorData.message.includes('already exists')) {
          errorMessage = 'A fee for this book already exists. Please use a different book.';
        } else {
          errorMessage = errorData.message;
        }
      } else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      }
    } catch {
      // Keep the default error message
    }

    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  const result: BookFee = await response.json();
  return result;
};

/**
 * Update a book fee
 * PATCH /book-fees/{id}
 */
export const updateBookFee = async (
  id: string,
  data: UpdateBookFeeData
): Promise<BookFee> => {
  const response = await fetch(`${API_URL}/book-fees/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update book fee. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;
      if (errorData.message && typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      } else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      }
    } catch {
      // Keep the default error message
    }

    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  const result: BookFee = await response.json();
  return result;
};

/**
 * Delete a book fee
 * DELETE /book-fees/{id}
 */
export const deleteBookFee = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/book-fees/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete book fee. Status: ${response.status}`;

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

/**
 * Update book fee status
 * PATCH /book-fees/{id}/status
 */
export const updateBookFeeStatus = async (
  id: string,
  data: { isActive: boolean }
): Promise<BookFee> => {
  const response = await fetch(`${API_URL}/book-fees/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update book fee status. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;
      if (errorData.message && typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      } else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      }
    } catch {
      // Keep the default error message
    }

    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  const result: BookFee = await response.json();
  return result;
};