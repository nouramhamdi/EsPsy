import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "../../backoffice/components/card";

const EventsSection = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 8; 
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/events")
      .then((response) => {
        setEvents(response.data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des événements:", error);
      });
  }, []);

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

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleViewDetails = (eventId) => {
    navigate(`/app/event/${eventId}`);
  };

  return (
    <section id="about" className="section">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-4">Événements</h2>
          <div className="flex justify-center">
            <input
              type="text"
              placeholder="Rechercher un événement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentEvents.map((event) => (
            <Card key={event._id} extra="p-3 hover:shadow-lg transition-shadow duration-300">
              <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
                {event.eventPicture ? (
                  <img
                    src={`data:image/jpeg;base64,${event.eventPicture}`}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Pas d'image</span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2 text-navy-700 dark:text-white">
                  {event.title}
                </h3>
                
                <div className="mb-4 text-gray-600">
                  <p className="mb-1">
                    <i className="fas fa-calendar-alt mr-2"></i>
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="mb-1">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    {event.location}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    event.status === 'active' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {event.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                  
                  <button
                    onClick={() => handleViewDetails(event._id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
                  >
                    Détails
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-2 mt-8">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === index + 1
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;