import React, { useEffect, useState } from "react";
import InputField from "../../components/fields/InputField";
import { Link, useNavigate } from "react-router-dom";
import userServices from "../../../Services/UserService"; // Importing the userServices
import NotificationCard from "backoffice/components/card/NotificationCard";

export default function SignUp() {
    const [notification, setNotification] = useState({
      show: false,
      message: "",
      type: "", // success, error, warning
    });
  
    const showNotification = (message, type) => {
      setNotification({ show: true, message, type });
    };
  
    const closeNotification = () => {
      setNotification({ show: false, message: "", type: "" });
    };


  const [errors, setErrors] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    dateOfBirth: "",
    role: "",
  });
  const navigate = useNavigate();

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

  const validateForm = () => {
    const newErrors = {
      fullname: "",
      username: "",
      email: "",
      password: "",
      phoneNumber: "",
      dateOfBirth: "",
      role: "",
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
    const userEmails = new Set(users.map(user => user.email.toLowerCase()));
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
    }
    else if(emailExists){
      newErrors.email = "This Email is already registered";
      isValid = false;
    }

    // Password Validation
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    // Phone Number Validation
    if (!String(formData.phoneNumber).trim()) {
      newErrors.phoneNumber = "Phone Number is required";
      isValid = false;
    } else if (!/^\d{8}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone Number must be exactly 8 digits long";
      isValid = false;
    } else if (!/^(2|5|7|9)\d{7}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone Number must be a tunisian number";
      isValid = false;
    }
    

    // Date of Birth Validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of Birth is required";
      isValid = false;
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
    
      // Adjust age if the birthday hasn't occurred yet this year
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }
    
      if (age < 16) {
        newErrors.dateOfBirth = "You must be at least 16 years old";
        isValid = false;
      }
    }

    // Role Validation
    if (!formData.role) {
      newErrors.role = "Role is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
    dateOfBirth: "",
    role: "student",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }
    const dataToSend = {
      fullname: formData.fullname,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      datebirth: formData.dateOfBirth, // Mapping dateOfBirth to datebirth
      number: formData.phoneNumber,    // Mapping phoneNumber to number
      role: formData.role,
    };
    try {
      const response = await userServices.addUser(dataToSend); // Sending data to backend      
 
     

      if(dataToSend.role==="student" ){
        const loggeduser = response.user;
        localStorage.setItem("loggedUser", JSON.stringify(loggeduser));
        await userServices.MailAfterSignUp(loggeduser._id);
        window.location.href = 'https://espsyy.vercel.app/app';
      }
      else{
        showNotification("You have to send Registration Request","info" );
        
        setTimeout(() => {
          navigate(`/auth/contactAdmin/${dataToSend.email}`)
        }, 4000);
      }
    } catch (error) {
      console.error("Error registering user:", error);
      showNotification("Error registering user. Please try again.","error" );
    }
  };

  return (
    <div className="mt-16 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
      <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
          Sign Up
        </h4>
        <p className="mb-9 ml-1 text-base text-gray-600">
          Enter your details to create an account!
        </p>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <InputField
            value={formData.fullname}
            onChange={handleChange}
            variant="auth"
            extra="mb-3"
            label="Full Name*"
            placeholder="John Doe"
            id="fullname"
            name="fullname"
            type="text"
          />
          {errors.fullname && (
            <span className="text-red-500 text-sm">{errors.fullname}</span>
          )}
          {/* Username */}
          <InputField
            variant="auth"
            extra="mb-3"
            label="Username*"
            placeholder="johndoe123"
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && (
            <span className="text-red-500 text-sm">{errors.username}</span>
          )}
          {/* Email */}
          <InputField
            variant="auth"
            extra="mb-3"
            label="Email*"
            placeholder="mail@eprit.tn"
            id="email"
            name="email"
            type="text"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email}</span>
          )}
          {/* Password */}
          <InputField
            variant="auth"
            extra="mb-3"
            label="Password*"
            placeholder="Min. 8 characters"
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <span className="text-red-500 text-sm">{errors.password}</span>
          )}
          {/* Phone Number */}
          <InputField
            variant="auth"
            extra="mb-3"
            label="Phone Number*"
            placeholder="+216 98 123 456"
            id="phoneNumber"
            name="phoneNumber"
            type="text"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          {errors.phoneNumber && (
            <span className="text-red-500 text-sm">{errors.phoneNumber}</span>
          )}
          {/* Date of Birth */}
          <InputField
            variant="auth"
            extra="mb-3"
            label="Date of Birth*"
            placeholder="YYYY-MM-DD"
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
          {errors.dateOfBirth && (
            <span className="text-red-500 text-sm">{errors.dateOfBirth}</span>
          )}
          {/* Role */}
          <div className="mb-3">
            <label className="text-gray-700 dark:text-white text-sm font-medium">
              Role*
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-brand-500 focus:ring focus:ring-brand-500 focus:ring-opacity-50 dark:border-gray-600 dark:bg-navy-800 dark:text-white"
            >
              <option value="student">Student</option>
              <option value="psychologist">Psychologist</option>
              <option value="teacher">Teacher</option>
            </select>
            {errors.role && (
              <span className="text-red-500 text-sm">{errors.role}</span>
            )}
          </div>

          <button
            type="submit"
            className="linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            Sign Up
          </button>
        </form>

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
        <NotificationCard
          message={notification.message}
          type={notification.type}
          show={notification.show}
          onClose={() => closeNotification()}
        />
    </div>
  );
}
