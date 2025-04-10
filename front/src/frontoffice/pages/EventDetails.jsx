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
    if (!loggedUser || !event) return null;
    
    const content = `Event Details
Name: ${loggedUser.username}
Email: ${loggedUser.email}
Event Title: ${event.title}
Event Date: ${new Date(event.date).toLocaleDateString()}`;
    
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(content)}`;
  };

  useEffect(() => {
    axios
      .get(`http://localhost:5000/events/${id}`)
      .then((response) => {
        setEvent(response.data);
      })
      .catch((error) => {
        console.error("Error while retrieving event:", error);
        navigate("/app#about");
      });

    if (loggedUser && loggedUser._id) {
      axios
        .get(`http://localhost:5000/reservations/check/${id}/${loggedUser._id}`)
        .then((response) => {
          setHasReservation(response.data.hasReservation);
        })
        .catch((error) => {
          console.error("Error while checking reservation:", error);
        });
    }
  }, [id, navigate, loggedUser]);

  const handleDownloadPDF = () => {
    const content = contentRef.current;
    const opt = {
      margin: 1,
      filename: `event-${event.title}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(content).save();
  };

  const handleReservation = () => {
    setIsReserving(true);
    setSuccessMessage("");
    const reservationData = {
      idevent: id,
      iduser: loggedUser._id,
      Student: loggedUser.username,
      class: loggedUser.class || "Not specified",
      mail: loggedUser.email,
      Event: event.title,
      date: event.date
    };

    axios.post('http://localhost:5000/reservations/ajouter', reservationData)
      .then(response => {
        setSuccessMessage("Reservation completed successfully!");
        setTimeout(() => {
          navigate("/app#about");
        }, 2000);
      })
      .catch(error => {
        console.error("Error during reservation:", error);
        alert("Error during reservation. Please try again.");
      })
      .finally(() => {
        setIsReserving(false);
      });
  };

  const handleReturn = () => {
    navigate("/app#about");
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
                  src={`data:image/jpeg;base64,${event.eventPicture}`}
                  alt={event.title}
                  className="w-full h-[500px] object-cover rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-full h-[500px] bg-gray-200 flex items-center justify-center rounded-lg">
                  <span className="text-gray-400 text-xl">No image</span>
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
                {getQRCodeUrl() && (
                  <div className="flex flex-col items-center ml-4">
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
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {event.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <i className="fas fa-tag w-6"></i>
                  <span className="font-semibold mr-2">Type:</span>
                  {event.eventType}
                </div>

                <div className="flex items-center text-gray-600">
                  <i className="fas fa-users w-6"></i>
                  <span className="font-semibold mr-2">Max Participants:</span>
                  {event.maxParticipants}
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
            disabled={isReserving || hasReservation}
            className={`px-6 py-2 rounded text-white transition-colors duration-300 ${
              isReserving || hasReservation
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-800"
            }`}
          >
            {isReserving 
              ? "Reservation in progress..." 
              : hasReservation 
                ? "Already Reserved" 
                : "Reserve"}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default EventDetails;