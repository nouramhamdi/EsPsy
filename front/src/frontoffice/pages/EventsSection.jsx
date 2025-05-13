import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../backoffice/components/card';

const EventsSection = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(4);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/events');
        setEvents(response.data);
        setFilteredEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const filtered = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || event.eventType === selectedType;
      return matchesSearch && matchesType;
    });
    setFilteredEvents(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedType, events]);

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const handleEventClick = (eventId) => {
    navigate(`/app/events/${eventId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filtres et recherche */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search events..."
          className="px-4 py-2 border rounded-lg flex-grow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="px-4 py-2 border rounded-lg"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="sport">Sport</option>
          <option value="culture">Culture</option>
          <option value="education">Education</option>
        </select>
      </div>

      {/* Grille d'événements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentEvents.map((event) => (
          <Card
            key={event._id}
            extra="p-4 cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={() => handleEventClick(event._id)}
          >
            <div className="h-48 mb-4">
              <img
                src={event.eventPicture || 'https://via.placeholder.com/300x200'}
                alt={event.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{event.eventType}</span>
              <span className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</span>
            </div>
          </Card>
        ))}
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
              currentPage === 1 ? "bg-gray-700 text-white" : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            1
          </button>

          {/* Deuxième page si elle existe */}
          {totalPages >= 2 && (
            <button
              onClick={() => setCurrentPage(2)}
              className={`px-3 py-1 rounded ${
                currentPage === 2 ? "bg-gray-700 text-white" : "bg-gray-200 hover:bg-gray-300"
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
                currentPage === 3 ? "bg-gray-700 text-white" : "bg-gray-200 hover:bg-gray-300"
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
                  currentPage === totalPages ? "bg-gray-700 text-white" : "bg-gray-200 hover:bg-gray-300"
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
    </div>
  );
};

export default EventsSection; 