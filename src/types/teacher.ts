// // src/types/teacher.ts

// export interface Teacher {
//   id: string;
//   firstName: string;
//   lastName: string;
//   gender: string;
//   phone: string;
//   email: string;
//   address: string;
//   salaryType: string;
//   salaryAmount: number;
//   feePercentage: number;
//   hireDate: string;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface CreateTeacherData {
//   firstName: string;
//   lastName: string;
//   gender: string;
//   phone: string;
//   email?: string; // Optional
//   address?: string; // Optional
//   salaryType: string;
//   salaryAmount: number;
//   feePercentage: number;
//   hireDate: string;
//   isActive: boolean;
// }

// export interface UpdateTeacherData extends Partial<CreateTeacherData> {
//   id?: string;
// }