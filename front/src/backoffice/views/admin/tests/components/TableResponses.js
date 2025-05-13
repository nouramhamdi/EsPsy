import React, { useEffect, useState } from 'react';
import ResponseService from '../../../../../Services/ResponseService';
import Card from "../../../../components/card";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import NotificationCard from "backoffice/components/card/NotificationCard";


const TableResponses = () => {
  const [responses, setResponses] = useState([]);
  const [previewResponse, setPreviewResponse] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3); // Now displaying 3 items per page
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'pending', or 'treated'
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
  };

  const closeNotification = () => {
    setNotification({ show: false, message: "", type: "" });
  };

  useEffect(() => {
    fetchAllResponses();
  }, []);

  const fetchAllResponses = async () => {
    try {
      const data = await ResponseService.getAllResponses();
      setResponses(data);
    } catch (error) {
      console.error('Error loading responses:', error);
    }
  };

  const handleDeleteResponse = async (id) => {
    try {
      await ResponseService.deleteResponse(id);
      fetchAllResponses();
    } catch (error) {
      console.error('Error deleting response:', error);
    }
  };

  const sendResultByEmail = async (responseId, resultText) => {
    try {
      if (!resultText) {
        showNotification("Please enter a result before sending.", "error");
        return;
      }
      
      await ResponseService.addResultToResponse(responseId, resultText);
      showNotification("Result sent by email successfully!", "success");
      fetchAllResponses();
    } catch (err) {
      showNotification("Error sending result. Please try again.", "error");
      console.error(err);
    }
  };

  const generateStyledPDF = async (response) => {
    const doc = new jsPDF("p", "mm", "a4");
    
    // Configuration
    const margin = 15;
    const maxWidth = 180;
    let yPosition = 20;
    const lineHeight = 6;
    const sectionGap = 15;
    
    // Couleurs modernes
    const primaryColor = '#2c4964';
    const secondaryColor = '#4a6fa5';
    const accentColor = '#4F46E5';
    const lightBg = '#F8FAFC';
    const borderColor = '#E5E7EB';
    const textColor = '#333333';
    const lightText = '#6B7280';
    const cardBg = '#FFFFFF';
    const cardShadow = '#00000010';
    
    // En-tête amélioré
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.width, 50, 'F');
    
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('EsPsy', margin, 35);
    
    doc.setFontSize(14);
    doc.text('Analysis Report', doc.internal.pageSize.width / 2, 35, { align: 'center' });
    
    // Informations patient
    doc.setFillColor(cardBg);
    doc.roundedRect(margin, 55, maxWidth, 30, 3, 3, 'F');
    doc.setDrawColor(borderColor);
    doc.roundedRect(margin, 55, maxWidth, 30, 3, 3, 'S');
    
    doc.setFontSize(10);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('USER INFORMATION', margin + 8, 64);
    
    doc.setFontSize(9);
    doc.setTextColor(textColor);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${response.userId?.fullname || 'Not specified'}`, margin + 8, 72);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, maxWidth + margin - 8, 72, { align: 'right' });
    
    yPosition = 90;
    
    // Métadonnées
    doc.setFontSize(8);
    doc.setTextColor(lightText);
    doc.text(`Report ID: ${response._id?.slice(-8)?.toUpperCase() || ''}`, margin, yPosition);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}`, maxWidth + margin, yPosition, { align: 'right' });
    
    yPosition += 10;
    
    // Diviseur stylisé
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.8);
    doc.line(margin, yPosition, maxWidth + margin, yPosition);
    yPosition += sectionGap;
    
    // Section Analyse principale
    const analysis = response.resultText || response.result;
    if (analysis) {
        doc.setFontSize(12);
        doc.setTextColor(primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('PSYCHOLOGICAL ANALYSIS', margin, yPosition);
        doc.setFillColor(primaryColor);
        doc.rect(margin, yPosition + 3, 60, 1, 'F');
        
        yPosition += 10;
        
        // Style du contenu de l'analyse
        doc.setFillColor(cardBg);
        doc.roundedRect(margin, yPosition, maxWidth, doc.internal.pageSize.height - yPosition - 40, 3, 3, 'F');
        doc.setDrawColor(borderColor);
        doc.roundedRect(margin, yPosition, maxWidth, doc.internal.pageSize.height - yPosition - 40, 3, 3, 'S');
        
        const analysisLines = doc.splitTextToSize(analysis, maxWidth - 20);
        doc.setFontSize(10);
        doc.setTextColor(textColor);
        doc.setFont('helvetica', 'normal');
        
        let currentY = yPosition + 10;
        const maxY = doc.internal.pageSize.height - 40;
        
        for (let i = 0; i < analysisLines.length; i++) {
            if (currentY + lineHeight > maxY) {
                doc.addPage();
                currentY = 20;
                
                // Répéter le style de la carte sur les nouvelles pages
                doc.setFillColor(cardBg);
                doc.roundedRect(margin, currentY, maxWidth, doc.internal.pageSize.height - currentY - 40, 3, 3, 'F');
                doc.setDrawColor(borderColor);
                doc.roundedRect(margin, currentY, maxWidth, doc.internal.pageSize.height - currentY - 40, 3, 3, 'S');
                currentY += 10;
            }
            
            doc.text(analysisLines[i], margin + 10, currentY);
            currentY += lineHeight;
        }
        
        yPosition = currentY + sectionGap;
    }
    
    // Pied de page professionnel
    const footerY = doc.internal.pageSize.height - 20;
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY, maxWidth + margin, footerY);
    
    doc.setFontSize(8);
    doc.setTextColor(lightText);
    doc.text(`Confidential document - ${new Date().getFullYear()} © EsPsy Psychological Services`, 
             margin, footerY + 5);
    
    // Numéro de page
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, 
             doc.internal.pageSize.width - margin, footerY + 5, { align: 'right' });
    
    // Filigrane discret
    doc.setFontSize(40);
    doc.setTextColor(245, 245, 245);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIDENTIAL', doc.internal.pageSize.width / 2, doc.internal.pageSize.height / 2, {
        angle: 45,
        align: 'center',
        opacity: 0.5
    });
    
    // Enregistrement avec nom de fichier amélioré
    const fileName = `Psychological_Analysis_${response.userId?.fullname?.replace(/ /g, '_') || 'User'}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
};

  // Filtering and sorting
  const filteredAndSortedResponses = responses
    .filter((res) => {
      if (statusFilter === "pending") return !res.treated;
      if (statusFilter === "treated") return res.treated;
      return true; // all
    })
    .filter((res) =>
      res.userId?.fullname?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (a.treated === b.treated ? 0 : a.treated ? 1 : -1)); // Pending first

  // Pagination logic
  const indexOfLastResponse = currentPage * itemsPerPage;
  const indexOfFirstResponse = indexOfLastResponse - itemsPerPage;
  const currentResponses = filteredAndSortedResponses.slice(indexOfFirstResponse, indexOfLastResponse);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const isNextDisabled = currentPage === Math.ceil(filteredAndSortedResponses.length / itemsPerPage);
  const isPrevDisabled = currentPage === 1;

  return (
    <div>
      <br />
      <Card extra={"w-full h-full sm:overflow-auto px-6"}>
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between pt-4">
             <div className="text-xl font-bold text-navy-700 dark:text-white">Responses Table</div>

        

       
        <div className="flex flex-wrap gap-2 mt-4">
  <input
    type="text"
    placeholder="Search by user name..."
    className="border border-gray-300 rounded p-2 text-sm"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />

  <select
            className="border border-gray-300 rounded p-2 text-sm"

    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option value="all">All</option>
    <option value="pending">Pending</option>
    <option value="treated">Treated</option>
  </select>
</div>
</header>
<div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
  <table className="w-full">
    <thead>
      <tr>
        <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">Test Title</th>
        <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">User</th>
        <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">Answers</th>
        <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">Status</th>
        <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">Actions</th>
      </tr>
    </thead>
    <tbody>
      {currentResponses.length > 0 ? (
        currentResponses.map((response) => (
          <tr
            key={response._id}
            className={`transition-all duration-300 ${response.treated ? 'bg-green-100' : ''}`}
          >
            <td className="py-3 pr-4">{response.testId?.title || 'Unknown Test'}</td>
            <td className="py-3 pr-4">{response.userId?.fullname || 'Unknown User'}</td>
            <td className="py-3 pr-4">
            <button
  className="text-sm px-4 py-2 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] text-white rounded-lg shadow-md hover:bg-opacity-90 transition-all duration-300"
  onClick={() => setPreviewResponse(response)}
>
  Preview Questions & Answers
</button>

            </td>
            <td className="py-3 pr-4">
              {response.treated ? (
                <span className="text-green-600 font-semibold">Treated ✅</span>
              ) : (
                <span className="text-yellow-600 font-semibold">Pending ⏳</span>
              )}
            </td>
            <td className="py-3 pr-4 space-y-2">
              <textarea
                rows={2}
                placeholder="Enter result..."
                className="w-full p-2 border border-gray-300 rounded"
                value={response.resultText || ''}
                onChange={(e) => {
                  const updatedResponses = responses.map((r) =>
                    r._id === response._id ? { ...r, resultText: e.target.value } : r
                  );
                  setResponses(updatedResponses);
                }}
              />
              <button
                onClick={() => sendResultByEmail(response._id, response.resultText)}
                className="bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] text-white px-3 py-1 rounded text-sm"
              >
                Send Result
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="5" className="text-center py-4 text-gray-500">
            No responses available
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

{/* Pagination */}
<div className="flex justify-center mt-4">
  <button
    onClick={() => paginate(currentPage - 1)}
    className={`px-4 py-2 rounded-l-md ${isPrevDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] text-white'}`}
    disabled={isPrevDisabled}
  >
    Previous
  </button>
  <button
    onClick={() => paginate(currentPage + 1)}
    className={`px-4 py-2 rounded-r-md ${isNextDisabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] text-white'}`}
    disabled={isNextDisabled}
  >
    Next
  </button>
