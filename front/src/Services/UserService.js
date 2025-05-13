import axios from "axios";

axios.defaults.withCredentials = true;
const API_URL = "http://localhost:5000/users"; // Adjust the URL based on your backend

const userServices = {
 
  addUser: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/addUser`, userData);
      return response.data; // Return the response data
    } catch (error) {
      console.error("Error adding user:", error.response?.data || error.message);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      return response.data; // Return the response data (e.g., user info, token)
    } catch (error) {
      console.error("Error logging in:", error.response?.data || error.message);
      throw error;
    }
  },

  getSessionUser: async () => {
    try {
      const response = await axios.get(`${API_URL}/session-user`, {
        withCredentials: true, // Ensure cookies are sent with the request
      });
      return response.data; // Return the user data
    } catch (error) {
      console.error("Error fetching session user:", error.response?.data || error.message);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await axios.post(`${API_URL}/logout`);
      return response.data;
    } catch (error) {
      console.error("Error logging out:", error.response?.data || error.message);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await axios.put(`${API_URL}/updateUser/${id}`, userData);
      return response.data; // Return the updated user data
    } catch (error) {
      console.error("Error updating user:", error.response?.data || error.message);
      throw error;
    }
  },

  getAllUsers: async () => {
    try {
      const response = await axios.get(`${API_URL}/getAllUser`);
      return response.data; // Return the actual data from response
    } catch (error) {
      console.error("Error fetching all users:", error.response?.data || error.message);
      throw error;
    }
  },

  changeUserRole: async (userId, newRole) => {
    try {
      const response = await axios.put(
        `${API_URL}/changeRole/${userId}`,
        { newRole },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error("Error changing role:", error.response?.data || error.message);
      throw error;
    }
  },

  blockUser: async (userId) => {
    try {
      const response = await axios.put(`${API_URL}/blockUser/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error blocking user:', error.response?.data || error.message);
      throw error;
    }
  },

  unblockUser: async (userId) => {
    try {
      const response = await axios.put(`${API_URL}/unblockUser/${userId}`);
      return response.data;
    } 
    catch (error) {
      console.error('Error blocking user:', error.response?.data || error.message);
      throw error;
    }
  },
  getRoleStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/role-stats`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching role stats:", error.response?.data || error.message);
      throw error;
    }
  },

  MailAfterSignUp: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/MailAfterSignUp/${userId}`, {
        withCredentials: true, // Ensure cookies are sent with the request
      });
      return response.data; // Return the user data
    } catch (error) {
      console.error("Error fetching session user:", error.response?.data || error.message);
      throw error;
    }
  },
  GetPendingRequests: async () => {
    try {
      const response = await axios.get(`${API_URL}/pending-requests`);
      return response.data; // Return the actual data from response
    } catch (error) {
      console.error("Error fetching pending-requests :", error.response?.data || error.message);
      throw error;
    }
  },
  AcceptRequest: async (userId) => {
    try {
      const response = await axios.put(`${API_URL}/accept-request/${userId}`);
      return response.data; // Return the updated user data
    } catch (error) {
      console.error("Error accepting request:", error.response?.data || error.message);
      throw error;
    }
  },

  CancelRequest: async (userId) => {
    try {
      const response = await axios.delete(`${API_URL}/cancel-request/${userId}`);
      return response.data; // Return the success message
    } catch (error) {
      console.log("Error canceling request:", error.response?.data || error.message);
      throw error;
    }
  },
  ratePsychologist: async (psychologistId, ratingData) => {
    try {
      const response = await axios.post(
        `${API_URL}/${psychologistId}/rate`,
        ratingData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error rating psychologist:', error.response?.data || error.message);
      throw error;
    }
  },
  getPsychologistRatings: async (psychologistId) => {
    try {
      const response = await axios.get(`${API_URL}/${psychologistId}/ratings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching psychologist ratings:', error.response?.data || error.message);
      throw error;
    }
  },
  getPsychologistStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/psychologists/stats`);
      return response.data;
    } catch (error) {
      console.error("Error fetching psychologist stats:", error);
      throw error;
    }
  },
  // In userServices
  getTestParticipationStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/stats/test-participation`);
      return response.data;
    } catch (error) {
      console.error("Error fetching test participation stats:", error);
      throw error;
    }
  },
};
export default userServices;





