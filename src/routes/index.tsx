// src/routes/index.tsx (Add other expenses route)
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "@components/layout/DashboardLayout/DashboardLayout";
import Dashboard from "@pages/Dashboard/Dashboard";
import PrivateRoute from "./PrivateRoute";
import Login from "@pages/Login/Login";

// Teacher pages
import AllTeachers from "@pages/Teachers/AllTeachers";
import TeacherRegister from "@pages/Teachers/TeacherRegister";

// Student pages
import AllStudents from "@/pages/Students/AllStudents";
import StudentRegister from "@/pages/Students/StudentRegister";
import EnrollStudent from "@/pages/Students/EnrollStudent";

// Book pages
import AllBooks from "@/pages/Books/AllBooks";
import AddBook from "@/pages/Books/AddBook";

// Class pages
import AllClasses from "@/pages/Classes/AllClasses";
import AddClass from "@/pages/Classes/AddClass";

// Payment pages - Student Payments
import StudentPaymentPage from "@/pages/Payment/StudentPayment";
import AddStudentPayment from "@/pages/Payment/AddStudentPayment";

// Payment pages - Teacher Payroll
import TeacherPayrollPage from "@/pages/Payment/TeacherPayroll";

// Payment pages - Other Expenses
import OtherExpensesPage from "@/pages/Payment/OtherExpenses";

// Note pages
import Notes from "@/pages/Notes/Notes";
import SettingPage from "@/pages/settings/SettingsPage";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          
          {/* Teacher Routes */}
          <Route path="/teachers/all" element={<AllTeachers />} />
          <Route path="/teachers/register" element={<TeacherRegister />} />
          
          {/* Student Routes */}
          <Route path="/students/all" element={<AllStudents />} />
          <Route path="/students/register" element={<StudentRegister />} />
          <Route path="/students/enroll/:studentId" element={<EnrollStudent />} />
          
          {/* Class Routes */}
          <Route path="/classes/all" element={<AllClasses />} />
          <Route path="/classes/add" element={<AddClass />} />
          
          {/* Book Routes */}
          <Route path="/books/all" element={<AllBooks />} />
          <Route path="/books/add" element={<AddBook />} />
          
          {/* Payment Routes - Student Payments */}
          <Route path="/payment/students" element={<StudentPaymentPage />} />
          <Route path="/payment/students/add" element={<AddStudentPayment />} />
          
          {/* Payment Routes - Teacher Payroll */}
          <Route path="/payment/teacher" element={<TeacherPayrollPage />} />
          
          {/* Payment Routes - Other Expenses */}
          <Route path="/payment/expenses" element={<OtherExpensesPage />} />
          
          {/* Note Routes */}
          <Route path="/notes" element={<Notes />} />
          
          {/* Settings */}
          <Route path="/settings" element={<SettingPage></SettingPage>} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;