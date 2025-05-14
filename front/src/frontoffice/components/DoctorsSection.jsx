import React, { useEffect, useState } from "react";
import axios from "axios";

const PsychologistsSection = () => {
  const [psychologists, setPsychologists] = useState([]);

  useEffect(() => {
    axios.get("https://espsy.onrender.com/users/psychologists")
      .then((res) => setPsychologists(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section id="doctors" className="doctors section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Psychologists</h2>
        <p>Meet our certified professionals ready to support your mental well-being.</p>
      </div>

      <div className="container">
        <div className="row gy-4">
          {psychologists.map((psych, idx) => (
            <div className="col-lg-6" key={psych._id} data-aos="fade-up" data-aos-delay={100 * (idx + 1)}>
              <div className="team-member d-flex align-items-start">
                <div className="pic">
                  <img
                    src={`https://espsy.onrender.com/uploads/${psych.image_user}`}
                    className="img-fluid"
                    alt={psych.fullname}
                  />
                </div>
                <div className="member-info">
                  <h4>{psych.fullname}</h4>
                  <span>Psychologist</span>
                  <p>Email: {psych.email}</p>
                  <div className="social">
                    <a href="#"><i className="bi bi-linkedin"></i></a>
                    <a href={`mailto:${psych.email}`}><i className="bi bi-envelope"></i></a>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {psychologists.length === 0 && (
            <p className="text-center">No psychologists found.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default PsychologistsSection;
