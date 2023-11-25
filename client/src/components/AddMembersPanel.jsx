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
      className=" fixed top-0 right-0 h-full w-full flex items-center justify-center bg-black bg-opacity-50"
      id="add-members-panel"
    >
      <div className="bg-indigo-100 p-4 h-1/2 max-h-1/2 w-1/3 overflow-auto max-w-1/3">
        {" "}
        <SearchInput
          selecting={selecting}
          searchUser={searchUser}
          setSearchUser={setSearchUser}
          onClickFunction={AddMembersToRoom}
          placeHolder="Search members"
        />
        <div>
          {foundUsers && foundUsers.length > 0 ? (
            foundUsers
              .filter((user) => !memoizedRoom.members.includes(user.id))
              .map((user, index) => (
                <p className="h-10 my-1 bg-indigo-200" key={index}>
                  {user.name}
                  <label className="float-right">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={checkboxes[user.id]} 
                      onChange={() => AddUserToRoom(user.id)}
                    />
                  </label>
                </p>
              ))
          ) : (
            <p className="h-10 my-1  bg-indigo-200 "> User Not found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMembersPanel;
