import React, { useState, useEffect } from "react";
import AppointmentService from "../../../../Services/AppointmentService";
import TableAppointments from "./components/TableAppointments";
import FullCalendarView from "../calendarView/FullCalendarView";
import ScheduleModal from "./components/ScheduleModal";

const Appointments = () => {
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [confirmedAppointments, setConfirmedAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const pendingData = await AppointmentService.getRequestedAppointments();
      const confirmedData = await AppointmentService.getConfirmedAppointments();
      setPendingAppointments(pendingData);
      setConfirmedAppointments(confirmedData);
      setLoading(false);
    } catch (err) {
      setError("Error fetching appointments");
      setLoading(false);
    }
  };

  const handleScheduleClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

 

  const handleDecline = async (id) => {
    try {
      await AppointmentService.declineAppointment(id);
      fetchAppointments();
    } catch (err) {
      setError("Error declining appointment");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="w-full p-6">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Requested Appointments Table */}
          <TableAppointments
            title="Requested Appointments"
            appointments={pendingAppointments}
            showActions={true}
            onSchedule={handleScheduleClick}
            onDecline={handleDecline}
          />

          {/*  Calendar for Confirmed Appointments */}
          <FullCalendarView appointments={confirmedAppointments} />
          {/* Schedule Modal */}
          <ScheduleModal
            isOpen={isModalOpen}
            onClose={closeModal}
            selectedAppointment={selectedAppointment}
            refreshData={fetchAppointments}
          />
        </>
      )}
    </div>
  );
};

export default Appointments;
