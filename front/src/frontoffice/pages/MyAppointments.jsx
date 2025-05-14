import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentService from '../../Services/AppointmentService';
import { toast } from 'react-toastify';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiX, FiCheck, FiMessageSquare } from 'react-icons/fi';

const FeedbackModal = ({ isOpen, appointment, loggedUser, onSubmit, onClose }) => {
  const [feedback, setFeedback] = useState('');
  
  if (!isOpen || !appointment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(appointment._id, feedback);
      onClose();
    } catch (error) {
      toast.error("Failed to submit feedback");
    }
  };
  const getImageUrl = (user) => {
    console.log("User for image:", user);
    return user?.image_user
      ? `https://espsy.onrender.com/uploads/${appointment.user.image_user}`
      : "https://via.placeholder.com/40";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">
          Feedback for appointment with {appointment.psychologist?.fullname || 'the psychologist'}
        </h3>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full p-2 border rounded mb-4"
            rows="4"
            placeholder="Enter your feedback..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MyAppointments = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser")) || {};
    const [actionId, setActionId] = useState('');
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const formatShortDate = (dateString) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const date = new Date(dateString);
        return `${date.getDate()} ${months[date.getMonth()]}`;
    };

    const getAppointments = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data } = await AppointmentService.getUserAppointments(loggedUser._id);
            setAppointments(data?.reverse() || []);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }, [loggedUser?._id]);

    const handleAction = async (appointmentId) => {
        try {
            setActionId(appointmentId);
            const response = await AppointmentService.declineAppointment(appointmentId);
            if (response.success) {
                toast.success(response.message);
                await getAppointments();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setActionId('');
        }
    };

    const handleFeedbackSubmit = async (appointmentId, feedback) => {
        try {
            if (loggedUser.role === 'student') {
                await AppointmentService.submitStudentFeedback(appointmentId, feedback);
            } else {
                await AppointmentService.submitPsychologistFeedback(appointmentId, feedback);
            }
            getAppointments();
            toast.success("Feedback submitted successfully");
        } catch (error) {
            toast.error("Failed to submit feedback");
        }
    };

    useEffect(() => {
        if (loggedUser?._id) {
            getAppointments();
        }
    }, [getAppointments, loggedUser?._id]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-5xl">
            <div className="flex justify-between items-center mb-6">
            <div className="container section-title" data-aos="fade-up">
        <h2>My Appointments</h2>
      </div>
                <span className="text-sm text-gray-500">
                    {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                </span>
            </div>

            {appointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appointments.map((appointment) => (
                        <div key={appointment._id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="p-4">
                                <div className="flex items-start space-x-3">
                                    {/* Image Container with Fallback */}
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center overflow-hidden">
                                        {appointment.psychologist?.profileImage ? (
                                            <img 
                                             src="https://espsy.onrender.com/uploads/${appointment.psychologist.image_user}"
                                             alt={appointment.psychologist.username}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%233b82f6'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";
                                                }}
                                            />
                                        ) : (
                                            <FiUser className="text-blue-600 text-xl" />
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-medium text-gray-900 truncate">
                                                {loggedUser.role === 'student' 
                                                    ? `Dr. ${appointment.psychologist?.username || ''}`
                                                    : appointment.student?.username || ''}
                                            </h3>
                                            <div className="flex items-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                    appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    appointment.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {appointment.status}
                                                </span>
                                            </div>
                                        </div>

                                        {loggedUser.role === 'student' && appointment.psychologist?.specialization && (
                                            <p className="text-sm text-gray-500 mt-1 truncate">
                                                {appointment.psychologist.specialization}
                                            </p>
                                        )}

                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                                <FiCalendar className="mr-1" />
                                                <span>{formatShortDate(appointment.scheduledDate)}</span>
                                            </div>
                                            <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                                <FiClock className="mr-1" />
                                                <span>{appointment.time}</span>
                                            </div>
                                        </div>

                                        {loggedUser.role === 'student' && appointment.psychologist?.clinicAddress && (
                                            <div className="mt-2 flex items-center text-xs text-gray-500">
                                                <FiMapPin className="mr-1" />
                                                <span className="truncate">{appointment.psychologist.clinicAddress}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 flex justify-end space-x-2">
                                    {loggedUser.role === 'student' && 
                                        ['requested', 'approved'].includes(appointment.status) && (
                                        <button 
                                            onClick={() => handleAction(appointment._id)}
                                            disabled={actionId === appointment._id}
                                            className="inline-flex items-center px-3 py-1 border border-red-200 text-red-600 rounded-md text-sm hover:bg-red-50 transition-colors"
                                        >
                                            <FiX className="mr-1" />
                                            {actionId === appointment._id ? 'Processing...' : 'Cancel'}
                                        </button>
                                    )}

                                    {loggedUser.role === 'student' && 
                                        ['completed'].includes(appointment.status) && (
                                        <button 
                                            onClick={() => {
                                                setSelectedAppointment(appointment);
                                                setShowFeedbackModal(true);
                                            }}
                                            className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                                        >
                                            <FiMessageSquare className="mr-1" />
                                            Feedback
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner mb-3">
                        <FiCalendar className="text-2xl text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-600">No appointments scheduled</h3>
                    <p className="text-gray-400 mt-1">You don't have any upcoming appointments</p>
                </div>
            )}

            <FeedbackModal
                isOpen={showFeedbackModal}
                appointment={selectedAppointment}
                loggedUser={loggedUser}
                onSubmit={handleFeedbackSubmit}
                onClose={() => {
                    setShowFeedbackModal(false);
                    setSelectedAppointment(null);
                }}
            />
        </div>
    );
};

export default MyAppointments;