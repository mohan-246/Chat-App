/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { joinRoom, setCurChat } from "../redux/UserSlice";
import { UserButton, useUser } from "@clerk/clerk-react";
import { addRoom, setRoom } from "../redux/RoomSlice";
import SearchInput from "./SearchInput";
import { updateUser } from "../redux/UsersSlice";
import Room from "./Room";
import { myMessageColor } from "../functions/colors";
import FoundUser from "./FoundUser";

const MessageList = ({ socket }) => {
  const { user } = useUser();
  // eslint-disable-next-line no-unused-vars
  const [curCard, setCurCard] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [foundUsers, setFoundUsers] = useState([]);
  const [foundRooms, setFoundRooms] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([user.id]);
  const [checkboxes, setCheckboxes] = useState({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sortedMyRooms, setSortedMyRooms] = useState([]);

  const users = useSelector((state) => state.Users.users);
  const myRooms = useSelector((state) => state.User.myrooms);
  const rooms = useSelector((state) => state.Room.rooms);
  const curChat = useSelector((state) => state.User.curChat);
  const dispatch = useDispatch();

  useEffect(() => {
    const myRoomIds = myRooms.map((room) => room.id);
    const myRoomsWithMessages = rooms.filter((r) => myRoomIds.includes(r.id));
    const sortedMyRoomsLocal = myRoomsWithMessages.sort((roomA, roomB) => {
      const messageA =
        roomA?.messages && roomA.messages.length
          ? roomA.messages[roomA.messages.length - 1]
          : null;

      const messageB =
        roomB?.messages && roomB.messages.length
          ? roomB.messages[roomB.messages.length - 1]
          : null;

      if (messageA && messageB) {
        const timeA = parseInt(messageA.time, 10);
        const timeB = parseInt(messageB.time, 10);

        return timeB - timeA;
      }

      return 0;
    });
    setSortedMyRooms(sortedMyRoomsLocal);
  }, [myRooms, rooms]);
  useEffect(() => {
    if (searching) {
      const usersFound = users.filter(
        (foundUser) =>
          foundUser.userName.toLowerCase().includes(searchUser.toLowerCase()) &&
          foundUser.id != user.id
      );
      setFoundUsers(usersFound);
    } else {
      const roomsFound = rooms.filter((r) => {
        if (r.type === "group") {
          return r.name.toLowerCase().includes(searchUser.toLowerCase());
        } else {
          const memberNames = r.members
            .filter((memberId) => memberId !== user.id)
            .map((memberId) => {
              const member = users.find((u) => u.id === memberId);
              return member ? member.name : "Unknown User";
            });
          return memberNames
            .join(" ")
            .toLowerCase()
            .includes(searchUser.toLowerCase());
        }
      });
      setFoundRooms(roomsFound);
    }
  }, [searchUser]);
  useEffect(() => {
    socket.on("checked-room", handleCheckedRoom);
    socket.on("private-room-exists", handlePrivateRoomExists);
    socket.on("added-members", handleAddedMembers);
    socket.on("updated-user", handleUpdatedUser);
    return () => {
      socket.off("checked-room", handleCheckedRoom);
      socket.off("private-room-exits", handlePrivateRoomExists);
      socket.off("added-members", handleAddedMembers);
      socket.off("updated-user", handleUpdatedUser);
    };
  }, [socket]);
  const searchOnClick = () => {
    if (searching) {
      setSelecting(false);
      setSearching(false);
      setSelectedUsers([user.id]);
      setSearchUser("");
      setCheckboxes({});
    } else {
      setSearching(true);
      setIsMenuOpen(false);
                 
    }
  };
  const handleUpdatedUser = ({ id, username, fullName, imageUrl }) => {
    dispatch(updateUser({ id, username, fullName, imageUrl }));
    window.alert("handling updated user");
    console.log(users);
  };
  const CheckAndCreateRoom = () => {
    if (selectedUsers.length === 1) {
      window.alert("Please select at least one user");
      return;
    }
    if (selectedUsers.length > 2) {
      let groupInput = window.prompt("Enter Group Name");
      if (!groupInput || groupInput.trim() === "" || groupInput.length === 0) {
        window.alert("Please enter a valid group name");
        return;
      }

      socket.emit("check-room", {
        users: selectedUsers,
        groupName: groupInput,
        type: "group",
      });
    } else {
      socket.emit("check-room", { users: selectedUsers, type: "private" });
    }

    setSelecting(false);
    setSearching(false);
    setSelectedUsers([user.id]);
    setSearchUser("");
    setCheckboxes({});
  };
  const AddUserToRoom = (userid) => {
    setSelecting(true);

    setSelectedUsers((prevUsers) => {
      if (prevUsers.includes(userid)) {
        return prevUsers.filter((id) => id !== userid);
      } else {
        return [...prevUsers, userid];
      }
    });
    setCheckboxes((prevCheckboxes) => ({
      ...prevCheckboxes,
      [userid]: !prevCheckboxes[userid],
    }));
  };
  const handlePrivateRoomExists = () => {
    window.alert("private chat with user already exists");
  };
  const handleCheckedRoom = (room) => {
    dispatch(addRoom(room));
    socket.emit("join-chat", room.id);
    dispatch(
      joinRoom({
        id: room.id,
        type: room.type,
        name: room.name,
        members: room.members,
      })
    );
  };
  const handleAddedMembers = ({ users, foundRoom }) => {
    if (users.includes(user.id)) {
      dispatch(
        joinRoom({
          id: foundRoom.id,
          type: foundRoom.type,
          name: foundRoom.name,
          members: foundRoom.members,
        })
      );
    }
    dispatch(setRoom(foundRoom));
  };
  const handleRoomClick = (room) => {
    dispatch(setCurChat(room.id));
  };
  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    setCurCard("");
  };

  return (
    <div className="h-screen bg-[#edededff] flex flex-col text-[#E8ECEE]">
      <div className="h-[60px] flex items-center mx-2  py-2 bg-[#edededff] justify-evenly flex-none ">
      <div className="rounded-xl  bg-[#f5f5f5ff] h-[44px] w-full p-2 flex items-center gap-2">
        <UserButton className="" />
        <SearchInput
          selecting={selecting}
          searchUser={searchUser}
          setSearchUser={setSearchUser}
          onClickFunction={CheckAndCreateRoom}
          placeHolder={"Search or start new chat"}
          searching={searching}
          searchOnClick={searchOnClick}
        />
      </div>
      
        {/* <div className="ml-auto bg-orange-50 relative">
          <button
            className={`text-lg font-bold px-2 text-[#AEBAC1] ml-auto hover:text-white  rounded ${
              !isMenuOpen ? "transform rotate-90" : "mr-2"
            }`}
            onClick={toggleMenu}
          >
            <span
              dangerouslySetInnerHTML={{
                __html: !isMenuOpen ? "&hellip;" : "X",
              }}
            />
          </button>
          {isMenuOpen && (
            <div className="top-[35px] absolute right-0 mt-4 mr-1 bg-[#edededff]  whitespace-nowrap text-[#080808ff] w-[150px] rounded-lg shadow-lg">
              <p
                className="block pt-4 p-3 text-sm hover:bg-[#edededff] hover:text-white hover:rounded-lg px-5 w-full text-start text-md"
                onClick={() => {
                  setSearching(true);
                  setIsMenuOpen(false);
                }}
              >
                New Chat
              </p>
            </div>
          )}
        </div> */}
        
      </div>
      {/* <div className="bg-[#edededff]">
        <SearchInput
          selecting={selecting}
          searchUser={searchUser}
          setSearchUser={setSearchUser}
          onClickFunction={CheckAndCreateRoom}
          placeHolder={"Search or start new chat"}
          searching={searching}
          searchOnClick={searchOnClick}
        />
      </div> */}
      <div className="overflow-y-auto custom-scrollbar rounded-xl bg-[#f5f5f5ff] mx-2 h-full mb-2">
        {searching ? (
          foundUsers && foundUsers.length > 0 ? (
            foundUsers.map((user, index) => (
              <FoundUser
                key={index}
                user={user}
                index={index}
                AddUserToRoom={AddUserToRoom}
                checkboxes={checkboxes}
              />
            ))
          ) : (
            <p className="h-10 my-1 bg-[#f5f5f5ff] text-[#080808ff] flex justify-center items-center ">
              {" "}
              User Not found
            </p>
          )
        ) : foundRooms && searchUser.length > 0 ? (
          foundRooms.length > 0 ? (
            foundRooms.map((room, index) => (
              <Room
                key={index}
                room={room}
                length={foundRooms.length}
                index={index}
                curChat={curChat}
                onClick={() => handleRoomClick(room)}
              />
            ))
          ) : (
            <p className="h-10 my-1 bg-[#f5f5f5ff] text-[#080808ff] flex justify-center items-center">
              No chats found
            </p>
          )
        ) : sortedMyRooms && sortedMyRooms.length > 0 ? (
          sortedMyRooms.map((room, index) => (
            <Room
              key={index}
              room={room}
              length={sortedMyRooms.length}
              index={index}
              curChat={curChat}
              onClick={() => dispatch(setCurChat(room.id))}
            />
          ))
        ) : (
          <p className="h-[60px] my-1 rounded bg-[#f5f5f5ff] text-[#080808ff] flex items-center justify-center p-2 ">
            Join a room to start chatting
          </p>
        )}
      </div>
    </div>
  );
};

export default MessageList;
