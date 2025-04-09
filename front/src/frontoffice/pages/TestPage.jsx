import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const TestPage = () => {
  const [answers, setAnswers] = useState([]);
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  const userId = loggedUser._id; 
  
  const { testId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [testDuration, setTestDuration] = useState(0);
  const [testTitle, setTestTitle] = useState("");
  useEffect(() => {
    axios.get(`http://localhost:5000/tests/${testId}`)
      .then(response => {
        setQuestions(response.data.questions);
        setTestDuration(response.data.duration * 60); // Convert minutes to seconds
        setTimeLeft(response.data.duration * 60);
        setTestTitle(response.data.title); // Fetch and set the title

      })
      .catch(error => console.error("Error fetching questions:", error));
  }, [testId]);

  useEffect(() => {
    if (timeLeft === 0) {
      setShowResults(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSelectOption = (index) => {
    setSelectedOption(index);
  
    const currentQ = questions[currentQuestion];
  
    const updatedAnswers = [...answers];
    const existingIndex = updatedAnswers.findIndex(a => a.questionId === currentQ._id);
  
    const newAnswer = {
      questionId: currentQ._id,
      selectedOption: index,
    };
  
    if (existingIndex !== -1) {
      updatedAnswers[existingIndex] = newAnswer;
    } else {
      updatedAnswers.push(newAnswer);
    }
  
    setAnswers(updatedAnswers);
  };
  

  const handleNextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      setShowResults(true);
  


      // POST request to send the responses to the backend
      axios.post("http://localhost:5000/test-responses", {
        testId ,
        userId ,
        answers,
      })
      .then((res) => {
        console.log("✅ Test responses saved:", res.data);
      })
      .catch((err) => {
        console.error("❌ Failed to save test responses:", err);
      });
    }
  };
  
  
  const handleRestartTest = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowResults(false);
    setTimeLeft(testDuration); // Reset time based on test duration from database
  };

  if (questions.length === 0) {
    return <div className="container text-center mt-5">Loading questions...</div>;
  }

  if (showResults) {
    return (
      <div className="container text-center mt-5">
        <h2>You passed the test !</h2>
        <button className="btn btn-primary" onClick={handleRestartTest}>Restart </button>
      </div>
    );
  }

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="quiz-container bg-white p-4 rounded shadow" style={{ maxWidth: "600px", width: "100%" }}>
        <h2 className="text-center">{testTitle}</h2>
        <div className="progress mb-3">
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            aria-valuenow={(currentQuestion + 1) / questions.length * 100}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
        <p className="question">{questions[currentQuestion].text}</p>
        <div className="options d-grid gap-2">
          {questions[currentQuestion].choices.map((option, index) => (
            <button
              key={index}
              className={`btn ${selectedOption === index ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => handleSelectOption(index)}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="d-flex justify-content-between align-items-center mt-4">
          <span className="fw-bold">Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} min</span>
          <button className="btn btn-primary" onClick={handleNextQuestion} disabled={selectedOption === null}>
            Next
          </button>
        </div>
      </div>
      
    </div>
    
  );
};

export default TestPage;
