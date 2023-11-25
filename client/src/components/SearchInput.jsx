/* eslint-disable react/prop-types */
const SearchInput = ({
  selecting,
  searchUser,
  setSearchUser,
  onClickFunction,
  placeHolder,
}) => {
  
  return (
    <div className="flex">
      <input
        type="text"
        placeholder={placeHolder}
        className={`my-2 px-2 rounded mx-2 ${
          selecting ? "w-[80%] " : "w-full "
        }`}
        value={searchUser || ""}
        onChange={(e) => setSearchUser(e.target.value)}
      ></input>
      {selecting && (
        <button
          className="w-[20%] mx-1 bg-white my-2 rounded"
          onClick={() => onClickFunction()}
        >
          Add
        </button>
      )}
    </div>
  );
};

export default SearchInput;
