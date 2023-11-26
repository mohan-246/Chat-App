/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { joinRoom, setCurChat } from "../redux/UserSlice";
import { useUser } from "@clerk/clerk-react";
import { addRoom, setRoom } from "../redux/RoomSlice";
import SearchInput from "./SearchInput";

const MessageList = ({ socket }) => {
  const { user } = useUser();
  const [searchUser, setSearchUser] = useState("");
  const [foundUsers, setFoundUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([user.id]);
  const [checkboxes, setCheckboxes] = useState({}); // State to manage checkbox statuses
  const users = useSelector((state) => state.Users.users);
  const myRooms = useSelector((state) => state.User.myrooms);
  const curChat = useSelector((state) => state.User.curChat);
  const dispatch = useDispatch();

  useEffect(() => {
    const usersFound = users.filter(
      (foundUser) =>
        foundUser.userName.toLowerCase().includes(searchUser.toLowerCase()) &&
        foundUser.id != user.id
    );
    setFoundUsers(usersFound);
    if (searchUser && searchUser.length > 0) {
      setSearching(true);
    } else {
      setSearching(false);
    }
  }, [searchUser]);
  useEffect(() => {
    socket.on("checked-room", handleCheckedRoom);
    socket.on("private-room-exists", handlePrivateRoomExists);
    socket.on("added-members", handleAddedMembers);
    return () => {
      socket.off("checked-room", handleCheckedRoom);
      socket.off("private-room-exits", handlePrivateRoomExists);
      socket.off("added-members", handleAddedMembers);
    };
  }, [socket]);
  function CheckAndCreateRoom() {
    if (selectedUsers.length > 2) {
      let groupInput = window.prompt("Enter Group Name");
      if (!groupInput || groupInput.trim() === "" || groupInput.length == 0) {
        window.alert("Please enter a valid group name");
        return;
      }

      socket.emit("check-room", {
        users: selectedUsers,
        name: groupInput,
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
  }
  function AddUserToRoom(userid) {
    setSelecting(true);
    if (selectedUsers.includes(userid)) {
      setSelectedUsers((prevUsers) => prevUsers.filter((id) => id !== userid));
      setCheckboxes({ ...checkboxes, [userid]: false });
    } else {
      setSelectedUsers((prevUsers) => [...prevUsers, userid]);
      setCheckboxes({ ...checkboxes, [userid]: true });
    }
  }
  function handlePrivateRoomExists() {
    window.alert("private chat with user already exists");
  }
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
  function handleAddedMembers({ users, foundRoom }) {
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
  }
  return (
    <div className="h-screen bg-[#0B141A] flex flex-col text-[#E8ECEE]">
    <div className="bg-[#202C33]">
      <SearchInput
        selecting={selecting}
        searchUser={searchUser}
        setSearchUser={setSearchUser}
        onClickFunction={CheckAndCreateRoom}
        placeHolder={"Start new chat"}
      />
  </div>
      <div className="overflow-auto">
        {searching ? (
          foundUsers && foundUsers.length > 0 ? (
            foundUsers.map((user, index) => (
              <div
                className="h-auto my-1 p-1 bg-[#111B21] relative flex items-center"
                key={index}
              >
                <img
                  src={user.image}
                  className="h-8 w-8 rounded-full"
                  alt={`Profile of ${user.userName}`}
                />
                <div className="ml-2 flex-grow">
                  <span className="font-semibold block">{user.userName}</span>
                  <span className="block">{`(${user.name})`}</span>
                </div>
                <label className="absolute top-1 right-1">
                  <input
                    type="checkbox"
                    className="h-4 w-4 border-gray-400 rounded-full mr-1"
                    onChange={() => AddUserToRoom(user.id)}
                  />
                </label>
              </div>
            ))
          ) : (
            <p className="h-10 my-1  bg-[#111B21] "> User Not found</p>
          )
        ) : myRooms && myRooms.length > 0 ? (
          myRooms.map((room, index) => (
            <div
              key={index}
              className={`flex items-center gap-2  ${room.id == curChat ? "bg-[#2A3942]" : "bg-[#202C33]"}`}
              onClick={() => dispatch(setCurChat(room.id))}
            >
              <div>
                {room.name ? (
                  <img
                    src="https://cdn.pixabay.com/photo/2020/05/29/13/26/icons-5235125_1280.png"
                    className="h-8 w-8 rounded-full m-[4px]"
                  />
                ) : (
                  room.members
                    .filter((memberId) => memberId !== user.id)
                    .map((memberId) => {
                      const member = users.find((u) => u.id === memberId);
                      return (
                        <img
                          key={memberId}
                          src={member.image}
                          className="h-8 w-8 rounded-full m-[4px]"
                        />
                      );
                    })
                )}
              </div>
              <p className="h-[60px] flex items-center " key={index}>
                {room.name
                  ? room.name
                  : room.members
                      ?.filter((memberId) => memberId !== user.id)
                      .map((memberId) => {
                        const member = users.find(
                          (user) => user.id === memberId
                        );
                        return (
                          <span key={memberId}>
                            {member ? member.name : "Unknown User"}
                          </span>
                        );
                      })}
              </p>
            </div>
          ))
        ) : (
          <p className="h-[60px] my-1 rounded bg-[#033933] ">
            {" "}
            Join a room to start chatting
          </p>
        )}
      </div>
    </div>
  );
};

export default MessageList;
