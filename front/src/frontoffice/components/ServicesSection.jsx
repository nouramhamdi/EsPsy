import React from "react";

const ServicesSection = () => {
  return (
    <section id="services" className="services section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Our Services</h2>
        <p>Comprehensive mental health support — from self-discovery to community healing.</p>
      </div>

      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="100">
            <div className="service-item position-relative">
              <div className="icon">
                <i className="fas fa-brain"></i>
              </div>
              <h3>Self-Assessments</h3>
              <p>
                Evidence-based psychological tests to better understand your emotional and mental state.
              </p>
            </div>
          </div>

          <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="150">
            <div className="service-item position-relative">
              <div className="icon">
                <i className="fas fa-video"></i>
              </div>
              <h3>Personalized Resources</h3>
              <p>
                Get tailored videos, exercises, and guidance based on your test results and personal goals.
              </p>
            </div>
          </div>

          <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="200">
            <div className="service-item position-relative">
              <div className="icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <h3>Appointments</h3>
              <p>
                Book sessions with certified psychologists for private, focused mental health support.
              </p>
            </div>
          </div>

          <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="250">
            <div className="service-item position-relative">
              <div className="icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Supportive Groups</h3>
              <p>
                Join student or professional psychologist groups to share experiences and insights in a safe space.
              </p>
            </div>
          </div>

          <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="300">
            <div className="service-item position-relative">
              <div className="icon">
                <i className="fas fa-blog"></i>
              </div>
              <h3>Community Blog</h3>
              <p>
                Share your healing journey or discover inspiring stories and articles written by others.
              </p>
            </div>
          </div>

          <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="350">
            <div className="service-item position-relative">
              <div className="icon">
                <i className="fas fa-video-camera"></i>
              </div>
              <h3>Video Calls</h3>
              <p>
                Connect face-to-face with mental health professionals or group members for real-time support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
