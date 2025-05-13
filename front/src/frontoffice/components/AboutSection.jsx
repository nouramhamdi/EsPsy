import React from "react";

const AboutSection = () => {
  return (
    <section id="about" className="about section">
      <div className="container">
        <div className="row gy-4 gx-5">
         
            <div className="col-lg-6 position-relative align-self-start" data-aos="fade-up" data-aos-delay="200">
            <img src="assets/img/about.jpg" className="img-fluid" alt="" />
            <a href="https://www.youtube.com/watch?v=Y7f98aduVJ8" className="glightbox pulsating-play-btn"></a>
          </div>

          <div
            className="col-lg-6 content"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <h3>About ESPSY</h3>
            <p>
              ESPSY is your companion for mental wellness. Through accessible psychological tests, supportive resources, and expert guidance, our platform empowers you to better understand yourself and take positive steps toward emotional well-being.
            </p>
            <ul>
              <li>
                <i className="fa-solid fa-clipboard-question"></i>
                <div>
                  <h5>Psychological Self-Assessments</h5>
                  <p>
                    Engage in thoughtful, research-based tests designed to help you gain insights into your mental and emotional health.
                  </p>
                </div>
              </li>
              <li>
                <i className="fa-solid fa-circle-play"></i>
                <div>
                  <h5>Personalized Resources & Activities</h5>
                  <p>
                    Access tailored videos, exercises, and activities to support your growth and well-being based on your results.
                  </p>
                </div>
              </li>
              <li>
                <i className="fa-solid fa-calendar-check"></i>
                <div>
                  <h5>Well-Being Events & Appointments</h5>
                  <p>
                    Join events focused on mental wellness or book appointments with qualified professionals directly through the platform.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
