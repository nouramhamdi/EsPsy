import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./backoffice/layouts/admin";
import AuthLayout from "./backoffice/layouts/auth";
import UserLayout from './frontoffice/layouts/UserLayout';
import HomePage from "./frontoffice/pages/HomePage";
import MyProfile from "./frontoffice/pages/MyProfile";
import SignUp from "backoffice/views/auth/SignUp";
import SignIn from "backoffice/views/auth/SignIn";

const App = () => {
  return (
    <Routes>
      
      <Route path="auth/*" element={<AuthLayout />} >
        <Route index element={<SignIn />} />
        <Route path="sign-in" element={<SignIn />} />
        <Route path="sign-up" element={<SignUp />} />
      </Route>

      <Route path="admin/*" element={<AdminLayout />} />
      
      <Route path="app/*" element={<UserLayout />}>
        <Route index element={<HomePage />} />
        <Route path="profile" element={<MyProfile />} />

        {/* Add other frontoffice routes here */}
      </Route>

      <Route path="/" element={<Navigate to="/auth/sign-in" replace />} />
    </Routes>
  );
};

export default App;
