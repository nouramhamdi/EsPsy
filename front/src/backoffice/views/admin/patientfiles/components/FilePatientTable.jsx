import React, { useEffect, useState } from "react";
import Card from "../../../../components/card";
import AppointmentService from "../../../../../Services/AppointmentService";
import { toast } from "react-toastify";
import userServices from "../../../../../Services/UserService";
import { useNavigate } from 'react-router-dom';

const FilePatientTable = ({ tableData, refreshData }) => {
  const [files, setFiles] = useState(tableData);
  const [isAddFileOpen, setIsAddFileOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();
  const [newFileData, setNewFileData] = useState({ patientId: "" });
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState({ id: null, note: "" });
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState("");

  useEffect(() => setFiles(tableData), [tableData]);

  const handleDeleteFile = async (fileId) => {
    try {
      await AppointmentService.deleteFile(fileId);
      toast.success("File deleted successfully");
      refreshData();
    } catch (error) {
      toast.error("Failed to delete file");
      console.error('Error deleting file:', error);
    }
  };

  const handleCreateFile = async (e) => {
    e.preventDefault();
    try {
      await AppointmentService.createFile({
        user: newFileData.patientId,
        psychologist: loggedUser._id,
        note: ""
      });
      toast.success("Patient file created successfully");
      refreshData();
      setIsAddFileOpen(false);
    } catch (error) {
      toast.error("Failed to create file");
      console.error('Error creating file:', error);
    }
  };

  const handleEditNote = async (e) => {
    e.preventDefault();
    try {
      await AppointmentService.updateFileNote(selectedFile.id, selectedFile.note);
      toast.success("Note updated successfully");
      refreshData();
      setIsEditNoteOpen(false);
    } catch (error) {
      toast.error("Failed to update note");
      console.error('Error updating note:', error);
    }
  };

  useEffect(() => {
    if (isAddFileOpen) {
      const fetchPatients = async () => {
        try {
          const response = await userServices.getAllUsers();
          setPatients(response.users.filter(user => user.role === 'student'));
        } catch (error) {
          console.error("Error fetching patients:", error);
        }
      };
      fetchPatients();
    }
  }, [isAddFileOpen]);

  const handleGetRecommendations = async (idFile) => {
    try {
      setIsLoadingAnalysis(true);
      setAnalysisError("");
      const result = await AppointmentService.analyzePsyNotes(idFile);
      setAnalysisResult(result.analysis);
      setShowRecommendation(true);
    } catch (error) {
      setAnalysisError("Failed to get recommendations. Please try again.");
      console.error('Analysis error:', error);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  return (
    <Card extra={"w-full h-full sm:overflow-auto px-6"}>
      <header className="relative flex items-center justify-between pt-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          Patient Files List
        </div>
        <button
  className="flex items-center px-4 py-2.5 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
  onClick={() => setIsAddFileOpen(true)}
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
  <span className="text-sm font-semibold text-white">New Patient File</span>
</button>
      </header>

      <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
        <table className="w-full">
          <thead>
            <tr className="!border-px !border-gray-400">
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  PATIENT
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  PSYCHOLOGIST
                </p>
              </th>
              <th className="border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                <p className="text-sm font-bold text-gray-600 dark:text-white">
                  ACTIONS
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, index) => (
              <tr key={index}>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {file.user?.fullname}
                  </p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {loggedUser.fullname}
                  </p>
                </td>
                <td className="min-w-[150px] border-white/0 py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedFile({ id: file._id, note: file.note });
                        setIsEditNoteOpen(true);
                      }}
                      className="flex items-center px-3 py-1 text-sm font-bold text-white bg-indigo-500 rounded hover:bg-indigo-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit Note
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDetails(file);
                        setIsDetailsOpen(true);
                      }}
                      className="flex items-center px-3 py-1 text-sm font-bold text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      Details
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file._id)}
                      className="flex items-center px-3 py-1 text-sm font-bold text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Delete
                    </button>
                    <button
                      onClick={() => handleGetRecommendations(file._id)}
                      className="flex items-center px-3 py-1 text-sm font-bold text-white bg-purple-500 rounded hover:bg-purple-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Recommendations
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add File Modal */}
      {isAddFileOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">Add New Patient File</h3>
              <button
                onClick={() => setIsAddFileOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateFile} className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Patient</label>
                <select
                  name="patientId"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  onChange={(e) => setNewFileData({...newFileData, patientId: e.target.value})}
                >
                  <option value="">Select a patient</option>
                  {patients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.fullname}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setIsAddFileOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  Create File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Note Modal */}
      {isEditNoteOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">Edit Patient Note</h3>
              <button
                onClick={() => setIsEditNoteOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditNote} className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Note Content</label>
                <textarea
                  value={selectedFile.note}
                  onChange={(e) => setSelectedFile(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setIsEditNoteOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsOpen && selectedDetails && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">Patient Details</h3>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-gray-900">{selectedDetails.user?.fullname}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Username</p>
                  <p className="text-gray-900">{selectedDetails.user?.username}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{selectedDetails.user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-gray-900">{selectedDetails.user?.number}</p>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => {
                    setIsDetailsOpen(false);
                    navigate(`/student-profile/${selectedDetails.user?._id}/${selectedDetails._id}`, {
                      state: { 
                        analysis: analysisResult,
                        note: selectedFile.note 
                      }
                    });
                  }}
                  className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  View Full Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Modal */}
      {showRecommendation && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">Clinical Recommendations</h3>
              <button
                onClick={() => setShowRecommendation(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {isLoadingAnalysis ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Analyzing notes...</p>
                </div>
              ) : analysisError ? (
                <div className="text-red-500 p-2">{analysisError}</div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Analysis:</h4>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {analysisResult?.split("**Analysis:**")[1]?.split("**Recommendations:**")[0]?.trim() || "No analysis available"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-1">Recommendations:</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-600">
                      {analysisResult?.split("**Recommendations:**")[1]?.split("\n")
                        .filter(line => line.trim().startsWith("-"))
                        .map((rec, index) => (
                          <li key={index} className="leading-relaxed">
                            {rec.replace("-", "").trim()}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default FilePatientTable;