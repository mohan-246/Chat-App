import axios from "axios";

async function getUsers() {
  
  //const response = await axios.get("https://chat-backend-itw9.onrender.com/api/users");
  const response = await axios.get("http://localhost:3001/api/users");

  if (response.status !== 200) {
    
    return null
  }

  return response.data;
}
export default getUsers