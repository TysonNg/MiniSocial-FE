"use client";
import { useModal } from "@/app/context/modal.context";
import { useSocket } from "@/app/hooks/useSocket.hook";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChatInterface } from "../../interfaces/chat.interface";
import { doc, onSnapshot } from "firebase/firestore";
import db from "@/app/ultils/lib/firebase";
import Link from "next/link";

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
  const [messagesHistory, setMessagesHistory] = useState<ChatInterface[]>([]);
  const { socket } = useSocket();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [userStatus, setUserStatus] = useState<string>("offline"); 
  const unsubscribeRef = useRef<(() => void)[]>([]);


  const handleSendMessage = () => {
    if (message.trim() === "") return;

    socket?.emit("privateMessage", {
      toUserId: `${selectedUser?.id}`,
      message: `${message}`,
    });
    setMessage("");
    document.dispatchEvent(new Event("newMessage"));
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

      if (data.user.fromId === selectedUser?.id) {
        setMessagesHistory((prev) => [
          ...prev,
          {
            fromId: data.user.fromId,
            fromUrl: data.user.imgUrl,
            fromUserName: data.user.userName,
            message: data.message,
            toId: data.user.toId,
          },
        ]);
      }
    };
    const handleGetAllMessagesHistory = () => {
      socket?.emit("getHistoryPrivateMessages", selectedUser?.id);
    };

    socket?.on("privateMessage", handleReceivePrivateMessage);

    socket?.on("historyMessagesSent", (data) => {
      setMessagesHistory(data.historyMessages);
    });

    if (isChatModal && selectedUser) {
      socket?.emit("markMessagesAsRead", {
        toId: selectedUser.id,
      });

      handleGetAllMessagesHistory();
      document.addEventListener("newMessage", handleGetAllMessagesHistory);
    }

    return () => {
      socket.off("historyMessagesSent");
      socket.off("privateMessage");

      document.removeEventListener("newMessage", handleGetAllMessagesHistory);
    };
  }, [socket, isChatModal, selectedUser]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesHistory]);


  

  if (isChatModal) {
    return (
      <div className="fixed bottom-0 right-30 w-full h-full max-w-[338px] max-h-[570px] bg-white shadow-xl rounded-t-xl">
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
            onClick={closeChatModal}
          >
            <div className=" text-xl">X</div>
          </div>
        </div>

        {/* Chat Body */}
        <div className="w-full h-full max-h-[461px] py-2 bg-white overflow-y-auto">
          {messagesHistory.map((message, i) => (
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
              <div
                className={`${
                  message.fromId !== selectedUser?.id
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                    : "bg-gradient-to-br from-gray-300 to-gray-400 text-black"
                } rounded-3xl  p-2 text-sm`}
              >
                {message.message}
              </div>
            </div>
          ))}
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
