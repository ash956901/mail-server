import axios from 'axios';

const API_URL = 'http://localhost:5001/api/email/';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
};

export const sendEmail = async (recipient, subject, body) => {
  const response = await axios.post(API_URL + 'send', 
    { recipient, subject, body },
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const getInbox = async () => {
  const response = await axios.get(API_URL + 'inbox', {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getEmail = async (id) => {
  const response = await axios.get(API_URL + id, {
    headers: getAuthHeader()
  });
  return response.data;
};