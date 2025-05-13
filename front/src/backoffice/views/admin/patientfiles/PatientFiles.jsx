import React, { useEffect, useState } from 'react';
import AppointmentService from '../../../../Services/AppointmentService';
import FilePatientTable from './components/FilePatientTable';

const PatientFiles = () => {
  const [files, setFiles] = useState([]);
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

  const fetchData = async () => {
    try {
      const data = await AppointmentService.getFilesByPsychologist(loggedUser._id);
      setFiles(data.data);
    } catch (error) {
      console.error('Error fetching patient files:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {/* File Table */}
      <FilePatientTable 
        tableData={files} 
        refreshData={fetchData}
      />
    </div>
  );
};

export default PatientFiles;