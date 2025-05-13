import axios from "axios";

const API_URL = "http://localhost:5000/appointments"; 
const STUDENTS_API="http://localhost:5000/users";


const AppointmentService = {
  // Create a new appointment request
  requestAppointment: async (appointmentData) => {
    try {

      const response = await axios.post(`${API_URL}/request`, appointmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
   
  

  // Get all requested appointments (Pending requests)
  getRequestedAppointments: async () => {
    try {
      const response = await axios.get(`${API_URL}/requested`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all confirmed appointments (Accepted RDVs)
  getConfirmedAppointments: async () => {
    try {
      const response = await axios.get(`${API_URL}/confirmed`, {
        params: { status: 'confirmed' }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Approve an appointment request
  approveAppointment: async (appointmentId) => {
    try {
      const response = await axios.put(`${API_URL}/approve/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // Decline an appointment request
  declineAppointment: async (appointmentId) => {
    try {
      const response = await axios.delete(`${API_URL}/cancel/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createAppointment: async (studentId,psychologistId,date,time) => {
    try {
      const response = await axios.post(`${API_URL}/createAppointment`, {
        studentId,
        psychologistId,
        date,
        time
      
    });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },


  // Get booked slots for a psychologist on a specific date
  getBookedSlots: async (psychologistId, date) => {
    try {
      const response = await axios.post(`${API_URL}/getBookedSlots`, { psychologistId, date });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  
  rescheduleAppointment: async (appointmentId, psychologistId, newDate, newTime) => {
    try {
      const response = await axios.post(`${API_URL}/reschedule`, {
        appointmentId,
        psychologistId,
        newDate,
        newTime
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  
 

  updateAppointmentDate: async (appointmentId, psychologistId, newDate, newTime) => {
    try {
      const response = await axios.put(`${API_URL}/update`, {
        appointmentId,
        psychologistId,
        newDate,
        newTime,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },


  getUserAppointments: async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/getUserAppointments/${userId}`)
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
 },

 submitStudentFeedback: async (appointmentId, feedback) => {
  try {
    const response = await axios.post(`${API_URL}/${appointmentId}/student-feedback`,{ feedback },);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
},

createFile: async (fileData) => {
  try {
    const response = await axios.post(`${API_URL}/files`, fileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
},

getFilesByPsychologist: async (psychologistId) => {
  try {
    const response = await axios.get(`${API_URL}/files/psychologist/${psychologistId}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
},

getFileById: async (fileId) => {
  try {
    const response = await axios.get(`${API_URL}/files/${fileId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
},

deleteFile: async (fileId) => {
  try {
    const response = await axios.delete(`${API_URL}/files/${fileId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
},
  updateFileNote:async(fileId, noteId, data) =>{
  try {
    const response = await axios.put(
      `/api/filepatients/${fileId}/notes/${noteId}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
},

// updateFileNote: async (fileId, note) => {
//   try {
//     const response = await axios.put(`${API_URL}/files/${fileId}/note`, 
//       { note }
//     );
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error.message;
//   }
// },

updateFileNote: async (fileId, note) => {
  try {

    // Faire la requête PUT pour mettre à jour le fichier avec la nouvelle note
    const response = await axios.put(`${API_URL}/files/note/${fileId}`, {note});
    
    // Retourner la réponse de l'API
    return response.data;
  } catch (error) {
    // Si une erreur survient, la relancer
    throw error.response?.data || error.message;
  }
},


updateFileRecommendation: async (fileId, recommendation) => {
  try {

    // Faire la requête PUT pour mettre à jour le fichier avec la nouvelle note
    const response = await axios.put(`${API_URL}/files/recommendation/${fileId}`, {recommendation});
    
    // Retourner la réponse de l'API
    return response.data;
  } catch (error) {
    // Si une erreur survient, la relancer
    throw error.response?.data || error.message;
  }
},

analyzeStudentCase: async (description) => {
  try {
    const response = await axios.post(`${API_URL}/analyze-student`, { description });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
},

analyzePsyNotes: async (idFile) => {
  try {
    const response = await axios.post(`${API_URL}/analyze-psy-note`, { idFile });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
},


 getStudentProfile : async (studentId) => {
  try {
    const response = await axios.get(`${STUDENTS_API}/getUserById/${studentId}`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du profil de l'étudiant :", error.response?.data || error.message);
    throw new Error("Impossible de récupérer le profil de l'étudiant.");
  }
},

getNotes: async (filePatientId) => {
  try {
    const response = await axios.get(`${API_URL}/files/${filePatientId}/notes`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
},
};
export default AppointmentService;