import { useEffect } from "react";
import MessageList from "../components/MessageList";
import ChatBox from "../components/ChatBox";
import { useDispatch } from "react-redux";
import { setName, setId, setMyRooms, setUserName, setImage } from "../redux/UserSlice";
import { useUser } from "@clerk/clerk-react";
import useSocket from "../socket/useSocket";
import checkUser from "../functions/checkUser";
import getUsers from "../functions/getUsers";
import { setUsers } from "../redux/UsersSlice";
import getRooms from "../functions/getRooms";
import { setRooms } from "../redux/RoomSlice";

const ChatPage = () => {
  const socket = useSocket();
  const { user } = useUser();
  const dispatch = useDispatch();
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    handleUserChange()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[user.fullName , user.imageUrl , user.username])
  async function handleUserChange() {
    dispatch(setName(user.fullName))
    dispatch(setUserName(user.username))
    dispatch(setImage(user.imageUrl))
    socket.emit("user-change",{fullName : user.fullName, imageUrl : user.imageUrl, username : user.username})
  }
  async function fetchData() { 
    const me = await checkUser(user.id);
    const users = await getUsers();
    const rooms = await getRooms(user.id);
    
    dispatch(setName(user.fullName));
    dispatch(setUserName(user.username))
    dispatch(setId(user.id));
    dispatch(setImage(user.imageUrl))
    if (!me) {
      socket.emit("new-user");
    } else {
      dispatch(setMyRooms(me.userrooms));
    }
    if (users) {
      dispatch(setUsers(users));
    }
    if (rooms) {
      dispatch(setRooms(rooms));
    }
  }
  
  return (
    <div className="h-screen min-w-[845px] custom-scrollbar filter invert-1">
      <div className="grid grid-cols-5 gap-0">
        <div className="col-span-2 ">
          <MessageList socket={socket} />
        </div>
        <div className="col-span-3 border-[#edededff] border-l">
          <ChatBox socket={socket} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
