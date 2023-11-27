/* eslint-disable react/prop-types */
const ChatInput = ({ sendMessage, setMessage, message }) => {
  return (
    <div className="bg-[#202C33] px-2 py-3 flex items-center">
      <input
        type="text"
        placeholder="Type a message"
        value={message || ""}
        onChange={(e) => setMessage(e.target.value)}
        className="w-[95%] mx-1 rounded-md py-1 px-3 bg-[#2a3942] text-[#E4E8EB] text-start  outline-none"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
      />
      <button
        className="mx-1 rounded-md w-[5%] h-5 align-middle bg-contain bg-no-repeat flex items-center justify-center transform rotate-12"
        style={{
          backgroundImage: 'url(/paper-plane-solid.svg)',
          filter: "invert(1)",
        }}
        onClick={sendMessage}
      >
      </button>
      
    </div>
  );
};

export default ChatInput;
