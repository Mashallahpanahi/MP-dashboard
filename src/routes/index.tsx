// src/routes/index.tsx
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

// Book pages
import AllBooks from "@/pages/Books/AllBooks";
import AddBook from "@/pages/Books/AddBook";

// Class pages
import AllClasses from "@/pages/Classes/AllClasses";
import AddClass from "@/pages/Classes/AddClass";

// Payment pages
import TeacherPayment from "@/pages/Payment/TeacherPayment";
import OtherExpenses from "@/pages/Payment/OtherExpenses";

// Note pages
import Notes from "@/pages/Notes/Notes";

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
          
          {/* Class Routes */}
          <Route path="/classes/all" element={<AllClasses />} />
          <Route path="/classes/add" element={<AddClass />} />
          
          {/* Book Routes */}
          <Route path="/books/all" element={<AllBooks />} />
          <Route path="/books/add" element={<AddBook />} />
          
          {/* Payment Routes */}
          <Route path="/payment/teacher" element={<TeacherPayment />} />
          <Route path="/payment/expenses" element={<OtherExpenses />} />
          
          {/* Note Routes */}
          <Route path="/notes" element={<Notes />} />
          
          {/* Settings */}
          <Route path="/settings" element={<div>Settings</div>} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;