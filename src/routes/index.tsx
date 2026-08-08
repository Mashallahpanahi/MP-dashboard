import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "@components/layout/DashboardLayout/DashboardLayout";
import Dashboard from "@pages/Dashboard/Dashboard";
import PrivateRoute from "./PrivateRoute";
import Login from "@pages/Login/Login"; // 👈 real Login
import AllTeachers from "@pages/Teachers/AllTeachers";
import StudentRegister from "@/pages/Students/StudentRegister";
import AllStudents from "@/pages/Students/AllStudents";
import AddBook from "@/pages/Books/AddBook";
import AllBooks from "@/pages/Books/AllBooks";
import AllClasses from "@/pages/Classes/AllClasses";
import AddClass from "@/pages/Classes/AddClass";
import TeacherPayment from "@/pages/Payment/TeacherPayment";
import OtherExpenses from "@/pages/Payment/OtherExpenses";
import Notes from "@/pages/Notes/Notes";
import TeacherRegister from "@/pages/Teachers/TeacherRegister";

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/teachers/all" element={<AllTeachers />} />
          <Route path="/teachers/register" element={<TeacherRegister />}/>
          <Route path="/students/register" element={<StudentRegister />} />
          <Route path="/students/all" element={<AllStudents />} />
          <Route path="/books/add" element={<AddBook />} />
          <Route path="/books/all" element={<AllBooks />} />
          <Route path="/classes/add" element={<AddClass />} />
          <Route path="/classes/all" element={<AllClasses />} />
          <Route path="/payment/teacher" element={<TeacherPayment />} />
          <Route path="/payment/expenses" element={<OtherExpenses />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/settings" element={<div>Settings</div>} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRoutes;

// wihout login

// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import DashboardLayout from "@components/layout/DashboardLayout/DashboardLayout";
// import Dashboard from "@pages/Dashboard/Dashboard";
// import PrivateRoute from "./PrivateRoute";
// import TeacherRegister from "@pages/Teachers/TeacherRegister";
// import AllTeachers from "@pages/Teachers/AllTeachers";
// import StudentRegister from "@/pages/Students/StudentRegister";
// import AllStudents from "@/pages/Students/AllStudents";
// import AddBook from "@/pages/Books/AddBook";
// import AllBooks from "@/pages/Books/AllBooks";
// import AllClasses from "@/pages/Classes/AllClasses";
// import AddClass from "@/pages/Classes/AddClass";
// import TeacherPayment from "@/pages/Payment/TeacherPayment";
// import OtherExpenses from "@/pages/Payment/OtherExpenses";
// import Notes from "@/pages/Notes/Notes";

// // Temporary placeholder for Login (create later)
// const Login = () => <div>Login Page</div>;

// const AppRoutes = () => (
//   <BrowserRouter>
//     <Routes>
//       <Route path="/login" element={<Login />} />
//       <Route element={<PrivateRoute />}>
//         <Route element={<DashboardLayout />}>
//           <Route path="/" element={<Dashboard />} />
//           <Route path="/teachers/register" element={<TeacherRegister />} />
//           <Route path="/teachers/all" element={<AllTeachers />} />
//           <Route path="/students/register" element={<StudentRegister />} />
//           <Route path="/students/all" element={<AllStudents />} />
//           <Route path="/books/add" element={<AddBook />} />
//           <Route path="/books/all" element={<AllBooks />} />
//           <Route path="/classes/add" element={<AddClass />} />
//           <Route path="/classes/all" element={<AllClasses />} />
//           <Route path="/payment/teacher" element={<TeacherPayment />} />
//           <Route path="/payment/expenses" element={<OtherExpenses />} />
//           <Route path="/notes" element={<Notes />} />
//           <Route path="/settings" element={<div>Settings</div>} />
//         </Route>
//       </Route>
//     </Routes>
//   </BrowserRouter>
// );

// export default AppRoutes;
