import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/email'; // Update with your backend URL

export const fetchEmails = async (session, numEmails) => {
  try {
    const response = await axios.get(`${API_BASE_URL}`, {
      params: {
        session,
        numEmails,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
};

export const classifyEmails = async (emailsToClassify, apiKey) => {
  try {
    const response = await axios.post(`${API_BASE_URL}`, {
      emailsToClassify,
      apiKey,
    });
    return response.data;
  } catch (error) {
    console.error('Error classifying emails:', error);
    throw error;
  }
};