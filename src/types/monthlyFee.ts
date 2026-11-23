// // src/types/monthlyFee.ts

// export interface MonthlyFee {
//   id: string;
//   bookId: string;
//   book: {
//     id: string;
//     code: string;
//     name: string;
//     levelOrder: number;
//     durationWeeks: number;
//     passingScore: number;
//     description: string;
//     level: string;
//     category: string;
//     author: string;
//     publisher: string;
//     isbn: string;
//     bookPrice: number;
//     totalLessons: number;
//     totalHours: number;
//     isActive: boolean;
//     createdAt: string;
//     updatedAt: string;
//   };
//   month: number;
//   fee: number;
//   description: string;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface CreateMonthlyFeeData {
//   bookId: string;
//   month: number;
//   fee: number;
//   description?: string;
//   isActive?: boolean;
// }

// export interface UpdateMonthlyFeeData {
//   bookId?: string;
//   month?: number;
//   fee?: number;
//   description?: string;
//   isActive?: boolean;
// }

// export interface BulkCreateMonthlyFeeData {
//   bookId: string;
//   month: number;
//   fee: number;
//   description?: string;
//   isActive?: boolean;
// }