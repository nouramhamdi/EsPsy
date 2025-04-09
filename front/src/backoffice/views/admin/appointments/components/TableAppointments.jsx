import React from "react";

const TableAppointments = ({ title, appointments, showActions, onSchedule, onDecline }) => {
  return (
    <div className="w-full mb-8">
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Student</th>
            <th className="border p-2">Psychologist</th>
            <th className="border p-2">{showActions ? "Description" : "Scheduled Date"}</th>
            {showActions ? <th className="border p-2">Actions</th> : <th className="border p-2">File</th>}
          </tr>
        </thead>
        <tbody>
          {appointments.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center p-3">No appointments found</td>
            </tr>
          ) : (
            appointments.map((appointment) => (
              <tr key={appointment._id} className="border">
                <td className="border p-2">{appointment.student.fullname}</td>
                <td className="border p-2">{appointment.psychologist.fullname}</td>
                <td className="border p-2">
                  {showActions ? appointment.description : new Date(appointment.scheduledDate).toLocaleString()}
                </td>
                {showActions ? (
                  <td className="border p-2">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                      onClick={() => onSchedule(appointment._id)} // Call onSchedule with the appointment ID
                    >
                      Schedule
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => onDecline(appointment._id)}
                    >
                      Decline
                    </button>
                  </td>
                ) : (
                  <td className="border p-2">{appointment.filePatient?.diagnosis || "No File"}</td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TableAppointments;