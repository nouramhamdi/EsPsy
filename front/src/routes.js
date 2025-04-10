import React from "react";

// Admin Imports
//import MainDashboard from "./backoffice/views/admin/default";
//import NFTMarketplace from "./backoffice/views/admin/marketplace";
import Profile from "./backoffice/views/admin/profile";
//import DataTables from "./backoffice/views/admin/tables";

// Auth Imports
import Users from "backoffice/views/admin/users/users";
import Appointments from "backoffice/views/admin/appointments/Appointments";
import Tests from "backoffice/views/admin/tests/Tests";

import Requests from "backoffice/views/admin/sendRequest/SendRequest";
import ReservationsTable from "./backoffice/views/admin/reservations/ReservationsTable";

// Auth Imports
import TableEvent from "./backoffice/views/events/components/TableEvent";
import AddEvent from "./backoffice/views/events/components/AddEvent";
import UpdateEvent from "./backoffice/views/events/components/UpdateEvent";
// Icon Imports
import {
  MdPerson,
  MdPeople,
  MdEvent,
  MdBook,
  MdChat,
  MdAssignment,
  MdQuiz,
  MdGroup,
  MdCalendarToday,
  MdLibraryBooks,
  MdSchedule,
  MdPsychology
} from "react-icons/md";
import PatientFiles from "backoffice/views/admin/patientfiles/PatientFiles";
import AddGroup from "backoffice/views/admin/groupDiscussions/addGroup";
import GroupDetails from "backoffice/views/admin/groupDiscussions/GroupDetails";
import Reports from "backoffice/views/admin/groupDiscussions/Reports";
import Groups from "./backoffice/views/admin/groupDiscussions/groups";

import Resources from "backoffice/views/admin/resources/resourses";
import ResourceDetails from "backoffice/views/admin/resources/components/ResourceDetails";
import EditResource from "backoffice/views/admin/resources/components/EditResource";




const routes = [
  // interfaces in admin,teacher and psychologist sessions
  {
    name: "My Profile",
    role:'allInterface',
    layout: "/admin",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Profile />,
  },

  //admin interface links
  {
    name: "Users Management",
    role:'admin',
    layout: "/admin",
    path: "users",
    icon: <MdPeople className="h-6 w-6" />,
    component: <Users />,
  },
  {
    name: "Control Group discussions",
    role:'admin',
    layout: "/admin",
    path: "GroupsManagmentControl",
    icon: <MdChat className="h-6 w-6" />,
    component: <Reports />,
  },





  //teacher interface links
{ 
  name: "View Events",
  role:'teacher',
  layout: "/admin",
  path: "ViewEvents",
  icon: <MdEvent className="h-6 w-6" />,
  component: <Profile />,
},
{ 
  name: "View Ressources",
  role:'teacher',
  layout: "/admin",
  path: "ViewRessources",
  icon: <MdBook className="h-6 w-6" />,
  component: <Profile />,
},
{ 
  name: "Request Appointment",
  role:'teacher',
  layout: "/admin",
  path: "RequestAppointment",
  icon: <MdSchedule className="h-6 w-6" />,
  component: <Requests />,
},



  //psychologist interface links


{
  name: "Ressources Management",
  role:'psychologist',
  layout: "/admin",
  path: "RessourcesManagement",
  icon: <MdBook className="h-6 w-6" />,
  component: <Resources/>,
},
{
  name: "Resource Details",
  role: 'none',
  layout: "/admin",
  path: "resources/details/:id",
  component: <ResourceDetails />,
  hidden: true, // Cette route ne sera pas affichée dans le menu
},
{
  name: "Edit Resource",
  role: 'none',
  layout: "/admin",
  path: "resources/edit/:id",
  component: <EditResource />,
  hidden: true, // Cette route ne sera pas affichée dans le menu
},
{
  name: "Patients File Management",
  role:'psychologist',
  layout: "/admin",
  path: "FilePatientsManagement",
  icon: <MdSchedule className="h-6 w-6" />,
  component: <PatientFiles/>,
},
{
  name: "Appointments Management",
  role:'psychologist',
  layout: "/admin",
  path: "AppointmentsManagement",
  icon: <MdSchedule className="h-6 w-6" />,
  component: <Appointments />,
},
{
  name: "Tests Management",
  role:'psychologist',
  layout: "/admin",
  path: "TestsManagement",
  icon: <MdAssignment className="h-6 w-6" />,
  component: <Tests/>,
},
{
  name: "View Users",
  role:'psychologist',
  layout: "/admin",
  path: "ViewUsers",
  icon: <MdGroup className="h-6 w-6" />,
  component: <Users />,
},

{
  name: "Group discussions Management",
  role:'psychologist',
  layout: "/admin",
  path: "GroupsManagment",
  icon: <MdChat className="h-6 w-6" />,
  component: <Groups />,
},
{
  name: "Add Group Discussions",
  role:'none',
  layout: "/admin",
  path: "addGroupPage",
  icon: <MdChat className="h-6 w-6" />,
  component: <AddGroup />,
},

{
  name: "Group Discussions Details",
  role:'none',
  layout: "/admin",
  path: "grpDetails/:id",
  icon: <MdChat className="h-6 w-6" />,
  component: <GroupDetails />,
},

{
  name: "Events Management",
  role:'psychologist',
  layout: "/admin",
  path: "EventsManagement",
  icon: <MdEvent className="h-6 w-6" />,
  component: <TableEvent/>
  
  ,
},
{
  name: "Add Event",
  role: "none",
  layout: "/admin",
  path: "EventsManagement/addEvenement",
  icon: <MdEvent className="h-6 w-6" />,
  component: <AddEvent />, // Assure-toi que ce composant existe
},

{
  name: "Update Event",
  role: "none",
  layout: "/admin",
  path: "EventsManagement/updateEvenement/:id",
  icon: <MdEvent className="h-6 w-6" />,
  component: <UpdateEvent />,
},
{
  name: "Réservations",
  role: "none",
  layout: "/admin",
  path: "reservations",
  icon: <MdCalendarToday className="h-6 w-6" />,
  component: <ReservationsTable />
},

  /*


   {
    name: "Main Dashboard",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
  },
  {
    name: "NFT Marketplace",
    layout: "/admin",
    path: "nft-marketplace",
    icon: <MdOutlineShoppingCart className="h-6 w-6" />,
    component: <NFTMarketplace />,
    secondary: true,
  },
  {
    name: "Data Tables",
    layout: "/admin",
    icon: <MdBarChart className="h-6 w-6" />,
    path: "data-tables",
    component: <DataTables />,
  },*/


];
export default routes;
