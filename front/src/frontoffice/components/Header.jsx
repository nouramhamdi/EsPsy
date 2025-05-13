import React from "react";
import { Link } from "react-router-dom";
import userServices from '../../Services/UserService'
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();


  const handleLogout = async () => {
    try {
      await userServices.logout();
      // Optional: Clear frontend storage
      localStorage.removeItem('token');
      // Redirect to login page
      navigate('/auth/sign-in');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header id="header" className="header sticky-top">
   

      <div className="branding d-flex align-items-center">
        <div className="container position-relative d-flex align-items-center justify-content-between">
          <a href="index.html" className="logo d-flex align-items-center me-auto">
            <h1 className="sitename">EsPsy</h1>
          </a>

          <nav id="navmenu" className="navmenu">
  <ul>
    <li>
      <Link
        to="/app"
        className={location.pathname === "/app" ? "active" : ""}
      >
        Home
      </Link>
    </li>
    <li>
      <Link
        to="/app/events"
        className={location.pathname.startsWith("/app/events") ? "active" : ""}
      >
        Events
      </Link>
    </li>
    <li>
      <Link
        to="/app/resources"
        className={location.pathname.startsWith("/app/resources") ? "active" : ""}
      >
        Ressources
      </Link>
    </li>
    <li>
      <Link
        to="/app/Doctors"
        className={location.pathname.startsWith("/app/Doctors") ? "active" : ""}
      >
        Psychologists
      </Link>
    </li>
    <li>
      <Link
        to="/app/MyAppointments"
        className={location.pathname.startsWith("/app/MyAppointments") ? "active" : ""}
      >
        My Appointments
      </Link>
    </li>
    <li>
      <Link
        to="/app/Mytest"
        className={location.pathname.startsWith("/app/Mytest") ? "active" : ""}
      >
        Self Care
      </Link>
    </li>
    <li>
      <Link
        to="/app/groupsupport"
        className={location.pathname.startsWith("/app/groupsupport") ? "active" : ""}
      >
        Group Support
      </Link>
    </li>
    <li>
      <Link
        to="/app/blog"
        className={location.pathname.startsWith("/app/blog") ? "active" : ""}
      >
        Blog
      </Link>
    </li>
  </ul>
  <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
</nav>

          <div className="dropdown ms-auto">
          <button
            className="bg-[var(--accent-color)] text-[var(--contrast-color)] px-4 py-2 rounded-lg"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="bi bi-person-circle"></i> My Profile
          </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
              <li>
                  <Link className="dropdown-item" to="/app/profile">
                    Manage Profile
                  </Link>               
              </li>
              <li>
                <a className="dropdown-item" href="#">
                  My Appointments
                </a>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                 <Link className="dropdown-item" onClick={handleLogout}>
                 
                    Logout
                  </Link>  
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;