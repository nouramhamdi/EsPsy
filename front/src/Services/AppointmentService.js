import axios from "axios";

const API_URL = "http://localhost:5000/appointments"; 

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
    const response = await axios.get(`${API_URL}/files/psychologist/${psychologistId}`);
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

updateFileNote: async (fileId, note) => {
  try {
    const response = await axios.put(`${API_URL}/files/${fileId}/note`, 
      { note }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}
};

export default AppointmentService;
