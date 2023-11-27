/* eslint-disable react/prop-types */
const SearchInput = ({
  selecting,
  searchUser,
  setSearchUser,
  onClickFunction,
  placeHolder,
  searching,
  searchOnClick,
}) => {
  return (
    <div className="flex h-[50px] m-1">
      <div
        className="bg-cover bg-center bg-no-repeat h-[22px] w-[22px] m-auto px-2 flex justify-center items-center"
        style={{
          backgroundImage: `url(${
            searching || searchUser.length > 0
              ? "/chevron-left-solid.svg"
              : "/magnifying-glass-solid.svg"
          })`,
          filter: "invert(1)",
          backgroundSize: "contain",
        }}
        onClick={() => searchOnClick()}
      ></div>

      <input
        type="text"
        placeholder={placeHolder}
        className={`my-2 px-3 outline-none rounded-md mx-2 bg-[#202C33] text-start ${
          selecting && searchUser.length > 0 ? "w-[80%] " : "w-full "
        }`}
        value={searchUser || ""}
        onChange={(e) => setSearchUser(e.target.value)}
      ></input>
      {selecting && (
        <button
          className="w-[20%] mx-1 text-[#9CA3AF] my-2 rounded bg-[#202C33] "
          onClick={() => onClickFunction()}
        >
          Add
        </button>
      )}
    </div>
  );
};

export default SearchInput;
