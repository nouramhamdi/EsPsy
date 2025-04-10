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
    EventServices.getAllEvents()
      .then((data) => {
        setEvents(data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des événements:", error);
      });
  }, [refresh]); // Utiliser refresh comme dépendance

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
    <Card extra={"w-full h-full p-4"}>
      <header className="relative flex items-center justify-between mb-4">
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
              {message.type === "error" && message.text === "Are you sure you want to delete this event?" && (
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => handleConfirmDelete(message.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Yes
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border-b border-gray-200 p-4 text-start">Title</th>
              <th className="border-b border-gray-200 p-4 text-start">Description</th>
              <th className="border-b border-gray-200 p-4 text-start">Type</th>
              <th className="border-b border-gray-200 p-4 text-start">Date</th>
              <th className="border-b border-gray-200 p-4 text-start">Location</th>
              <th className="border-b border-gray-200 p-4 text-start">Participants Max</th>
              <th className="border-b border-gray-200 p-4 text-start">Public Ciblé</th>
              <th className="border-b border-gray-200 p-4 text-start">Statut</th>
              <th className="border-b border-gray-200 p-4 text-start">Image</th>
              <th className="border-b border-gray-200 p-4 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEvents.map((event) => (
              <tr key={event._id}>
                <td className="border-b border-gray-200 p-4">{event.title}</td>
                <td className="border-b border-gray-200 p-4">{event.description}</td>
                <td className="border-b border-gray-200 p-4">{event.eventType}</td>
                <td className="border-b border-gray-200 p-4">{new Date(event.date).toLocaleDateString()}</td>
                <td className="border-b border-gray-200 p-4">{event.location}</td>
                <td className="border-b border-gray-200 p-4">{event.maxParticipants}</td>
                <td className="border-b border-gray-200 p-4">{event.targetAudience}</td>
                <td className={`border-b border-gray-200 p-4 ${event.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {event.status}
                </td>
                <td className="border-b border-gray-200 p-4">
                  {event.eventPicture ? (
                    <img 
                      src={`data:image/jpeg;base64,${event.eventPicture}`} 
                      alt={event.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="border-b border-gray-200 p-4">
                  <div className="flex space-x-2">
                    {/* Bouton Edit */}
                    <button
                      className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded transition-colors duration-300"
                      onClick={() => navigate(`/admin/EventsManagement/updateEvenement/${event._id}`)}
                    >
                      Edit
                    </button>
                    {/* Bouton Delete */}
                    <button
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors duration-300"
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
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1
                  ? "bg-gray-600 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </Card>
  );
};

export default TableEvent;