import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../../components/fields/InputField";
import userServices from "../../../Services/UserService";


export default function ForgotPassword() {
  const [users, setUsers] = useState([]);
  useEffect(() => {

    // Users.jsx
    const fetchUsers = async () => {
      try {
        const data = await userServices.getAllUsers();
        setUsers(data.users); // Access the 'users' array from response data
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);
  const [formData, setFormData] = useState({
    email: "",
  });

  const [errors, setErrors] = useState({
    email: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateForm = () => {
    const newErrors = {
      email: "",
    };

    let isValid = true;

    // Email Validation
    const userEmails = new Set(users.map(user => user.email.toLowerCase()));
   console.log('====================================');
   console.log(userEmails);
   console.log('====================================');
    const emailExists = userEmails.has(formData.email);

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    } else if (!formData.email.endsWith("@esprit.tn")) {
      newErrors.email = "Email must end with @esprit.tn";
      isValid = false;
    }else if(!emailExists){
      newErrors.email = "This Email is not found";
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
        const response = await axios.post(
        "http://localhost:5000/users/forgot-password",
        { email: formData.email }
      );

      setSuccessMessage("Password reset instructions sent to your email!");
      setErrors({ email: "" });

      // Optional: Redirect after success
      setTimeout(() => {
        navigate("/auth/sign-in");
      }, 3000);

    } catch (error) {
      console.error("Password reset failed:", error.response?.data || error.message);
      setErrors({
        email: error.response?.data?.message || "Error sending reset instructions",
      });
    }
  };

  return (
    <div className="mt-16 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
      <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
          Forgot Password
        </h4>
        <p className="mb-9 ml-1 text-base text-gray-600">
          Enter your email to reset your password
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <InputField
            variant="auth"
            extra="mb-3"
            label="Email*"
            placeholder="mail@example.com"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email}</span>
          )}
          {successMessage && (
            <div className="text-green-500 text-sm mb-3">{successMessage}</div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            Reset Password
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