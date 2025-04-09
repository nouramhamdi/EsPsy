import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppointmentService from '../../Services/AppointmentService'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets/assets'
import FeedbackModal from 'frontoffice/components/FeedbackModal'

const MyAppointments = () => {
    const navigate = useNavigate()
    const [appointments, setAppointments] = useState([])
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"))
    const [actionId, setActionId] = useState('')

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Date formatting function from the design
    const slotDateFormat = (dateString) => {
        const date = new Date(dateString)
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
    }

    // Fetch user appointments
    const getAppointments = useCallback(async () => {
        try {
            const { data } = await AppointmentService.getUserAppointments(loggedUser._id);
            setAppointments(data.reverse());
        } catch (error) {
            toast.error(error.message);
        }
    }, [loggedUser?._id]);

    // Handle appointment actions
    const handleAction = async (appointmentId) => {
        try {

            let response;
            response = await AppointmentService.declineAppointment(appointmentId)
            
            if (response.success) {
                toast.success(response.message)
                getAppointments()
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    }

    useEffect(() => {
        if (loggedUser?._id) {
            getAppointments();
        }
    }, [getAppointments, loggedUser?._id]); 




    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
  
    const handleFeedbackSubmit = async (appointmentId, feedback) => {
      try {
        if (loggedUser.role === 'student') {
          await AppointmentService.submitStudentFeedback(appointmentId, feedback);
        } else {
          await AppointmentService.submitPsychologistFeedback(appointmentId, feedback);
        }
        getAppointments(); // Refresh the list
      } catch (error) {
        throw error;
      }
    };


    return (
        <div className='container mx-auto px-8 sm:px-64'>
            <p className='pb-3 mt-12 text-lg font-medium text-gray-600 border-b'>My Appointments</p>
            <div className=''>
                {appointments.map((appointment) => (
                    <div key={appointment._id} className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-4 border-b'>
                        <div>
                            <img 
                                className='w-36 bg-[#EAEFFF] rounded-lg' 
                                src={assets.appointment_img} 
                                alt="profile" 
                            />
                        </div>
                        
                        <div className='flex-1 text-sm text-[#5E5E5E]'>
                            <p className='text-[#262626] text-base font-semibold'>
                                {loggedUser.role === 'student' 
                                    ? `Dr. ${appointment.psychologist?.username}`
                                    : appointment.student?.username}
                            </p>
                            
                            {loggedUser.role === 'student' && (
                                <>
                                    <p>{appointment.psychologist?.specialization}</p>
                                    <p className='text-[#464646] font-medium mt-1'>Address: El Ghazela Esprit</p>
                                    <p className=''>{appointment.psychologist?.clinicAddress}</p>
                                </>
                            )}
                            
                            <p className='mt-1'>
                                <span className='text-sm text-[#3C3C3C] font-medium'>
                                    Date & Time:
                                </span> {slotDateFormat(appointment.scheduledDate)} | {appointment.time}
                            </p>
                        </div>

                        <div className='flex flex-col gap-2 justify-end text-sm text-center'>
                            <span className={`px-2 py-1 rounded text-sm ${
                                appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {appointment.status}
                            </span>


                            {loggedUser.role === 'student' && 
                                ['requested', 'approved'].includes(appointment.status) && (
                                <button 
                                    onClick={() => {
                                        setActionId(appointment._id)
                                        handleAction(appointment._id)
                                    }}
                                    className='sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'
                                    disabled={actionId === appointment._id}
                                >
                                    {actionId === appointment._id ? 'Canceled' : 'Cancel'}
                                </button>
                                
                            )}

                            {loggedUser.role === 'student' && 
                                ['completed'].includes(appointment.status) && (
                                <button 
                                onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setShowFeedbackModal(true);
                                  }}
                                    className='sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300'
                                    disabled={actionId === appointment._id}
                                >
                                 FeedBack
                                </button>
                                
                            )}

                            {appointment.status === 'declined' && (
                                <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>
                                    Cancelled
                                </button>
                            )}

                            {appointment.status === 'completed' && (
                                <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>
                                    Completed
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {appointments.length === 0 && (
                    <div className='text-center text-gray-500 mt-8'>
                        No appointments found
                    </div>
                )}
            </div>
            
      {showFeedbackModal && (
        <FeedbackModal
          appointment={selectedAppointment}
          loggedUser={loggedUser}
          onSubmit={handleFeedbackSubmit}
          onClose={() => {
            setShowFeedbackModal(false);
            setSelectedAppointment(null);
          }}
        />
      )}
        </div>
    )
}

export default MyAppointments