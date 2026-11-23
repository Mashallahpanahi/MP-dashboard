// // src/types/dashboard.ts

// export interface StudentStatistics {
//   totalStudents: number;
//   totalActive: number;
//   totalGraduated: number;
//   totalInactive: number;
//   activeStudents: ActiveStudent[];
// }

// export interface ActiveStudent {
//   id: string;
//   firstName: string;
//   lastName: string;
//   phone: string;
//   image: string | null;
//   fatherName: string;
//   fatherPhone: string | null;
//   gender: 'Male' | 'Female';
//   status: 'Active' | 'Inactive' | 'Graduated';
//   studentNumber: string;
//   registrationDate: string;
//   notes: string | null;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface DashboardStats {
//   studentStats: StudentStatistics | null;
//   loading: boolean;
//   error: string;
// }