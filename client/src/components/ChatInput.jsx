/* eslint-disable react/prop-types */
import { useRef, useEffect } from "react";
import * as colors from "../functions/colors";

const ChatInput = ({ sendMessage, setMessage, message, curChat }) => {
  const inputRef = useRef(null);
  useEffect(() => {
    // Focus on the input element when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef, curChat]);

  return (
    <div className={`bg-[#edededff]  flex items-center mr-2`}>
      <div className="bg-[#f5f5f5ff] my-2 rounded-xl w-full flex items-center justify-evenly">
        <input
          type="text"
          placeholder="Type a message"
          value={message || ""}
          onChange={(e) => setMessage(e.target.value)}
          className={`w-[95%] py-1 px-4 bg-[#f5f5f5ff] rounded-l-xl border-r-4 border-[#edededff] text-[#080808ff] text-start  outline-none`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          ref={inputRef}
        />
        <div className="h-full w-[7%] py-2 bg-[#FF4A09] flex rounded-r-xl items-center justify-center">
          <button
          className=" rounded-md w-[50%] h-5 bg-contain  bg-no-repeat "
          style={{
            backgroundImage: "url(/paper-plane-solid.svg)",
            filter: "invert(1)",
          }}
          onClick={sendMessage}
        ></button>
        </div>
        
      </div>
    </div>
  );
};

export default ChatInput;
