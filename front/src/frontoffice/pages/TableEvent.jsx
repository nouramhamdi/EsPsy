import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../backoffice/components/card';
import EventServices from '../../Services/EventService';

const TableEvent = () => {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "", id: null });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://espsy.onrender.com/events');
        const activeEvents = response.data.filter(event => event.status !== 'cancelled');
        setEvents(activeEvents);
        setError(null);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
      id: eventId 
    });
  };

  const handleConfirmCancel = (eventId) => {
    EventServices.updateEventStatus(eventId, "cancelled")
      .then(() => {
        setEvents(events.map(event => 
          event._id === eventId ? { ...event, status: "cancelled" } : event
        ));
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

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(events.length / eventsPerPage);

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/300x200';
  };

  if (loading) {
    return (
      <Card extra="p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card extra="p-4">
        <div className="text-center text-red-500">
          {error}
        </div>
      </Card>
    );
  }

  return (
    <Card extra="p-4">
      {message.text && (
        <div className={`p-4 mb-4 rounded text-center ${
          message.type === "success" ? "bg-green-100 text-green-700 border border-green-400" :
          message.type === "error" ? "bg-red-100 text-red-700 border border-red-400" :
          message.type === "warning" ? "bg-yellow-100 text-yellow-700 border border-yellow-400" :
          ""
        }`}>
          <div className="flex flex-col items-center">
            <p>{message.text}</p>
            {message.type === "warning" && message.text === "Are you sure you want to cancel this event?" && (
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => handleConfirmCancel(message.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Yes
                </button>
                <button
                  onClick={handleCancelAction}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentEvents.map((event) => (
          <Card
            key={event._id || Math.random()}
            extra="p-4 cursor-pointer hover:shadow-lg transition-shadow duration-300"
          >
            <div className="h-48 mb-4">
              <img
                src={event.eventPicture || 'https://via.placeholder.com/300x200'}
                alt={event.title || 'Event image'}
                className="w-full h-full object-cover rounded-lg"
                onError={handleImageError}
              />
            </div>
            <h3 className="text-xl font-semibold mb-2">{event.title || 'Untitled Event'}</h3>
            <p className="text-gray-600 mb-4">{event.description || 'No description available'}</p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">{event.eventType || 'Uncategorized'}</span>
              <span className="text-sm text-gray-500">
                {event.date ? new Date(event.date).toLocaleDateString() : 'No date set'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors duration-300"
                onClick={() => event._id && navigate(`/app/events/${event._id}`)}
              >
                Details
              </button>
              {event.status !== "cancelled" && (
                <button
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-300"
                  onClick={() => handleCancelEvent(event._id, event.date)}
                >
                  Cancel
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          {/* Bouton Previous */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>

          {/* Afficher les pages disponibles */}
          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === pageNumber
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {pageNumber}
            </button>
          ))}
          
          {/* Bouton Next */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </Card>
  );
};

export default TableEvent; 