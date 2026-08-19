// src/api/settingsApi.ts
import type { PaymentMethod, CreatePaymentMethodData, UpdatePaymentMethodData } from "@/types/settings";
import { ApiError } from "./teacherApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Get payment method
 * GET /select-payment-method
 */
export const getPaymentMethod = async (): Promise<PaymentMethod> => {
  const response = await fetch(`${API_URL}/select-payment-method`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `Failed to fetch payment method. Status: ${response.status}`,
      response.status
    );
  }

  const data: PaymentMethod = await response.json();
  return data;
};

/**
 * Create payment method
 * POST /select-payment-method
 */
export const createPaymentMethod = async (
  data: CreatePaymentMethodData
): Promise<PaymentMethod> => {
  const response = await fetch(`${API_URL}/select-payment-method`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create payment method. Status: ${response.status}`;
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

  const result: PaymentMethod = await response.json();
  return result;
};

/**
 * Update payment method
 * PATCH /select-payment-method
 */
export const updatePaymentMethod = async (
  data: UpdatePaymentMethodData
): Promise<PaymentMethod> => {
  const response = await fetch(`${API_URL}/select-payment-method`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = `Failed to update payment method. Status: ${response.status}`;
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

  const result: PaymentMethod = await response.json();
  return result;
};