// src/routes/index.tsx (Add other expenses route)
import DashboardLayout from "@components/layout/DashboardLayout/DashboardLayout";
import Dashboard from "@pages/Dashboard/Dashboard";
import Login from "@pages/Login/Login";
import { HashRouter, Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";


// Teacher pages
import AllTeachers from "@pages/Teachers/AllTeachers";
import TeacherRegister from "@pages/Teachers/TeacherRegister";

// Student pages
import AllStudents from "@/pages/Students/AllStudents";
import EnrollStudent from "@/pages/Students/EnrollStudent";
import StudentRegister from "@/pages/Students/StudentRegister";

// Book pages
import AddBook from "@/pages/Books/AddBook";
import AllBooks from "@/pages/Books/AllBooks";

// Class pages
import AddClass from "@/pages/Classes/AddClass";
import AllClasses from "@/pages/Classes/AllClasses";

// Payment pages - Teacher Payroll
import TeacherPayrollPage from "@/pages/Payment/TeacherPayroll";

// Payment pages - Other Expenses
import OtherExpensesPage from "@/pages/Payment/OtherExpenses";
import AddScores from "@/pages/Students/AddScores";

// Note pages
import Notes from "@/pages/Notes/Notes";
import SettingPage from "@/pages/settings/SettingsPage";
import PrintResultCard from "@/pages/Students/PrintResultCard";

const AppRoutes = () => (
  <HashRouter>
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
          <Route path="/students/add-scores" element={<AddScores/>} />
          <Route path="/students/print-result-card" element={<PrintResultCard />} />
          
          {/* Class Routes */}
          <Route path="/classes/all" element={<AllClasses />} />
          <Route path="/classes/add" element={<AddClass />} />
          
          {/* Book Routes */}
          <Route path="/books/all" element={<AllBooks />} />
          <Route path="/books/add" element={<AddBook />} />
          
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
</HashRouter>
);

export default AppRoutes;