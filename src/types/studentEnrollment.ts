// // src/types/studentEnrollment.ts

// export interface StudentEnrollment {
//   id: string;
//   studentId: string;
//   bookId: string;
//   classId: string;
//   teacherId: string;
//   startDate: string;
//   endDate: string;
//   time: string | null; // ✅ Added time field
//   status: 'Studying' | 'Completed' | 'Dropped' | 'Pending';
//   result: 'Passed' | 'Failed' | 'Pending' | 'In Progress';
//   fee: number;
//   discount: number;
//   finalFee: number;
//   date: string;
//   paymentStatus: 'Paid' | 'Pending' | 'Partially Paid' | 'Overdue';
//   score: number | null;
//   scoreDate: string | null;
//   scoreTime: string | null;
//   scoreNotes: string | null;
//   student: {
//     id: string;
//     firstName: string;
//     lastName: string;
//     studentNumber: string;
//     phone: string;
//   };
//   book: {
//     id: string;
//     name: string;
//     code: string;
//     level: string;
//     levelOrder: number;
//   };
//   teacher: {
//     id: string;
//     firstName: string;
//     lastName: string;
//     email: string;
//   };
//   class: {
//     id: string;
//     name: string;
//     block: string;
//   };
//   createdAt: string;
//   updatedAt: string;
// }

// export interface CreateEnrollmentWithPaymentData {
//   studentId: string;
//   bookId: string;
//   classId: string;
//   teacherId: string;
//   startDate: string;
//   endDate: string;
//   time?: string; // ✅ Added time field (optional)
//   status?: 'Studying' | 'Completed' | 'Dropped' | 'Pending';
//   result?: 'Passed' | 'Failed' | 'Pending' | 'In Progress';
//   fee: number;
//   discount?: number;
//   finalFee: number;
//   date: string;
//   paymentStatus?: 'Paid' | 'Pending' | 'Partially Paid' | 'Overdue';
//   score?: number;
//   scoreDate?: string;
//   scoreTime?: string;
//   scoreNotes?: string;
// }

// export interface UpdateEnrollmentData {
//   studentId?: string;
//   bookId?: string;
//   classId?: string;
//   teacherId?: string;
//   startDate?: string;
//   endDate?: string;
//   time?: string; // ✅ Added time field
//   status?: 'Studying' | 'Completed' | 'Dropped' | 'Pending';
//   result?: 'Passed' | 'Failed' | 'Pending' | 'In Progress';
// }

// export interface UpdatePaymentData {
//   fee?: number;
//   discount?: number;
//   finalFee?: number;
//   date?: string;
//   paymentStatus?: 'Paid' | 'Pending' | 'Partially Paid' | 'Overdue';
// }

// export interface UpdateScoreData {
//   score?: number;
//   scoreDate?: string;
//   scoreTime?: string;
//   scoreNotes?: string;
// }

// export interface UpdateBothData {
//   // Enrollment fields
//   studentId?: string;
//   bookId?: string;
//   classId?: string;
//   teacherId?: string;
//   startDate?: string;
//   endDate?: string;
//   time?: string; // ✅ Added time field
//   status?: 'Studying' | 'Completed' | 'Dropped' | 'Pending';
//   result?: 'Passed' | 'Failed' | 'Pending' | 'In Progress';
//   // Payment fields
//   fee?: number;
//   discount?: number;
//   finalFee?: number;
//   date?: string;
//   paymentStatus?: 'Paid' | 'Pending' | 'Partially Paid' | 'Overdue';
// }

// export interface ScoreData {
//   id: string;
//   enrollmentId: string;
//   score: number;
//   scoreDate: string;
//   scoreTime: string;
//   scoreNotes: string;
// }