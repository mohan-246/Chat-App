/* eslint-disable react/prop-types */
// Room.js
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { DateTime } from "luxon";
import {
  decryptMessage,
  decryptDataWithSymmetricKey,
} from "../functions/encrypt";
import { useUser } from "@clerk/clerk-react";

const Room = ({ room, curChat, onClick }) => {
  const users = useSelector((state) => state.Users.users);
  // const rooms = useSelector((state) => state.Room.rooms);
  const [decryptedMessage, setDecryptedMessage] = useState("");
  const [RoomLength, setRoomLength] = useState(room.messages.length);
  const { user } = useUser();
  useEffect(() => {
    async function decryptContent() {
      try {
        setRoomLength(room.messages.length);
        const lastMessage = room.messages[RoomLength - 1] || null;
        // console.log("L" , RoomLength , 'lm' , lastMessage)
        if (lastMessage == null) {
          setDecryptedMessage("");
        } else if (lastMessage.from == "io") {
          setDecryptedMessage(lastMessage.content);
        } else {
          const Decrypter = import.meta.env.VITE_DECRYPT_KEY;
          const decryptedHybridKey = await decryptMessage(
            room.hybridKey,
            Decrypter
          );
          const DecryptedKey = decryptDataWithSymmetricKey(
            room.privateKey.encryptedData,
            decryptedHybridKey,
            room.privateKey.iv
          );
          const decryptedContent = await decryptMessage(
            lastMessage.content,
            DecryptedKey
          );
          setDecryptedMessage(decryptedContent);
        }
        // console.log( lastMessage , 'e\n' ,decryptedMessage)
      } catch (error) {
        console.error("Error decrypting message:", error);
      }
    }

    decryptContent();
  }, [
    RoomLength,
    room.hybridKey,
    room.messages,
    room.privateKey.encryptedData,
    room.privateKey.iv,
  ]);
  return (
    <div
      className={`flex items-center gap-2 border-[#0B141A] border-b px-2 hover:bg-[#202C33] ${
        room.id === curChat ? "bg-[#2A3942]" : "bg-[#111B21]"
      }`}
      onClick={onClick}
    >
      <div>
        {room.name ? (
          <img
            src="https://cdn.pixabay.com/photo/2020/05/29/13/26/icons-5235125_1280.png"
            className="h-8 w-8 rounded-full m-[4px]"
            alt={`Group icon for ${room.name}`}
          />
        ) : (
          room.members
            .filter((memberId) => memberId !== user.id)
            .map((memberId) => {
              const member = users.find((u) => u.id === memberId);
              return (
                <img
                  key={memberId}
                  src={member.image}
                  className="h-8 w-8 rounded-full m-[4px]"
                  alt={`Profile of ${member.name}`}
                />
              );
            })
        )}
      </div>
      <div className="flex flex-col h-[63px] text-md w-full overflow-x-clip items-start">
        <div className="flex justify-between w-full">
          <p className="whitespace-nowrap mt-[6px] ">
            {room.name
              ? room.name
              : room.members
                  ?.filter((memberId) => memberId !== user.id)
                  .map((memberId) => {
                    const member = users.find((user) => user.id === memberId);
                    return (
                      <span key={memberId}>
                        {member ? member.name : "Unknown User"}
                      </span>
                    );
                  })}
          </p>
          <p className="text-[9px] mt-2 text-[#8696A0] mx-1 whitespace-nowrap">
            {RoomLength > 0 &&
              (() => {
                const lastMessage = room.messages[RoomLength - 1];

                if (!lastMessage) {
                  return null;
                }

                const messageTime = parseInt(lastMessage.time);
                const luxonMessageTime = DateTime.fromMillis(messageTime, {
                  zone: "Asia/Kolkata",
                });

                const today = DateTime.local().setZone("Asia/Kolkata");

                let formattedDateTime;

                if (luxonMessageTime.hasSame(today, "day")) {
                  formattedDateTime = luxonMessageTime.toFormat("hh:mm a");
                } else {
                  formattedDateTime = luxonMessageTime.toFormat("dd-MM-yyyy");
                }

                return <span key={lastMessage.time}>{formattedDateTime}</span>;
              })()}
          </p>
        </div>
        <div className="text-sm text-[#8696A0] whitespace-nowrap">
          {RoomLength > 0 &&
            (() => {
              const content = decryptedMessage;
              const fromUser = room.messages[RoomLength - 1]?.from;
              const fromUserName =
                users.filter((u) => u.id === fromUser).map((u) => u.name) || "";
              const truncatedContent = content.slice(0, 50);

              return (
                <p key={room.id}>
                  <span>
                    {room.type === "group" &&
                      fromUser !== "io" &&
                      `${fromUserName}: `}
                  </span>
                  <span key={room.messages[RoomLength - 1]?.time || ""}>
                    {truncatedContent.length === content.length
                      ? truncatedContent
                      : `${truncatedContent}...`}
                  </span>
                </p>
              );
            })()}
        </div>
      </div>
    </div>
  );
};

export default Room;
