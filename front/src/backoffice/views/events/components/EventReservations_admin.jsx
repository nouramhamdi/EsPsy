import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "../../../../backoffice/components/card";
import html2pdf from 'html2pdf.js';

const EventReservations_admin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Récupérer les détails de l'événement
        const eventResponse = await axios.get(`https://espsy.onrender.com/events/${id}`);
        setEvent(eventResponse.data);

        // Récupérer les réservations pour l'événement
        const reservationsResponse = await axios.get(`https://espsy.onrender.com/reservations/event/${id}`);
        setReservations(reservationsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDownloadPDF = () => {
    const pdfContent = document.createElement('div');
    pdfContent.className = 'pdf-container';
    pdfContent.style.padding = '20px';
    pdfContent.style.fontFamily = 'Arial, sans-serif';

    pdfContent.innerHTML = `
      <div style="margin-bottom: 30px;">
        <h1 style="color: #1a365d; font-size: 24px; margin-bottom: 20px;">${event.title} - Reservations</h1>
        <div style="margin-bottom: 10px;"><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</div>
        <div style="margin-bottom: 10px;"><strong>Location:</strong> ${event.location}</div>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f7fafc;">
            <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Student Name</th>
            <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Email</th>
            <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Class</th>
            <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Reservation Date</th>
          </tr>
        </thead>
        <tbody>
          ${reservations.map(reservation => `
            <tr>
              <td style="border: 1px solid #e2e8f0; padding: 8px;">${reservation.Student}</td>
              <td style="border: 1px solid #e2e8f0; padding: 8px;">${reservation.mail}</td>
              <td style="border: 1px solid #e2e8f0; padding: 8px;">${reservation.class}</td>
              <td style="border: 1px solid #e2e8f0; padding: 8px;">${new Date(reservation.date).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `reservations-${event.title}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(pdfContent).save();
  };

  const filteredReservations = reservations.filter(reservation => {
    const searchLower = searchTerm.toLowerCase();
    return (
      reservation.Student.toLowerCase().includes(searchLower) ||
      reservation.mail.toLowerCase().includes(searchLower) ||
      reservation.class.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Section supérieure avec image et détails */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Image de l'événement */}
        <div className="md:w-1/2">
          <Card extra="p-4">
            {event.eventPicture ? (
              <img
                src={event.eventPicture}
                alt={event.title}
                className="w-full h-[400px] object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center rounded-lg">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </Card>
        </div>

        {/* Détails de l'événement */}
        <div className="md:w-1/2">
          <Card extra="p-6">
            <h1 className="text-3xl font-bold mb-6">{event.title}</h1>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="font-semibold w-32">Date:</span>
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center">
                <span className="font-semibold w-32">Location:</span>
                <span>{event.location}</span>
              </div>
              
              <div className="flex items-center">
                <span className="font-semibold w-32">Type:</span>
                <span>{event.eventType}</span>
              </div>
              
              <div className="flex items-center">
                <span className="font-semibold w-32">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  event.status === 'active' ? 'bg-green-100 text-green-600' :
                  event.status === 'Fully booked event' ? 'bg-red-100 text-red-600' :
                  event.status === 'passed' ? 'bg-gray-100 text-gray-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {event.status}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="font-semibold w-32">Available Spots:</span>
                <span className={event.maxParticipants <= 0 ? 'text-red-600' : 'text-green-600'}>
                  {event.maxParticipants}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className="font-semibold w-32">Target Audience:</span>
                <span>{event.targetAudience}</span>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-gray-700">{event.description}</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Tableau des réservations */}
      <Card extra="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
            Event Reservations
          </h2>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate("/admin/EventsManagement")}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back to Events
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <i className="fas fa-download mr-2"></i>
              Download PDF
            </button>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by student name, email or class..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-b border-gray-200 p-4 text-start">Student Name</th>
                <th className="border-b border-gray-200 p-4 text-start">Email</th>
                <th className="border-b border-gray-200 p-4 text-start">Class</th>
                <th className="border-b border-gray-200 p-4 text-start">Reservation Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => (
                <tr key={reservation._id}>
                  <td className="border-b border-gray-200 p-4">{reservation.Student}</td>
                  <td className="border-b border-gray-200 p-4">{reservation.mail}</td>
                  <td className="border-b border-gray-200 p-4">{reservation.class}</td>
                  <td className="border-b border-gray-200 p-4">
                    {new Date(reservation.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default EventReservations_admin; 