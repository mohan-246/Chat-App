import React from "react";

const ShowMembers = ({ setCurCard, memoizedRoom, users }) => {
  
  return (
    <div
      className="absolute top-[55px] left-[2/5] ml-1 flex items-center justify-center bg-black bg-opacity-50"
      id="show-members-panel"
    >
      <div className="bg-[#111B21] shadow-lg rounded-lg p-3 w-[300px] overflow-auto text-[#E8ECEE]">
        <div className="flex">
          <div
            className="bg-cover bg-center mx-1 bg-no-repeat h-[22px] w-[5%] m-auto flex justify-center items-center"
            style={{
              backgroundImage: `url(/chevron-left-solid.svg)`,
              backgroundSize: "contain",
              filter: "invert(1)",
            }}
            onClick={() => setCurCard("")}
          ></div>
          <h2 className="text-lg font-bold mb-2 mx-2 border-[#6C7B85] border-b flex-1">
            Room Members
          </h2>
        </div>

        <ul>
          {memoizedRoom.members.map((memberId) => {
            const member = users.find((u) => u.id === memberId);
            return (
              <li key={memberId} className="mb-1 px-8 py-1">
                {member ? member.name : "Unknown User"}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ShowMembers;
