// src/types/teacherPayroll.ts

export interface TeacherPayroll {
  id: string;
  teacherId: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
    salaryType: 'Fixed' | 'Percentage';
    salaryAmount: number;
    feePercentage: number;
    hireDate: string;
    isActive: boolean;
  };
  month: string; // Format: YYYY-MM
  year: number;
  baseSalary: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'Bank' | 'Cheque';
  bankAccount: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherPayrollData {
  teacherId: string;
  month: string; // Format: YYYY-MM
  year: number;
  baseSalary: number;
  bonus?: number;
  deductions?: number;
  netSalary: number;
  paymentDate?: string;
  paymentMethod?: 'Cash' | 'Bank' | 'Cheque';
  bankAccount?: string;
  status?: 'Paid' | 'Pending' | 'Overdue';
  notes?: string;
}

export interface UpdateTeacherPayrollData extends Partial<CreateTeacherPayrollData> {
  id?: string;
}

export interface GeneratePayrollDto {
  teacherId: string;
  month: string; // Format: YYYY-MM
  year: number;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  salaryType: 'Fixed' | 'Percentage';
  salaryAmount: number;
  feePercentage: number;
  isActive: boolean;
}