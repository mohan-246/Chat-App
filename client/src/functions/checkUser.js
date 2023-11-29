import axios from 'axios';

async function checkUser(userId) {
    try {
      const response = await axios.get(`https://chat-backend-itw9.onrender.com/api/user/${userId}`);
      return response.data;
    } catch (error) {
      
      return null;
    }
  }
export default checkUser