/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useState, useEffect, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addMessageToRoom, removeUserFromRoom } from "../redux/RoomSlice";
import { leaveRoom, setCurChat } from "../redux/UserSlice";
import { useUser } from "@clerk/clerk-react";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import AddMembersPanel from "./AddMembersPanel";
import Message from "./Message";
import ShowMembers from "./ShowMembers";

const ChatBox = ({ socket }) => {
  const dispatch = useDispatch();
  const { user } = useUser();
  const curChat = useSelector((state) => state.User.curChat);
  const rooms = useSelector((state) => state.Room.rooms);
  const users = useSelector((state) => state.Users.users);
  const myRooms = useSelector((state) => state.User.myrooms);
  const FinalRef = useRef();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [foundUsers, setFoundUsers] = useState([]);
  const [selecting, setSelecting] = useState(false);
  const [checkboxes, setCheckboxes] = useState({});
  const [curCard, setCurCard] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const memoizedRoom = useMemo(
    () => rooms.find((room) => room.id === curChat),
    [rooms, curChat]
  );

  useEffect(() => {
    socket.on("sent-message", handleSentMessage);
    socket.on("left-room", handleLeftRoom);

    return () => {
      socket.off("sent-message", handleSentMessage);
      socket.off("left-room", handleLeftRoom);
    };
  }, [socket]);
  useEffect(() => {
    scrollToBottom();
  }, [curChat, memoizedRoom]);
  useEffect(() => {
    setCurCard("")
    setIsMenuOpen(false)
  },[curChat])
  useEffect(() => {
    const usersFound = users.filter(
      (foundUser) =>
        foundUser.userName.toLowerCase().includes(searchUser.toLowerCase()) &&
        foundUser.id != user.id
    );
    setFoundUsers(usersFound);
  }, [searchUser]);

  const handleLeftRoom = ({ user, room, members }) => {
    dispatch(removeUserFromRoom({ user, room, members }));
    setCurChat(curChat);
  }
  const handleSentMessage = (message) => {
    dispatch(addMessageToRoom(message));
    scrollToBottom();
  }
  const sendMessage = () => {
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
  const sendIoMessage = (ioMessage) => {
    const messageWithId = {
      from: "io",
      to: curChat,
      time: String(new Date().getTime()),
      content: ioMessage,
    };
    socket.emit("send-message", messageWithId);
    dispatch(addMessageToRoom(messageWithId));
  }
  const scrollToBottom = () => {
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
  const handleLeaveRoom = () => {
    const foundRoom = rooms.find((r) => r.id === curChat);

    if (foundRoom) {
      socket.emit("leave-room", { user: user.id, room: curChat });
      sendIoMessage(`${user.fullName} left`);
      dispatch(leaveRoom({ roomid: curChat }));
      dispatch(setCurChat(null));
    } else {
      console.error(`Room with ID ${curChat} not found.`);
    }
  }
  const AddMembersToRoom = () => {
    if (selectedUsers.length == 0) {
      window.alert("Please select atleast one user");
      return;
    }
    const selectedUserNames = users
      .filter((user) => selectedUsers.includes(user.id))
      .map((user) => user.name);
    sendIoMessage(`${user.fullName} added ${selectedUserNames}`);
    socket.emit("add-members", { users: selectedUsers, room: curChat });
    setSelecting(false);
    setSelectedUsers([]);
    setSearchUser("");
    setCurCard("");
    setCheckboxes({});
  }
  const searchOnClick = () => {
    setSelecting(false);
    setSelectedUsers([]);
    setSearchUser("");
    setCurCard("");
    setCheckboxes({});
  }
  const handleMessageInfoClick = (message) => {
    setShowInfo((prev) => !prev);
    setSelectedMessage(message);
  }

  return (
    <div className="h-screen flex flex-col ">
      {curChat ? (
        <div className="h-screen flex flex-col">
          <ChatHeader
            memoizedRoom={memoizedRoom}
            leaveRoom={handleLeaveRoom}
            setCurCard={setCurCard}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
          />
          <div
            className="bg-[#0B141A] flex-1 overflow-y-auto custom-scrollbar-2"
            id="chatbox"
          >
            {curCard === "showMembers" && (
              <ShowMembers
                setCurCard={setCurCard}
                memoizedRoom={memoizedRoom}
                users={users}
              />
            )}

            <div>
              {memoizedRoom &&
                memoizedRoom.messages.map((message) => (
                  <Message
                    key={message.time}
                    message={message}
                    handleInfoClick={handleMessageInfoClick}
                    showInfo={showInfo}
                    selectedMessage={selectedMessage}
                    memoizedRoom={memoizedRoom}
                  />
                ))}
            </div>

            <p ref={FinalRef}></p>
          </div>
          {memoizedRoom && curCard == "addingMembers" && (
            <AddMembersPanel
              searchUser={searchUser}
              setSearchUser={setSearchUser}
              selecting={selecting}
              setSelecting={setSelecting}
              foundUsers={foundUsers}
              selectedUsers={selectedUsers}
              setSelectedUsers={setSelectedUsers}
              AddMembersToRoom={AddMembersToRoom}
              checkboxes={checkboxes}
              setCheckboxes={setCheckboxes}
              memoizedRoom={memoizedRoom}
              searchOnClick={searchOnClick}
            />
          )}

          {curChat && (
            <ChatInput
              sendMessage={sendMessage}
              setMessage={setMessage}
              message={message}
              curChat={curChat}
            />
          )}
        </div>
      ) : (
        <div className="bg-[#0B141A] w-full h-full flex items-center justify-center text-center">
          <p className="text-xl max-w-[50%] font-mono text-[#D9E3E4] font-semibold uppercase">
            Join a room or select a room to start chatting
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
