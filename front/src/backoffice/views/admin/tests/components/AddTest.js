import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TestService from '../../../../../Services/TestService';

const AddTest = () => {
  const [tests, setTests] = useState([]);
  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    questions: [],
  });
  const [questionCount, setQuestionCount] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ text: '', choices: [''] });

  const [imageMode, setImageMode] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [imageDescription, setImageDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
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

  const fetchTests = async () => {
    try {
      const data = await TestService.getTests();
      setTests(data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleSetQuestionCount = (e) => {
    const count = parseInt(e.target.value) || 0;
    setQuestionCount(count);
    setNewTest({ ...newTest, questions: [] });
    setCurrentQuestionIndex(0);
    setNewQuestion({ text: '', choices: [''] });
    setShowQuestionForm(count > 0);
  };

  const handleAddQuestion = () => {
    if (newQuestion.text.trim() !== '' && newQuestion.choices.every(c => c.trim() !== '')) {
      setNewTest((prevTest) => ({
        ...prevTest,
        questions: [...prevTest.questions, newQuestion],
      }));

      if (currentQuestionIndex + 1 < questionCount) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setNewQuestion({ text: '', choices: [''] });
      } else {
        setShowQuestionForm(false);
      }
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      setUploadedImage(URL.createObjectURL(file));
      setGeneratedImage(null);
    }
  };

  const handleGenerateImage = async () => {
    console.log("Generating image with:", imageDescription);
    setLoading(true);
  
    try {
      const response = await axios.post('https://espsy.onrender.com/test/generate-image', {
        prompt: imageDescription,
      });
  
      if (response.data?.data?.length > 0) {
        setGeneratedImage(response.data.data[0].url);
      } else {
        console.error("No image generated.");
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGeneratedImage = async () => {
    if (!generatedImage) return;
  
    try {
      const response = await axios.post('https://espsy.onrender.com/save-generated-image', {
        url: generatedImage
      });
  
      if (response.data?.fileName) {
        const savedFileName = response.data.fileName;
  
        setUploadedImage(`https://espsy.onrender.com/uploads/${savedFileName}`); // For UI preview
        setImageFile(null); // Make sure file upload is disabled
        setNewTest((prevTest) => ({
          ...prevTest,
          image: savedFileName, // Store filename in DB
        }));
      } else {
        console.error('Failed to store generated image.');
      }
    } catch (error) {
      console.error('Error saving generated image:', error);
    } finally {
      setGeneratedImage(null);
    }
  };
  

  const handleAddTest = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitLoading(true);  // Show loading state
  
    if (!newTest.title || !newTest.description || !newTest.category || !newTest.duration || newTest.questions.length === 0) {
      setErrorMessage("Please fill in all required fields and add at least one question.");
      setSubmitLoading(false);
      return;
    }
  
    try {
      let response;
  
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("title", newTest.title);
        formData.append("description", newTest.description);
        formData.append("category", newTest.category);
        formData.append("duration", parseInt(newTest.duration, 10));
        formData.append("questions", JSON.stringify(newTest.questions));  // Correctly serialize questions as JSON
  
        // Debug: Check what's being sent
        console.log("Form Data being sent:", formData);
  
        response = await axios.post("https://espsy.onrender.com/tests", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
  
      } else if (newTest.image) {
        response = await axios.post("https://espsy.onrender.com/tests", {
          title: newTest.title,
          description: newTest.description,
          category: newTest.category,
          duration: parseInt(newTest.duration, 10),
          questions: newTest.questions,
          image: newTest.image, // 🟢 now contains saved filename
        });
      }
      else {
        setErrorMessage("Please upload an image or generate one.");
        setSubmitLoading(false);
        return;
      }
  
      console.log("Test added successfully:", response.data);
  
      // ✅ Clear all inputs after submission
      setNewTest({ title: "", description: "", category: "", duration: "", questions: [] });
      setQuestionCount(0);
      setCurrentQuestionIndex(0);
      setShowQuestionForm(false);
      setNewQuestion({ text: "", choices: [""] });
  
      setImageFile(null);
      setUploadedImage(null);
      setGeneratedImage(null);
      setImageMode(null);
      setImageDescription("");
  
      fetchTests(); // Refresh test list
  
    } catch (error) {
      console.error("Error adding test:", error.response?.data || error.message);
      setErrorMessage("Failed to add test. Check the console for details.");
    } finally {
      setSubmitLoading(false);
    }
  };
  
  return (
    <div className="p-6">
   

      <h2 className="text-xl font-bold mb-4">Create a New Test</h2>
      <form onSubmit={handleAddTest} className="mb-6">
        <label className="block mb-2">Test Title:</label>
        <input
          type="text"
          value={newTest.title}
          onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
          className="mb-2 p-2 border border-gray-300 rounded w-full"
          required
        />

        <label className="block mb-2">Description:</label>
        <textarea
          value={newTest.description}
          onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
          className="mb-2 p-2 border border-gray-300 rounded w-full"
          required
        />

        <label className="block mb-2">Category:</label>
        <select
          value={newTest.category}
          onChange={(e) => setNewTest({ ...newTest, category: e.target.value })}
          className="mb-2 p-2 border border-gray-300 rounded w-full"
          required
        >
          <option value="" disabled>Select Category</option>
          {categoriesEnum.map((category, index) => (
            <option key={index} value={category}>{category}</option>
          ))}
        </select>

        <label className="block mb-2">Duration (minutes):</label>
        <input
          type="number"
          value={newTest.duration}
          onChange={(e) => setNewTest({ ...newTest, duration: e.target.value })}
          className="mb-2 p-2 border border-gray-300 rounded w-full"
          required
        />

        <label className="block mb-2">Number of Questions:</label>
        <input
          type="number"
          min="1"
          value={questionCount}
          onChange={handleSetQuestionCount}
          className="mb-4 p-2 border border-gray-300 rounded w-full"
          required
        />

        {showQuestionForm && (
          <div className="mt-4 p-4 border border-gray-300 rounded">
            <h3>Question {currentQuestionIndex + 1} of {questionCount}</h3>
            <input
              type="text"
              placeholder="Enter question text"
              value={newQuestion.text}
              onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
              className="mb-2 p-2 border border-gray-300 rounded w-full"
              required
            />
            <h4>Choices:</h4>
            {newQuestion.choices.map((choice, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  placeholder={`Choice ${index + 1}`}
                  value={choice}
                  onChange={(e) => {
                    const updatedChoices = [...newQuestion.choices];
                    updatedChoices[index] = e.target.value;
                    setNewQuestion({ ...newQuestion, choices: updatedChoices });
                  }}
                  className="p-2 border border-gray-300 rounded w-full"
                  required
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setNewQuestion({ ...newQuestion, choices: [...newQuestion.choices, ''] })}
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Add Choice
            </button>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-3 py-1 bg-green-600 text-white rounded ml-2"
            >
              Add Question
            </button>
          </div>
        )}

        <div className="mt-6">
          <h3 className="font-bold mb-2">Add an Image</h3>
          {imageMode === null && (
            <div>
              <button 
                type="button"
                onClick={() => setImageMode('upload')} 
                className="px-3 py-1 bg-blue-500 text-white rounded mr-2"
              >
                Upload Image
              </button>
              <button 
                type="button"
                onClick={() => setImageMode('generate')} 
                className="px-3 py-1 bg-purple-500 text-white rounded"
              >
                Generate Image
              </button>
            </div>
          )}

          {imageMode === 'upload' && (
            <div className="mt-2">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="mb-2" 
              />
              {uploadedImage && <img src={uploadedImage} alt="Uploaded" className="w-40 h-auto" />}
            </div>
          )}

          {imageMode === 'generate' && (
            <div className="mb-2">
              <input
                type="text"
                placeholder="Image prompt"
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                className="p-2 border border-gray-300 rounded w-full mb-2"
              />
              <button
                type="button"
                onClick={handleGenerateImage}
                className="px-4 py-2 bg-purple-500 text-white rounded flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24"></svg>
                    Generating...
                  </>
                ) : (
                  "Generate AI Image"
                )}
              </button>
            </div>
          )}

          {generatedImage && (
            <div className="mt-2">
              <img src={generatedImage} alt="Generated" className="w-40 h-auto mb-2" />
              <button
                type="button"
                onClick={handleSelectGeneratedImage}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Use this image
              </button>
            </div>
          )}
        </div>

        <h3 className="font-bold mt-6">Preview of Questions</h3>
        {newTest.questions.map((q, index) => (
          <div key={index} className="border border-gray-300 rounded p-2 mt-2">
            <p className="font-semibold">Q{index + 1}: {q.text}</p>
            <ul className="list-disc ml-5">
              {q.choices.map((choice, idx) => (
                <li key={idx}>{choice}</li>
              ))}
            </ul>
          </div>
        ))}

        {errorMessage && (
          <div className="mt-4 text-red-500">{errorMessage}</div>
        )}

        <button 
          type="submit" 
          className="mt-6 px-4 py-2 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] text-white rounded hover:bg-blue-700 transition-colors"
          disabled={submitLoading}
        >
          {submitLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding Test...
            </>
          ) : 'Add Test'}
        </button>
      </form>
    </div>
  );
};

export default AddTest;
