import axios from 'axios';

const API_URL = 'http://localhost:5000/tests';


const updateTest = async (id, updatedTest) => {
  const formData = new FormData();
  formData.append("title", updatedTest.title);
  formData.append("description", updatedTest.description);
  formData.append("category", updatedTest.category);
  formData.append("duration", updatedTest.duration);

  if (updatedTest.image instanceof File) {
    formData.append("image", updatedTest.image);
  } else {
    formData.append("image", updatedTest.image || "");
  }

  formData.append("questions", JSON.stringify(updatedTest.questions || []));

  const response = await axios.put(`${API_URL}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await axios.post('http://localhost:5000/test/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.imageUrl; // Return the image URL
  } catch (error) {
    console.error('Error uploading image:', error.response?.data || error.message);
    throw error;
  }
};

// Create a test
const createTest = async (testData) => {
  try {
    const response = await axios.post(API_URL, testData);
    return response.data;
  } catch (error) {
    console.error('Error creating test:', error.response?.data || error.message);
    throw error;
  }
};
const getTests = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching tests:', error);
    throw error;
  }
};

const getTestById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching test with id ${id}:`, error);
    throw error;
  }
};



const deleteTest = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting test with id ${id}:`, error);
    throw error;
  }
};

export default { getTests, getTestById, createTest, updateTest, deleteTest,uploadImage };
