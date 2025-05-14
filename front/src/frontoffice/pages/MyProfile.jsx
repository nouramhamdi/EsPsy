import React, { useEffect, useRef, useState } from "react";
import "../assets/css/myprofile.css";
import userServices from "../../Services/UserService"
import { useNavigate } from "react-router-dom";
import NotificationCard from "backoffice/components/card/NotificationCard";
import avatar from "../assets/img/avatar.png";
const MyProfile = () => {
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "", // success, error, warning
  });
  // Add new state for image preview
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
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
  
  
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  // State for form fields
  const [formData, setFormData] = useState({
    fullName: loggedUser?.fullname || "",
    username: loggedUser?.username || "",
    email: loggedUser?.email || "",
    phone: loggedUser?.number || "",
    newPassword: "",
    confirmPassword: "",
  });

  // State for errors
  const [errors, setErrors] = useState({
    fullName: "",
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
      fullName: "",
      username: "",
      email: "",
      phone: "",
      newPassword: "",
      confirmPassword: "",
    };

    let isValid = true;

    // Full Name Validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
      isValid = false;
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Full Name must be at least 3 characters";
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
    }   else if(emailExists){
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
        fullname: formData.fullName,
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



  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await userServices.logout();
      // Optional: Clear frontend storage
      localStorage.removeItem('token');
      localStorage.removeItem('loggedUser');
      // Redirect to login page
      navigate('/auth/sign-in');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification("Please upload an image file", "error");
      return;
    }

    // Set preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    try {
      const response = await userServices.updateUserImg(loggedUser._id, file);
      
      // Update local storage and state
      const updatedUser = { 
        ...loggedUser, 
        image_user: response.updatedUser.image_user 
      };
      localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
      
      showNotification("Profile image updated successfully", "success");
    } catch (error) {
      console.error("Image upload failed:", error);
      showNotification("Failed to update profile image", "error");
    }
  };
  // Update the user avatar display
  const getImageUrl = () => {
    if (imagePreview) return imagePreview;
    return loggedUser?.image_user 
      ? `https://espsy.onrender.com/uploads/${loggedUser.image_user}`
      : avatar;
  };
  return (
    <section id="profile" className="profile section light-background">
      <img className="profile-bg" src="/assets/img/hero-bg.jpg" alt="" data-aos="fade-in" />

      <div className="container position-relative">
        <div className="section-header text-center" data-aos="fade-down" data-aos-delay="100">
          <h2 className="fw-bold mb-3">MY PROFILE</h2>
          <p className="lead">Manage your personal information and account settings</p>
        </div>

        <div className="row justify-content-center g-5">
          {/* User Info Card */}
          <div className="col-lg-5">
            <div className="profile-card text-center" data-aos="zoom-out" data-aos-delay="200">
              <div className="card-header px-4 pt-5">
                 <div className="user-avatar mx-auto mb-3 position-relative">
                  <img 
                    src={getImageUrl()}
                    alt="Profile"
                    className="rounded-circle"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                      cursor: "pointer"
                    }}
                    onClick={() => fileInputRef.current.click()}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className=" hidden"
                  />

                </div>
                <h3 className="mb-2">{loggedUser?.fullname}</h3>
                <div className="badge bg-primary rounded-pill py-2 px-3">
                  <i className="bi bi-patch-check me-2"></i>Student Account
                </div>
              </div>

              <div className="card-body px-4 pb-4">
                <div className="info-grid row g-3">
                  {[
                    { icon: 'bi-person-badge', label: 'Username', value: loggedUser?.username },
                    { icon: 'bi-envelope-at', label: 'Email', value: loggedUser?.email },
                    { icon: 'bi-calendar-event', label: 'Date of Birth', value: loggedUser?.datebirth?.split('T')[0] },
                    { icon: 'bi-phone', label: 'Contact', value: loggedUser?.number },
                  ].map((item, index) => (
                    <div className="col-12" key={index}>
                      <div className="info-item d-flex align-items-center justify-content-center p-3">
                        <i className={`bi ${item.icon} fs-5 me-3`}></i>
                        <div>
                          <div className="info-label text-muted small">{item.label}</div>
                          <div className="info-value fw-medium">{item.value}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-grid gap-2 mt-4">
                  <button onClick={handleLogout} className="btn btn-outline-danger btn-lg rounded-pill">
                    <i className="bi bi-box-arrow-left me-2"></i>Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Card */}
          <div className="col-lg-7">
            <div className="settings-card" data-aos="zoom-out" data-aos-delay="300">
              <div className="card-header border-bottom pb-3">
                <h3 className="mb-0">
                  <i className="bi bi-gear-fill me-2"></i>Account Settings
                </h3>
              </div>

              <div className="card-body">
                <form className="needs-validation" noValidate onSubmit={handleSubmit}>
                  <div className="row g-4">
                    {[
                      { id: 'fullName', label: 'Full Name', value: formData.fullName, icon: 'bi-person-fill', type: "text", name: "fullName" },
                      { id: 'username', label: 'Username', value: formData.username, icon: 'bi-at', type: "text", name: "username" },
                      { id: 'email', label: 'Email Address', value: formData.email, icon: 'bi-envelope-fill', type: "text", name: "email" },
                      { id: 'phone', label: 'Phone Number', value: formData.phone, icon: 'bi-phone-fill', type: "text", name: "phone" },
                      { id: 'newPassword', label: 'New Password', value: formData.newPassword, icon: 'bi bi-shield-lock-fill', type: "password", name: "newPassword" },
                      { id: 'confirmPassword', label: 'Confirm Password', value: formData.confirmPassword, icon: 'bi bi-shield-lock-fill', type: "password", name: "confirmPassword" },
                    ].map((input, index) => (
                      <div className="col-md-6" key={index}>
                        <div className="form-floating">
                          <input
                            className="form-control"
                            id={input.id}
                            name={input.name}
                            value={input.value}
                            onChange={handleChange}
                            type={input.type}
                            required
                          />
                          <label htmlFor={input.id}>
                            <i className={`bi ${input.icon} me-2`}></i>{input.label}
                          </label>
                          {errors[input.name] && (
                            <span className="text-danger text-sm">{errors[input.name]}</span>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="col-12 text-center">
                      <button type="submit" className="btn btn-primary btn-lg px-5 rounded-pill">
                        <i className="bi bi-save-fill me-2"></i>Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <NotificationCard
          message={notification.message}
          type={notification.type}
          show={notification.show}
          onClose={() => closeNotification()}
        />
    </section>
  );
};

export default MyProfile;