/* eslint-disable react/prop-types */
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useSelector } from "react-redux";
import * as colors from "../functions/colors";

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
        `bg-[#edededff] py-2 h-[60px] text-lg mr-2 flex items-center relative`
      }
    >
    <div className="rounded-xl  bg-[#f5f5f5ff] h-[44px] w-full p-2 flex items-center gap-3">

    
      <div > 
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
        <span className={`uppercase font-bold text-[#080808ff]`}>
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
              className={`text-lg font-bold px-2 text-[#080808ff] rounded ${
                !isMenuOpen ? "transform rotate mb-3 mr-1" : "mr-2"
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
              <div className="absolute top-0 right-0 mt-[44px] mr-[2px] bg-[#edededff]  whitespace-nowrap text-[#080808ff]  rounded-lg w-[200px] shadow">
                <button
                  className="block pt-4 p-3 text-sm hover:bg-[#e6e6e6ff] hover:rounded-lg px-5 w-full text-start text-md"
                  onClick={() => setCurCard("showMembers")}
                >
                  Show Members
                </button>
                <button
                  className="block pt-4 p-2 text-sm hover:bg-[#e6e6e6ff] w-full text-start px-5 text-md"
                  onClick={() => setCurCard("addingMembers")}
                >
                  Add Members
                </button>
                <button
                  className="block pt-4 p-2 text-sm hover:bg-[#e6e6e6ff] hover:rounded-lg px-5 w-full text-start text-md"
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
    </div>
  );
};

export default ChatHeader;
