import axios from 'axios';

const API_URL = 'http://localhost:5000/api/responses';  // Adjust as needed

const getAllResponses = async (filters = {}, includeQuestions = true) => {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.status) params.append('status', filters.status);
  if (includeQuestions) params.append('includeQuestions', 'true');

  const response = await axios.get(`${API_URL}?${params.toString()}`);
  return response.data;
};


const deleteResponse = async (responseId) => {
  await axios.delete(`${API_URL}/${responseId}`);
};



const addResultToResponse= async (id, result) =>{
  return axios.put(`http://localhost:5000/api/responses/add-result/${id}`, { result });
}




export default {
  getAllResponses,
  deleteResponse,
  addResultToResponse,
 };

