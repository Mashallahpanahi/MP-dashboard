// src/api/expenseApi.ts
import type { 
  Expense, 
  CreateExpenseData, 
  UpdateExpenseData,
  ExpenseCategory,
  CreateExpenseCategoryData,
  UpdateExpenseCategoryData
} from "@/types/expense";
import { ApiError } from "./teacherApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ==================== EXPENSE CATEGORIES ====================

/**
 * Create an expense category
 */
export const createExpenseCategory = async (
  data: CreateExpenseCategoryData
): Promise<ExpenseCategory> => {
  const response = await fetch(`${API_URL}/expenses/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create expense category. Status: ${response.status}`;
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

  const result: ExpenseCategory = await response.json();
  return result;
};

/**
 * Get all expense categories
 */
export const getExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  const response = await fetch(`${API_URL}/expenses/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch expense categories. Status: ${response.status}`,
      response.status
    );
  }

  const data: ExpenseCategory[] = await response.json();
  return data;
};

/**
 * Update an expense category
 */
export const updateExpenseCategory = async (
  id: string,
  data: UpdateExpenseCategoryData
): Promise<ExpenseCategory> => {
  const response = await fetch(`${API_URL}/expenses/categories/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update expense category. Status: ${response.status}`;
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

  const result: ExpenseCategory = await response.json();
  return result;
};

/**
 * Delete an expense category
 */
export const deleteExpenseCategory = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/expenses/categories/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete expense category. Status: ${response.status}`;

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

// ==================== EXPENSES ====================

/**
 * Create an expense
 */
export const createExpense = async (
  data: CreateExpenseData
): Promise<Expense> => {
  const response = await fetch(`${API_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create expense. Status: ${response.status}`;
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

  const result: Expense = await response.json();
  return result;
};

/**
 * Get all expenses
 */
export const getExpenses = async (): Promise<Expense[]> => {
  const response = await fetch(`${API_URL}/expenses`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch expenses. Status: ${response.status}`,
      response.status
    );
  }

  const data: Expense[] = await response.json();
  return data;
};

/**
 * Get an expense by ID
 */
export const getExpenseById = async (id: string): Promise<Expense> => {
  const response = await fetch(`${API_URL}/expenses/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch expense. Status: ${response.status}`,
      response.status
    );
  }

  const data: Expense = await response.json();
  return data;
};

/**
 * Update an expense
 */
export const updateExpense = async (
  id: string,
  data: UpdateExpenseData
): Promise<Expense> => {
  const response = await fetch(`${API_URL}/expenses/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update expense. Status: ${response.status}`;
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

  const result: Expense = await response.json();
  return result;
};

/**
 * Delete an expense
 */
export const deleteExpense = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/expenses/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete expense. Status: ${response.status}`;

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