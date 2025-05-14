import React, { useEffect, useState } from "react";
import Card from "../../../../components/card";
import groupServices from "../../../../../Services/groupService";

const ReportDetailsModal = ({ report, onClose }) => {
  const [messageDetails, setMessageDetails] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(false);

  useEffect(() => {
    const fetchMessageDetails = async () => {
      if (report?.group && report?.message) {
        try {
          setLoadingMessage(true);
          const message = await groupServices.getMessageById(
            report.group._id,  // Direct ID reference
            report.message // Direct ID reference
          );
          setMessageDetails(message);
        } catch (error) {
          console.error("Error fetching message details:", error);
          setMessageDetails(null);
        } finally {
          setLoadingMessage(false);
        }
      }
    };

    fetchMessageDetails();
  }, [report]);

  if (!report) return null;

  return (
    <div className="fixed inset-0 bg-gray-100/10 backdrop-blur-lg z-50 flex items-center justify-center">
      <Card extra="w-full max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-6xl">
        <header className="flex justify-between items-center mb-6">
          <h5 className="text-xl font-bold text-gray-800">Report Details</h5>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </header>

        <div className="space-y-4">
          {/* Reporter Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Reporter:</label>
              <p className="mt-1 text-gray-800">
                {report.reporter?.username || 'Deleted User'}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Reported User:</label>
              <p className="mt-1 text-gray-800">
                {report.reportedUser?.username || 'Deleted User'}
              </p>
            </div>
          </div>

          {/* Report Status */}
          <div>
            <label className="text-sm font-semibold text-gray-600">Status:</label>
            <span className={`mt-1 px-2 py-1 text-xs rounded-full ${
              report.status === 'handled' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {report.status}
            </span>
          </div>

          {/* Report Content */}
          <div>
            <label className="text-sm font-semibold text-gray-600">Report Reason:</label>
            <p className="mt-1 text-gray-800 whitespace-pre-wrap">
              {report.content}
            </p>
          </div>

          {/* Report Metadata */}
          <div>
            <label className="text-sm font-semibold text-gray-600">Report Date:</label>
            <p className="mt-1 text-gray-800">
              {new Date(report.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Message Details Section */}
          <div>
            <label className="text-sm font-semibold text-gray-600">
              Reported Message Details:
            </label>
            
            {loadingMessage ? (
              <div className="mt-2 p-3 bg-gray-50 rounded-md text-center text-gray-500">
                Loading message details...
              </div>
            ) : messageDetails ? (
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                {/* Message Content */}
                <p className="text-gray-800">{messageDetails.content}</p>
                {/* Media Display */}
                {messageDetails.media && messageDetails.messageType!=="text" && (
                  <div className="mt-3">
                    <div className="mt-1">
                      <a
                        href={`https://espsy.onrender.com${messageDetails.media.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View {messageDetails.media.type}
                      </a>
                      {messageDetails.media.duration && (
                        <p className="mt-1">
                          Duration: {Math.round(messageDetails.media.duration)} seconds
                        </p>
                      )}
                    </div>
                  </div>
                )}
                {/* Message Metadata */}
                <div className="mt-3 text-sm text-gray-600">
                  <p>Sent at: {new Date(messageDetails.timestamp).toLocaleString()}</p>
                  <p>Type: {messageDetails.messageType}</p>
                </div>
              </div>
            ) : (
              <div className="mt-2 p-3 bg-red-50 rounded-md text-red-600">
                Message not found or deleted
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReportDetailsModal;