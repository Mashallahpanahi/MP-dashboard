// src/api/settingsApi.ts
import { useFetch } from "@/hooks/useFetch";
import { useCreate } from "@/hooks/useCreate";
import { useUpdate } from "@/hooks/useUpdate";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const PAYMENT_METHOD_URL = `${API_URL}/select-payment-method`;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface PaymentMethod {
  id: string;
  paymentMethod: "per_month" | "per_book";
}

export interface CreatePaymentMethodData {
  paymentMethod: "per_month" | "per_book";
}

export interface UpdatePaymentMethodData {
  paymentMethod: "per_month" | "per_book";
}

/* ------------------------------------------------------------------ */
/* Query hook                                                          */
/* ------------------------------------------------------------------ */

/** GET /select-payment-method */
export const usePaymentMethod = () =>
  useFetch<PaymentMethod>(PAYMENT_METHOD_URL);

/* ------------------------------------------------------------------ */
/* Mutation hooks                                                      */
/* ------------------------------------------------------------------ */

/** POST /select-payment-method */
export const useCreatePaymentMethod = () =>
  useCreate<PaymentMethod>(PAYMENT_METHOD_URL);

/**
 * PATCH /select-payment-method
 *
 * Endpoint has no `:id` path param, but `useUpdate` appends `/${id}`.
 * We pass `""` as the id, so the final URL is
 *   `.../select-payment-method/`
 * which Express/NestJS route to the same handler.
 *
 * If your backend rejects trailing slashes (strict routing), see the
 * fallback note below.
 */
export const useUpdatePaymentMethod = () => {
  const { update, ...rest } = useUpdate<PaymentMethod>(PAYMENT_METHOD_URL);

  const updatePaymentMethod = (data: UpdatePaymentMethodData) =>
    update("", data);

  return { ...rest, updatePaymentMethod, update };
};