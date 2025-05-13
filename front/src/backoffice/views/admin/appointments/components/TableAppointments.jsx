import React, { useState } from "react";
import Card from "../../../../components/card";
import AppointmentService from "../../../../../Services/AppointmentService";
import avatar from "../../../../assets/img/avatars/avatar11.png";

const TableAppointments = ({ title, appointments, showActions, onSchedule, onDecline }) => {
  const [showAnalysisPopup, setShowAnalysisPopup] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [analysisResult, setAnalysisResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleAnalyze = async (appointment) => {
    try {
      setIsLoading(true);
      const result = await AppointmentService.analyzeStudentCase(appointment.description);
      setAnalysisResult(result.result);
      setSelectedAppointment(appointment);
      setShowAnalysisPopup(true);
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysisResult("Error performing analysis");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPriority = () => {
    console.log("Setting priority for:", selectedAppointment._id);
    setShowAnalysisPopup(false);
  };

  return (
    <Card extra={"w-full h-full sm:overflow-auto px-6"}>
      <header className="relative flex items-center justify-between pt-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white">{title}</div>
      </header>

      <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
        <table className="w-full">
          <thead>
            <tr className="!border-px !border-gray-400">
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">Student</p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">Psychologist</p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  {showActions ? "Description" : "Scheduled Date"}
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  {showActions ? "Actions" : "File"}
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-6 text-gray-500">
                  No appointments found
                </td>
              </tr>
            ) : (
              appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td className="min-w-[150px] border-white/0 py-3 pr-4">
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                      {appointment.student.fullname}
                    </p>
                  </td>
                  <td className="min-w-[150px] border-white/0 py-3 pr-4">
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                      {appointment.psychologist.fullname}
                    </p>
                  </td>
                  <td className="min-w-[150px] border-white/0 py-3 pr-4">
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                      {showActions
                        ? appointment.description
                        : new Date(appointment.scheduledDate).toLocaleString()}
                    </p>
                  </td>
                  <td className="min-w-[150px] border-white/0 py-3 pr-4">
                    <div className="flex items-center gap-2">
                      {showActions ? (
                        <>
                          <button
                            onClick={() => onSchedule(appointment._id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Schedule
                          </button>
                          <button
                            onClick={() => onDecline(appointment._id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Decline
                          </button>
                          <button
                            onClick={() => handleAnalyze(appointment)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Analyze
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-gray-600 dark:text-white">
                          {appointment.filePatient?.diagnosis || "No File"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Analysis Popup (conservé identique) */}
      {showAnalysisPopup && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md dark:bg-navy-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Case Analysis</h3>
              <button
                onClick={() => setShowAnalysisPopup(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-300">Analyzing case...</p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Analysis Result:
                    </h4>
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-600 leading-relaxed dark:bg-gray-800 dark:text-gray-200">
                      {analysisResult || "No analysis available"}
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={handleSetPriority}
                      className="px-5 py-2.5 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Set as Priority
                    </button>
                    <button
                      onClick={() => setShowAnalysisPopup(false)}
                      className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TableAppointments;