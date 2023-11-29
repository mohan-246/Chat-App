/* eslint-disable react/prop-types */
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSelector } from "react-redux";

const ChatHeader = ({
  memoizedRoom,
  leaveRoom,
  setCurCard,
  isMenuOpen,
  setIsMenuOpen,
}) => {
  const { user } = useUser();
  const users = useSelector((state) => state.Users.users);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    setCurCard("");
  };

  return (
    <div
      className={
        "bg-[#202C33] p-2 h-[50px] shadow-lg text-lg flex gap-2 items-center relative"
      }
    >
      <div>
        {memoizedRoom.name ? (
          <img
            src="https://cdn.pixabay.com/photo/2020/05/29/13/26/icons-5235125_1280.png"
            className="h-8 w-8 rounded-full"
          />
        ) : (
          memoizedRoom.members
            .filter((memberId) => memberId !== user.id)
            .map((memberId) => {
              const member = users.find((u) => u.id === memberId);
              return (
                <img
                  key={memberId}
                  src={member.image}
                  className="h-8 w-8 rounded-full"
                />
              );
            })
        )}
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

      {memoizedRoom && memoizedRoom.type === "group" && (
        <div className="flex gap-4 ml-auto relative">
          {/* Burger Menu */}
          <div className="ml-2">
            <button
              className={`text-lg font-bold px-2 text-[#AEBAC1] hover:text-white  rounded ${
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
              <div className="absolute top-0 right-0 mt-[44px] mr-[2px] bg-[#233138]  whitespace-nowrap text-[#AEBAC1]  rounded-lg w-[200px] shadow">
                <button
                  className="block pt-4 p-3 text-sm hover:bg-[#202C33] hover:text-white hover:rounded-lg px-5 w-full text-start text-md"
                  onClick={() => setCurCard("showMembers")}
                >
                  Show Members
                </button>
                <button
                  className="block pt-4 p-2 text-sm hover:bg-[#202C33] hover:text-white w-full text-start px-5 text-md"
                  onClick={() => setCurCard("addingMembers")}
                >
                  Add Members
                </button>
                <button
                  className="block pt-4 p-2 text-sm hover:bg-[#202C33] hover:text-white hover:rounded-lg px-5 w-full text-start text-md"
                  onClick={leaveRoom}
                >
                  Leave Group
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
