import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { joinRoom, setCurChat } from "../redux/UserSlice";
import { UserProfile, useUser } from "@clerk/clerk-react";
import useSocket from "../socket/useSocket";
import { addRoom } from "../redux/RoomSlice";

const MessageList = ({ socket }) => {
  const { user } = useUser();
  const [searchUser, setSearchUser] = useState("");
  const [foundUsers, setFoundUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([user.id]);
  const [confirming, setConfirming] = useState(false);
  const [named, setNamed] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [checkboxes, setCheckboxes] = useState({}); // State to manage checkbox statuses

  //const socket = useSelector((state) => state.socket.socket)
  const users = useSelector((state) => state.Users.users);
  const myRooms = useSelector((state) => state.User.myrooms);
  const rooms = useSelector((state) => state.Room.rooms);
  const dispatch = useDispatch();

  const handleCheckedRoom = (room) => {
    dispatch(addRoom(room));
    socket.emit("join-chat", room.id);
    console.log("handling checked room");
    dispatch(
      joinRoom({
        id: room.id,
        type: room.type,
        name: room.name,
        members: room.members,
      })
    );
  };

  useEffect(() => {
    const usersFound = users.filter((foundUser) =>
      foundUser.name.toLowerCase().includes(searchUser.toLowerCase()) && foundUser.id != user.id
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
    return () => {
      socket.off("checked-room", handleCheckedRoom);
    };
  }, [socket]);

  function CheckAndCreateRoom(userid) {
    if (selectedUsers.length > 2 && !named) {
      const groupInput = window.prompt("Enter Group Name");
  
      if (groupInput && groupInput.trim() !== "") {
        setGroupName(groupInput);
        setNamed(true);
      } else {
        return; // Exit the function if the user cancels or doesn't enter a valid name
      }
    }
  
    const roomName = groupName;
  
    if (selectedUsers.length > 2) {
      socket.emit("check-room", { users: selectedUsers, name: roomName });
    } else {
      socket.emit("check-room", { users: selectedUsers });
    }
  
    if (confirming) {
      setConfirming(false);
      setSelecting(false);
      setSelectedUsers([user.id]);
      setNamed(false);
      setGroupName("");
      setSearching(false);
      // Uncheck all checkboxes by resetting the state
      setCheckboxes({});
    } else {
      setConfirming(true);
    }
  }

  function AddUserToRoom(userid) {
    setSelecting(true);
    if (selectedUsers.includes(userid)) {
      setSelectedUsers((prevUsers) => prevUsers.filter((id) => id !== userid));
      // Uncheck the checkbox
      setCheckboxes({ ...checkboxes, [userid]: false });
    } else {
      setSelectedUsers((prevUsers) => [...prevUsers, userid]);
      // Check the checkbox
      setCheckboxes({ ...checkboxes, [userid]: true });
    }
  }

  return (
    <div className="h-screen bg-blue-100">
      <div className="flex">
        <input
          type="text"
          className={`my-2 rounded mx-2 ${selecting ? "w-[80%] " : "w-full "}`}
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
        ></input>
        {selecting && (
          <button
            className="w-[20%] mx-1 bg-white my-2 rounded"
            onClick={() => CheckAndCreateRoom()}
          >
            {confirming ? "Confirm" : "Add"}
          </button>
        )}
      </div>

      {searching ? (
        <p className="bg-blue-200">results </p>
      ) : (
        <p className="bg-blue-200">Rooms </p>
      )}
      <div>
        {searching ? (
          foundUsers && foundUsers.length > 0 ? (
            foundUsers.map((user, index) => (
              <p className="h-10 my-1 rounded bg-blue-300" key={index}>
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
            <p className="h-10 my-1 rounded bg-blue-300 "> user Not found</p>
          )
        ) : myRooms && myRooms.length > 0 ? (
          myRooms.map((room, index) => (
            <p
              className="h-10 my-1 rounded bg-blue-300 "
              key={index}
              onClick={() => dispatch(setCurChat(room.id))}
            >
              {room.name
                ? room.name
                : room.members
                    .filter((memberId) => memberId !== user.id)
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
          <p className="h-10 my-1 rounded bg-blue-300 "> room Not found</p>
        )}
      </div>
    </div>
  );
};

export default MessageList;
