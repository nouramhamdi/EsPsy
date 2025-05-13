import axios from "axios";

axios.defaults.withCredentials = true;
const API_URL = "http://localhost:5000/resources";

const resourceServices = {
  addResource: async (userData, files) => {
    try {
      const formData = new FormData();
      formData.append("title", userData.title);
      formData.append("description", userData.description);
      formData.append("type", userData.type);
      
      // Ajouter chaque fichier au formData
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append("files", file);
        });
      }

      const response = await axios.post(`${API_URL}/addResource`, formData, {
        withCredentials: true,
        headers: { 
          "Content-Type": "multipart/form-data"
        }
      });

      return response.data;
    } catch (error) {
      console.error("Error adding resource:", error.response?.data || error.message);
      throw error;
    }
  },

  getResources: async () => {
    try {
      const response = await axios.get(`${API_URL}/getAllResources`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching resources:", error.response?.data || error.message);
      throw error;
    }
  },

  getResourceById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/getResourceById/${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching resource:", error.response?.data || error.message);
      throw error;
    }
  },

  updateResource: async (id, updatedData, files) => {
    try {
      const formData = new FormData();
      formData.append("title", updatedData.title);
      formData.append("description", updatedData.description);
      formData.append("type", updatedData.type);
      
      // Ajouter chaque fichier au formData
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append("files", file);
        });
      }

      const response = await axios.put(`${API_URL}/updateResource/${id}`, formData, {
        withCredentials: true,
        headers: { 
          "Content-Type": "multipart/form-data"
        }
      });

      return response.data;
    } catch (error) {
      console.error("Error updating resource:", error.response?.data || error.message);
      throw error;
    }
  },

  deleteResource: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/deleteResource/${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting resource:", error.response?.data || error.message);
      throw error;
    }
  },

  searchResources: async (query) => {
    try {
      const response = await axios.get(`${API_URL}/search`, {
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error("Error searching resources:", error.response?.data || error.message);
      throw error;
    }
  },

  likeResource: async (resourceId, iduser) => {
    try {
      const response = await axios.post(`${API_URL}/${resourceId}/like`, 
        {
          userId: iduser
        });
      return response.data;
    } catch (error) {
      console.error('ResourceService: Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      throw error;
    }
  },

  favoriteResource: async (resourceId, iduser) => {
    try {
      const response = await axios.post(`${API_URL}/${resourceId}/favorite`, 
        {
          userId: iduser
        },
        {
          withCredentials: true
        });
      return response.data;
    } catch (error) {
      console.error("Error favoriting resource:", error.response?.data || error.message);
      throw error;
    }
  },

  getUserFavorites: async () => {
    try {
      const response = await axios.get(`${API_URL}/favorites`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user favorites:", error.response?.data || error.message);
      throw error;
    }
  },

  toggleBlockResource: async (id) => {
    try {
      const response = await axios.post(`${API_URL}/BlockResource/${id}`, null, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error("Error toggling block status:", error.response?.data || error.message);
      throw error;
    }
  },

  getMostLikedByType: async () => {
    try {
      const response = await axios.get(`${API_URL}/stats/most-liked-by-type`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching most liked resources by type:", error.response?.data || error.message);
      throw error;
    }
  },

  getResourceStatsByType: async () => {
    try {
      const response = await axios.get(`${API_URL}/stats/resource-stats-by-type`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching resource stats by type:", error.response?.data || error.message);
      throw error;
    }
  }
};

export default resourceServices; 