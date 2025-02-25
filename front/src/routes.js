import React from "react";

// Admin Imports
//import MainDashboard from "./backoffice/views/admin/default";
//import NFTMarketplace from "./backoffice/views/admin/marketplace";
import Profile from "./backoffice/views/admin/profile";
//import DataTables from "./backoffice/views/admin/tables";

// Auth Imports
import Users from "backoffice/views/admin/users/users";


// Icon Imports
import {
  //MdHome,
  //MdOutlineShoppingCart,
  //MdBarChart,
  MdPerson,
  //MdLock,
} from "react-icons/md";




const routes = [
  //admin pages
  {
    name: "My Profile",
    role:'allInterface',
    layout: "/admin",
    path: "profile",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Profile />,
  },
  {
    name: "Users Management",
    role:'admin',
    layout: "/admin",
    path: "users",
    icon: <MdPerson className="h-6 w-6" />,
    component: <Users />,
  },


{ 
  name: "Page teacher",
  role:'teacher',
  layout: "/admin",
  path: "page",
  icon: <MdPerson className="h-6 w-6" />,
  component: <Profile />,
},
{
  name: "Page psychologist",
  role:'psychologist',
  layout: "/admin",
  path: "page2",
  icon: <MdPerson className="h-6 w-6" />,
  component: <Users />,
},





  /*
  {
    name: "Forgot Password",
    role: "allInterface",
    layout: "/auth",
    path: "forgot-password",
    icon: <MdLock className="h-6 w-6" />,
    component: <ForgotPassword />,
  },


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
