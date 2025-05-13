import axios from "axios";

axios.defaults.withCredentials = true;
const API_URL = "http://localhost:5000/grp"; 

const groupServices = {
  getAllGroups: async () => {
    try {
      const response = await axios.get(`${API_URL}/getAllGroups`);
      return response.data; 
    } catch (error) {
      console.error("Error fetching all groups:", error.response?.data || error.message);
      throw error;
    }
  },

  
  getGroupById: async (groupId) => {
    try {

      const response = await axios.get(`${API_URL}/getGroupById/${groupId}`);
      return response.data; 
    } catch (error) {
      console.error("Error fetching group by ID:", error.response?.data || error.message);
      throw error;
    }
  },

  getGroupsByCreator: async (creatorId) => {
    try {
      const response = await axios.get(`${API_URL}/getGroupsByCreator/${creatorId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching groups by moderator:", error.response?.data || error.message);
      throw error;
    }
  },

  getGroupsByIdMember: async (memberId) => {
    try {
      const response = await axios.get(`${API_URL}/getGroupByIdMember/${memberId}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching groups by moderator:", error.response?.data || error.message);
      throw error;
    }
  },
  
  addGroup: async (groupData) => {
    try {
      const response = await axios.post(`${API_URL}/addGroup`, groupData);
      return response.data; 
    } catch (error) {
      console.error("Error adding group:", error.response?.data || error.message);
      throw error;
    }
  },

  
  addMemberToGroup: async (groupId, userId) => {
    try {
      const response = await axios.post(`${API_URL}/addMember/${groupId}`, { userId: userId });
      return response.data; 
    } catch (error) {
      console.error("Error adding member to group:", error.response?.data || error.message);
      throw error;
    }
  },

  toggleLockGroup: async (groupId) => {
    try {
      const response = await axios.put(`${API_URL}/toggleLock/${groupId}`);
      return response.data; 
    } catch (error) {
      console.error("Error toggling lock on group:", error.response?.data || error.message);
      throw error;
    }
  },

  
  changeModerator: async (groupId, newModeratorId) => {
    try {
      const response = await axios.put(`${API_URL}/changeModerator/${groupId}`, { newModeratorId });
      return response.data; 
    } catch (error) {
      console.error("Error changing group moderator:", error.response?.data || error.message);
      throw error;
    }
  },

  
  deleteGroup: async (groupId) => {
    try {
      const response = await axios.delete(`${API_URL}/deleteGroup/${groupId}`);
      return response.data; 
    } catch (error) {
      console.error("Error deleting group:", error.response?.data || error.message);
      throw error;
    }
  },

  
  deleteMemberFromGroup: async (groupId, memberId) => {
    try {
      const response = await axios.put(`${API_URL}/deleteMember/${groupId}`,  { userId: memberId } );
      return response.data; 
    } catch (error) {
      console.error("Error deleting member from group:", error.response?.data || error.message);
      throw error;
    }
  },

  addReportMessage: async (reportData) => {
    try {
      const response = await axios.post(`${API_URL}/addReportMessage`, reportData);
      return response.data;
    } catch (error) {
      console.error("Error adding report:", error.response?.data || error.message);
      throw error;
    }
  },

  getReportMessageList: async (status = 'all') => {
    try {
      const response = await axios.get(`${API_URL}/getReportMessageList`, {
        params: { status: status !== 'all' ? status : null }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching report list:", error.response?.data || error.message);
      throw error;
    }
  },
  
  getReportMessageById: async (reportId) => {
    try {
      const response = await axios.get(`${API_URL}/getReportMessageById/${reportId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching report by ID:", error.response?.data || error.message);
      throw error;
    }
  },

  handleReportMessage: async (reportId) => {
    try {
      const response = await axios.put(`${API_URL}/handleReportMessage/${reportId}`);
      return response.data;
    } catch (error) {
      console.error("Error handling report:", error.response?.data || error.message);
      throw error;
    }
  },
  getMessageById: async (groupId, messageId) => {
    try {
      const response = await axios.post(`${API_URL}/getMessage`, {
        groupId,
        messageId
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching message:", error.response?.data || error.message);
      throw error;
    }
  },
  deleteReport: async (reportId) => {
    try {
      const response = await axios.delete(`${API_URL}/deleteReport/${reportId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting report:", error.response?.data || error.message);
      throw error;
    }
  },
  checkNewNotifications: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/has-unread/${userId}`);
      return response.data.hasUnread;
    } catch (error) {
      console.error("Error checking new notifications:", error.response?.data || error.message);
      return false;
    }
  },
  markNotificationsAsRead: async (userId) => {
    try {
      const response = await axios.put(`${API_URL}/markNotificationsAsRead/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error marking notifications as read:", error.response?.data || error.message);
      throw error;
    }
  },
};

export default groupServices;
