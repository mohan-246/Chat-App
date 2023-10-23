import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessageToRoom } from "../redux/RoomSlice";
import { useUser } from "@clerk/clerk-react";

const ChatBox = ({ socket }) => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.Users.users);
  const myRooms = useSelector((state) => state.User.myrooms);
  const rooms = useSelector((state) => state.Room.rooms);
  const curChat = useSelector((state) => state.User.curChat);
  const [message, setMessage] = useState("");
  const { user } = useUser();

  useEffect(() => {
    socket.on("sent-message", handleSentMessage);

    return () => {
      socket.off("sent-message", handleSentMessage);
    };
  }, [socket]);
  function handleSentMessage(message) {
    console.log("reciedve new msg");
    dispatch(addMessageToRoom(message));
  }
  function sendMessage() {
    const messageWithId = {
      from: user.id,
      to: curChat,
      time: String(new Date().getTime()),
      content: message,
    };
    socket.emit("send-message", messageWithId);
    setMessage("");
    dispatch(addMessageToRoom(messageWithId));
  }

  return (
    <div className="h-screen flex flex-col">
      <p className="bg-blue-100 p-2">
        {rooms
          .filter((room) => room.id === curChat)
          .map((room) => (
            <span key={room.id} className="uppercase font-bold">
              {room.name
                ? room.name
                : room.members
                    ?.filter((memberId) => memberId !== user.id)
                    .map((memberId) => {
                      const member = users.find((user) => user.id === memberId);
                      return (
                        <span key={memberId}>
                          {member ? member.name : "Unknown User"}
                        </span>
                      );
                    })}
            </span>
          ))}
      </p>
      <div className="bg-slate-100 flex-1 overflow-y-auto" id="chatbox">
        {rooms
          .filter((room) => room.id === curChat)
          .map((room) => (
            <div key={room.id}>
              {room.messages.map((message) => (
                <div key={message.time} className="mb-2 mx-1">
                  <div className="bg-slate-200 rounded-md inline-block m-1 p-1">
                    <p className="text-[10px]">
                      {users
                        .filter((user) => user.id === message.from)
                        .map((user) => (
                          <span key={user.id}>{user.name}</span>
                        ))}
                    </p>
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
      <div className="bg-blue-100 px-2 py-3 flex items-center">
        <input
          type="text"
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-[80%] mx-1 rounded-md py-1 px-2"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage(e.target.value);
              e.target.value = "";
            }
          }}
        />
        <button
          className="mx-1 rounded-md w-[20%] py-1 bg-blue-300"
          onClick={sendMessage}
        >
          send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
