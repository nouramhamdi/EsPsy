import React from "react";

const HeroSection = () => {
  return (
    <section id="hero" className="hero section light-background">
      <img src="assets/img/hero-bg.jpg" alt="" data-aos="fade-in" />

      <div className="container position-relative">
        <div className="welcome position-relative" data-aos="fade-down" data-aos-delay="100">
          <h2>WELCOME TO ESPSY</h2>
          <p>Your safe space for a healthier mind</p>
        </div>

        <div className="content row gy-4">
          <div className="col-lg-4 d-flex align-items-stretch">
            <div className="why-box" data-aos="zoom-out" data-aos-delay="200">
              <h3>Why Choose EsPsy?</h3>
              <p>
                At EsPsy, we prioritize your mental well-being by providing confidential, accessible, and professional
                psychological support. Our expert team is here to guide you through challenges, helping you build
                resilience and find balance in your academic and personal life.
              </p>
              <div className="text-center">
                <a href="#about" className="more-btn">
                  <span>Learn More</span> <i className="bi bi-chevron-right"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="col-lg-8 d-flex align-items-stretch">
            <div className="d-flex flex-column justify-content-center">
              <div className="row gy-4">
                <div className="col-xl-4 d-flex align-items-stretch">
                  <div className="icon-box" data-aos="zoom-out" data-aos-delay="300">
                    <i className="bi bi-clipboard-data"></i>
                    <h4>Personalized Support</h4>
                    <p>
                      Receive tailored guidance from experienced psychologists who understand student life challenges. Get
                      the right support for stress, anxiety, academic pressure, and more.
                    </p>
                  </div>
                </div>

                <div className="col-xl-4 d-flex align-items-stretch">
                  <div className="icon-box" data-aos="zoom-out" data-aos-delay="400">
                    <i className="bi bi-gem"></i>
                    <h4>Secure & Confidential</h4>
                    <p>
                      Your privacy matters. Our platform ensures secure and confidential sessions, so you can express
                      yourself freely and get the help you need without any worries.
                    </p>
                  </div>
                </div>

                <div className="col-xl-4 d-flex align-items-stretch">
                  <div className="icon-box" data-aos="zoom-out" data-aos-delay="500">
                    <i className="bi bi-inboxes"></i>
                    <h4>Flexible & Accessible</h4>
                    <p>
                      Book online appointments at your convenience and connect with professionals from anywhere. Mental
                      health support is just a few clicks away.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;