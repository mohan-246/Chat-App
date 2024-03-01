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
    <div className="flex h-[50px] w-full px-2">
      

      <input
        type="text"
        placeholder={placeHolder}
        className={`my-2 px-3 outline-none rounded-md mx-2 text-[#080808ff] bg-[#f5f5f5ff] text-start ${
          selecting && searchUser.length > 0 ? "w-[80%] " : "w-full "
        }`}
        value={searchUser || ""}
        onChange={(e) => setSearchUser(e.target.value)}
      ></input>
      <div
        className={`bg-cover bg-center bg-no-repeat h-[22px] w-[22px] m-auto px-2 duration-500 flex justify-center items-center ${(searching || searchUser.length > 0) && 'rotate-45'}`}
        style={{
          backgroundImage: `url(/plus-svgrepo-com.svg)`,
          filter: "invert(0)",
          backgroundSize: "contain",
        }}
        onClick={() => searchOnClick()}
      ></div>
      {selecting && (
        <button
          className="w-[20%] mx-1 text-[#f5f5f5ff] my-2 rounded bg-[#FF4A09] "
          onClick={() => onClickFunction()}
        >
          Add
        </button>
      )}
    </div>
  );
};

export default SearchInput;
