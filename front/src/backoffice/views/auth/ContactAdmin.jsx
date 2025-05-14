import React, { useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import InputField from "../../components/fields/InputField";

export default function ContactAdmin() {
    const { email } = useParams();
  
  const [formData, setFormData] = useState({
    subject: "",
    body: "",
  });

  const [errors, setErrors] = useState({
    subject: "",
    body: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear error when user types
  };

  const validateForm = () => {
    const newErrors = {
      subject: "",
      body: "",
    };

    let isValid = true;

    // Subject Validation
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
      isValid = false;
    }

    // Body Validation
    if (!formData.body.trim()) {
      newErrors.body = "Message body is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Send the request to the backend
      const response = await axios.post(
        `https://espsy.onrender.com/users/contact-admin/${email}`,
        formData
      );

      setSuccessMessage("Your request has been sent successfully!");
      setErrors({ subject: "", body: "" });

      // Clear form after successful submission
      setFormData({
        subject: "",
        body: "",
      });

    } catch (error) {
      console.error("Failed to send request:", error.response?.data || error.message);
      setErrors({
        subject: error.response?.data?.message || "Error sending request",
        body: error.response?.data?.message || "Error sending request",
      });
    }
  };

  return (
    <div className="mt-16 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
      <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
          Contact Admin
        </h4>
        <p className="mb-9 ml-1 text-base text-gray-600">
          Send a request to the admin
        </p>

        <form onSubmit={handleSubmit}>
          {/* Subject Input */}
          <InputField
            variant="auth"
            extra="mb-3"
            label="Subject*"
            placeholder="Enter subject"
            id="subject"
            name="subject"
            type="text"
            value={formData.subject}
            onChange={handleChange}
          />
          {errors.subject && (
            <span className="text-red-500 text-sm">{errors.subject}</span>
          )}

          {/* Body Input */}
          <div className="mb-3">
            <label
              htmlFor="body"
              className="text-sm font-medium text-navy-700 dark:text-white"
            >
              Message Body*
            </label>
            <textarea
              id="body"
              name="body"
              placeholder="Enter your message"
              value={formData.body}
              onChange={handleChange}
              className={`mt-2 flex h-36 w-full items-center justify-center rounded-xl border bg-white/0 p-3 text-sm outline-none ${
                errors.body ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.body && (
              <span className="text-red-500 text-sm">{errors.body}</span>
            )}
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="text-green-500 text-sm mb-3">{successMessage}</div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            Send Request
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-4">
          <span className="text-sm font-medium text-navy-700 dark:text-gray-600">
            Already have an account?
          </span>
          <Link
            to="/auth/sign-in"
            className="ml-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
          >
            Sign In
          </Link>
        </div>
      </div>
      
    </div>
  );
}