// src/api/monthlyFeeApi.ts
import type { 
  MonthlyFee, 
  CreateMonthlyFeeData, 
  UpdateMonthlyFeeData,
  BulkCreateMonthlyFeeData 
} from "@/types/monthlyFee";
import { ApiError } from "./teacherApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Get all monthly fees
 * GET /monthly-fees
 */
export const getMonthlyFees = async (): Promise<MonthlyFee[]> => {
  const response = await fetch(`${API_URL}/monthly-fees`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch monthly fees. Status: ${response.status}`,
      response.status
    );
  }

  const data: MonthlyFee[] = await response.json();
  return data;
};

/**
 * Get all active monthly fees
 * GET /monthly-fees/active
 */
export const getActiveMonthlyFees = async (): Promise<MonthlyFee[]> => {
  const response = await fetch(`${API_URL}/monthly-fees/active`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch active monthly fees. Status: ${response.status}`,
      response.status
    );
  }

  const data: MonthlyFee[] = await response.json();
  return data;
};

/**
 * Get monthly fees by month number
 * GET /monthly-fees/month/{month}
 */
export const getMonthlyFeesByMonth = async (month: number): Promise<MonthlyFee[]> => {
  const response = await fetch(`${API_URL}/monthly-fees/month/${month}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch monthly fees by month. Status: ${response.status}`,
      response.status
    );
  }

  const data: MonthlyFee[] = await response.json();
  return data;
};

/**
 * Get monthly fees by book ID
 * GET /monthly-fees/book/{bookId}
 */
export const getMonthlyFeesByBook = async (bookId: string): Promise<MonthlyFee[]> => {
  const response = await fetch(`${API_URL}/monthly-fees/book/${bookId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch monthly fees by book. Status: ${response.status}`,
      response.status
    );
  }

  const data: MonthlyFee[] = await response.json();
  return data;
};

/**
 * Get fee for payment calculation
 * GET /monthly-fees/payment
 */
export const getFeeForPayment = async (): Promise<MonthlyFee[]> => {
  const response = await fetch(`${API_URL}/monthly-fees/payment`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch fee for payment. Status: ${response.status}`,
      response.status
    );
  }

  const data: MonthlyFee[] = await response.json();
  return data;
};

/**
 * Get monthly fee by ID
 * GET /monthly-fees/{id}
 */
export const getMonthlyFeeById = async (id: string): Promise<MonthlyFee> => {
  const response = await fetch(`${API_URL}/monthly-fees/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch monthly fee. Status: ${response.status}`,
      response.status
    );
  }

  const data: MonthlyFee = await response.json();
  return data;
};

/**
 * Create a monthly fee
 * POST /monthly-fees
 */
export const createMonthlyFee = async (
  data: CreateMonthlyFeeData
): Promise<MonthlyFee> => {
  const response = await fetch(`${API_URL}/monthly-fees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create monthly fee. Status: ${response.status}`;
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

  const result: MonthlyFee = await response.json();
  return result;
};

/**
 * Bulk create monthly fees
 * POST /monthly-fees/bulk
 */
export const bulkCreateMonthlyFees = async (
  data: BulkCreateMonthlyFeeData[]
): Promise<MonthlyFee[]> => {
  const response = await fetch(`${API_URL}/monthly-fees/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to bulk create monthly fees. Status: ${response.status}`;
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

  const result: MonthlyFee[] = await response.json();
  return result;
};

/**
 * Update a monthly fee
 * PATCH /monthly-fees/{id}
 */
export const updateMonthlyFee = async (
  id: string,
  data: UpdateMonthlyFeeData
): Promise<MonthlyFee> => {
  const response = await fetch(`${API_URL}/monthly-fees/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update monthly fee. Status: ${response.status}`;
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

  const result: MonthlyFee = await response.json();
  return result;
};

/**
 * Delete a monthly fee
 * DELETE /monthly-fees/{id}
 */
export const deleteMonthlyFee = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/monthly-fees/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to delete monthly fee. Status: ${response.status}`;

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