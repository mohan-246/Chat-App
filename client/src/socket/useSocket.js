import io from 'socket.io-client';
import { useUser } from '@clerk/clerk-react';

function useSocket() {
  const { user } = useUser();
  const socket = io('http://localhost:3001',{ query: { userId: user.id , userName: user.firstName } });

  return socket;
}

export default useSocket;
