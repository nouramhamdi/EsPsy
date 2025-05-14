import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import userServices from "../../../Services/UserService";
import NotificationCard from "backoffice/components/card/NotificationCard";

export default function VerifyAccount() {
  const { token } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
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
  const validateBlock = (user) =>{
    if(user.blocked && user.blocked===true){
      return true ;
    }
    return false;
  }
  const validateNotSigned = (user) =>{
    if(user.RequestResponse && user.RequestResponse===false){
      return true ;
    }
    return false;
  }
  useEffect(() => {
    const verifyAccount = async () => {
      try {
        // Call verification endpoint
        const response = await axios.get(
          `https://espsy.onrender.com/users/verify-account/${token}`
        );

        if (response.data.success) {
          setIsSuccess(true);
          setErrorMessage("");
          const loggedUser = response.data.user
          localStorage.setItem("loggedUser", JSON.stringify(loggedUser));
          
          if(validateBlock(loggedUser)){
            showNotification("You are blocked ! ","error" );
            return ;
          }
          
          if(validateNotSigned(loggedUser)){
            showNotification("Your Registration Request is not Accepted yet","info" );
            return ;
          }
          
          if(loggedUser.ResetPassword === true){
            navigate(`/auth/ResetPassword/${loggedUser.email}`)

          }
          else{
            if(loggedUser.role==="student"){
              window.location.href = 'http://localhost:3000/app';
             }
             else{
               navigate('/admin')
             }
          }



        }
      } catch (error) {
        console.error("Verification failed:", error.response?.data || error.message);
        setErrorMessage(error.response?.data?.message || "Verification failed");
        setIsSuccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAccount();
  }, [token]);

  return (
    <>
    

    <div className="mt-16 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
      <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
          Account Verification
        </h4>
        
        {isLoading ? (
          <div className="text-center">
            <p className="mb-9 ml-1 text-base text-gray-600">
              Verifying your account...
            </p>
            <div className="animate-pulse">⏳</div>
          </div>
        ) : (
          <>
            {isSuccess ? (
              <div className="text-center">
                <p className="mb-9 ml-1 text-base text-gray-600">
                  ✅ Account verified successfully!
                </p>
                <button
                  onClick={() => navigate("/auth/sign-in")}
                  className="linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
                  >
                  Go to Login
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="mb-9 ml-1 text-base text-red-500">
                  ❌ {errorMessage || "Verification failed"}
                </p>
                <Link
                  to="/auth/sign-in"
                  className="linear mt-2 w-full rounded-xl bg-gray-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-gray-600 active:bg-gray-700"
                >
                  Back to Login
                </Link>
              </div>
            )}
          </>
        )}

        <div className="mt-4 text-center">
          <span className="text-sm font-medium text-navy-700 dark:text-gray-600">
            Need help?{" "}
            <Link
              to="/contact-support"
              className="ml-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white"
            >
              Contact Support
            </Link>
          </span>
        </div>
      </div>
    </div>
    <NotificationCard
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={() => closeNotification()}
      />
    </>
  );
}