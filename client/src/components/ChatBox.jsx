import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessageToRoom, removeUserFromRoom } from "../redux/RoomSlice";
import { removeUserRoom } from "../redux/UsersSlice";
import { leaveRoom, setCurChat } from "../redux/UserSlice";
import { useUser } from "@clerk/clerk-react";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";

const ChatBox = ({ socket }) => {
  const dispatch = useDispatch();
  const { user } = useUser();
  const curChat = useSelector((state) => state.User.curChat);
  const rooms = useSelector((state) => state.Room.rooms);
  const users = useSelector((state) => state.Users.users);
  const [showMembers, setShowMembers] = useState(false);
  const [message, setMessage] = useState("");
  const FinalRef = useRef();
  const myRooms = useSelector((state) => state.User.myrooms);

  const memoizedRoom = useMemo(
    () => rooms.find((room) => room.id === curChat),
    [rooms, curChat]
  );
  useEffect(() => {
    // console.log('rooms changed', rooms)
  },[rooms])
  useEffect(() => {
    // console.log("Memoized room changed",memoizedRoom);
  }, [memoizedRoom]);
  useEffect(() => {
    scrollToBottom();
  }, [curChat, rooms, myRooms, users]);

  useEffect(() => {
    socket.on("sent-message", handleSentMessage);
    socket.on("left-room", handleLeftRoom);

    return () => {
      socket.off("sent-message", handleSentMessage);
      socket.off("left-room", handleLeftRoom);
    };
  }, [socket]);
  function handleLeftRoom({ user, room , members }) {
    
    dispatch(removeUserFromRoom({ user, room , members }));
    console.log("handling left room",rooms)
    setCurChat(curChat);
  }

  function handleSentMessage(message) {
    dispatch(addMessageToRoom(message));
    scrollToBottom();
  }

  function sendMessage() {
    if (message.trim() === "") {
      return;
    }
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
  function sendIoMessage(ioMessage) {
    const messageWithId = {
      from: "io",
      to: curChat,
      time: String(new Date().getTime()),
      content: ioMessage,
    };
    socket.emit("send-message", messageWithId);
    dispatch(addMessageToRoom(messageWithId));
  }
  function scrollToBottom() {
    if (FinalRef.current) {
      const container = FinalRef.current.parentElement;
      const scrollThreshold = 150;
      const distanceToBottom =
        container.scrollHeight - (container.scrollTop + container.clientHeight);
      const shouldScrollSmoothly = distanceToBottom <= scrollThreshold;

      if (shouldScrollSmoothly) {
        container.scrollTop = container.scrollHeight;
      } else {
        FinalRef.current.scrollIntoView();
      }
    }
  }
  function handleInfoClick() {
    setShowMembers(true);
  }

  function handleCloseMembers() {
    setShowMembers(false);
  }
  function handleLeaveRoom() {
    const foundRoom = rooms.find((r) => r.id === curChat);

    if (foundRoom) {
      socket.emit("leave-room", { user: user.id, room: curChat });
      sendIoMessage(`${user.fullName} has left the chat`);
      dispatch(leaveRoom({ roomid: curChat }));
      dispatch(setCurChat(null));
    } else { 
      console.error(`Room with ID ${curChat} not found.`);
    }
  }
  function handleAddMembers(){
    window.alert("adding members...");
  }
  return (
    <div className="h-screen flex flex-col">
      <ChatHeader
        handleInfoClick={handleInfoClick}
        memoizedRoom={memoizedRoom}
        leaveRoom={handleLeaveRoom}
        addMembers={handleAddMembers}
      />
      <div className="bg-indigo-50 flex-1 overflow-y-auto" id="chatbox">
        {showMembers && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-indigo-50 p-4 rounded">
              <h2 className="text-lg font-bold mb-2">Room Members</h2>
              <ul>
                {memoizedRoom.members.map((memberId) => {
                  const member = users.find((u) => u.id === memberId);
                  return (
                    <li key={memberId} className="mb-1">
                      {member ? member.name : "Unknown User"}
                    </li>
                  );
                })}
              </ul>
              <button
                className="bg-indigo-300 py-2 px-4 rounded mt-4"
                onClick={handleCloseMembers}
              >
                Close
              </button>
            </div>
          </div>
        )}

        <div>
          {memoizedRoom &&
            memoizedRoom.messages.map((message) => (
              <div
                key={message.time}
                className={`flex mb-2 mx-1 ${
                  message.from === user.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg inline-block m-1 p-2 max-w-[80%] ${
                    message.from === user.id ? "bg-indigo-200" : "bg-indigo-100"
                  }`}
                >
                  <p className="text-[10px] opacity-80 capitalize">
                    {users
                      .filter(
                        (u) =>
                          u.id === message.from &&
                          u.id != user.id &&
                          memoizedRoom.members.length > 2
                      )
                      .map((u) => (
                        <span key={u.id}>{u.name}</span>
                      ))}
                  </p>
                  <p>{message.content}</p>
                </div>
              </div>
            ))}
        </div>

        <p ref={FinalRef}></p>
      </div>

      <ChatInput
        sendMessage={sendMessage}
        setMessage={setMessage}
        message={message}
      />
    </div>
  );
};

export default ChatBox;
