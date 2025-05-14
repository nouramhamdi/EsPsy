import axios from 'axios';

const API_BASE_URL = 'https://espsy.onrender.com/api';

const chatbotService = {
  // Start new chat session
  startSession: async (userId, aiId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/sessions`, {
        userId,
        aiId
      });
      return response.data;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  },

  // Add message to existing session
  addMessage: async (sessionId, message) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/sessions/${sessionId}/messages`,
        { message }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding message:', error);
      throw error;
    }
  },

  // Get chat history
  getHistory: async (sessionId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  },

  // Get session ID by user and AI ID
  getSessionId: async (userId, aiId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/GetsessionId`,{ userId, aiId }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting session ID:', error);
      throw error;
    }
  }
};

export default chatbotService;