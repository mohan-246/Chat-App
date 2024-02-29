/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { DateTime } from "luxon";
import { useSelector } from "react-redux";
import { useUser } from "@clerk/clerk-react";
import { decryptMessage } from "../functions/encrypt";

const Message = ({
  message,
  handleInfoClick,
  showInfo,
  selectedMessage,
  memoizedRoom,
}) => {
  const users = useSelector((state) => state.Users.users);
  const { user } = useUser();
  const [decryptedMessage , setDecryptedMessage] = useState('')
  useEffect(() => {
    async function decryptContent() {
      try {
        const decryptedContent = await decryptMessage(message.content, memoizedRoom.privateKey);
        setDecryptedMessage(decryptedContent);
      } catch (error) {
        console.error('Error decrypting message:', error);
      }
    }

    decryptContent();

  }, [message.content, memoizedRoom.privateKey]);
  return (
    <div
      className={`flex mb-2 mx-1 ${
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
        className={`rounded-lg inline-block m-[6px] p-2 max-w-[80%] ${
          message.from === "io"
            ? "bg-[#182229] "
            : message.from === user.id
            ? "bg-[#005C4B] hover:bg-[#126350] "
            : "bg-[#202C33] hover:bg-[#283740]"
        }`}
        onClick={() => handleInfoClick(message.time)}
      >
        <p className="text-[10px] max-w-[80%] text-[#A5B337] capitalize">
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
                message.from == "io"
                  ? "text-[#8696A0] text-sm"
                  : "text-[#E4E8EB]"
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
                <span>
                  {decryptedMessage}
                </span>
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
