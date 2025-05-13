import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Player } from "@lottiefiles/react-lottie-player";

import thinkingAnimation from "../assets/thinking.json"
const TestPage = () => {
  const [answers, setAnswers] = useState([]);
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  const userId = loggedUser._id;
  const [aiMessage, setAiMessage] = useState("");
  const [suggestedResource, setSuggestedResource] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);
  const { testId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [testDuration, setTestDuration] = useState(0);
  const [testTitle, setTestTitle] = useState("");

  // Load test metadata + questions
  useEffect(() => {
    axios.get(`http://localhost:5000/tests/${testId}`)
      .then(response => {
        setQuestions(response.data.questions);
        setTestDuration(response.data.duration * 60);
        setTimeLeft(response.data.duration * 60);
        setTestTitle(response.data.title);
      })
      .catch(error => console.error("Error fetching questions:", error));
  }, [testId]);

  // Check if the user already completed the test
  useEffect(() => {
    const fetchUserTestResponse = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/test-responses/${testId}/${userId}`
        );

        if (response.data && response.data.length > 0) {
          setShowResults(true);
          setAiMessage(response.data[0].analysis_for_user);
          setSuggestedResource(response.data[0].suggested_resource);
        } else {
          setShowResults(false);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setShowResults(false); // no previous result: show test
        } else {
          console.error("Error fetching test response:", error);
        }
      }
    };

    fetchUserTestResponse();
  }, [testId, userId]);

  // Timer logic
  useEffect(() => {
    if (timeLeft === 0 && !showResults) {
      setShowResults(true);
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, showResults]);

  const handleSelectOption = (index) => {
    setSelectedOption(index);
    const currentQ = questions[currentQuestion];
    const updatedAnswers = [...answers];
    const existingIndex = updatedAnswers.findIndex(a => a.questionId === currentQ._id);
    const newAnswer = { questionId: currentQ._id, selectedOption: index };

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
      setLoadingResults(true);
      axios.post("http://localhost:5000/test-responses", {
        testId,
        userId,
        answers,
      })
        .then((res) => {
          setAiMessage(res.data.message);
          setSuggestedResource(res.data.resource);
          setShowResults(true);
        })
        .catch((err) => {
          console.error("Failed to save and analyze:", err);
          setAiMessage("An error occurred while analyzing your results.");
          setShowResults(true);
        })
        .finally(() => {
          setLoadingResults(false);
        });
    }
  };

  const handleExitTest = () => {
    navigate("/app/Mytest");
  };

  if (questions.length === 0) {
    return <div className="container text-center mt-5">Loading questions...</div>;
  }

  // In the loading section:
  if (loadingResults) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <Player
          autoplay
          loop
          src={thinkingAnimation}
          style={{ height: "300px", width: "300px" }}
        />
        <p className="mt-6 text-lg text-gray-700 font-medium">
          Analyzing your results... Please wait a few seconds.
        </p>
      </div>
    );
  }
  

  if (showResults) {
    return (
      <div className="container mx-auto text-center mt-10">
        {suggestedResource && (
          <div className="bg-white shadow-md rounded-lg p-5 max-w-lg mx-auto mt-6">
            <h2 className="text-xl font-bold">Test Result</h2>
            <p className="text-gray-400 font-semibold mt-2">{aiMessage}</p>
            <h6 className="font-bold mt-4">We suggest for you: {suggestedResource.title}</h6>
            <p className="text-gray-700 mt-2">{suggestedResource.description}</p>
            <p className="text-gray-500 mt-1"><strong>Type:</strong> {suggestedResource.type}</p>
            <div className="mt-4">
              <a
                href="/app/resource"
                rel="noopener noreferrer"
              >
                <button className="px-6 py-2 bg-[var(--accent-color)] text-[var(--contrast-color)] rounded-full hover:bg-[#3b82f6]">
  Access Resource
</button>

              </a>
            </div>
            <div className="mt-4 flex justify-center gap-4">
              <button
                className="px-6 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600"
                onClick={handleExitTest}
              >
                Exit to Tests
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl w-full">
        <h2 className="text-center text-3xl font-bold text-[var(--accent-color)] mb-6">{testTitle}</h2>
        <div className="relative mb-6">
          <div className="absolute top-0 left-0 right-0 bg-[var(--accent-color)] h-1 rounded-full" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
          <div className="h-1 bg-gray-200 rounded-full"></div>
        </div>
        <p className="text-lg font-medium text-gray-800">{questions[currentQuestion].text}</p>
        <div className="mt-4 space-y-3">
          {questions[currentQuestion].choices.map((option, index) => (
            <button
              key={index}
              className={`w-full px-4 py-2 text-lg rounded-lg ${selectedOption === index ? "bg-[var(--accent-color)] text-white" : "bg-gray-200"}`}
              onClick={() => handleSelectOption(index)}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center mt-6">
          <span className="font-semibold text-gray-600">
            Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} min
          </span>
          <button
  className="px-6 py-2 bg-[var(--accent-color)] text-[var(--contrast-color)] rounded-full hover:bg-[var(--contrast-color)] hover:text-[var(--accent-color)]"
  onClick={handleNextQuestion}
  disabled={selectedOption === null}
>
  Next
</button>

        </div>
      </div>
    </div>
  );
};

export default TestPage;
