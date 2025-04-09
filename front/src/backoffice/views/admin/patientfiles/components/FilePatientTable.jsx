import React, { useEffect, useState } from "react";
import CardMenu from "../../../../components/card/CardMenu";
import Card from "../../../../components/card";
import AppointmentService from "../../../../../Services/AppointmentService";
import { toast } from "react-toastify";
import userServices from "../../../../../Services/UserService";

const  FilePatientTable =({ tableData, refreshData }) => {
  const [files, setFiles] = useState(tableData);
  const [isAddFileOpen, setIsAddFileOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [newFileData, setNewFileData] = useState({
    patientId: "",
  });
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState({
    id: null,
    note: ""
  });
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);



  useEffect(() => {
    setFiles(tableData);
  }, [tableData]);

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
          const filteredPatients = response.users.filter(
            (user) => user.role === 'student'
          );
          setPatients(filteredPatients);
        } catch (error) {
          console.error("Error fetching patients:", error);
        }
      };
      fetchPatients();
    }
  }, [isAddFileOpen]);

  return (
    <Card extra={"w-full h-full sm:overflow-auto px-6"}>
      <header className="relative flex items-center justify-between pt-4">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          Patient Files
        </div>
        <button 
          className="px-3 py-1 text-sm font-bold text-white bg-blueSecondary rounded hover:bg-navy-500"
          onClick={() => setIsAddFileOpen(true)}
        >
          Add New Patient File
        </button>
      </header>



        {/* Table for displaying files */}
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
                      className="px-3 py-1 text-sm font-bold text-white bg-blueSecondary rounded hover:bg-blue-600"
                      onClick={() => {
                        setSelectedFile({
                          id: file._id,
                          note: file.note
                        });
                        setIsEditNoteOpen(true);
                      }}
                    >
                      Edit Note 
                    </button>
                    <button
                      className="px-3 py-1 text-sm font-bold text-white bg-blue-500 rounded hover:bg-blue-600"
                      onClick={() => {
                        setSelectedDetails(file);
                        setIsDetailsOpen(true);
                      }}
                      
                    >
                      Details
                    </button>
                    <button
                      className="px-3 py-1 text-sm font-bold text-white bg-red-500 rounded hover:bg-red-600"
                      onClick={() => handleDeleteFile(file._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isDetailsOpen && selectedDetails && (
        <>
            <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
            onClick={() => setIsDetailsOpen(false)}
            />
            <Card extra="fixed z-50 bg-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-xl p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-navy-700">Patient File Details</h3>
                <button
                className="text-2xl font-bold text-gray-500 hover:text-gray-700"
                onClick={() => setIsDetailsOpen(false)}
                >
                ×
                </button>
            </div>
            <div className="space-y-4">
                <div>
                <p className="font-semibold text-gray-600">Full Name:</p>
                <p className="text-navy-700">{selectedDetails.user?.fullname}</p>
                </div>
                <div>
                <p className="font-semibold text-gray-600">Username:</p>
                <p className="text-navy-700">{selectedDetails.user?.username}</p>
                </div>
                <div>
                <p className="font-semibold text-gray-600">Email:</p>
                <p className="text-navy-700">{selectedDetails.user?.email}</p>
                </div>
                <div>
                <p className="font-semibold text-gray-600">Phone Number:</p>
                <p className="text-navy-700">{selectedDetails.user?.number}</p>
                </div>
                <div>
                <p className="font-semibold text-gray-600">Note:</p>
                <p className="text-navy-700 whitespace-pre-line">{selectedDetails.note || "No note available."}</p>
                </div>
            </div>
            </Card>
        </>
        )}      
              {/* Add File Modal */}
      {isAddFileOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 bg-transparent backdrop-blur-md"
            onClick={() => setIsAddFileOpen(false)}
          />
          <Card extra=" rounded-lg  fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-lg w-full p-6 rounded-lg z-50 bg-white ">
            <div className="flex justify-between items-center mb-4 p-7">
              <h3 className="text-lg font-bold">Add New Patient File</h3>
              <button 
                className="text-brand-600 hover:text-brand-500"
                onClick={() => setIsAddFileOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateFile}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Select Patient</label>
                <select
                  name="patientId"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blueSecondary z-50"
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
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  className="px-4 py-2 text-white  bg-purple-700 rounded-lg hover:bg-purple-500"
                  onClick={() => setIsAddFileOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-white bg-blueSecondary rounded-lg hover:bg-indigo-700"
                >
                  Create File
                </button>
              </div>
            </form>
          </Card>
        </>
      )}
      {isEditNoteOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 bg-transparent backdrop-blur-md"
            onClick={() => setIsEditNoteOpen(false)}
          />
          <Card extra="p-6 rounded-lg fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-lg w-full p-6 rounded-lg z-50 bg-white">
            <div className="flex justify-between items-center mb-4 p-7">
              <h3 className="text-lg font-bold">Edit Patient Note</h3>
              <button 
                className="text-brand-600 hover:text-brand-500"
                onClick={() => setIsEditNoteOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditNote}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Note Content</label>
                <textarea
                  value={selectedFile.note}
                  onChange={(e) => setSelectedFile(prev => ({
                    ...prev,
                    note: e.target.value
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blueSecondary"
                  rows="4"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  className="px-4 py-2 text-white bg-purple-700 rounded-lg hover:bg-purple-500"
                  onClick={() => setIsEditNoteOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-white bg-blueSecondary rounded-lg hover:bg-indigo-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </Card>
        </>
      )}
    </Card>
  );
};

export default FilePatientTable;