import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import InputField from "../../components/fields/InputField";
import { FcGoogle } from "react-icons/fc";
import userServices from "../../../Services/UserService"; // Importing the userServices
import NotificationCard from "backoffice/components/card/NotificationCard";


export default function SignIn() {
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
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [Blocked,setBlocked] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Clear error when user types
  };

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
    };

    let isValid = true;

    // Email Validation
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


    // Password Validation
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateBlock = (user) =>{
    if(user.blocked && user.blocked===true){
      return true ;
    }
    return false;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; 
    }

    try {
      const response = await axios.post("https://espsy.onrender.com/users/login", formData);

      localStorage.setItem("token", response.data.token);
      const loggeduser = await userServices.getSessionUser();
     
      localStorage.setItem("loggedUser", JSON.stringify(loggeduser.user));
      
      if(validateBlock(loggeduser.user)){
        showNotification("You are blocked ! ","error" );
        setBlocked(true)
        setTimeout(() => {
          navigate(`/auth/contactAdmin/${loggeduser.email}`);
        }, 4000);
        return ;
        
      }

      if(loggeduser.user.role==="student"){
       window.location.href = 'https://espsyy.vercel.app/app';
      }
      else{
        if(loggeduser.user.RequestRegistration === true && loggeduser.user.RequestResponse === false ) {
          showNotification("Your Registration Request is not Accepted yet","info" );
          return ;
        }
        navigate('/admin')
      }


    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      setErrors({
        email: "Invalid email or password",
        password: "Invalid email or password",
      });
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'https://espsy.onrender.com/auth/google';
  };

  return (
    <div className="mt-16 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
      <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
          Sign In
        </h4>
        <p className="mb-9 ml-1 text-base text-gray-600">
          Enter your email and password to sign in!
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <InputField
            variant="auth"
            extra="mb-3"
            label="Email*"
            placeholder="mail@esprit.tn"
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

          {/* Forgot Password */}
          <div className="mb-4 flex items-center justify-end px-2">
            <Link to="/auth/forgetpass"
              className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
              href=" "
            >
              Forgot Password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
          >
            Sign In
          </button>
        </form>

        <br />

        {/* Divider */}
        <div className="mb-2 mt-2 flex items-center gap-3">
          <div className="h-px w-full bg-gray-200 dark:bg-navy-700" />
          <p className="text-base text-gray-600 dark:text-white"> or </p>
          <div className="h-px w-full bg-gray-200 dark:bg-navy-700" />
        </div>

        {/* Sign In with Google */}
        <button onClick={handleGoogleLogin}  className="mb-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-lightPrimary hover:cursor-pointer dark:bg-navy-800">
          <div className="rounded-full text-xl">
            <FcGoogle />
          </div>
          <h5 className="text-sm font-medium text-navy-700 dark:text-white">
            Sign In with Google
          </h5>
        </button>

        {/* Sign Up Link */}
        <div className="mt-4">
          <span className="text-sm font-medium text-navy-700 dark:text-gray-600">
            Not registered yet?
          </span>
          <Link
            to="/auth/sign-up"
            className="ml-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
          >
            Create an account
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