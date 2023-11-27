/* eslint-disable react/prop-types */
import SearchInput from "./SearchInput";
import FoundUser from "./FoundUser";
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
      className=" absolute top-[55px] shadow-lg h-1/2 w-[300px] ml-[6px] rounded-lg"
      id="add-members-panel"
    >
      <div className="bg-[#111B21] h-full w-full overflow-auto rounded-lg text-[#E4E8EB]">
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
                <FoundUser
                key={index}
                user={user}
                index={index}
                AddUserToRoom={AddUserToRoom}
              />
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
