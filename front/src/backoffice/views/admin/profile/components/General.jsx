import React, { useEffect, useState } from "react";
import Card from "../../../../components/card";
import userServices from "../../../../../Services/UserService"; // Adjust the path
import NotificationCard from "backoffice/components/card/NotificationCard";

const General = ({ loggedUser }) => {
    const [notification, setNotification] = useState({
      show: false,
      message: "",
      type: "", 
    });
  
    const showNotification = (message, type) => {
      setNotification({ show: true, message, type });
    };
  
    const closeNotification = () => {
      setNotification({ show: false, message: "", type: "" });
    };


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
    fullname: loggedUser.fullname,
    username: loggedUser.username,
    email: loggedUser.email,
    phone: loggedUser.number,
    newPassword: "",
    confirmPassword: "",
  });

  // State for errors
  const [errors, setErrors] = useState({
    fullname: "",
    username: "",
    email: "",
    phone: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear the error for the field when the user starts typing
    setErrors({ ...errors, [name]: "" });
  };

  // Validate the form
  const validateForm = () => {
    const newErrors = {
      fullname: "",
      username: "",
      email: "",
      phone: "",
      newPassword: "",
      confirmPassword: "",
    };

    let isValid = true;

    // Full Name Validation
    if (!formData.fullname.trim()) {
      newErrors.fullname = "Full Name is required";
      isValid = false;
    } else if (formData.fullname.trim().length < 3) {
      newErrors.fullname = "Full Name must be at least 3 characters";
      isValid = false;
    }

    // Username Validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      isValid = false;
    }

    // Email Validation
    const userEmails = new Set(
      users
        .filter(user => !loggedUser?._id || user._id !== loggedUser._id)
        .map(user => user.email.toLowerCase().trim())
    );
    const emailExists = userEmails.has(formData.email.trim().toLowerCase());

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    } else if (!formData.email.endsWith("@esprit.tn")) {
      newErrors.email = "Email must end with @esprit.tn";
      isValid = false;
    }
    else if(emailExists){
      newErrors.email = "This Email is already registered";
      isValid = false;
    }

    // Phone Number Validation
    if (!String(formData.phone).trim()) {
      newErrors.phone = "Phone Number is required";
      isValid = false;
    } else if (!/^\d{8}$/.test(formData.phone)) {
      newErrors.phone = "Phone Number must be exactly 8 digits long";
      isValid = false;
    } else if (!/^(2|5|7|9)\d{7}$/.test(formData.phone)) {
      newErrors.phone = "Phone Number must be a tunisian number";
      isValid = false;
    }

    // New Password Validation
    if (formData.newPassword && formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
      isValid = false;
    }

    // Confirm Password Validation
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    try {
      // Prepare data to send
      const dataToSend = {
        fullname: formData.fullname,
        username: formData.username,
        email: formData.email,
        number: formData.phone,
        password: formData.newPassword, // Only send if new password is provided
      };

      // Call the update API
      const response = await userServices.updateUser(loggedUser._id, dataToSend);
      console.log("Update successful:", response.data);
      showNotification("Profile updated successfully","success" );

    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
      showNotification("Failed to update profile. Please try again.","error" );

    }
  };

  return (


    <>
    
    <Card extra={"w-full h-full p-3"}>
      {/* Header */}
      <div className="mt-2 mb-8 w-full">
        <h4 className="px-2 text-xl font-bold text-navy-700 dark:text-white">
          Account Settings
        </h4>
        <p className="mt-2 px-2 text-base text-gray-600">
          Manage Your Account Here
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 px-2">
          {/* Full Name */}
          <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
            <label className="text-sm text-brand-900 dark:text-white">Fullname</label>
            <br />
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="block h-full w-full p-2 rounded-full bg-lightPrimary text-sm font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
            />
            {errors.fullname && (
              <span className="text-red-500 text-sm">{errors.fullname}</span>
            )}
          </div>

          {/* Username */}
          <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
            <label className="text-sm text-brand-900 dark:text-white">Username</label>
            <br />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="block h-full w-full p-2 rounded-full bg-lightPrimary text-sm font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
            />
            {errors.username && (
              <span className="text-red-500 text-sm">{errors.username}</span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
            <label className="text-sm text-brand-900 dark:text-white">Mail</label>
            <br />
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="block h-full w-full p-2 rounded-full bg-lightPrimary text-sm font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">{errors.email}</span>
            )}
          </div>

          {/* Phone Number */}
          <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
            <label className="text-sm text-brand-900 dark:text-white">Phone Number</label>
            <br />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="block h-full w-full p-2 rounded-full bg-lightPrimary text-sm font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
            />
            {errors.phone && (
              <span className="text-red-500 text-sm">{errors.phone}</span>
            )}
          </div>

          {/* New Password */}
          <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
            <label className="text-sm text-brand-900 dark:text-white">New Password</label>
            <br />
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter a new password"
              className="block h-full w-full p-2 rounded-full bg-lightPrimary text-sm font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
            />
            {errors.newPassword && (
              <span className="text-red-500 text-sm">{errors.newPassword}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
            <label className="text-sm text-brand-900 dark:text-white">Confirm Password</label>
            <br />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
              className="block h-full w-full p-2 rounded-full bg-lightPrimary text-sm font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white"
            />
            {errors.confirmPassword && (
              <span className="text-red-500 text-sm">{errors.confirmPassword}</span>
            )}
          </div>
        </div>

        {/* Footer with Save Changes Button */}
        <div className="mt-2 mb-8 flex justify-center items-center w-full">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </div>
      </form>

    </Card>

      <NotificationCard
                message={notification.message}
                type={notification.type}
                show={notification.show}
                onClose={() => closeNotification()}
      />
    </>
  );
};

export default General;