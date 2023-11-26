/* eslint-disable react/prop-types */
import { useSelector } from "react-redux";
import { useUser } from "@clerk/clerk-react";

const ChatHeader = ({
  memoizedRoom,
  handleInfoClick,
  leaveRoom,
  addMembers,
}) => {
  const { user } = useUser();
  const users = useSelector((state) => state.Users.users);

  return (
    <div className={"bg-[#202C33] p-2 h-[50px] text-lg flex gap-2 items-center"}>
      <div>
        {memoizedRoom.name ? (
          <img src="https://cdn.pixabay.com/photo/2020/05/29/13/26/icons-5235125_1280.png" className="h-8 w-8 rounded-full"/>

        ) :(
          memoizedRoom.members
            .filter((memberId) => memberId !== user.id)
            .map((memberId) => {
                  const member = users.find((u) => u.id === memberId);
                  return (
                    <img key={memberId} src={member.image} className="h-8 w-8 rounded-full"/>
                      
                  );
                }))}
      </div>

      {memoizedRoom && (
        <span className="uppercase font-bold text-[#E8ECEE]">
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
      )}
      {memoizedRoom && memoizedRoom.type == "group" && (
        <div className="flex gap-4 ml-auto">
          <button
            className=" font-bold px-2 text-gray-600 hover:text-white rounded"
            onClick={handleInfoClick}
          >
            i
          </button>
          <button
            className="text-md font-bold px-2 text-gray-600 hover:text-green-500 rounded"
            onClick={addMembers}
          >
            {"+"}
          </button>
          <button
            className=" font-bold px-2 text-gray-600 hover:text-red-500 rounded "
            onClick={leaveRoom}
          >
            {"->"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
