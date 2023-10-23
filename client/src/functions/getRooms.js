import axios from 'axios';

async function getRooms() {
    try {
      const response = await axios.get(`http://localhost:3001/api/rooms`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return null;
    }
  }
export default getRooms