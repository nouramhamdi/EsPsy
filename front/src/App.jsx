import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./backoffice/layouts/admin";
import AuthLayout from "./backoffice/layouts/auth";
import UserLayout from './frontoffice/layouts/UserLayout';
import HomePage from "./frontoffice/pages/HomePage";
import MyProfile from "./frontoffice/pages/MyProfile";
import Doctors from "./frontoffice/pages/Doctors";
import Mytest from "./frontoffice/pages/Mytest";
import TestPage from './frontoffice/pages/TestPage'; 
import Blog from "frontoffice/pages/blog";
import SignUp from "backoffice/views/auth/SignUp";
import SignIn from "backoffice/views/auth/SignIn";
import ForgotPassword from "backoffice/views/auth/forgetPassword";
import Error from "frontoffice/pages/Error";
// import MyAppointments from "frontoffice/pages/MyAppointments";
import VerifyAccount from "backoffice/views/auth/VerifyAccount";
import ContactAdmin from "backoffice/views/auth/ContactAdmin";
import ResetPassword from "backoffice/views/auth/ResetPassword";
import BookAppointment from "frontoffice/pages/BookAppointment";
import MyAppointments from "frontoffice/pages/MyAppointments";
import GroupSupportPage from "frontoffice/pages/GroupSupportPage";
import VideoCall from "backoffice/views/admin/groupDiscussions/components/VideoCall";
import Resources from "./frontoffice/pages/resources";
import ReservationsTable from "./backoffice/views/admin/reservations/ReservationsTable";
import EventDetails from "./frontoffice/pages/EventDetails";
import EventsSection from "frontoffice/components/EventsSection";
import StudentProfilePage from "backoffice/views/admin/patientfiles/StudentProfilePage";
import EventReservations from "./backoffice/views/events/components/EventReservations";
import TableEvent_Admin from "./backoffice/views/events/components/TableEvent_Admin";


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

      <Route path="admin/*" element={<AdminLayout />} >
        <Route path="reservations" element={<ReservationsTable />} />
        <Route path="Events" element={<TableEvent_Admin />} />
        <Route path="EventsManagement/event/:id/reservations" element={<EventReservations />} />
      </Route>
      <Route path="Error" element={<Error />} />

      <Route path="app/*" element={<UserLayout />}>
        <Route index element={<HomePage />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="appointment/:psychologistId" element={<BookAppointment />} />
        <Route path='MyAppointments' element={<MyAppointments />} /> 
        <Route path="mytest" element={<Mytest/>}  />
        <Route path="Blog" element={<Blog/>}  />

        <Route path="test/:testId" element={<TestPage />} />
        <Route path="groupsupport" element={<GroupSupportPage />} />
        <Route path="resources" element={<Resources />} />
        <Route path="event/:id" element={<EventDetails />} />
        <Route path="events" element={<EventsSection />} />
      </Route>
      <Route path="/call/:groupId" element={<VideoCall />} />
      <Route path="/" element={<Navigate to="/auth/sign-in" replace />} />
      <Route path="student-profile/:studentId/:idfile" element={<StudentProfilePage />} />

    </Routes>
  );
};

export default App;
