"use client";
import { useChatSocket } from "@/app/hooks/useChatSocket.hook";
import { faMessage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { AuthSocket } from "../notify/notify.component";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import db from "@/app/ultils/lib/firebase";
import { DataChat } from "@/app/features/users/interfaces/chat.interface";
import { UserInterface } from "@/app/features/users/interfaces/user.interface";
import Image from "next/image";
import { formatTime } from "@/app/ultils/format-time.ultil";
import { useModal } from "@/app/context/modal.context";

interface DataMap {
  user: UserInterface;
  data: DataChat;
}
export function MessageComponent() {
  const { socket } = useChatSocket();

  const [myId, setMyId] = useState<string>("");
  const [messageSet, setMessageSet] = useState<Set<string>>(new Set());
  const [allMessageMap, setAllMessageMap] = useState<Map<string, DataMap>>(
    new Map()
  );
  const [isOpenChatModal, setIsOpenChatModal] = useState<boolean>(false);
  const { openChatModal } = useModal();
  const handleChatModal = () => {
    setIsOpenChatModal(!isOpenChatModal);
    window.dispatchEvent(new Event("openMessageBox"));
  };

  const handleOpenChatModal = (user: UserInterface) => {
    openChatModal(user);
    setIsOpenChatModal(false);
  };
  const userCache = new Map<string, UserInterface>();

  const fetchNotYetReadMessages = async (userId: string) => {
    const q = query(collection(db, "messages"), where("toId", "==", userId));
    const unsubcribe = onSnapshot(q, (snapshot) => {
      const newSet = new Set<string>();
      if (snapshot.empty) {
        newSet.clear();
      } else {
        newSet.clear();

        snapshot.forEach((doc) => {
          const data = doc.data() as DataChat;
          if (!data.readBy?.includes(userId)) newSet.add(data.fromId);
        });
      }
      setMessageSet(newSet);
    });
    return unsubcribe;
  };

  const fetchAllMessageOfUser = async (userId: string) => {
    const q = query(
      collection(db, "messages"),
      where("chatParticipants", "array-contains", userId),
      orderBy("timestamp", "asc")
    );

    const unbsibcribe = onSnapshot(q, async (snapshot) => {
      const newMap = new Map<string, DataMap>();
      const promises: Promise<void>[] = [];

      snapshot.docs.forEach(async (doc) => {
        const data = doc.data() as DataChat;
        const chatParticipants = data.chatParticipants;

        if (Array.isArray(chatParticipants)) {
          for (const id of chatParticipants) {
            if (id !== userId) {
              const cachedUser = userCache.get(id);
              const user = cachedUser;

              if (!user) {
                const promise = fetch(`/api/user/find-user-by-id?userId=${id}`)
                  .then((res) => res.json())
                  .then((user: UserInterface) => {
                    userCache.set(id, user);
                    newMap.set(id, { data, user });
                  });
                promises.push(promise);
              } else {
                newMap.set(id, {
                  data,
                  user: cachedUser ?? {
                    avatarUrl: "",
                    bio: "",
                    createAt: "",
                    email: "",
                    id: "",
                    name: "",
                  },
                });
              }
            }
          }
        }
      });

      await Promise.all(promises);

      setAllMessageMap(newMap);
    });

    return unbsibcribe;
  };

  useEffect(() => {
    if (!socket) return;
    const { userId } = socket.auth as AuthSocket;
    setMyId(userId);
    const unsubscribe = fetchNotYetReadMessages(userId);
    const unsubcribeGetAllMessageOfUser = fetchAllMessageOfUser(userId);

    const fetchNum = () => {
      socket.emit("numOfNotYetReadMessage", { userId });
    };

    fetchNum();

    const handleSeen = () => {
      setTimeout(fetchNum, 500);
    };

    const handleNewMessage = () => {
      setTimeout(fetchNum, 500);
    };

    window.addEventListener("newMessage", handleNewMessage);
    window.addEventListener("seen", handleSeen);
    window.addEventListener("openNotifications", () => {
      setIsOpenChatModal(false);
    });
    return () => {
      window.removeEventListener("newMessage", handleNewMessage);
      window.removeEventListener("seen", handleSeen);
      window.removeEventListener("openNotifications", () => {
        setIsOpenChatModal(false);
      });
      unsubscribe.then((off) => off());
      unsubcribeGetAllMessageOfUser.then((off) => off());
    };
  }, [socket]);

  return (
    <>
      <div
        className={`${
          isOpenChatModal === true ? "" : "hidden"
        } fixed inset-0 z-9`}
        onClick={() => setIsOpenChatModal(false)}
      ></div>
      <div
        className="relative w-5 h-5 p-4  md:w-10 md:h-10 md:p-5 rounded-full border-1 border-[var(--base-button-background)] hidden  xs:flex  items-center justify-center bg-[var(--base-button-background)] cursor-pointer z-10 active:scale-90 "
        onClick={() => handleChatModal()}
      >
        <FontAwesomeIcon icon={faMessage} className="text-xs sm:text-sm md:text-xl" />
        <div
          className={`${
            messageSet.size === 0 ? "hidden" : ""
          } absolute w-4 h-4 bg-red-600 text-white text-sm flex items-center justify-center rounded-full top-0 right-0`}
        >
          {messageSet.size}
        </div>
      </div>

      {isOpenChatModal && (
        <div
          className={` absolute w-100 h-fit max-h-[80vh] overflow-y-auto bg-white top-13 -right-0 border border-[var(--color-separator)] shadow rounded-2xl z-10`}
        >
          {allMessageMap.size === 0 && <div className="text-center text-2xl">Empty</div>}
          {allMessageMap.size !== 0 && (
            <>
              <h1 className="text-center text-2xl my-5">Chat Box</h1>
              <div className="flex flex-col">
                {Array.from(allMessageMap.entries()).map(([id, chat]) => (
                  <div
                    key={id}
                    className="flex flex-row items-center gap-2 p-2 border-b border-gray-200 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleOpenChatModal(chat.user)}
                  >
                    <div className="w-12 h-12 relative rounded-full">
                      <Image
                        src={chat.user.avatarUrl}
                        fill
                        alt="avatar"
                        className="rounded-full"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">
                        {chat.user.name}
                      </div>
                      <div
                        className={` text-gray-500 text-xs  truncate flex flex-row items-center gap-2`}
                      >
                        <p
                          className={`${
                            chat.data.readBy.includes(myId)
                              ? ""
                              : "font-bold text-black"
                          }`}
                        >
                          {chat.data.message}
                        </p>
                        <span>
                          {formatTime(
                            new Date(
                              chat.data.timestamp.seconds * 1000
                            ).toString()
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
