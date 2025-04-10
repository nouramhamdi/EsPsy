import axios from 'axios';

const API_URL = 'http://localhost:5000/api/responses';  // Adjust as needed

const getAllResponses = async () => {
  const response = await axios.get(API_URL);  // Fetch all responses
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
  addResultToResponse
};

