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
  const dispatch = useDispatch();

  useEffect(() => {
    const usersFound = users.filter(
      (foundUser) =>
        foundUser.name.toLowerCase().includes(searchUser.toLowerCase()) &&
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
    <div className="h-screen bg-indigo-100">
      <SearchInput
        selecting={selecting}
        searchUser={searchUser}
        setSearchUser={setSearchUser}
        onClickFunction={CheckAndCreateRoom}
        placeHolder={"Start new chat"}
      />

      <p className="bg-indigo-300 px-2">
        {searching ? "Search Results" : "Chats"}
      </p>

      <div className="overflow-auto">
        {searching ? (
          foundUsers && foundUsers.length > 0 ? (
            foundUsers.map((user, index) => (
              <p className="h-10 my-1  bg-indigo-200" key={index}>
                {user.name}
                <label className="float-right">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={checkboxes[user.id]} // Use the state to determine checkbox status
                    onChange={() => AddUserToRoom(user.id)}
                  />
                </label>
              </p>
            ))
          ) : (
            <p className="h-10 my-1  bg-indigo-200 "> User Not found</p>
          )
        ) : myRooms && myRooms.length > 0 ? (
          myRooms.map((room, index) => (
            <p
              className="h-[35px] py-1 px-2 border bg-indigo-200 "
              key={index}
              onClick={() => dispatch(setCurChat(room.id))}
            >
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
            </p>
          ))
        ) : (
          <p className="h-10 my-1 rounded bg-indigo-200 ">
            {" "}
            Join a room to start chatting
          </p>
        )}
      </div>
    </div>
  );
};

export default MessageList;
