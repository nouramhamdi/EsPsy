import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Mytest = () => {
  const [tests, setTests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const testsPerPage = 3;
  const navigate = useNavigate();

  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  const userId = loggedUser._id;  // Get logged-in user's ID

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
    "Memory and Attention Tests",
  ];

  const getImageSrc = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/300x200";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return `http://localhost:5000/public/uploads/${imagePath}`;
  };

  // Fetch tests and check if user has passed any test
  useEffect(() => {
    axios
      .get("http://localhost:5000/tests")
      .then(async (response) => {
        const testsWithStatus = await Promise.all(
          response.data.map(async (test) => {
            // Check if the current user has passed the test
            const userTestStatus = await checkTestPassed(test._id, userId);


            return {
              ...test,
              passed: userTestStatus,
            };
          })
        );
        setTests(testsWithStatus);
      })
      .catch((error) => console.error("Error fetching tests:", error));
  }, []);

  const checkTestPassed = async (testId, userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/test-responses/${userId}/${testId}`);
      return !!response.data; // Retourne true si une réponse existe
    } catch (error) {
      console.error("Error checking test status:", error);
      return false; // Assume not passed if error occurs
    }
  };
  

  const filteredTests = tests
  .filter((test) => {
    const matchesSearch =
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDuration =
      (durationFilter === "less" && test.duration < 5) ||
      (durationFilter === "more" && test.duration >= 5) ||
      durationFilter === "";

    const matchesCategory =
      categoryFilter === "" || test.category === categoryFilter;

    return matchesSearch && matchesDuration && matchesCategory;
  })
  .sort((a, b) => {
    // Prioritize tests that are "available" (not passed)
    if (a.passed && !b.passed) return 1; // Move passed tests to the bottom
    if (!a.passed && b.passed) return -1; // Keep available tests at the top
    return 0; // Keep the order as is if both tests have the same passed status
  });


  const totalPages = Math.ceil(filteredTests.length / testsPerPage);
  const displayedTests = filteredTests.slice(
    (currentPage - 1) * testsPerPage,
    currentPage * testsPerPage
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="container section-title" data-aos="fade-up">
        <h2>Test your personality !</h2>
      </div>

      {/* Search, Filter Inputs */}
      <div className="mb-8 flex flex-col md:flex-row gap-3 items-start">
        <input
          type="text"
          placeholder="Search for a test..."
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={durationFilter}
          onChange={(e) => setDurationFilter(e.target.value)}
        >
          <option value="">All Durations</option>
          <option value="less">Less than 5 minutes</option>
          <option value="more">More than 5 minutes</option>
        </select>

        <select
          className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categoriesEnum.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Test Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedTests.map((test) => (
          <div
            key={test._id}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={() => navigate(`/app/test/${test._id}`)}
          >
            <img
              src={getImageSrc(test.image)}
              alt={test.title}
              className="h-48 w-full object-cover rounded-t-xl"
            />
            <div className="p-4 relative">
              <h3 className="text-xl font-semibold mb-1 text-center">{test.title}</h3>

              {/* Dynamic Badge */}
              <span
                className={`absolute top-4 right-4 text-xs font-semibold px-2 py-1 rounded-full ${
                  test.passed ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                }`}
              >
                {test.passed ? "Passed" : "Available"}
              </span>

              <p className="text-gray-600 mb-2 line-clamp-3">{test.description}</p>
              <p className="text-sm text-gray-500 mb-2">
                <strong>Duration:</strong> {test.duration} minutes
              </p>
              <button
                className="w-full px-4 py-2 rounded-lg mt-2"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--contrast-color)",
                }}
              >
                Take the Test
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-10">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded"
            style={{
              backgroundColor: "var(--accent-color)",
              color: "var(--contrast-color)",
            }}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              style={{
                backgroundColor: currentPage === i + 1 ? "var(--accent-color)" : "",
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded"
            style={{
              backgroundColor: "var(--accent-color)",
              color: "var(--contrast-color)",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Mytest;
