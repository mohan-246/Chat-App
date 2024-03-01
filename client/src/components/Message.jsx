/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { useSelector } from "react-redux";
import { useUser } from "@clerk/clerk-react";
import * as colors from "../functions/colors";
import {
  decryptMessage,
  decryptDataWithSymmetricKey,
} from "../functions/encrypt";

const Message = ({
  message,
  handleInfoClick,
  prevMessage,
  nextMessage,
  showInfo,
  selectedMessage,
  memoizedRoom,
}) => {
  const users = useSelector((state) => state.Users.users);
  const { user } = useUser();
  const [decryptedMessage, setDecryptedMessage] = useState("");
  useEffect(() => {
    async function decryptContent() {
      try {
        if (message.from === "io") {
          setDecryptedMessage(message.content);
        } else {
          const Decrypter = import.meta.env.VITE_DECRYPT_KEY;
          const decryptedHybridKey = await decryptMessage(
            memoizedRoom.hybridKey,
            Decrypter
          );
          const DecryptedKey = decryptDataWithSymmetricKey(
            memoizedRoom.privateKey.encryptedData,
            decryptedHybridKey,
            memoizedRoom.privateKey.iv
          );
          const decryptedContent = await decryptMessage(
            message.content,
            DecryptedKey
          );
          setDecryptedMessage(decryptedContent);
        }
      } catch (error) {
        console.error("Error decrypting message:", error);
      }
    }

    decryptContent();
  }, [message.content, memoizedRoom.privateKey]);
  return (
    <div
      className={`flex mb-[1px] mx-1 ${
        message.from === "io"
          ? "justify-center text-center"
          : message.from === user.id
          ? "justify-end"
          : "justify-start"
      }`}
    >
      {users
        .filter((u) => u.id === message.from && u.id !== user.id)
        .map((u) => (
          <img
            key={u.id}
            src={u.image}
            className="h-8 w-8 rounded-full m-[1px] mt-2"
            alt={`Profile of ${u.userName}`}
          ></img>
        ))}
      <div
        className={` inline-block max-w-[80%]  ${
          message.from === "io"
            ? `bg-transparent rounded-full outline-[#d9d9d9ff] mt-2 p-2 outline-[0.5px]  outline`
            : message.from === user.id
            ? `bg-[#FF4A09] hover:bg-[#FF4A09] rounded-l-[16px] px-4 py-3 ${message.from != prevMessage && 'rounded-tr-[16px]'} ${message.from != nextMessage && 'rounded-br-[16px]'}`
            : `bg-[#e6e6e6ff] hover:bg-[#e6e6e6ff] rounded-r-[16px] px-4 py-3 ml-2 ${message.from != prevMessage && 'rounded-tl-[16px]'} ${message.from != nextMessage && 'rounded-bl-[16px]'}`
        }`}
        // onClick={() => handleInfoClick(message.time)}
      >
        <p className={`text-[10px] max-w-[80%] text-[#7d7d8aff] capitalize`}>
          {users
            .filter(
              (u) =>
                u.id == message.from &&
                u.id != user.id &&
                memoizedRoom.type == "group"
            )
            .map((u) => (
              <span key={u.id}>{u.name} </span>
            ))}
        </p>
        <div className="flex gap-1">
          <div>
            <p
              className={`${
                message.from == 'io' ? 'text-xs' :
                message.from === user.id
                  ? `text-[#f5f5f5ff]`
                  : `text-[#080808ff]`
              } whitespace-normal`}
            >
              {showInfo &&
              message.time === selectedMessage &&
              message.from !== "io" ? (
                <>
                  <span>
                    From:{" "}
                    {users
                      .filter((u) => u.id === message.from)
                      .map((u) => u.name)}
                  </span>
                  <br />
                  <span>
                    Date:{" "}
                    {DateTime.fromMillis(parseInt(message.time), {
                      zone: "Asia/Kolkata",
                    }).toFormat("dd MMMM yyyy 'at' hh:mm a")}
                  </span>
                </>
              ) : (
                <span>{decryptedMessage}</span>
              )}
            </p>
          </div>
          <div className="mt-auto">
            {message.from !== "io" &&
              !(message.time === selectedMessage && showInfo) && (
                <p className="text-[#939ea5] text-[10px] mx-1">
                  {DateTime.fromMillis(parseInt(message.time), {
                    zone: "Asia/Kolkata",
                  }).toFormat("hh:mm a")}
                </p>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
