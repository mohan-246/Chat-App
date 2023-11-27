/* eslint-disable react/prop-types */
import SearchInput from "./SearchInput";

const AddMembersPanel = ({
  searchUser,
  setSearchUser,
  selecting,
  setSelecting,
  foundUsers,
  setSelectedUsers,
  selectedUsers,
  AddMembersToRoom,
  checkboxes,
  setCheckboxes,
  memoizedRoom,
  searchOnClick
}) => {
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

  return (
    <div
      className=" fixed top-[55px] shadow-lg left-[2/5] h-1/2 w-1/3 rounded-lg"
      id="add-members-panel"
    >
      <div className="bg-[#111B21] h-full max-h-1/2 w-full overflow-auto max-w-1/3 rounded-lg text-[#E4E8EB]">
        {" "}
        <SearchInput
          selecting={selecting}
          searchUser={searchUser}
          setSearchUser={setSearchUser}
          onClickFunction={AddMembersToRoom}
          placeHolder="Search members"
          searching={true}
          searchOnClick={searchOnClick}
        />
        <div>
          {foundUsers && foundUsers.length > 0 ? (
            foundUsers
              .filter((user) => !memoizedRoom.members.includes(user.id))
              .map((user, index) => (
                <div
                  className="h-auto my-1 p-1 bg-[#0B141A] relative flex items-center"
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
            <p className="h-10 my-1  bg-[#202C33] flex justify-center items-center "> User Not found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMembersPanel;
