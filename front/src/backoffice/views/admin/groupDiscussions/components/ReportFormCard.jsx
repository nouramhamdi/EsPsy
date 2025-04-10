import React, { useState, useEffect } from "react";
import Card from "backoffice/components/card";
import groupServices from "../../../../../Services/groupService";
import toast from "react-hot-toast";

const ReportFormCard = ({ onSuccess, onClose, selectedReportDetails }) => {
  const [formData, setFormData] = useState({
    content: '',
    reporter: '',
    reportedUser: '',
    group: '',
    message: ''
  });

  const [errors, setErrors] = useState({});

  // Initialize form data when component mounts or details change
  useEffect(() => {
    setFormData({
      content: selectedReportDetails.content,
      reporter: selectedReportDetails.reporter,
      reportedUser: selectedReportDetails.reportedUser,
      group: selectedReportDetails.groupId,
      message: selectedReportDetails.messageId
    });
  }, [selectedReportDetails]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.content.trim()) {
      setErrors({ content: "Report description is required" });
      toast.error("Please provide a report description");
      return;
    }

    try {
      // Submit report
      await groupServices.addReportMessage(formData);
      toast.success("Report submitted successfully");
      onSuccess(); // Clear parent component's state
      onClose();   // Close the form
    } catch (error) {
      toast.error("Failed to submit report");
      console.error("Error submitting report:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm z-50 flex items-center justify-center">
      <Card extra="w-full max-w-xl mx-auto p-6 bg-white shadow-lg rounded-6xl">
        <header className="flex justify-between items-center mb-6">
          <h5 className="text-xl font-bold text-gray-800">Report Message</h5>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            {/* Report Content Field */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">
                Reason for Reporting
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Explain why you're reporting this message..."
                className={`mt-1 p-3 border rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 ${
                  errors.content ? 'border-red-500' : 'focus:ring-blue-500'
                } h-32 resize-none`}
              />
              {errors.content && (
                <span className="text-red-500 text-sm mt-1">{errors.content}</span>
              )}
            </div>

            {/* Action Buttons */}
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
                className="px-6 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Submit Report
              </button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ReportFormCard;