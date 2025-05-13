import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CardMenu from "../../../../backoffice/components/card/CardMenu";
import Card from "../../../../backoffice/components/card";
import EventServices from "../../../../Services/EventService"; // Assure-toi d'importer le service


const TableEvent = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [refresh, setRefresh] = useState(0); // Ajout d'un état pour forcer le rafraîchissement
  const [message, setMessage] = useState({ text: "", type: "", id: null });
  const eventsPerPage = 4;
  const navigate = useNavigate();

  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

    if (loggedUser && loggedUser.role === "psychologist") {
      // Récupérer uniquement les événements du psychologue connecté
      axios.get(`http://localhost:5000/events/psychologist/${loggedUser._id}`)
        .then((response) => {
          // Pour les psychologues, on affiche tous les événements, y compris les annulés
          setEvents(response.data);
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des événements:", error);
        });
    } else {
      // Pour les autres rôles (admin), récupérer tous les événements
      EventServices.getAllEvents()
        .then((data) => {
          // Pour les admins, on affiche tous les événements, y compris les annulés
          setEvents(data);
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des événements:", error);
        });
    }
  }, [refresh]);

  const handleActivateClick = () => {
    navigate("/admin/EventsManagement/addEvenement");
  };

  const handleReservationsClick = () => {
    navigate("/admin/reservations");
  };

  const handleDelete = (id) => {
    setMessage({ text: "Are you sure you want to delete this event?", type: "error", id });
  };

  const handleConfirmDelete = (id) => {
    EventServices.deleteEvent(id) // Utilisation du service pour supprimer l'événement
      .then(() => {
        setEvents(events.filter((event) => event._id !== id)); // Mise à jour de la liste après suppression
        setRefresh(refresh + 1); // Forcer le rechargement
        setMessage({ text: "Event has been successfully deleted!", type: "success", id: null });
        setTimeout(() => setMessage({ text: "", type: "", id: null }), 3000);
      })
      .catch((error) => {
        console.error("Erreur lors de la suppression:", error);
        setMessage({ text: "Error while deleting the event. Please try again.", type: "error", id: null });
        setTimeout(() => setMessage({ text: "", type: "", id: null }), 3000);
      });
  };

  const handleCancelDelete = () => {
    setMessage({ text: "", type: "", id: null });
  };

  const handleCancelEvent = (eventId, eventDate) => {
    const eventDateObj = new Date(eventDate);
    const currentDate = new Date();

    if (currentDate >= eventDateObj) {
      setMessage({
        text: "Cannot cancel an event that has already passed or is in progress.",
        type: "error",
        id: null
      });
      setTimeout(() => setMessage({ text: "", type: "", id: null }), 3000);
      return;
    }

    setMessage({
      text: "Are you sure you want to cancel this event?",
      type: "warning",
      id: eventId,
      action: "cancel"
    });
  };

  const handleConfirmCancel = (eventId) => {
    EventServices.updateEventStatus(eventId, "cancelled")
      .then(() => {
        setEvents(events.map(event =>
          event._id === eventId ? { ...event, status: "cancelled" } : event
        ));
        setRefresh(refresh + 1);
        setMessage({
          text: "Event has been successfully cancelled!",
          type: "success",
          id: null
        });
        setTimeout(() => setMessage({ text: "", type: "", id: null }), 3000);
      })
      .catch((error) => {
        console.error("Error cancelling event:", error);
        setMessage({
          text: "Error while cancelling the event. Please try again.",
          type: "error",
          id: null
        });
        setTimeout(() => setMessage({ text: "", type: "", id: null }), 3000);
      });
  };

  const handleCancelAction = () => {
    setMessage({ text: "", type: "", id: null });
  };

  const handleReinstateEvent = (eventId) => {
    setMessage({
      text: "Are you sure you want to reinstate this event?",
      type: "warning",
      id: eventId,
      action: "reinstate"
    });
  };

  const handleConfirmReinstate = (eventId) => {
    EventServices.updateEventStatus(eventId, "active")
      .then(() => {
        setEvents(events.map(event =>
          event._id === eventId ? { ...event, status: "active" } : event
        ));
        setRefresh(refresh + 1);
        setMessage({
          text: "Event has been successfully reinstated!",
          type: "success",
          id: null
        });
        setTimeout(() => setMessage({ text: "", type: "", id: null }), 3000);
      })
      .catch((error) => {
        console.error("Error reinstating event:", error);
        setMessage({
          text: "Error while reinstating the event. Please try again.",
          type: "error",
          id: null
        });
        setTimeout(() => setMessage({ text: "", type: "", id: null }), 3000);
      });
  };

  const filteredEvents = events.filter((event) => {
    const searchLower = searchTerm.toLowerCase();
    const dateStr = new Date(event.date).toLocaleDateString();

    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.description.toLowerCase().includes(searchLower) ||
      event.eventType.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower) ||
      dateStr.includes(searchTerm)
    );
  });

  // Calculer les index pour la pagination
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  // Fonction pour changer de page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Card extra={"w-full h-full sm:overflow-auto px-6"}>
      <header className="relative flex items-center justify-between pt-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          Events List
        </div>
        {message.text && (
          <div className={`p-4 mb-4 rounded text-center ${
            message.type === "success" ? "bg-green-100 text-green-700 border border-green-400" :
            message.type === "error" ? "bg-red-100 text-red-700 border border-red-400" :
            message.type === "warning" ? "bg-yellow-100 text-yellow-700 border border-yellow-400" :
            ""
          }`}>
            <div className="flex flex-col items-center">
              <p>{message.text}</p>
              {(message.type === "warning" || message.type === "error") && (
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => {
                      if (message.action === "cancel") {
                        handleConfirmCancel(message.id);
                      } else if (message.action === "reinstate") {
                        handleConfirmReinstate(message.id);
                      } else {
                        handleConfirmDelete(message.id);
                      }
                    }}
                    className="px-3 py-1 text-sm font-bold text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    Yes
                  </button>
                  <button
                    onClick={handleCancelAction}
                    className="px-3 py-1 text-sm font-bold text-white bg-gray-500 rounded hover:bg-gray-600"
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flex space-x-3">
          <button
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded transition-colors duration-300"
            onClick={handleActivateClick}
          >
            Add Event
          </button>
          <button
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors duration-300"
            onClick={handleReservationsClick}
          >
            Reservations
          </button>
        </div>
      </header>

      {/* Search bar */}
      <div className="my-4">
        <input
          type="text"
          placeholder="Search by title, type, description, date or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Events table */}
      <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
        <table className="w-full">
          <thead>
            <tr className="!border-px !border-gray-400">
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  IMAGE
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  TITLE
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  DESCRIPTION
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  TYPE
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  DATE
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  LOCATION
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  MAX PARTICIPANTS
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  TARGET AUDIENCE
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  STATUS
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  ACTIONS
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentEvents.map((event) => (
              <tr key={event._id}>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  {event.eventPicture ? (
                    <div>
                      <img
                        src={event.eventPictureIsUrl ? event.eventPicture : `data:image/jpeg;base64,${event.eventPicture}`}
                        alt={event.title}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          console.error("Erreur de chargement de l'image:", e.target.src);
                          // En cas d'erreur de chargement, utiliser une image par défaut
                          e.target.onerror = null;
                          e.target.src = `https://via.placeholder.com/160x160?text=${encodeURIComponent(event.title)}`;
                        }}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {event.eventPictureIsUrl ? "Image IA" : "Image téléchargée"}
                      </div>
                    </div>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {event.title}
                  </p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {event.description}
                  </p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {event.eventType}
                  </p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {event.location}
                  </p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {event.maxParticipants}
                  </p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {event.targetAudience}
                  </p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className={`text-sm font-bold ${event.status === 'active' ? 'text-green-600' : event.status === 'cancelled' ? 'text-red-600' : 'text-gray-600'}`}>
                    {event.status}
                  </p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <div className="flex space-x-2">
                    {/* Bouton Details */}
                    <button
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-300"
                      onClick={() => navigate(`/admin/EventsManagement/event-reservations/${event._id}`)}
                    >
                      Details
                    </button>
                    {/* Bouton Edit */}
                    <button
                      className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded transition-colors duration-300"
                      onClick={() => navigate(`/admin/EventsManagement/updateEvenement/${event._id}`)}
                    >
                      Edit
                    </button>
                    {/* Bouton Reinstate */}
                    {event.status === "cancelled" && new Date(event.date) > new Date() && (
                      <button
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors duration-300"
                        onClick={() => handleReinstateEvent(event._id)}
                      >
                        Reinstate
                      </button>
                    )}
                    {/* Bouton Cancel */}
                    {event.status !== "cancelled" && new Date(event.date) > new Date() && (
                      <button
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors duration-300"
                        onClick={() => handleCancelEvent(event._id, event.date)}
                      >
                        Cancel
                      </button>
                    )}
                    {/* Bouton Delete */}
                    <button
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-300"
                      onClick={() => handleDelete(event._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex justify-center space-x-2 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>

          {/* Première page */}
          <button
            onClick={() => setCurrentPage(1)}
            className={`px-3 py-1 rounded ${
              currentPage === 1 ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            1
          </button>

          {/* Deuxième page si elle existe */}
          {totalPages >= 2 && (
            <button
              onClick={() => setCurrentPage(2)}
              className={`px-3 py-1 rounded ${
                currentPage === 2 ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              2
            </button>
          )}

          {/* Troisième page si elle existe */}
          {totalPages >= 3 && (
            <button
              onClick={() => setCurrentPage(3)}
              className={`px-3 py-1 rounded ${
                currentPage === 3 ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              3
            </button>
          )}

          {/* Ellipsis si plus de 3 pages */}
          {totalPages > 3 && (
            <>
              <span className="px-2">...</span>
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </Card>
  );
};

export default TableEvent;