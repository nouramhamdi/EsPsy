import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "../../backoffice/components/card";
import { getEventRecommendations } from "../../Services/recommendationService";

const EventsSection = () => {
  const [events, setEvents] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [currentRecPage, setCurrentRecPage] = useState(1); // Added for Recommendations pagination
  const eventsPerPage = 3; // Set to 3 cards per page
  const navigate = useNavigate();

  // Types d'événements disponibles
  const eventTypes = [
    "Workshop",
    "Therapy Session",
    "Seminar",
    "Social Event",
    "Support Group",
  ];

  // Fonction pour récupérer les réservations
  const fetchReservations = async () => {
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
    const userId = loggedUser?._id;
    console.log("Tentative de récupération des réservations pour l'utilisateur:", userId);

    if (!userId) {
      console.error("ID utilisateur non trouvé dans le localStorage");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/reservations/user/${userId}`);
      console.log("Réponse complète des réservations:", response);
      console.log("Données des réservations:", response.data);

      if (Array.isArray(response.data)) {
        setReservations(response.data);
        console.log("Réservations mises à jour:", response.data);
      } else {
        console.error("Les données de réservation ne sont pas un tableau:", response.data);
        setReservations([]);
      }
    } catch (error) {
      console.error("Erreur détaillée lors de la récupération des réservations:", error);
      console.error("Message d'erreur:", error.message);
      console.error("Réponse d'erreur:", error.response);
      setReservations([]);
    }
  };

  useEffect(() => {
    // Récupérer tous les événements
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/events");
        console.log("Événements récupérés:", response.data);

        // Filtrer les événements pour exclure ceux qui ont le statut "cancelled"
        const activeEvents = response.data.filter((event) => event.status !== "cancelled");
        console.log("Événements actifs (non annulés):", activeEvents.length);

        setEvents(activeEvents);
      } catch (error) {
        console.error("Erreur lors de la récupération des événements:", error);
      }
    };

    fetchEvents();

    // Récupérer les réservations
    fetchReservations();
  }, []);

  const handleToggleRecommendations = () => {
    if (!showRecommendations) {
      // Les recommandations sont basées sur les événements actifs (non annulés)
      // car la variable 'events' a déjà été filtrée dans useEffect
      const recommendations = getEventRecommendations(events, reservations);
      setRecommendedEvents(recommendations);
      setShowRecommendations(true);
      setCurrentRecPage(1); // Reset to page 1 when showing recommendations
    } else {
      setShowRecommendations(false);
      setRecommendedEvents([]);
    }
  };

  const handleViewDetails = (eventId) => {
    navigate(`/app/event/${eventId}`);
  };

  const getImageSrc = (image) => {
    if (!image) return "https://via.placeholder.com/300x200";
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }
    return `data:image/jpeg;base64,${image}`;
  };

  const filteredEvents = events.filter((event) => {
    const searchLower = searchTerm.toLowerCase();
    const dateStr = new Date(event.date).toLocaleDateString();

    if (selectedType !== "all" && event.eventType !== selectedType) {
      return false;
    }

    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.description.toLowerCase().includes(searchLower) ||
      event.eventType.toLowerCase().includes(searchLower) ||
      event.location.toLowerCase().includes(searchLower) ||
      dateStr.includes(searchTerm)
    );
  });

  // Pagination for normal events
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Pagination for recommended events
  const indexOfLastRecEvent = currentRecPage * eventsPerPage;
  const indexOfFirstRecEvent = indexOfLastRecEvent - eventsPerPage;
  const currentRecEvents = recommendedEvents.slice(indexOfFirstRecEvent, indexOfLastRecEvent);
  const totalRecPages = Math.ceil(recommendedEvents.length / eventsPerPage);

  const handleRecPageChange = (pageNumber) => {
    setCurrentRecPage(pageNumber);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
       <div className="container section-title" data-aos="fade-up">
          <h2>All Events</h2>
        </div>
      <header className="relative flex items-center justify-between mb-4">
     
        <button
          onClick={handleToggleRecommendations}
          className="px-4 py-2 rounded-lg"
          style={{
            backgroundColor: "var(--accent-color)",
            color: "var(--contrast-color)",
          }}
        >
          {showRecommendations ? "Hide Recommendations" : "Get Recommendations"}
        </button>
      </header>

      {/* Section de recherche et filtrage - toujours visible */}
      <div className="mb-8 flex flex-col md:flex-row gap-3 items-start">
        <input
          type="text"
          placeholder="Search for an event..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All types</option>
          {eventTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Section des recommandations - visible uniquement quand showRecommendations est true */}
      {showRecommendations && recommendedEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-navy-700 dark:text-white mb-4">
            Recommendations based on your preferences
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentRecEvents.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => handleViewDetails(event._id)}
              >
                <img
                  src={getImageSrc(event.eventPicture)}
                  alt={event.title}
                  className="h-48 w-full object-cover rounded-t-xl"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                  }}
                />
                <div className="p-4 relative">
                  <h3 className="text-xl font-semibold mb-1 text-center">{event.title}</h3>
                  <span
                    className={`absolute top-4 right-4 text-xs font-semibold px-2 py-1 rounded-full ${
                      event.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {event.status === "active" ? "Actif" : "Inactif"}
                  </span>
                  <p className="text-gray-600 mb-2 line-clamp-3">{event.description}</p>
                  <p className="text-sm text-gray-500 mb-2">
                    <strong>Location:</strong> {event.location}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                  </p>
                  <button
                    className="w-full px-4 py-2 rounded-lg mt-2"
                    style={{
                      backgroundColor: "var(--accent-color)",
                      color: "var(--contrast-color)",
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination for Recommendations */}
          {totalRecPages > 1 && (
            <div className="flex justify-center space-x-2 mt-10">
              <button
                onClick={() => handleRecPageChange(currentRecPage - 1)}
                disabled={currentRecPage === 1}
                className="px-3 py-1 rounded"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--contrast-color)",
                }}
              >
                Previous
              </button>
              {[...Array(totalRecPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleRecPageChange(i + 1)}
                  className={`px-3 py-1 rounded ${
                    currentRecPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  style={{
                    backgroundColor: currentRecPage === i + 1 ? "var(--accent-color)" : "",
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handleRecPageChange(currentRecPage + 1)}
                disabled={currentRecPage === totalRecPages}
                className="px-3 py-1 rounded"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "var(--contrast-color)",
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Liste normale des événements - visible uniquement quand showRecommendations is false */}
      {!showRecommendations && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentEvents.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => handleViewDetails(event._id)}
            >
              <img
                src={getImageSrc(event.eventPicture)}
                alt={event.title}
                className="h-48 w-full object-cover rounded-t-xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                }}
              />
              <div className="p-4 relative">
                <h3 className="text-xl font-semibold mb-1 text-center">{event.title}</h3>
                <span
                  className={`absolute top-4 right-4 text-xs font-semibold px-2 py-1 rounded-full ${
                    event.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {event.status === "active" ? "Actif" : "Inactif"}
                </span>
                <p className="text-gray-600 mb-2 line-clamp-3">{event.description}</p>
                <p className="text-sm text-gray-500 mb-2">
                  <strong>Location:</strong> {event.location}
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                </p>
                <button
                  className="w-full px-4 py-2 rounded-lg mt-2"
                  style={{
                    backgroundColor: "var(--accent-color)",
                    color: "var(--contrast-color)",
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination for normal events - visible uniquement quand showRecommendations is false */}
      {!showRecommendations && totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-10">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded"
            style={{
              backgroundColor: "var(--accent-color)",
              color: "var(--contrast-color)",
            }}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              style={{
                backgroundColor: currentPage === i + 1 ? "var(--accent-color)" : "",
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded"
            style={{
              backgroundColor: "var(--accent-color)",
              color: "var(--contrast-color)",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default EventsSection;