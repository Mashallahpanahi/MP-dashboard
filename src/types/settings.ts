// src/types/settings.ts

export interface PaymentMethod {
  id: string;
  paymentMethod: 'per_month' | 'per_book';
}

export interface CreatePaymentMethodData {
  paymentMethod: 'per_month' | 'per_book';
}

export interface UpdatePaymentMethodData {
  paymentMethod: 'per_month' | 'per_book';
}