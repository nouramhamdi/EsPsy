import React, { useEffect, useState } from "react";
import Card from "../../../components/card";
import userServices from "../../../../Services/UserService"; // Adjust the path
import appointmentService from "../../../../Services/AppointmentService"; 
import NotificationCard from "backoffice/components/card/NotificationCard";

const SendRequest = ({ loggedUser }) => {
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

  const [students, setStudents] = useState([]);
  const [psychologists, setPsychologists] = useState([]);
  
  const [formData, setFormData] = useState({
    student: "",
    psychologist: "",
    description: "",
  });

  // Fetch students & psychologists
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userServices.getAllUsers();
        setStudents(data.users.filter(user => user.role === "student"));
        setPsychologists(data.users.filter(user => user.role === "psychologist"));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Validate form before submission
  const validateForm = () => {
    if (!formData.student || !formData.psychologist || !formData.description) {
      showNotification("All fields are required.", "error");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const requestData = {
        student: formData.student,
        psychologist: formData.psychologist,
        description: formData.description,
      };

      await appointmentService.requestAppointment(requestData);
      showNotification("Appointment request submitted successfully!", "success");
      setFormData({ student: "", psychologist: "", description: "" });

    } catch (error) {
      console.error("Error submitting request:", error);
      showNotification("Failed to submit request. Try again.", "error");
    }
  };

  return (
    <>
      <Card extra={"w-full h-full p-3"}>
        <div className="mt-2 mb-8 w-full">
         
          <p className="mt-2 px-2 text-base text-gray-600">
            Select a student, psychologist, and description for the appointment.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 px-2">
            {/* Select Student */}
            <div className="flex flex-col">
              <label className="text-sm text-brand-900 dark:text-white">Select Student</label>
              <select
                name="student"
                value={formData.student}
                onChange={handleChange}
                className="p-2 rounded-md bg-lightPrimary text-navy-700 dark:bg-navy-900 dark:text-white"
              >
                <option value="">-- Choose a student --</option>
                {students.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.fullname}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Psychologist */}
            <div className="flex flex-col">
              <label className="text-sm text-brand-900 dark:text-white">Select Psychologist</label>
              <select
                name="psychologist"
                value={formData.psychologist}
                onChange={handleChange}
                className="p-2 rounded-md bg-lightPrimary text-navy-700 dark:bg-navy-900 dark:text-white"
              >
                <option value="">-- Choose a psychologist --</option>
                {psychologists.map(psy => (
                  <option key={psy._id} value={psy._id}>
                    {psy.fullname}
                  </option>
                ))}
              </select>
            </div>

             {/* Description Input */}
            <div className="flex flex-col">
              <label className="text-sm text-brand-900 dark:text-white">Describe the Student’s Case</label>
             <textarea name="description" value={formData.description} onChange={handleChange} className="p-2 rounded-md"></textarea>
           </div>
          </div>

          {/* Submit Button */}
          <div className="mt-4 flex justify-center">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Request Appointment
            </button>
          </div>
        </form>
      </Card>

      <NotificationCard
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={closeNotification}
      />
    </>
  );
};

export default SendRequest;