</div>
  <br />

{/* Hidden preview for PDF generation */}
{responses.map((response) => (
  <div
    key={response._id}
    id={`pdf-content-${response._id}`}
    style={{ padding: "20px", width: "600px", display: "none" }}
  >
    <h2 style={{ textAlign: "center" }}>{response.testId?.title}</h2>
    <h3 style={{ marginBottom: "10px" }}>
      User: {response.userId?.fullname}
    </h3>
    <div style={{ fontSize: "12px" }}>
      <h4>Questions & Answers:</h4>
      <ul style={{ paddingLeft: "20px" }}>
        {response.answers?.map((answer, i) => {
          const questionText = answer.questionId?.text || `Question ${i + 1}`;
          const selectedOptionText = answer.questionId?.options?.[answer.selectedOption] || `Option ${answer.selectedOption}`;
          return (
            <li key={i}>
              <p><strong>Q{i + 1}:</strong> {questionText}</p>
              <p><strong>A:</strong> {selectedOptionText}</p>
            </li>
          );
        })}
      </ul>
      <hr />
      <p><strong>Analysis:</strong></p>
      <p>{response.resultText || response.result}</p>
    </div>
  </div>
))}

{/* Modal preview */}
{previewResponse && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg max-w-lg w-full relative">
      <h2 className="text-lg font-bold mb-2">{previewResponse.testId?.title}</h2>
      <h3 className="text-sm mb-4">User: {previewResponse.userId?.fullname}</h3>
      <div className="text-sm whitespace-pre-wrap max-h-96 overflow-y-auto space-y-3">
        <h4 className="font-semibold mb-2">Questions & Answers:</h4>
        <ul className="list-disc pl-5 space-y-2">
          {previewResponse.answers?.map((answer, i) => {
            const questionText = answer.questionId?.text || `Question ${i + 1}`;
            const selectedOptionText = answer.questionId?.options?.[answer.selectedOption] || `Option ${answer.selectedOption}`;
            return (
              <li key={i}>
                <p><strong>Q{i + 1}:</strong> {questionText}</p>
                <p><strong>A:</strong> {selectedOptionText}</p>
              </li>
            );
          })}
        </ul>
        <hr className="my-3" />
        <p><strong>Analysis:</strong></p>
        <p>{previewResponse.resultText || previewResponse.result}</p>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => generateStyledPDF(previewResponse)}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Download PDF
        </button>
        <button
          onClick={() => setPreviewResponse(null)}
          className="bg-gray-400 text-white px-3 py-1 rounded text-sm"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}


        
        
        
      </Card>
      <br />
      <NotificationCard
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={closeNotification}
      />
    </div>
  );
};

export default TableResponses;
