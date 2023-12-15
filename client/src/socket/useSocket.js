import io from 'socket.io-client';
import { useUser } from '@clerk/clerk-react';

function useSocket() {
  const { user } = useUser();

  
  const socket = io('https://chat-backend-itw9.onrender.com',{ query: { userId: user.id , userName: user.username , name: user.fullName, image: user.imageUrl } });


  return socket;
}

export default useSocket;
