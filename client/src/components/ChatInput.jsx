/* eslint-disable react/prop-types */
const ChatInput = ({ sendMessage, setMessage, message }) => {
  return (
    <div className="bg-[#202C33] px-2 py-3 flex items-center">
      <input
        type="text"
        placeholder="Type a message"
        value={message || ""}
        onChange={(e) => setMessage(e.target.value)}
        className="w-[95%] mx-1 rounded-md py-1 px-2 bg-[#2a3942]"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage();
          }
        }}
      />
      <button
        className="mx-1 rounded-md w-[5%] h-5 align-middle bg-contain bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: 'url(/send.png)',
        }}
        onClick={sendMessage}
      >
      </button>
    </div>
  );
};

export default ChatInput;
