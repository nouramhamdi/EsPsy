import React from "react";
import { Link } from "react-router-dom";
import userServices from '../../Services/UserService'
import { useNavigate } from 'react-router-dom';
const Header = () => {
  const navigate = useNavigate();

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
      <div className="topbar d-flex align-items-center">
        <div className="container d-flex justify-content-center justify-content-md-between">
          <div className="contact-info d-flex align-items-center">
            <i className="bi bi-envelope d-flex align-items-center">
              <a href="mailto:contact@example.com">contact@example.com</a>
            </i>
            <i className="bi bi-phone d-flex align-items-center ms-4">
              <span>+1 5589 55488 55</span>
            </i>
          </div>
          <div className="social-links d-none d-md-flex align-items-center">
            <a href="#" className="twitter">
              <i className="bi bi-twitter-x"></i>
            </a>
            <a href="#" className="facebook">
              <i className="bi bi-facebook"></i>
            </a>
            <a href="#" className="instagram">
              <i className="bi bi-instagram"></i>
            </a>
            <a href="#" className="linkedin">
              <i className="bi bi-linkedin"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="branding d-flex align-items-center">
        <div className="container position-relative d-flex align-items-center justify-content-between">
          <a href="index.html" className="logo d-flex align-items-center me-auto">
            <h1 className="sitename">EsPsy</h1>
          </a>

          <nav id="navmenu" className="navmenu">
            <ul>
              <li>
                <a href="#hero" className="active">
                <Link className="dropdown-item" to="/app">
                    Home
                  </Link> <br />
                </a>
              </li>
              <li>
                <a href="/app/events">Events</a>
              </li>
              <li>
                <Link to="/app/resources">Ressources</Link>
              </li>
              <li>
                <Link to="/app/Doctors">psychologists</Link>
              </li>
              <li>
                <Link to="/app/MyAppointments">My Appointments</Link>
              </li>
              <li>
                <Link to="/app/Mytest">Self Care</Link>
              </li>
              <li>
                  <Link className="" to="/app/groupsupport">
                    Group Support
                  </Link>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
            </ul>
            <i className="mobile-nav-toggle d-xl-none bi bi-list"></i>
          </nav>

          <div className="dropdown ms-auto">
            <a
              className="btn btn-primary dropdown-toggle"
              role="button"
              id="profileDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-person-circle"></i> My Profile
            </a>
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