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
    salaryType: 'Fixed' | 'PerStudent';
    salaryAmount: number;
    feePercentage: number;
    hireDate: string;
    isActive: boolean;
  };
  month: number;
  year: number;
  baseSalary: number;
  paidAmount: number;
  remainingSalary: number;
  date: string;
  status: 'Completed' | 'Not Completed';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherPayrollData {
  teacherId: string;
  month: number;
  year: number;
  baseSalary: number;
  paidAmount?: number;
  remainingSalary?: number;
  date?: string;
  status?: 'Completed' | 'Not Completed';
  notes?: string;
}

export interface UpdateTeacherPayrollData {
  teacherId?: string;
  month?: number;
  year?: number;
  baseSalary?: number;
  paidAmount?: number;
  remainingSalary?: number;
  date?: string;
  status?: 'Completed' | 'Not Completed';
  notes?: string;
}

export interface TeacherPayrollSummary {
  totalBaseSalary: number;
  totalPaidAmount: number;
  totalRemainingSalary: number;
  totalRecords: number;
  completedCount: number;
  notCompletedCount: number;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  salaryType: 'Fixed' | 'PerStudent';
  salaryAmount: number;
  feePercentage: number;
  isActive: boolean;
}

export interface AddPaymentData {
  amount: number;
  date?: string;
  notes?: string;
}

// ✅ NEW: student detail inside a PerStudent unpaid record
export interface UnpaidStudentDetail {
  studentId: string;
  studentName: string;
  studentLastName: string;
  finalFee: number;
  teacherShare: number;
}

// ✅ UPDATED: UnpaidSalaryRecord with new backend fields
export interface UnpaidSalaryRecord {
  teacherId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  salaryType: string;                    // "Fixed" | "PerStudent"
  salaryAmount: number | string;
  feePercentage: number | string;
  hireDate: string;
  month: string;
  monthNumber?: number;                  // ✅ NEW
  year: number;
  monthKey: string;
  message: string;
  // ✅ NEW (only present for PerStudent)
  calculatedSalary?: number | null;
  enrolledStudents?: number | null;
  studentDetails?: UnpaidStudentDetail[] | null;
}