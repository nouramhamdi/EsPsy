import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AppointmentService from "../../../../Services/AppointmentService";

const FullCalendarView = ({ appointments, refreshData }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const formatDateTime = (scheduledDate, time) => {
      const [hours, minutes] = time.split(":");
      const period = minutes.split(" ")[1];
      let [hour, minute] = time.split(" ")[0].split(":");

      if (period === "PM" && hour !== "12") hour = parseInt(hour) + 12;
      if (period === "AM" && hour === "12") hour = 0;

      const date = new Date(scheduledDate);
      date.setHours(hour);
      date.setMinutes(minute);
      return date;
    };

    const formattedEvents = appointments.map((appt) => ({
      id: appt._id,
      title: appt.student?.fullname || "N/A",
      start: formatDateTime(appt.scheduledDate, appt.time),
      allDay: false,
      extendedProps: {
        psychologistId: appt.psychologist,
        status: appt.status // Ajout du statut si disponible
      },
    }));

    setEvents(formattedEvents);
  }, [appointments]);

  const handleEventDrop = async (eventInfo) => {
    const { event } = eventInfo;
    const appointmentId = event.id;
    const psychologistId = event.extendedProps.psychologistId;
    const newDate = event.start.toISOString().split("T")[0]; // Format de la date (YYYY-MM-DD)
    const newTime = `${event.start.getHours()}:${event.start.getMinutes()}`;
  
    try {
      // Mettre à jour l'événement dans la base de données
      await AppointmentService.updateAppointmentDate(appointmentId, psychologistId, newDate, newTime);
      
      // Mettre à jour les événements dans l'état local pour refléter le changement
      setEvents((prevEvents) =>
        prevEvents.map((evt) =>
          evt.id === appointmentId ? { ...evt, start: event.start, end: event.end } : evt
        )
      );
  
      refreshData(); // Rafraîchir les rendez-vous si nécessaire
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rendez-vous", error);
      eventInfo.revert(); // Revenir à la position initiale si erreur
    }
  };
  

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        }}
        events={events}
        editable={true}
        droppable={true}
        eventDrop={handleEventDrop}
        selectable={true}
        dayMaxEvents={true}
        nowIndicator={true}
        height="auto"
        eventContent={(eventInfo) => (
          <div className="p-1">
            <div className="flex items-start">
              <div className={`w-2 h-2 mt-1.5 mr-2 rounded-full flex-shrink-0 ${
                eventInfo.event.extendedProps.status === 'confirmed' 
                  ? 'bg-green-500' 
                  : 'bg-blue-500'
              }`}></div>
              <div className="overflow-hidden">
                <div className="text-xs text-gray-600 truncate">
                  {eventInfo.timeText}
                </div>
                <div className="text-sm font-medium text-gray-900 truncate">
                  {eventInfo.event.title}
                </div>
              </div>
            </div>
          </div>
        )}
        eventClassNames={(arg) => 
          `border-l-4 ${arg.event.extendedProps.status === 'confirmed' 
            ? 'border-green-500 bg-green-50 hover:bg-green-100' 
            : 'border-blue-500 bg-blue-50 hover:bg-blue-100'}`
        }
        headerToolbarClassNames="border-none mb-4"
        buttonClassNames="text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium"
        buttonTodayClassNames="text-blue-600 hover:bg-blue-50"
        buttonActiveClassNames="bg-gray-100 text-gray-900"
        dayHeaderClassNames="border-none pt-4 pb-2 text-gray-600 uppercase text-xs font-semibold"
        dayCellClassNames="border-gray-100 hover:bg-gray-50"
        nowIndicatorClassNames="bg-red-500 opacity-50"
        todayClassNames="bg-blue-50/30"
        viewClassNames="border-none"
        moreLinkClassNames="text-xs text-gray-500 hover:text-gray-700"
        moreLinkContent={(args) => `+${args.num} more`}
        dayHeaderContent={(args) => (
          <div className="flex flex-col items-center">
            <span className="text-xs font-medium text-gray-500 uppercase">
              {args.date.toLocaleDateString('fr-FR', { weekday: 'short' })}
            </span>
            <span className="text-sm font-medium text-gray-900 mt-1">
              {args.date.getDate()}
            </span>
          </div>
        )}
      />
    </div>
  );
};

export default FullCalendarView;