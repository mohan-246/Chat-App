/* eslint-disable react/prop-types */
const ChatInput = ({sendMessage , setMessage , message}) => {
  return (
    <div className="bg-indigo-100 px-2 py-3 flex items-center">
        <input
          type="text"
          placeholder="Type a message"
          value={message || ""}
          onChange={(e) => setMessage(e.target.value)}
          className="w-[80%] mx-1 rounded-md py-1 px-2"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />
        <button
          className="mx-1 rounded-md w-[20%] py-1 bg-indigo-300"
          onClick={sendMessage}
        >
          send
        </button>
      </div>
  )
}

export default ChatInput