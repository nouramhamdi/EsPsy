import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "../../components/navbar";
import Sidebar from "../../components/sidebar";
import Footer from "../../components/footer/Footer";
import routes from "../../../routes";
import "../../assets/css/reset.css"
import userServices from "../../../Services/UserService"; // Importing the userServices



export default function Admin(props) {
  
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  if(loggedUser.role==="student" || !loggedUser){
    window.location.href = 'http://localhost:3000/Error';
  }

  const { ...rest } = props;
  const location = useLocation();
  const [open, setOpen] = React.useState(true);
  const [currentRoute, setCurrentRoute] = React.useState("Main Dashboard");

  React.useEffect(() => {
    window.addEventListener("resize", () =>
      window.innerWidth < 1200 ? setOpen(false) : setOpen(true)
    );
  }, []);
  React.useEffect(() => {
    getActiveRoute(routes);
  }, [location.pathname]);

  const getActiveRoute = (routes) => {
    let activeRoute = "Main Dashboard";
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(
          routes[i].layout + "/" + routes[i].path
        ) !== -1
      ) {
        setCurrentRoute(routes[i].name);
      }
    }
    return activeRoute;
  };
  const getActiveNavbar = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (
        window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
      ) {
        return routes[i].secondary;
      }
    }
    return activeNavbar;
  };

  const getRoutes = (routes) => {
    return routes
      .map((prop, key) => (
        <Route path={`/${prop.path}`} element={prop.component} key={key} />
      ));
  };



  document.documentElement.dir = "ltr";
  return (
    <div className="admin-layout flex h-full w-full">
      {loggedUser ?
      <Sidebar role={loggedUser.role} open={open} onClose={() => setOpen(false)} />
      :
      <Sidebar role={"admin"} open={open} onClose={() => setOpen(false)} />
      }
      <div className="h-full w-full bg-lightPrimary dark:!bg-navy-900">
      {/* Main Content */}
        <main
          className={`mx-[12px] h-full flex-none transition-all md:pr-2 xl:ml-[313px]`}
        >
          {/* Routes */}
          <div className="h-full">
            {loggedUser ?
                <Navbar
                  username={loggedUser.username}
                  onOpenSidenav={() => setOpen(true)}
                  logoText={"EsPsy"}
                  brandText={currentRoute}
                  secondary={getActiveNavbar(routes)}
                  {...rest}
               />
            :
              <Navbar
                username={""}
                onOpenSidenav={() => setOpen(true)}
                logoText={"EsPsy"}
                brandText={currentRoute}
                secondary={getActiveNavbar(routes)}
                {...rest}
              />
            }

            <div className="pt-5s mx-auto mb-auto h-full min-h-[84vh] p-2 md:pr-2 mr-8 ">
              <Routes>
                {getRoutes(routes)}
                <Route
                  path="/"
                  element={<Navigate to="/admin/profile" replace />}
                />
              </Routes>
            </div>
         
          </div>
        </main>
      </div>
    </div>
  );
}
