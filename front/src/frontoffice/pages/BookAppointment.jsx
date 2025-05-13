import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserService from '../../Services/UserService';
import AppointmentService from "../../Services/AppointmentService";
import NotificationCard from "backoffice/components/card/NotificationCard";
import { FiCalendar, FiClock, FiUser, FiMapPin, FiArrowLeft } from 'react-icons/fi';

const BookAppointment = () => {
  const { psychologistId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?._id;

  // State management
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const getImageUrl = (user) => {
    console.log("User for image:", user);
    return user?.image_user
      ? `http://localhost:5000/uploads/${user.image_user}`
      : "https://via.placeholder.com/40";
  };
  // Notification handler
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  // Fetch psychologist data
  useEffect(() => {
    const fetchPsychologist = async () => {
      try {
        setIsLoading(true);
        const data = await UserService.getAllUsers();
        const foundDoctor = data.users.find(doc => doc._id === psychologistId);
        if (foundDoctor) setDoctor(foundDoctor);
      } catch (error) {
        console.error('Error fetching psychologist:', error);
        showNotification("Failed to load psychologist data", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPsychologist();
  }, [psychologistId]);

  // Generate time slots
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

  // Fetch available slots
  const fetchAvailableSlots = async (date) => {
    try {
      if (!date) return;
      
      const formattedDate = new Date(date).toISOString().split("T")[0];
      const { bookedSlots = [] } = await AppointmentService.getBookedSlots(psychologistId, formattedDate);
      const allTimes = generateTimeSlots();
      const available = allTimes.filter(time => !bookedSlots.includes(time));
      setAvailableSlots(available);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    }
  };

  // Handle booking
  const handleBooking = async () => {
    try {
      if (!selectedDate || !selectedTime) {
        showNotification("Please select a date and time", "error");
        return;
      }
  
      const formattedDate = new Date(selectedDate).toISOString().split("T")[0];
      const loggedInUser = JSON.parse(localStorage.getItem("loggedUser")); 
      const studentId = loggedInUser._id; 
  
      await AppointmentService.createAppointment(
        studentId,
        psychologistId,
        formattedDate,
        selectedTime
      );
  
      showNotification("Appointment booked successfully!", "success");
      localStorage.setItem("appointmentSuccess", "Your appointment has been confirmed!");
  
      setTimeout(() => navigate("/app/MyAppointments"), 1500);
    } catch (error) {
      console.error("Booking failed:", error);
      showNotification(error.response?.data?.message || "Booking failed. Please try again.", "error");
    }
  };

  // Handle date change
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setSelectedTime('');
    fetchAvailableSlots(newDate);
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!doctor) return (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium text-gray-600">Psychologist not found</h3>
      <button 
        onClick={() => navigate(-1)}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Back
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
      >
        <FiArrowLeft className="mr-2" />
        Back to list
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Doctor Profile Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="relative h-48 bg-gradient-to-r from-blue-50 to-blue-100">
            <img 
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-40 w-40 rounded-full border-4 border-white object-cover shadow-md"
              src={getImageUrl(doctor)}
              alt={doctor.name}
              onError={(e) => e.target.src = "/assets/img/default-profile.png"}
            />
          </div>
          
          <div className="pt-20 pb-6 px-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800">{doctor.name}</h2>
            <p className="text-blue-600 font-medium">{doctor.speciality}</p>
            
            <div className="mt-6 grid grid-cols-2 gap-4 text-left">
              <div className="flex items-center text-gray-600">
                <FiUser className="mr-2 text-blue-500" />
                <span>DR. {doctor.fullname || 'Not specified'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiMapPin className="mr-2 text-blue-500" />
                <span>{doctor.clinicAddress || 'Online'}</span>
              </div>
            </div>
            
            {doctor.bio && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600">{doctor.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <FiCalendar className="mr-2 text-blue-500" />
              Book Appointment
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <div className="relative">
                  <input 
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={handleDateChange}
                    value={selectedDate}
                  />
                  <FiCalendar className="absolute right-3 top-3.5 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
                {selectedDate ? (
                  availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                    {availableSlots.map(time => (
                      <button 
                        key={time}
                        className={`py-2 px-3 rounded-lg border transition-all ${
                          selectedTime === time 
                            ? 'bg-[var(--accent-color)] text-[var(--contrast-color)] border-[var(--accent-color)]' 
                            : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--accent-color)]'
                        }`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No available slots for this date</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Please select a date first</p>
                  </div>
                )}
              </div>
              
              <button
  className={`w-full py-2 px-4 rounded-lg transition-opacity font-medium ${
    selectedDate && selectedTime
      ? 'bg-[var(--accent-color)] hover:opacity-90 text-[var(--contrast-color)]'
      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
  }`}
  onClick={handleBooking}
  disabled={!selectedDate || !selectedTime}
>
  Confirm Appointment
</button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification.show && (
        <div className="fixed bottom-6 right-6 z-50">
          <NotificationCard
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification({ show: false })}
          />
        </div>
      )}
    </div>
  );
};

export default BookAppointment;