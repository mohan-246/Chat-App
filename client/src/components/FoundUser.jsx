import React from 'react';

const FoundUser = ({ user, index, AddUserToRoom }) => (
  <div className="h-auto my-1 p-1 bg-[#202C33] relative flex items-center" key={index}>
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
);

export default FoundUser;
