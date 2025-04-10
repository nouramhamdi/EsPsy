import { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "../assets/css/test.css";
import { useNavigate } from "react-router-dom"; 

const Mytest = () => {
  const [tests, setTests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");  // Track search term
  const [durationFilter, setDurationFilter] = useState("");  // Track duration filter
  const [categoryFilter, setCategoryFilter] = useState("");  // Track category filter
  const testsPerPage = 3;
  const navigate = useNavigate(); 

  const categoriesEnum = [
    "Cognitive and Intelligence Tests",
    "Personality Tests",
    "Neuropsychological Tests",
    "Achievement and Educational Tests",
    "Diagnostic and Clinical Tests",
    "Projective Tests",
    "Behavioral and Observational Tests",
    "Attitude and Opinion Tests",
    "Vocational and Career Tests",
    "Social and Emotional Intelligence Tests",
    "Stress and Coping Tests",
    "Memory and Attention Tests"
  ];

  // Image source helper
  const getImageSrc = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return `http://localhost:5000/public/uploads/${imagePath}`;
  };

  // Fetch tests from backend
  useEffect(() => {
    axios.get("http://localhost:5000/tests")
      .then((response) => {
        setTests(response.data);
      })
      .catch((error) => {
        console.error("Error fetching tests:", error);
      });
  }, []);

  // Filter tests based on search term, duration, and category
  const filteredTests = tests.filter((test) => {
    const matchesSearch = 
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDuration = 
      (durationFilter === "less" && test.duration < 5) || 
      (durationFilter === "more" && test.duration >= 5) || 
      durationFilter === "";  // If no filter is selected, include all tests

    const matchesCategory = 
      categoryFilter === "" || test.category === categoryFilter;

    return matchesSearch && matchesDuration && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTests.length / testsPerPage);

  const handlePageChange = (step) => {
    setCurrentPage((prev) => Math.max(1, Math.min(prev + step, totalPages)));
  };

  const displayedTests = filteredTests.slice((currentPage - 1) * testsPerPage, currentPage * testsPerPage);

  return (
    <div className="container">
      <header>
        <br />
        <div className="search-container d-flex justify-content-between align-items-center">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search for a test..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}  // Update searchTerm on change
            style={{ width: "70%", padding: "10px" }}
          />
          <button className="search-btn btn btn-outline-secondary" style={{ padding: "10px 15px" }}>
            <i className="bi bi-search"></i>
          </button>
        </div>

        <div className="filter-container d-flex justify-content-between mt-3">
          {/* Duration Filter */}
          <div className="duration-filter">
            <label htmlFor="durationSelect" className="form-label">Filter by Duration:</label>
            <select 
              id="durationSelect"
              className="form-select form-select-sm"
              value={durationFilter}
              onChange={(e) => setDurationFilter(e.target.value)} // Update duration filter
              style={{ width: "auto", padding: "0.3rem 0.5rem" }}  // Adjust dropdown size
            >
              <option value="">All</option>
              <option value="less">Less than 5 minutes</option>
              <option value="more">More than 5 minutes</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="category-filter">
            <label htmlFor="categorySelect" className="form-label">Filter by Category:</label>
            <select 
              id="categorySelect"
              className="form-select form-select-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)} // Update category filter
              style={{ width: "auto", padding: "0.3rem 0.5rem" }}
            >
              <option value="">All Categories</option>
              {categoriesEnum.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </header>
      
      <main className="row">
        {displayedTests.map((test) => (
          <div key={test._id} className="col-lg-4 col-md-6 mb-4">
            <div className="doctor-card card shadow-sm">
              <img 
                className="card-img-top doctor-image" 
                src={getImageSrc(test.image)} 
                alt={test.title} 
              />
              <div className="card-body">
                <div className="status d-flex align-items-center">
                  <span className="status-dot bg-success"></span>
                  <p className="ms-2 mb-0">Available</p>
                </div>
                <h5 className="doctor-name">{test.title}</h5>
                <p className="doctor-speciality">{test.description}</p>
                <p className="doctor-speciality"><strong>Duration:</strong> {test.duration} min</p>
                <div className="d-grid mt-3">
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate(`/app/test/${test._id}`)}
                  >
                    Pass the test
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>
      
      <div className="pagination d-flex justify-content-center mt-4">
        <button 
          className="prev-page btn btn-outline-secondary" 
          onClick={() => handlePageChange(-1)} 
          style={{ padding: "5px 10px" }}
        >
          « Prev
        </button>
        <span className="mx-2 align-self-center">{currentPage}</span>
        <button 
          className="next-page btn btn-outline-secondary" 
          onClick={() => handlePageChange(1)} 
          style={{ padding: "5px 10px" }}
        >
          Next »
        </button>
      </div>
      <br />
    </div>
  );
};

export default Mytest;
