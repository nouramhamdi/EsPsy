import React, { useEffect, useState, useRef } from "react";
import Card from "../../../components/card";
import axios from "axios";
import html2pdf from 'html2pdf.js';

const ReservationsTable = () => {
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const reservationsPerPage = 5;
  const tableRef = useRef(null);

  useEffect(() => {
    // Récupérer les réservations depuis l'API
    axios
      .get("https://espsy.onrender.com/reservations/tous")
      .then((response) => {
        setReservations(response.data.reservations || []);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des réservations:", error);
        setReservations([]); // En cas d'erreur, initialiser avec un tableau vide
      });
  }, []);

  const handleDownloadPDF = () => {
    const content = tableRef.current;
    const opt = {
      margin: 1,
      filename: 'reservations.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(content).save();
  };

  // Filtrer les réservations en fonction de la recherche
  const filteredReservations = reservations.filter((reservation) => {
    if (!reservation) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      (reservation.Student?.toLowerCase() || "").includes(searchLower) ||
      (reservation.mail?.toLowerCase() || "").includes(searchLower) ||
      (reservation.Event?.toLowerCase() || "").includes(searchLower)
    );
  });

  // Pagination
  const indexOfLastReservation = currentPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = filteredReservations.slice(
    indexOfFirstReservation,
    indexOfLastReservation
  );
  const totalPages = Math.ceil(filteredReservations.length / reservationsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Card extra={"w-full h-full p-4"}>
      <header className="relative flex items-center justify-between mb-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          List of Reservations
        </div>
        <button
          onClick={handleDownloadPDF}
          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-300 flex items-center"
        >
          <i className="fas fa-download mr-2"></i>
          Download
        </button>
      </header>

      {/* Barre de recherche */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par étudiant, email ou événement..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div ref={tableRef}>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="border-b border-gray-200 p-4 text-start">
                Student
              </th>
              <th className="border-b border-gray-200 p-4 text-start">
                Mail
              </th>
              <th className="border-b border-gray-200 p-4 text-start">
                Event
              </th>
              <th className="border-b border-gray-200 p-4 text-start">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {currentReservations.length > 0 ? (
              currentReservations.map((reservation, index) => (
                <tr key={index}>
                  <td className="border-b border-gray-200 p-4">
                    {reservation.Student || '-'}
                  </td>
                  <td className="border-b border-gray-200 p-4">
                    {reservation.mail || '-'}
                  </td>
                  <td className="border-b border-gray-200 p-4">
                    {reservation.Event || '-'}
                  </td>
                  <td className="border-b border-gray-200 p-4">
                    {reservation.date ? new Date(reservation.date).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center p-4">
                  Aucune réservation trouvée
                </td>
              </tr>
            )}
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

export default ReservationsTable;