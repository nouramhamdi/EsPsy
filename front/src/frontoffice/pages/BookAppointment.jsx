import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserService from '../../Services/UserService'; // Adjust import path
import AppointmentService from "../../Services/AppointmentService";
import NotificationCard from "backoffice/components/card/NotificationCard"; // Adjust path if needed

const BookAppointment = () => {
  const { psychologistId } = useParams(); // Modified to match psychologistId
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?._id;

  // State for notification
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Function to show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });

    // Hide the notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // State for doctor, selected date and time
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    const fetchPsychologists = async () => {
      try {
        const data = await UserService.getAllUsers();
        const allUsers = data.users;
        const foundDoctor = allUsers.find(doc => doc._id === psychologistId); 
        if (foundDoctor) setDoctor(foundDoctor);
      } catch (error) {
        console.error('Error fetching psychologists:', error);
      }
    };
    fetchPsychologists();
  }, [psychologistId]);

  // Function to generate available time slots based on booked slots
  const fetchAvailableSlots = async (date) => {
    try {
      const formattedDate = date.toISOString().split("T")[0];
      const { bookedSlots = [] } = await AppointmentService.getBookedSlots(psychologistId, formattedDate);
      const allTimes = generateTimeSlots();
      const available = allTimes.filter(time => !bookedSlots.includes(time));
      setAvailableSlots(available);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    }
  };

  // Generate all time slots for the day
  const generateTimeSlots = () => {
    const times = [];
    const startDate = new Date();
    startDate.setHours(9, 0, 0, 0);
    
    for (let i = 0; i < 16; i++) {
      const time = new Date(startDate);
      time.setMinutes(startDate.getMinutes() + i * 30);
      times.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    return times;
  };

  const handleBooking = async () => {
    try {
      if (!selectedDate || !selectedTime) {
        showNotification("Please select a date and time", "error");
        return;
      }
  
      const formattedDate = new Date(selectedDate).toISOString().split("T")[0];
      const loggedInUser = JSON.parse(localStorage.getItem("loggedUser")); 
      const studentId = loggedInUser._id; 
  
      console.log("Payload sent to backend:", {
        studentId,
        psychologistId,
        date: formattedDate,
        time: selectedTime,
      });
  
      await AppointmentService.createAppointment(
        studentId,
        psychologistId,
        formattedDate,
        selectedTime
      );
  
      // Show success notification
      showNotification("Appointment booked successfully. We will redirect you to the home page.", "success");
  
      // Temporary success message in localStorage
      localStorage.setItem("appointmentSuccess", "Your appointment has been confirmed!");
  
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/app/MyAppointments"); // Redirige vers la page d'accueil après 2 secondes
      }, 500); // 3 seconds delay for the notification to show
  
    } catch (error) {
      console.error("Booking failed:", error);
      showNotification("Booking failed. Please try again.", "error");
    }
  };
  
  
  
  

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchAvailableSlots(new Date(newDate)); // Fetch available slots for the new date
  };

  if (!doctor) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Doctor Info */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <img 
            className="w-full h-90 object-cover" 
            src="/assets/img/doc1.png" 
            alt={doctor.name}
          />
          <div className="p-4">
            <h2 className="text-xl font-medium mb-2">{doctor.name}</h2>
            <p className="text-gray-500 mb-4">{doctor.speciality}</p>
          </div>
        </div>

        {/* Booking Form */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Book Appointment</h3>
          
          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Select Date</label>
            <input 
              type="date" 
              className="w-full p-2 border rounded"
              onChange={handleDateChange}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-600 mb-2">Select Time</label>
            <div className="flex flex-wrap gap-2">
              {availableSlots.length > 0 ? (
                availableSlots.map(time => (
                  <button 
                    key={time}
                    className={`px-4 py-2 rounded ${selectedTime === time ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </button>
                ))
              ) : (
                <p>No available slots for this date.</p>
              )}
            </div>
          </div>

          <button 
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg"
            onClick={handleBooking}
          >
            Confirm Booking
          </button>
        </div>

        {/* Notification Card */}
        {notification.show && (
          <NotificationCard
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ show: false })}
          />
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
