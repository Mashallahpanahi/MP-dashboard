// src/types/student.ts

export interface Student {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string | null;
  gender: 'Male' | 'Female';
  phone: string;
  parentPhone: string | null;
  address: string | null;
  birthDate: string | null;
  registrationDate: string;
  status: 'Active' | 'Inactive' | 'Graduated';
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentData {
  studentNumber?: string;
  firstName: string;
  lastName?: string | null;
  gender: 'Male' | 'Female';
  phone?: string;
  parentPhone?: string | null;
  address?: string | null;
  birthDate?: string | null;
  status?: 'Active' | 'Inactive' | 'Graduated';
  notes?: string | null;
}

export interface UpdateStudentData {
  studentNumber?: string;
  firstName?: string;
  lastName?: string | null;
  gender?: 'Male' | 'Female';
  phone?: string;
  parentPhone?: string | null;
  address?: string | null;
  birthDate?: string | null;
  status?: 'Active' | 'Inactive' | 'Graduated';
  notes?: string | null;
}

// ============================================
// ENROLLMENT TYPES
// ============================================

export interface EnrollmentTeacher {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  salaryType: string;
  salaryAmount: number;
  feePercentage: number;
  hireDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentBook {
  id: string;
  code: string;
  name: string;
  description: string;
  level: string;
  category: string;
  author: string;
  publisher: string;
  isbn: string;
  bookPrice: number;
  durationWeeks: number;
  totalLessons: number;
  totalHours: number;
  passingScore: number;
  isActive: boolean;
  levelOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentEnrollment {
  id: string;
  student: Student;
  teacher: EnrollmentTeacher;
  book: EnrollmentBook;
  timetable: string;
  tuitionFee: number;
  discount: number;
  finalFee: number;
  startDate: string;
  expectedEndDate: string;
  completedDate: string | null;
  status: 'Studying' | 'Completed' | 'Dropped' | 'Pending';
  finalScore: number;
  attendancePercentage: number;
  remarks: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEnrollmentData {
  studentId: string;
  teacherId: string;
  bookId: string;
  timetable: string;
  tuitionFee: number;
  discount?: number;
  finalFee?: number;
  startDate: string;
  expectedEndDate: string;
  remarks?: string;
}

export interface UpdateEnrollmentData {
  timetable?: string;
  discount?: number;
  remarks?: string;
  status?: 'Studying' | 'Completed' | 'Dropped' | 'Pending';
  finalScore?: number;
  attendancePercentage?: number;
}

// ============================================
// LEVEL UP TYPES
// ============================================

export interface LevelUpInfo {
  previousEnrollment: StudentEnrollment | null;
  isEligible: boolean;
  nextBook: {
    id: string;
    name: string;
    code: string;
    level: string;
  } | null;
  message: string;
}

export interface LevelUpResponse {
  newEnrollment: StudentEnrollment;
  message: string;
}