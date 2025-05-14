import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "../../backoffice/components/card";
import html2pdf from 'html2pdf.js';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const contentRef = useRef(null);
  const [isReserving, setIsReserving] = useState(false);
  const [hasReservation, setHasReservation] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  const getQRCodeUrl = () => {
    if (!loggedUser || !event || !hasReservation) return null;

    const content = `Event Details
Event Title: ${event.title}
Name: ${loggedUser.username}
Email: ${loggedUser.email}
Event Date: ${new Date(event.date).toLocaleDateString()}`;

    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(content)}`;
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`https://espsy.onrender.com/events/${id}`);
        const eventData = response.data;

        // Vérifier si l'événement est passé
        const eventDate = new Date(eventData.date);
        const now = new Date();
        if (eventDate < now) {
          eventData.status = "passed";
        }

        setEvent(eventData);
      } catch (error) {
        console.error("Error while retrieving event:", error);
        navigate("/app#about");
      }
    };

    const checkReservation = async () => {
      if (loggedUser && loggedUser._id) {
        try {
          const response = await axios.get(`https://espsy.onrender.com/reservations/check/${id}/${loggedUser._id}`);
          setHasReservation(response.data.hasReservation);
        } catch (error) {
          console.error("Error while checking reservation:", error);
        }
      }
    };

    // Exécuter les requêtes en parallèle
    Promise.all([fetchEvent(), checkReservation()])
      .catch(error => {
        console.error("Error in parallel requests:", error);
      });
  }, [id, navigate, loggedUser]);

  const handleDownloadPDF = () => {
    // Créer une nouvelle div temporaire pour le PDF
    const pdfContent = document.createElement('div');
    pdfContent.className = 'pdf-container';
    pdfContent.style.padding = '20px';
    pdfContent.style.fontFamily = 'Arial, sans-serif';

    // Structure du contenu PDF
    pdfContent.innerHTML = `
      <div style="position: relative; margin-bottom: 30px;">
        <div style="position: absolute; top: -10px; right: 0; font-size: 28px; font-weight: bold; color: #1a365d;">EsPsy</div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div style="flex: 1;">
            <h1 style="color: #1a365d; font-size: 24px; margin-bottom: 20px;">${event.title}</h1>
            <div style="margin-bottom: 30px;">
              <div style="margin-bottom: 10px;"><strong>Location:</strong> ${event.location}</div>
              <div style="margin-bottom: 10px;"><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</div>
              <div style="margin-bottom: 10px;"><strong>Status:</strong> ${event.status}</div>
              <div style="margin-bottom: 10px;"><strong>Type:</strong> ${event.eventType}</div>
              <div style="margin-bottom: 10px;"><strong>Max Participants:</strong> ${event.maxParticipants}</div>
              <div style="margin-bottom: 10px;"><strong>Target Audience:</strong> ${event.targetAudience}</div>
            </div>
            <div style="margin-top: 20px;">
              <h2 style="color: #2d3748; font-size: 18px; margin-bottom: 10px;">Description</h2>
              <p style="line-height: 1.6;">${event.description}</p>
            </div>
          </div>
          <div style="width: 40%; margin-left: 20px; display: flex; flex-direction: column; align-items: center;">
            ${event.eventPicture ?
              `<img src="data:image/jpeg;base64,${event.eventPicture}"
                    alt="${event.title}"
                    style="width: 100%; height: auto; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">` :
              '<div style="width: 100%; height: 300px; background-color: #f7fafc; display: flex; align-items: center; justify-content: center; border-radius: 8px;"><span>No image</span></div>'
            }
            ${hasReservation && getQRCodeUrl() ?
              `<div style="margin-top: 20px; padding: 10px; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <img src="${getQRCodeUrl()}" alt="Event QR Code" style="width: 150px; height: 150px;">
               </div>` :
              ''
            }
          </div>
        </div>
        ${hasReservation ?
          `<div style="margin-top: 20px; padding: 15px; background-color: #f7fafc; border-radius: 8px;">
            <h3 style="color: #2d3748; margin-bottom: 10px;">Reservation Details</h3>
            <div style="margin-bottom: 5px;"><strong>Name:</strong> ${loggedUser.username}</div>
            <div style="margin-bottom: 5px;"><strong>Email:</strong> ${loggedUser.email}</div>
          </div>` :
          ''
        }
      </div>
    `;

    // Options pour html2pdf
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `event-${event.title}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    // Générer le PDF
    html2pdf().set(opt).from(pdfContent).save();
  };

  const handleReservation = () => {
    setIsReserving(true);
    setSuccessMessage("");

    // Vérifier si l'événement est passé
    const eventDate = new Date(event.date);
    const now = new Date();
    if (eventDate < now) {
      setSuccessMessage("This event has already passed");
      setIsReserving(false);
      return;
    }

    // Vérifier si l'événement est complet
    if (event.maxParticipants <= 0) {
      setSuccessMessage("This event is fully booked!");
      setIsReserving(false);
      return;
    }

    const reservationData = {
      idevent: id,
      iduser: loggedUser._id,
      Student: loggedUser.username,
      class: loggedUser.class || "Not specified",
      mail: loggedUser.email,
      Event: event.title,
      date: event.date
    };

    // Mettre à jour l'événement avant de créer la réservation
    const updatedEvent = {
      ...event,
      maxParticipants: event.maxParticipants - 1,
      status: event.maxParticipants - 1 <= 0 ? "Fully booked event" : event.status
    };

    // Mettre à jour l'événement avec les en-têtes CORS appropriés
    axios.put(`https://espsy.onrender.com/events/update/${id}`, updatedEvent, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    })
      .then(response => {
        // Créer la réservation avec les en-têtes CORS appropriés
        return axios.post('https://espsy.onrender.com/reservations/ajouter', reservationData, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        });
      })
      .then(response => {
        setEvent(updatedEvent);
        setSuccessMessage("Reservation completed successfully!");
        setHasReservation(true);
      })
      .catch(error => {
        console.error("Erreur détaillée:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });

        if (error.response?.status === 400) {
          setSuccessMessage(error.response.data.message || "Invalid reservation data");
        } else if (error.response?.status === 404) {
          setSuccessMessage("Event not found");
        } else if (error.response?.status === 409) {
          setSuccessMessage("You have already reserved this event");
        } else {
          setSuccessMessage("Error during reservation. Please try again.");
        }
      })
      .finally(() => {
        setIsReserving(false);
      });
  };

  const handleCancelReservation = () => {
    setIsReserving(true);
    setSuccessMessage("");

    // Mettre à jour l'événement après l'annulation
    const updatedEvent = {
      ...event,
      maxParticipants: event.maxParticipants + 1,
      status: event.status === "Fully booked event" ? "active" : event.status
    };

    // Supprimer la réservation
    axios.delete(`https://espsy.onrender.com/reservations/cancel/${id}/${loggedUser._id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    })
      .then(response => {
        // Mettre à jour l'événement
        return axios.put(`https://espsy.onrender.com/events/update/${id}`, updatedEvent, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        });
      })
      .then(response => {
        setEvent(updatedEvent);
        setSuccessMessage("Reservation cancelled successfully!");
        setHasReservation(false);
      })
      .catch(error => {
        console.error("Error while cancelling reservation:", error);
        setSuccessMessage("Error while cancelling reservation. Please try again.");
      })
      .finally(() => {
        setIsReserving(false);
      });
  };

  const handleReturn = () => {
    navigate("/app/events");
  };

  const handleOpenMaps = () => {
    if (event && event.location) {
      // Format the location for Google Maps
      const formattedLocation = encodeURIComponent(event.location);
      // Open Google Maps in a new tab with the location
      window.open(`https://www.google.com/maps/search/?api=1&query=${formattedLocation}`, '_blank');
    }
  };

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card extra="p-6">
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        <div ref={contentRef}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Image */}
            <div className="lg:w-1/2">
              {event.eventPicture ? (
                <img
                  src={event.eventPicture.startsWith('data:image') 
                    ? event.eventPicture 
                    : event.eventPicture.startsWith('http') 
                    ? event.eventPicture 
                    : `data:image/jpeg;base64,${event.eventPicture}`}
                  alt={event.title}
                  className="w-full h-[500px] object-cover rounded-lg shadow-lg"
                  onError={(e) => {
                    console.error("Erreur de chargement de l'image:", e.target.src);
                    e.target.onerror = null;
                    e.target.src = `https://via.placeholder.com/500x500?text=${encodeURIComponent(event.title)}`;
                  }}
                />
              ) : (
                <div className="w-full h-[500px] bg-gray-200 flex items-center justify-center rounded-lg">
                  <span className="text-gray-400 text-xl">No image available</span>
                </div>
              )}
            </div>

            {/* Right Details */}
            <div className="lg:w-1/2">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-3xl font-bold text-navy-700 dark:text-white">
                  {event.title}
                </h1>
                {/* QR Code à côté du titre */}
                {hasReservation && getQRCodeUrl() && (
                  <div className="flex flex-col items-center ml-4 qr-code-container">
                    <div className="p-4 bg-white rounded-lg shadow-lg">
                      <img
                        src={getQRCodeUrl()}
                        alt="Event QR Code"
                        className="w-[120px] h-[120px]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-map-marker-alt w-6"></i>
                  <span className="font-semibold mr-2">Location:</span>
                  {event.location}
                </div>

                {/* Map Frame */}
                <div className="mt-4 mb-4">
                  <div className="w-full h-[300px] rounded-lg overflow-hidden shadow-lg mb-4">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      allowFullScreen
                    ></iframe>
                  </div>
                  <button
                    onClick={handleOpenMaps}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center"
                  >
                    <i className="fas fa-directions mr-2"></i>
                    Get Directions
                  </button>
                </div>

                <div className="flex items-center text-gray-600">
                  <i className="fas fa-calendar-alt w-6"></i>
                  <span className="font-semibold mr-2">Date:</span>
                  {new Date(event.date).toLocaleDateString()}
                </div>

                <div className="flex items-center">
                  <i className="fas fa-circle w-6"></i>
                  <span className="font-semibold mr-2">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    event.status === 'active'
                      ? 'bg-green-100 text-green-600'
                      : event.status === 'Fully booked event'
                      ? 'bg-red-100 text-red-600'
                      : event.status === 'passed'
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {event.status}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <i className="fas fa-tag w-6"></i>
                  <span className="font-semibold mr-2">Type:</span>
                  {event.eventType}
                </div>

                <div className="flex items-center text-gray-600">
                  <i className="fas fa-users w-6"></i>
                  <span className="font-semibold mr-2">Available Spots:</span>
                  <span className={`font-bold ${
                    event.maxParticipants <= 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {event.maxParticipants}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <i className="fas fa-user-friends w-6"></i>
                  <span className="font-semibold mr-2">Target Audience:</span>
                  {event.targetAudience}
                </div>

                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-2">Description</h2>
                  <p className="text-gray-600">{event.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={handleReturn}
            className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-300"
          >
            Back to Events
          </button>

          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-300 flex items-center"
          >
            <i className="fas fa-download mr-2"></i>
            Download PDF
          </button>

          <button
            onClick={handleReservation}
            disabled={isReserving || hasReservation || event.maxParticipants <= 0 || event.status === 'passed'}
            className={`px-6 py-2 rounded text-white transition-colors duration-300 ${
              isReserving || hasReservation || event.maxParticipants <= 0 || event.status === 'passed'
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-800"
            }`}
          >
            {isReserving
              ? "Reservation in progress..."
              : hasReservation
                ? "Already Reserved"
                : event.maxParticipants <= 0
                ? "Fully Booked"
                : event.status === 'passed'
                ? "Event Passed"
                : "Reserve"}
          </button>

          {hasReservation && (
            <button
              onClick={handleCancelReservation}
              disabled={isReserving}
              className={`px-6 py-2 rounded text-white transition-colors duration-300 ${
                isReserving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isReserving ? "Cancelling..." : "Cancel Reservation"}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EventDetails;
