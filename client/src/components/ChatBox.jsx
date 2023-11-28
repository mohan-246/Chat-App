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

const ChatBox = ({ socket }) => {
  const dispatch = useDispatch();
  const { user } = useUser();
  const curChat = useSelector((state) => state.User.curChat);
  const rooms = useSelector((state) => state.Room.rooms);
  const users = useSelector((state) => state.Users.users);
  const [searchUser, setSearchUser] = useState("");
  const [foundUsers, setFoundUsers] = useState([]);
  const [selecting, setSelecting] = useState(false);
  const [checkboxes, setCheckboxes] = useState({});
  const [curCard, setCurCard] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState("");
  const FinalRef = useRef();
  const myRooms = useSelector((state) => state.User.myrooms);
  const memoizedRoom = useMemo(
    () => rooms.find((room) => room.id === curChat),
    [rooms, curChat]
  );
  const [showInfo, setShowInfo] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  function handleMessageInfoClick(message) {
    setShowInfo((prev) => !prev);
    setSelectedMessage(message);
  }
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
  }, [curChat, rooms, myRooms, users]);
  useEffect(() => {
    const usersFound = users.filter(
      (foundUser) =>
        foundUser.userName.toLowerCase().includes(searchUser.toLowerCase()) &&
        foundUser.id != user.id
    );
    setFoundUsers(usersFound);
  }, [searchUser]);

  function handleLeftRoom({ user, room, members }) {
    dispatch(removeUserFromRoom({ user, room, members }));
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
  function handleLeaveRoom() {
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

  function AddMembersToRoom() {
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
  function searchOnClick() {
    setSelecting(false);
    setSelectedUsers([]);
    setSearchUser("");
    setCurCard("");
    setCheckboxes({});
  }
  return (
    <div className="h-screen flex flex-col ">
      {curChat ? (
        <div className="h-screen flex flex-col">
          <ChatHeader
            memoizedRoom={memoizedRoom}
            leaveRoom={handleLeaveRoom}
            setCurCard={setCurCard}
          />
          <div
            className="bg-[#0B141A] flex-1 overflow-y-auto custom-scrollbar-2"
            id="chatbox"
          >
            {curCard == "showMembers" && (
              <div
                className="absolute top-[55px] left-[2/5] ml-1 flex items-center justify-center bg-black bg-opacity-50"
                id="show-members-panel"
              >
                <div className="bg-[#111B21] shadow-lg rounded-lg p-3 w-[300px] overflow-auto  text-[#E8ECEE]">
                  <div className="flex">
                    <div
                      className="bg-cover bg-center mx-1 bg-no-repeat h-[22px] w-[5%] m-auto flex justify-center items-center"
                      style={{
                        backgroundImage: `url(/chevron-left-solid.svg)`,
                        backgroundSize: "contain", // or "cover" based on your preference
                        filter: "invert(1)",
                      }}
                      onClick={() => setCurCard("")}
                    ></div>
                    <h2 className="text-lg font-bold mb-2 mx-2 border-[#6C7B85] border-b flex-1">
                      Room Members
                    </h2>
                  </div>

                  <ul>
                    {memoizedRoom.members.map((memberId) => {
                      const member = users.find((u) => u.id === memberId);
                      return (
                        <li key={memberId} className="mb-1 px-8 py-1">
                          {member ? member.name : "Unknown User"}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
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
