// // src/types/studentPayment.ts

// export interface StudentPayment {
//   id: string;
//   studentEnrollment: {
//     id: string;
//     student: {
//       id: string;
//       studentNumber: string;
//       firstName: string;
//       lastName: string;
//       gender: string;
//       phone: string;
//       parentPhone: string;
//       address: string;
//       birthDate: string;
//       registrationDate: string;
//       status: string;
//       notes: string;
//     };
//     teacher: {
//       id: string;
//       firstName: string;
//       lastName: string;
//       gender: string;
//       phone: string;
//       email: string;
//       address: string;
//       salaryType: string;
//       salaryAmount: number;
//       feePercentage: number;
//       hireDate: string;
//       isActive: boolean;
//       createdAt: string;
//       updatedAt: string;
//     };
//     book: {
//       id: string;
//       code: string;
//       name: string;
//       description: string;
//       level: string;
//       category: string;
//       author: string;
//       publisher: string;
//       isbn: string;
//       bookPrice: number;
//       durationWeeks: number;
//       totalLessons: number;
//       totalHours: number;
//       passingScore: number;
//       isActive: boolean;
//       levelOrder: number;
//       createdAt: string;
//       updatedAt: string;
//     };
//     timetable: string;
//     tuitionFee: number;
//     discount: number;
//     finalFee: number;
//     startDate: string;
//     expectedEndDate: string;
//     completedDate: string;
//     status: string;
//     finalScore: number;
//     attendancePercentage: number;
//     remarks: string;
//   };
//   amount: number;
//   discount: number;
//   paidAmount: number;
//   remainingAmount: number;
//   paymentDate: string;
//   paymentMethod: "Cash" | "Bank" | "Online" | "Cheque";
//   receiptNumber: string;
//   status: "Paid" | "Partial" | "Unpaid" | "Overdue";
//   notes: string;
// }

// export interface CreateStudentPaymentData {
//   studentEnrollmentId: string;
//   amount: number;
//   discount?: number;
//   paidAmount: number;
//   paymentDate: string;
//   paymentMethod: "Cash" | "Bank" | "Online" | "Cheque";
//   receiptNumber?: string;
//   status: "Paid" | "Partial" | "Unpaid" | "Overdue";
//   notes?: string;
// }

// export interface UpdateStudentPaymentData extends Partial<CreateStudentPaymentData> {
//   id?: string;
// }

// export interface StudentEnrollment {
//   id: string;
//   student: {
//     id: string;
//     studentNumber: string;
//     firstName: string;
//     lastName: string;
//     phone: string;
//   };
//   book: {
//     id: string;
//     code: string;
//     name: string;
//     level: string;
//   };
//   teacher: {
//     id: string;
//     firstName: string;
//     lastName: string;
//   };
//   tuitionFee: number;
//   discount: number;
//   finalFee: number;
//   status: string;
//   startDate: string;
//   expectedEndDate: string;
// }
