// src/api/otherExpenseApi.ts
import type {
  OtherExpense,
  CreateOtherExpenseData,
  UpdateOtherExpenseData,
  LastMonthTotal,
  ExpenseHistory,
} from "@/types/otherExpense";
import { ApiError } from "./teacherApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Get all other expenses
 * GET /other-expenses
 */
export const getOtherExpenses = async (): Promise<OtherExpense[]> => {
  const response = await fetch(`${API_URL}/other-expenses`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch other expenses. Status: ${response.status}`,
      response.status
    );
  }

  const result = await response.json();
  // Handle wrapped response: { success, message, data: [...] }
  return Array.isArray(result) ? result : (result.data || []);
};

/**
 * Get total expenses for the previous month
 * GET /other-expenses/total-last-month
 */
export const getTotalLastMonth = async (): Promise<LastMonthTotal> => {
  const response = await fetch(`${API_URL}/other-expenses/total-last-month`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch last month total. Status: ${response.status}`,
      response.status
    );
  }

  const result = await response.json();
  return result.data || result;
};

/**
 * Get expenses history between two dates
 * GET /other-expenses/history?fromDate=...&toDate=...
 */
export const getExpenseHistory = async (
  fromDate: string,
  toDate: string
): Promise<ExpenseHistory> => {
  const params = new URLSearchParams({
    fromDate,
    toDate,
  });

  const response = await fetch(
    `${API_URL}/other-expenses/history?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    let errorMessage = `Failed to fetch expense history. Status: ${response.status}`;

    try {
      const errorData = await response.json();
      if (errorData.message && typeof errorData.message === "string") {
        errorMessage = errorData.message;
      } else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      }
    } catch {
      // Keep the default error message
    }

    throw new ApiError(errorMessage, response.status);
  }

  const result = await response.json();
  return result.data || result;
};

/**
 * Get other expense by ID
 * GET /other-expenses/{id}
 */
export const getOtherExpenseById = async (id: string): Promise<OtherExpense> => {
  const response = await fetch(`${API_URL}/other-expenses/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch other expense. Status: ${response.status}`,
      response.status
    );
  }

  const result = await response.json();
  return result.data || result;
};

/**
 * Create a new other expense
 * POST /other-expenses
 */
export const createOtherExpense = async (
  data: CreateOtherExpenseData
): Promise<OtherExpense> => {
  const response = await fetch(`${API_URL}/other-expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create other expense. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;
      if (errorData.message && typeof errorData.message === "string") {
        errorMessage = errorData.message;
      } else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      }
    } catch {
      // Keep the default error message
    }

    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  const result = await response.json();
  return result.data || result;
};

/**
 * Update other expense
 * PATCH /other-expenses/{id}
 */
export const updateOtherExpense = async (
  id: string,
  data: UpdateOtherExpenseData
): Promise<OtherExpense> => {
  const response = await fetch(`${API_URL}/other-expenses/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update other expense. Status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorData = await response.json();
      errorDetails = errorData;
      if (errorData.message && typeof errorData.message === "string") {
        errorMessage = errorData.message;
      } else if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(", ");
      }
    } catch {
      // Keep the default error message
    }

    throw new ApiError(errorMessage, response.status, errorDetails);
  }

  const result = await response.json();
  return result.data || result;
};

/**
 * Delete other expense
 * DELETE /other-expenses/{id}
 */
export const deleteOtherExpense = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/other-expenses/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete other expense. Status: ${response.status}`;

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