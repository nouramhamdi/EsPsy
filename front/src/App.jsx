import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./backoffice/layouts/admin";
import AuthLayout from "./backoffice/layouts/auth";
import UserLayout from './frontoffice/layouts/UserLayout';
import HomePage from "./frontoffice/pages/HomePage";
import MyProfile from "./frontoffice/pages/MyProfile";
import Doctors from "./frontoffice/pages/Doctors";

import SignUp from "backoffice/views/auth/SignUp";
import SignIn from "backoffice/views/auth/SignIn";
import ForgotPassword from "backoffice/views/auth/forgetPassword";
// import MyAppointments from "frontoffice/pages/MyAppointments";
import VerifyAccount from "backoffice/views/auth/VerifyAccount";
import ContactAdmin from "backoffice/views/auth/ContactAdmin";
import ResetPassword from "backoffice/views/auth/ResetPassword";
import BookAppointment from "frontoffice/pages/BookAppointment";
import MyAppointments from "frontoffice/pages/MyAppointments";

const App = () => {
  return (
    <Routes>
      
      <Route path="auth/*" element={<AuthLayout />} >
        <Route index element={<SignIn />} />
        <Route path="sign-in" element={<SignIn />} />
        <Route path="sign-up" element={<SignUp />} />
        <Route path="forgetpass" element={<ForgotPassword />} />
        <Route path="ResetPassword/:email" element={<ResetPassword />} />
        <Route path="contactAdmin/:email" element={<ContactAdmin />} />
        <Route path="verify-account/:token" element={<VerifyAccount />} />
      </Route>

      <Route path="admin/*" element={<AdminLayout />} />
      
      <Route path="app/*" element={<UserLayout />}>
        <Route index element={<HomePage />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="appointment/:psychologistId" element={<BookAppointment />} />
        <Route path='MyAppointments' element={<MyAppointments />} /> 

      </Route>

      <Route path="/" element={<Navigate to="/auth/sign-in" replace />} />
    </Routes>
  );
};

export default App;
