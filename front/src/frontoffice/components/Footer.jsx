import React from "react";
import './Footer.css'; // Importing the CSS file for the footer styles

const Footer = () => {
  return (
    <footer id="footer" className="footer light-background">
      <div className="container footer-top">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6 footer-about">
            <a href="index.html" className="logo d-flex align-items-center">
              <span className="sitename">EsPsy</span>
            </a>
            <div className="footer-contact pt-3">
              <p className="mt-3">
                <strong>Phone:</strong> <span>+216 56 265 123</span>
              </p>
              <p>
                <strong>Email:</strong> <span>espsytunisia@gmail.com</span>
              </p>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Support</h4>
            <ul>
              <li>
                <a href="/app/groupsupport">Group support</a>
              </li>
              <li>
                <a href="/app/blog">Share your thoughts</a>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>Our Services</h4>
            <ul>
             
              <li>
                <a href="/app/resources">Check the resources</a>
              </li>
             
              <li>
                <a href="/app/events">Check our newest events</a>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 footer-links">
            <h4>What you can do ?</h4>
            <ul>
            <li>
                <a href="/app/Doctors">Book an appointment</a>
              </li>
              <li>
                <a href="/app/Mytest">Pass a test</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

   
    </footer>
  );
};

export default Footer;
