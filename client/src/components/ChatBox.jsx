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

const ChatBox = ({ socket }) => {
  const dispatch = useDispatch();
  const { user } = useUser();
  const curChat = useSelector((state) => state.User.curChat);
  const rooms = useSelector((state) => state.Room.rooms);
  const users = useSelector((state) => state.Users.users);
  const [searchUser, setSearchUser] = useState("");
  const [foundUsers, setFoundUsers] = useState([]);
  const [selecting, setSelecting] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [checkboxes, setCheckboxes] = useState({});
  const [addingMembers, setAddingMembers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState("");
  const FinalRef = useRef();
  const myRooms = useSelector((state) => state.User.myrooms);
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
  }, [curChat, rooms, myRooms, users]);
  useEffect(() => {
    const usersFound = users.filter(
      (foundUser) =>
        foundUser.name.toLowerCase().includes(searchUser.toLowerCase()) &&
        foundUser.id != user.id
    );
    setFoundUsers(usersFound);
  }, [searchUser]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMembers && event.target.id == "show-members-panel") {
        handleInfoClick();
      }
      if (addingMembers && event.target.id == "add-members-panel") {
        handleAddMembers();
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, [showMembers, addingMembers]);

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
  function handleInfoClick() {
    setShowMembers((prev) => !prev);
  }
  function handleLeaveRoom() {
    const foundRoom = rooms.find((r) => r.id === curChat);

    if (foundRoom) {
      socket.emit("leave-room", { user: user.id, room: curChat });
      sendIoMessage(`${user.firstName} left`);
      dispatch(leaveRoom({ roomid: curChat }));
      dispatch(setCurChat(null));
    } else {
      console.error(`Room with ID ${curChat} not found.`);
    }
  }
  function handleAddMembers() {
    setAddingMembers((prevAddingMembers) => !prevAddingMembers);
  }
  function AddMembersToRoom() {
    const selectedUserNames = users
      .filter((user) => selectedUsers.includes(user.id))
      .map((user) => user.name);
    sendIoMessage(`${user.firstName} added ${selectedUserNames}`);
    socket.emit("add-members", { users: selectedUsers, room: curChat });
    setSelecting(false);
    setSelectedUsers([]);
    setSearchUser("");
    setCheckboxes({});
    setAddingMembers(false);
  }
  return (
    <div className="h-screen flex flex-col">
      {curChat ? (
        <div className="h-screen flex flex-col">
          <ChatHeader
            handleInfoClick={handleInfoClick}
            memoizedRoom={memoizedRoom}
            leaveRoom={handleLeaveRoom}
            addMembers={handleAddMembers}
          />
          <div className="bg-indigo-50 flex-1 overflow-y-auto" id="chatbox">
            {showMembers && (
              <div
                className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50"
                id="show-members-panel"
              >
                <div className="bg-indigo-50 p-4 rounded max-h-1/2 overflow-auto max-w-1/4">
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
                </div>
              </div>
            )}

            <div>
              {memoizedRoom &&
                memoizedRoom.messages.map((message) => (
                  <div
                    key={message.time}
                    className={`flex mb-2 mx-1 ${
                      message.from == "io"
                        ? "justify-center"
                        : message.from === user.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg inline-block m-1 p-2 max-w-[80%] ${
                        message.from == "io"
                          ? "bg-slate-50"
                          : message.from === user.id
                          ? "bg-indigo-200"
                          : "bg-indigo-100"
                      }`}
                    >
                      <p className="text-[10px] opacity-80 capitalize">
                        {users
                          .filter(
                            (u) =>
                              u.id === message.from &&
                              u.id != user.id &&
                              memoizedRoom.type == "group"
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
          {memoizedRoom && addingMembers && (
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
            />
          )}

          {curChat && (
            <ChatInput
              sendMessage={sendMessage}
              setMessage={setMessage}
              message={message}
            />
          )}
        </div>
      ) : (
        <div className="bg-indigo-50 w-full h-full flex items-center justify-center text-center">
          <p className="text-xl max-w-[50%] font-mono font-semibold uppercase">Join a room or select a room to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
