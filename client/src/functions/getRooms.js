import axios from 'axios';

async function getRooms(userId) {
    try {
      const response = await axios.get(`https://chat-backend-itw9.onrender.com/api/rooms/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return null;
    }
  }
export default getRooms