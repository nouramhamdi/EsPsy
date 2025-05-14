import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import '../assets/css/main.css'; // Main CSS file
import "../../index.css";
import NotificationMenu from 'backoffice/views/admin/groupDiscussions/components/NotificationMenu';
import ChatBot from 'frontoffice/components/ChatBot';

const UserLayout = () => {  
  const loggedUser = JSON.parse(localStorage.getItem('loggedUser'));
  if(loggedUser.role!=="student" || !loggedUser){
    window.location.href = 'https://espsyy-raniakhedris-projects.vercel.app/Error';
  }

  useEffect(() => {
    // Dynamically load Bootstrap CSS from local node_modules
    const bootstrapCSS = document.createElement('link');
    bootstrapCSS.rel = 'stylesheet';
    bootstrapCSS.href = '/node_modules/bootstrap/dist/css/bootstrap.min.css'; // Local path
    document.head.appendChild(bootstrapCSS);
    // Dynamically load CSS files
    const loadCSS = (href) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    };

    // Dynamically load JS files
    const loadJS = (src, callback) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = callback;
      script.onerror = () => {
        console.error(`Failed to load script: ${src}`);
      };
      document.body.appendChild(script);
    };

    // Load favicon and apple-touch-icon
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = '/assets/img/favicon.png'; // Correct path
    document.head.appendChild(favicon);

    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = '/assets/img/apple-touch-icon.png'; // Correct path
    document.head.appendChild(appleTouchIcon);

    // Load Google Fonts
    const preconnectGoogle = document.createElement('link');
    preconnectGoogle.rel = 'preconnect';
    preconnectGoogle.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnectGoogle);

    const preconnectGstatic = document.createElement('link');
    preconnectGstatic.rel = 'preconnect';
    preconnectGstatic.href = 'https://fonts.gstatic.com';
    preconnectGstatic.crossOrigin = 'crossorigin';
    document.head.appendChild(preconnectGstatic);

    const googleFonts = document.createElement('link');
    googleFonts.rel = 'stylesheet';
    googleFonts.href =
      'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap';
    document.head.appendChild(googleFonts);

    // Load Vendor CSS Files
    loadCSS('/assets/vendor/bootstrap-icons/bootstrap-icons.css');
    loadCSS('/assets/vendor/aos/aos.css');
    loadCSS('/assets/vendor/fontawesome-free/css/all.min.css');
    loadCSS('/assets/vendor/glightbox/css/glightbox.min.css');
    loadCSS('/assets/vendor/swiper/swiper-bundle.min.css');

    // Load Vendor JS Files
    loadJS('/assets/vendor/bootstrap/js/bootstrap.bundle.min.js', () => {
      console.log('Bootstrap JS loaded');
    });

    loadJS('/assets/vendor/aos/aos.js', () => {
      console.log('AOS JS loaded');
      if (window.AOS) {
        window.AOS.init({
          duration: 1000,
          once: true,
        });
      } else {
        console.error('AOS is not defined');
      }
    });

    loadJS('/assets/vendor/glightbox/js/glightbox.min.js', () => {
      console.log('GLightbox JS loaded');
      if (window.GLightbox) {
        window.GLightbox({ selector: '.glightbox' });
      } else {
        console.error('GLightbox is not defined');
      }
    });

    loadJS('/assets/vendor/purecounter/purecounter_vanilla.js', () => {
      console.log('PureCounter JS loaded');
      if (window.PureCounter) {
        new window.PureCounter();
      } else {
        console.error('PureCounter is not defined');
      }
    });

    loadJS('/assets/vendor/swiper/swiper-bundle.min.js', () => {
      console.log('Swiper JS loaded');
    });

    // Load Main JS File
    loadJS('/assets/js/main.js', () => {
      console.log('Main JS loaded');
    });

    // Cleanup function to remove dynamically added scripts and styles
    return () => {
      // Remove Bootstrap CSS
      document.head.removeChild(bootstrapCSS);
      // Remove all dynamically added scripts and styles
      const scripts = document.querySelectorAll('script[src^="/assets/"]');
      scripts.forEach((script) => script.remove());

      const styles = document.querySelectorAll('link[href^="/assets/"]');
      styles.forEach((style) => style.remove());
    };
  }, []);

  return (
    <div className="frontoffice">
      <Header />
      
      <main className="main">
        <Outlet />
      </main>

      <Footer />
      <ChatBot/>
      <NotificationMenu/>
      <a href="#" id="scroll-top" class="scroll-top d-flex align-items-center justify-content-center right-4"><i class="bi bi-arrow-up-short"></i></a>
      <div id="preloader"></div>
    </div>
  );
};

export default UserLayout;