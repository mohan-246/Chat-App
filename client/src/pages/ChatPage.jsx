import { useEffect } from "react";
import MessageList from "../components/MessageList";
import ChatBox from "../components/ChatBox";
import { useDispatch, useSelector } from "react-redux";
import { setName, setId, setMyRooms } from "../redux/UserSlice";
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
  }, []);
  async function fetchData() {
    const me = await checkUser(user.id);
    const users = await getUsers();
    const rooms = await getRooms(user.id);

    dispatch(setName(user.firstName));
    dispatch(setId(user.id));
    if (!me) {
      socket.emit("new-user");
    } else {
      // console.log(me.rooms)
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
    <div className="h-screen">
      <div className="grid grid-cols-3 gap-0">
        <div className="col-span-1">
          <MessageList socket={socket} />
        </div>
        <div className="col-span-2">
          <ChatBox socket={socket} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
