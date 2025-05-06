"use client";
import { useModal } from "@/app/context/modal.context";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { DataChat } from "../../interfaces/chat.interface";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import db from "@/app/ultils/lib/firebase";
import Link from "next/link";
import { useChatSocket } from "@/app/hooks/useChatSocket.hook";
import { AuthSocket } from "@/app/shared/header/notify/notify.component";
import {
  formatTime,
  formatTimeToMinuteAndHour,
} from "@/app/ultils/format-time.ultil";

type DataMessageRevice = {
  user: {
    fromId: string;
    imgUrl: string;
    userName: string;
    toId: string;
  };
  message: string;
};

export default function ChatModal() {
  const { isChatModal, selectedUser, closeChatModal, openChatModalWithUser } =
    useModal();
  const [message, setMessage] = useState<string>("");
  const [messagesHistory, setMessagesHistory] = useState<DataChat[]>([]);
  const { socket } = useChatSocket();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [userStatus, setUserStatus] = useState<string>("offline");
  const unsubscribeRef = useRef<(() => void)[]>([]);
  const [myId, setMyId] = useState<string>();
  const refStyleBorder = useRef<string>("");
  const handleSendMessage = () => {
    if (message.trim() === "") return;

    socket?.emit("privateMessage", {
      toUserId: `${selectedUser?.id}`,
      message: `${message}`,
    });
    socket?.emit("markMessagesAsRead", {
      toId: selectedUser?.id,
    });
    setMessage("");
    window.dispatchEvent(new Event("newMessage"));
  };

  const fetchMessage = async (fromId: string, toId: string) => {
    const chatKey = [fromId, toId].sort().join("_");
    const q = query(
      collection(db, "messages"),
      where("chatKey", "==", chatKey),
      orderBy("timestamp", "asc")
    );

    const unsubcribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setMessagesHistory([]);
      } else {
        const messages: DataChat[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as DataChat;

          messages.push({
            fromId: data.fromId,
            fromUrl: data.fromUrl,
            fromUserName: data.fromUserName,
            message: data.message,
            toId: data.toId,
            chatKey: data.chatKey,
            readBy: data.readBy,
            chatParticipants: data.chatParticipants,
            isRead: data.isRead,
            timestamp: data.timestamp,
          });
        });
        setMessagesHistory(messages);
      }
    });

    return unsubcribe;
  };

  const markAsRead = () => {
    socket?.emit("markMessagesAsRead", {
      toId: selectedUser?.id,
    });
  };

  useEffect(() => {
    if (selectedUser) {
      const userActive = doc(db, "user", selectedUser.id);

      const unsubscribe = onSnapshot(userActive, (docsnap) => {
        if (docsnap.exists()) {
          const data = docsnap.data();
          setUserStatus(data?.status || "offline");
        }
      });
      unsubscribeRef.current.push(unsubscribe);

      return () => {
        unsubscribeRef.current.forEach((unsubscribe) => unsubscribe());
      };
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!socket) return;
    setMessagesHistory([]);

    const { userId } = socket.auth as AuthSocket;
    setMyId(userId);
    const unsubFetchMessage = fetchMessage(userId, selectedUser?.id ?? "");

    const handleReceivePrivateMessage = (data: DataMessageRevice) => {
      if (!isChatModal) {
        openChatModalWithUser({
          id: data.user.fromId,
          avatarUrl: data.user.imgUrl,
          bio: "",
          createAt: "",
          email: "",
          name: data.user.userName,
        });
      }
    };

    socket?.on("privateMessage", handleReceivePrivateMessage);

    return () => {
      socket.off("privateMessage", handleReceivePrivateMessage);
      unsubFetchMessage.then((unsubscribe) => unsubscribe());
    };
  }, [socket, isChatModal, selectedUser]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesHistory]);

  if (isChatModal) {
    return (
      <div
        className={`fixed bottom-0 right-30 w-full h-full max-w-[338px] max-h-[570px] bg-white shadow-xl rounded-t-xl ${refStyleBorder.current}`}
        onClick={() => markAsRead()}
      >
        {/* Chat Header */}
        <div className="flex flex-row items-center justify-between  border-b border-[var(--color-separator)] p-2 shadow">
          <div className="flex flex-row items-center gap-2">
            <div className="w-9 h-9 relative rounded-full">
              <Image
                className="rounded-full"
                src={selectedUser?.avatarUrl ?? ""}
                fill
                alt="avatar"
              />
            </div>
            <Link href={`/${selectedUser?.id}`} className="cursor-pointer">
              <div className="text-xs font-bold">{selectedUser?.name}</div>
            </Link>
            {userStatus === "online" && (
              <div
                className="w-2.5 h-2.5 bg-green-500 rounded-full ml-2"
                title="Online"
              ></div>
            )}
          </div>

          <div
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e6e6e6] cursor-pointer"
            onClick={(e) => {
              closeChatModal();
              e.stopPropagation();
            }}
          >
            <div className=" text-xl">X</div>
          </div>
        </div>

        {/* Chat Body */}
        <div className="w-full h-full max-h-[461px] content-end py-2 bg-white overflow-y-auto">
          {myId &&
            messagesHistory.map((message, i) => {
              const isSeen = message.readBy.includes(selectedUser?.id ?? "");
              const indexLastMessage = messagesHistory.length - 1;
              const lastMessage = messagesHistory[messagesHistory.length - 1];
              let messageStatus = isSeen
                ? "seen"
                : `sent ${formatTime(
                    new Date(message.timestamp.seconds * 1000).toString()
                  )} ago`;

              if (!message.readBy.includes(myId)) {
                refStyleBorder.current = "border border-[#b5b5b5]";
                messageStatus = "";
              } else if (lastMessage.fromId !== myId) {
                messageStatus = "";
              } else {
                refStyleBorder.current = "";
              }
              return (
                <div
                  key={i}
                  className={`${
                    message.fromId !== selectedUser?.id ? "place-self-end " : ""
                  } flex flex-row p-1 gap-2 `}
                >
                  <div
                    className={`${
                      message.fromId !== selectedUser?.id ? "hidden" : ""
                    } w-8 h-8 relative rounded-full`}
                    title={message.fromUserName}
                  >
                    <Image
                      src={message.fromUrl}
                      className="rounded-full object-cover"
                      fill
                      alt="avatar"
                    />
                  </div>

                  <div className="flex flex-col items-end">
                    <div
                      className={`${
                        message.fromId !== selectedUser?.id
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                          : "bg-gradient-to-br from-gray-300 to-gray-400 text-black"
                      } rounded-3xl  p-2 text-sm w-fit`}
                      title={formatTimeToMinuteAndHour(
                        new Date(message.timestamp.seconds * 1000)
                      )}
                    >
                      {message.message}
                    </div>
                    {i === indexLastMessage && (
                      <div className="flex flex-row gap-1 mt-1.5">
                        <p className="text-sm text-gray-500 ">
                          {" "}
                          {messageStatus}
                        </p>
                        {messageStatus.startsWith("seen") ? (
                          <div className="w-5 h-5 relative rounded-full" title={`${selectedUser?.name} have been seen message`}>
                            <Image
                              src={selectedUser?.avatarUrl ?? ""}
                              fill
                              alt="avatar-selectuser"
                              className="rounded-full"
                            />
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          <div ref={bottomRef} />
        </div>

        {/* Chat bottom */}
        <div className="flex items-center px-4 py-2 gap-3 border-t border-[var(--color-separator)] bg-white">
          <div className="flex-1 bg-gray-100 px-4 py-2 rounded-full">
            <textarea
              className="w-full bg-transparent resize-none text-sm outline-none"
              placeholder="Type a message..."
              rows={1}
              value={message}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <button
            className="text-blue-500 hover:text-blue-600 cursor-pointer"
            onClick={handleSendMessage}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    );
  }
}
