import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useUser } from "@clerk/clerk-react";

const ChatHeader = ({ memoizedRoom, handleInfoClick , leaveRoom , addMembers }) => {
  const { user } = useUser();
  const users = useSelector((state) => state.Users.users);
  const curChat = useSelector((state) => state.User.curChat);
  return (
    <div className="bg-indigo-100 p-2">
      { memoizedRoom &&
        <span className="uppercase font-bold">
          {memoizedRoom.name
            ? memoizedRoom.name
            : memoizedRoom.members
                ?.filter((memberId) => memberId !== user.id)
                .map((memberId) => {
                  const member = users.find((u) => u.id === memberId);
                  return (
                    <span key={memberId}>
                      {member ? member.name : "Unknown User"}
                    </span>
                  );
                })}
        </span>
      }  
      {memoizedRoom && (
        memoizedRoom.type == "group" &&
        <div className="float-right flex gap-4">
          <button
            className=" font-bold px-2 text-gray-600 hover:text-white rounded"
            onClick={handleInfoClick}
          >
            i
          </button>
          <button className=" font-bold px-2 text-gray-600 hover:text-red-500 rounded"
          onClick={leaveRoom}>
            -{">"}
          </button>
          <button className=" font-bold px-2 text-gray-600 hover:text-green-500 rounded"
          onClick={addMembers}>
            {"+"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
