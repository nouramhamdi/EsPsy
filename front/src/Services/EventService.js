import axios from "axios";

axios.defaults.withCredentials = true;
const API_URL = "http://localhost:5000/events"; // Adjust the URL based on your backend

const EventServices = {
 
  addEvent: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/add`, userData);
      return response.data; // Return the response data
    } catch (error) {
      console.error("Error adding event:", error.response?.data || error.message);
      throw error;
    }
  },
  getAllEvents: async () => {
    try {
      const response = await axios.get(`${API_URL}`);
      console.log("getAllEvents response:", response.data); // Pour le débogage
      return response.data; // Return the actual data from response
    } catch (error) {
      console.error("Error fetching all events:", error.response?.data || error.message);
      throw error;
    }
  },

  updateEvent: async (id, eventData) => {
    try {
      console.log("Updating event with ID:", id);
      
      // Si eventData est déjà un FormData, l'utiliser directement
      let dataToSend = eventData;
      
      // Si ce n'est pas un FormData, en créer un
      if (!(eventData instanceof FormData)) {
        dataToSend = new FormData();
        Object.keys(eventData).forEach(key => {
          if (eventData[key] !== undefined && eventData[key] !== null) {
            dataToSend.append(key, eventData[key]);
          }
        });
      }

      // Log du contenu du FormData pour débogage
      for (let pair of dataToSend.entries()) {
        console.log('FormData content:', pair[0], pair[1]);
      }

      const response = await axios.put(`${API_URL}/update/${id}`, dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("Update response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'événement:", error.response?.data || error.message);
      throw error;
    }
  },

  getEventById: async (id) => {
    try {
      console.log("Fetching event with ID:", id); // Pour le débogage
      const response = await axios.get(`${API_URL}/${id}`);
      console.log("getEventById response:", response.data); // Pour le débogage
      return response.data;
    } catch (error) {
      console.error("Error fetching event:", error.response?.data || error.message);
      throw error;
    }
  },

  deleteEvent: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/delete/${id}`);
      return response.data; // Retourne la réponse du backend (message de succès)
    } catch (error) {
      console.error("Erreur lors de la suppression de l'événement:", error.response?.data || error.message);
      throw error;
    }
  },

  updateEventStatus: async (id, status) => {
    try {
      const response = await axios.put(`${API_URL}/update-status/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating event status:", error.response?.data || error.message);
      throw error;
    }
  },

  // Récupérer les statistiques des événements
  getEventStatistics: async () => {
    try {
      const response = await axios.get(`${API_URL}/statistics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event statistics:', error);
      throw error;
    }
  }
};

export default EventServices;
