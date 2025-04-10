import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import InputField from "../../components/fields/InputField";

export default function ResetPassword() {
  const { email } = useParams(); // Get the token from the URL
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear error when user types
  };

  const validateForm = () => {
    const newErrors = {
      newPassword: "",
      confirmPassword: "",
    };

    let isValid = true;

    // New Password Validation
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
      isValid = false;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
      isValid = false;
    }

    // Confirm Password Validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm password is required";
      isValid = false;
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        `http://localhost:5000/users/reset-password`,
        { 
            newPassword: formData.newPassword,
            email:email
         }
      );

      if (response.data.success) {
        setIsSuccess(true);
        setErrorMessage("");
        setTimeout(() => {
          navigate("/auth/sign-in"); // Redirect to login after success
        }, 3000);
      }
    } catch (error) {
      console.error("Password reset failed:", error.response?.data || error.message);
      setErrorMessage(error.response?.data?.message || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-16 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
      <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
          Reset Password
        </h4>
        <p className="mb-9 ml-1 text-base text-gray-600">
          Enter your new password and confirm it
        </p>

        <form onSubmit={handleSubmit}>
          {/* New Password Input */}
          <InputField
            variant="auth"
            extra="mb-3"
            label="New Password*"
            placeholder="Enter new password"
            id="newPassword"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
          />
          {errors.newPassword && (
            <span className="text-red-500 text-sm">{errors.newPassword}</span>
          )}

          {/* Confirm Password Input */}
          <InputField
            variant="auth"
            extra="mb-3"
            label="Confirm Password*"
            placeholder="Confirm new password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <span className="text-red-500 text-sm">{errors.confirmPassword}</span>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="text-red-500 text-sm mb-3">{errorMessage}</div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="text-green-500 text-sm mb-3">
              Password reset successfully! Redirecting to login...
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-4">
          <span className="text-sm font-medium text-navy-700 dark:text-gray-600">
            Remember your password?
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