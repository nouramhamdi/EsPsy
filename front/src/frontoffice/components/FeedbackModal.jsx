// Create components/FeedbackModal.jsx
import React, { useState } from "react";
import Card from "../../backoffice/components/card/index";
import { toast } from "react-toastify";

const FeedbackModal = ({ appointment, loggedUser, onSubmit, onClose }) => {

    const [feedbackText, setFeedbackText] = useState("");

    const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!feedbackText.trim()) {
      setError("Feedback cannot be empty");
      toast.error("Please provide feedback before submitting");
      return;
    }

    try {
        const feedbackData = {
            userId: loggedUser._id,
            feedback: feedbackText
          };
      console.log('====================================');
      console.log('Feedback Data:', feedbackData);
      console.log('====================================');  
      await onSubmit(appointment._id, feedbackData);
      onClose();
      toast.success("Feedback submitted successfully");
    } catch (error) {
      toast.error("Failed to submit feedback");
      console.error("Feedback error:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm z-50 flex items-center justify-center">
      <Card extra="w-full max-w-xl mx-auto p-6 bg-white shadow-lg rounded-xl">
        <header className="flex justify-between items-center mb-6">
          <h5 className="text-xl font-bold text-gray-800">
            Submit Feedback for {loggedUser.role === 'student' ? 
            `Dr. ${appointment.psychologist?.name}` : 
            appointment.student?.name}
          </h5>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Your Feedback
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => {
                  setFeedbackText(e.target.value);
                  setError("");
                }}
                placeholder="Share your experience..."
                className={`mt-1 p-3 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 ${
                  error ? 'border-red-500' : 'focus:ring-blue-500'
                } h-32 resize-none`}
              />
              {error && (
                <span className="text-red-500 text-sm mt-1">{error}</span>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default FeedbackModal;