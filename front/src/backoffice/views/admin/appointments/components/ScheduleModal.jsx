import React, { useState, useEffect } from "react";
import AppointmentService from "../../../../../Services/AppointmentService";
import NotificationCard from "backoffice/components/card/NotificationCard";

const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const ScheduleModal = ({ isOpen, onClose, selectedAppointment, refreshData }) => {
  const psychologist = JSON.parse(localStorage.getItem("loggedUser"));
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
  };

  const generateAllTimes = () => {
    const times = [];
    for (let hour = 9; hour <= 16; hour++) {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      const timeString = `${displayHour.toString().padStart(2, '0')}:00 ${period}`;
      times.push(timeString);
    }
    return times;
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const fetchAvailableSlots = async (date) => {
    try {
      const formattedDate = date.toISOString().split("T")[0];
      const { bookedSlots = [] } = await AppointmentService.getBookedSlots(psychologist._id, formattedDate);
      const allTimes = generateAllTimes();
      const available = allTimes.filter(time => !bookedSlots.includes(time));
      setAvailableSlots(available);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([]);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedTime("");
    fetchAvailableSlots(date);
  };

  const handleTimeClick = (time) => {
    setSelectedTime(time);
  };

  const handleSchedule = async () => {
    try {
      if (!selectedDate || !selectedTime) {
        showNotification("Please select new date and time", "error");
        return;
      }

      const formattedDate = selectedDate.toISOString().split("T")[0];
      await AppointmentService.rescheduleAppointment(
        selectedAppointment, 
        psychologist._id,
        formattedDate,
        selectedTime
      );
      showNotification("A confirmed email has been successfully sent", "success");
      refreshData();
      onClose();
    } catch (error) {
      console.error("Reschedule failed:", error);
      showNotification("Reschedule failed", "error");
    }
  };

  const closeNotification = () => {
    setNotification({ show: false, message: "", type: "" });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto z-60">
          <h2 className="text-xl font-semibold mb-4">Schedule Appointment</h2>

          {/* Date selection */}
          <div className="flex gap-2 overflow-x-scroll mb-4">
            {generateDates().map((date, index) => (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={`text-center py-3 min-w-14 rounded-full cursor-pointer ${
                  selectedDate?.toDateString() === date.toDateString()
                    ? "bg-primary text-white"
                    : "border border-gray-300"
                }`}
              >
                <p className="text-sm">{daysOfWeek[date.getDay()]}</p>
                <p className="text-sm">{date.getDate()}</p>
              </div>
            ))}
          </div>

          {/* Time slots selection */}
          <div className="flex gap-2 flex-wrap mb-4">
            {/* Afficher un message si aucune disponibilité */}
            {availableSlots.length === 0 ? (
              <p className="text-gray-600">No available slots for this date.</p>
            ) : (
              availableSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleTimeClick(slot)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold border ${
                    selectedTime === slot ? "bg-primary text-white" : "bg-gray-100"
                  }`}
                >
                  {slot}
                </button>
              ))
            )}
          </div>

          {/* Schedule Button */}
          <div className="flex justify-between items-center mt-6">
            
            <button
              onClick={onClose}
              className="text-gray-600 py-2 px-6 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSchedule}
              className="bg-primary text-white py-2 px-6 rounded-md"
            >
              Schedule
            </button>
          </div>

          {/* Notification Card */}
          {notification.show && (
            <NotificationCard
              message={notification.message}
              type={notification.type}
              onClose={closeNotification}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ScheduleModal;
