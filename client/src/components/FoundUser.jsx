import React from "react";

const FoundUser = ({ user, index, AddUserToRoom, checkboxes }) => (
  <div
    className=" px-2 bg-[#f5f5f5ff] hover:bg-[#e6e6e6ff] gap-2 relative flex items-center"
    key={index}
  >
    <img
      src={user.image}
      className="h-8 w-8 rounded-full"
      alt={`Profile of ${user.userName}`}
    />
    <div className="flex justify-between items-center w-full h-[64px]">
      <div className="flex flex-col">
        <span className=" block text-[#080808ff]">
          {user.userName}
        </span>
        <span className="block text-[#7d7d8aff]">{`(${user.name})`}</span>
      </div>
      <label className="w-6 h-full flex items-center">
        <input
          type="checkbox"
          className="h-4 w-4 border-gray-400 rounded-full mr-1"
          onChange={() => AddUserToRoom(user.id)}
          checked={checkboxes[user.id]}
        />
      </label>
    </div>
  </div>
);

export default FoundUser;
