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
import { decryptDataWithSymmetricKey , decryptMessage , encryptMessage , generateSymmetricKey , encryptDataWithSymmetricKey } from "../functions/encrypt";
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
    setTimeout(() => {
      scrollToBottom();
    }, 50);
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
  const sendMessage = async() => {
    if (message.trim() == "") {
      return;
    }
   
    try{
      const hybridKey = await generateSymmetricKey()
      const encryptedHybridKey = await encryptMessage(hybridKey, memoizedRoom.publicKey)
      const encryptedData = await encryptDataWithSymmetricKey(message , hybridKey);
      const encryptedMessage = {
        from: user.id,
        to: curChat,
        hybridKey: encryptedHybridKey,
        time: String(new Date().getTime()),
        content: encryptedData,
      };
      
      socket.emit("send-message", encryptedMessage);
    }
    catch(err){
      console.log("Error while encrypting message ",err)
    }

    setMessage("");
   
  }
  const sendIoMessage = async (ioMessage) => {
    try{
      const hybridKey = await generateSymmetricKey()
      const encryptedHybridKey = await encryptMessage(hybridKey, memoizedRoom.publicKey)
      const encryptedData = await encryptDataWithSymmetricKey(ioMessage , hybridKey);
      const encryptedMessage = {
        from: 'io',
        to: curChat,
        hybridKey: encryptedHybridKey,
        time: String(new Date().getTime()),
        content: encryptedData,
      };
      socket.emit("send-message", encryptedMessage);
      // dispatch(addMessageToRoom(encryptedMessage));
    }
    catch(err){
      console.log("Error while encrypting message ",err)
    }
    
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
    <div className="h-screen w-full bg-[#edededff]  flex flex-col ">
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
            className={`bg-[#f5f5f5ff] py-2 rounded-xl mr-2 flex-1 overflow-y-auto custom-scrollbar-2`}
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
                memoizedRoom.messages.map((message , index) => {
                  let prevMessage = null;
                  let nextMessage = null;

                  if (index > 0) {
                    prevMessage = memoizedRoom.messages[index - 1].from;
                  }

                  if (index < memoizedRoom.messages.length - 1) {
                    nextMessage = memoizedRoom.messages[index + 1].from;
                  }
               
                  return (<Message
                    key={message.time}
                    message={message}
                    handleInfoClick={handleMessageInfoClick}
                    prevMessage={prevMessage}
                    nextMessage={nextMessage}
                    showInfo={showInfo}
                    selectedMessage={selectedMessage}
                    memoizedRoom={memoizedRoom}
                  />)
                  
              })}
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
        <div className="bg-[#edededff] w-full h-full flex items-center justify-center text-center">
          <p className="text-xl max-w-[50%] font-mono text-[#080808ff] font-semibold uppercase">
            Join a room or select a room to start chatting
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
