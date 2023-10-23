import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessageToRoom } from "../redux/RoomSlice";
import { useUser } from "@clerk/clerk-react";

const ChatBox = ({socket}) => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.Users.users);
  const myRooms = useSelector((state) => state.User.myrooms);
  const rooms = useSelector((state) => state.Room.rooms);
  const curChat = useSelector((state) => state.User.curChat);
  const [message, setMessage] = useState('');
  const {user} = useUser()

  useEffect(() => {
    socket.on("sent-message",handleSentMessage)
    
    return () => {
      socket.off("sent-message", handleSentMessage);
    };
  },[socket])
  function handleSentMessage (message){
    console.log("reciedve new msg")
    dispatch(addMessageToRoom(message))
  }
  function sendMessage(){
    const messageWithId = {from:user.id , to:curChat , time: String(new Date().getTime()), content : message }
    socket.emit("send-message",messageWithId)
    setMessage('')
    dispatch(addMessageToRoom(messageWithId))
  }
  
  return (
    <div className="h-screen flex flex-col">
      <p className="bg-slate-200 p-2">{curChat}</p>
      <div className="bg-slate-100 flex-1">
        {rooms
          .filter((room) => room.id === curChat)
          .map((room) => (
            <div key={room.id}>
              {room.messages.map((message) => (
                <p key={message.time}>{message.content}</p>
              ))}
            </div>
            
          ))}
      </div>
      <div className="bg-slate-300 p-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-[80%]"
        />
        <button className=" w-[20%] bg-slate-400" onClick={sendMessage}>send</button>
      </div>
    </div>
  );
};

export default ChatBox;
