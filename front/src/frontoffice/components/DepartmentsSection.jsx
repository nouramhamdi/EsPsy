import React from "react";

const DepartmentsSection = () => {
  return (
    <section id="departments" className="departments section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Departments</h2>
        <p>Necessitatibus eius consequatur ex aliquid fuga eum quidem sint consectetur velit</p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <div className="row">
          <div className="col-lg-3">
            <ul className="nav nav-tabs flex-column">
              <li className="nav-item">
                <a className="nav-link active show" data-bs-toggle="tab" href="#departments-tab-1">
                  Cardiology
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" data-bs-toggle="tab" href="#departments-tab-2">
                  Neurology
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" data-bs-toggle="tab" href="#departments-tab-3">
                  Hepatology
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" data-bs-toggle="tab" href="#departments-tab-4">
                  Pediatrics
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" data-bs-toggle="tab" href="#departments-tab-5">
                  Eye Care
                </a>
              </li>
            </ul>
          </div>
          <div className="col-lg-9 mt-4 mt-lg-0">
            <div className="tab-content">
              <div className="tab-pane active show" id="departments-tab-1">
                <div className="row">
                  <div className="col-lg-8 details order-2 order-lg-1">
                    <h3>Cardiology</h3>
                    <p className="fst-italic">
                      Qui laudantium consequatur laborum sit qui ad sapiente dila parde sonata raqer a videna mareta
                      paulona marka
                    </p>
                    <p>
                      Et nobis maiores eius. Voluptatibus ut enim blanditiis atque harum sint. Laborum eos ipsum ipsa
                      odit magni. Incidunt hic ut molestiae aut qui. Est repellat minima eveniet eius et quis magni
                      nihil. Consequatur dolorem quaerat quos qui similique accusamus nostrum rem vero
                    </p>
                  </div>
                  <div className="col-lg-4 text-center order-1 order-lg-2">
                    <img src="assets/img/departments-1.jpg" alt="" className="img-fluid" />
                  </div>
                </div>
              </div>
              {/* Add other tab panes here */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DepartmentsSection;