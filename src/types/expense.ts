// src/types/expense.ts

export interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseCategoryData {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateExpenseCategoryData extends Partial<CreateExpenseCategoryData> {
  id?: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'Bank' | 'Online' | 'Cheque';
  status: 'Paid' | 'Pending' | 'Approved';
  vendor: string;
  receiptNumber: string;
  notes: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseData {
  categoryId: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'Bank' | 'Online' | 'Cheque';
  status: 'Paid' | 'Pending' | 'Approved';
  vendor: string;
  receiptNumber?: string;
  notes?: string;
  attachments?: string[];
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {
  id?: string;
}