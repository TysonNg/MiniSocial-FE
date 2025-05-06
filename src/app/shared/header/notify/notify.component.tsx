"use client";
import { useModal } from "@/app/context/modal.context";
import { NotificationInterface } from "@/app/features/posts/interfaces/notification.interface";
import { useNotifySocket } from "@/app/hooks/useNotifySocket.hook";
import {formatTime} from "@/app/ultils/format-time.ultil";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useEffect, useState } from "react";

interface NotificationState extends NotificationInterface {
  fromUrl: string;
  fromName: string;
}

export type AuthSocket = {
  userId: string;
};

type DataGetAllNotification = {
  allNotifications: NotificationState[];
};

export function NotifyComponent() {
  const { notifySocket } = useNotifySocket();
  const [notificationsNotYetRead, setNotificationsNotYetRead] = useState<
    NotificationState[]
  >([]);
  const [notifications, setNotifications] = useState<NotificationInterface[]>(
    []
  );
  const [userId, setUserId] = useState<string>();
  const [isOpenNotify, setIsOpenNotify] = useState<boolean>(false);
  const { openPostModal } = useModal();

  const handleClickGetAllNotifications = () => {
    notifySocket?.emit("getAllNotifications", {
      userId,
    });
    setIsOpenNotify(!isOpenNotify);
    setNotificationsNotYetRead([]);
    window.dispatchEvent(new Event('openNotifications'))
  };

  const handleTypeNoti = (type: string) => {
    if (type === "like") {
      return "liked your post";
    } else if (type === "commentPost") {
      return "comment on your post";
    }
    else if (type === "commentReply") {
      return "reply your comment";
    } else {
      return "followed you";
    }
  };

  useEffect(() => {
    if (!notifySocket || !notifySocket.auth) return;

    const { userId } = notifySocket.auth as AuthSocket;
    setUserId(userId);

    const handleNotificationNotYetRead = (data: NotificationState) => {
      setNotificationsNotYetRead((prev) => [...prev, data]);
    };

    const handleGetAllNotificationsNotYetRead = (
      data: DataGetAllNotification
    ) => {
      setNotificationsNotYetRead(data.allNotifications);
    };

    const handleGetAllNotifications = (data: DataGetAllNotification) => {
      setNotifications(data.allNotifications);
    };
    notifySocket.emit("getNotificationsNotYetRead", { userId });

    notifySocket.on("getAllNotifications", handleGetAllNotifications);

    notifySocket.on("notification", handleNotificationNotYetRead);
    notifySocket.on(
      "getNotificaionsNotYetRead",
      handleGetAllNotificationsNotYetRead
    );
    const handleCloseNotify = () => setIsOpenNotify(false)
    
    window.addEventListener('openMessageBox',handleCloseNotify)
    return () => {
      notifySocket.off("getAllNotifications", handleGetAllNotifications);
      notifySocket.off("notification", handleNotificationNotYetRead);
      notifySocket.off(
        "getNotificaionsNotYetRead",
        handleGetAllNotificationsNotYetRead
      );
      window.removeEventListener('openMessageBox',handleCloseNotify)
    };
  }, [notifySocket]);

  
  
  return (
    <>
      <div
        className="relative w-5 h-5 p-4 md:w-10 md:h-10 md:p-5 rounded-full border-1 border-[var(--base-button-background)]  flex items-center justify-center bg-[var(--base-button-background)] cursor-pointer active:scale-90 z-10"
        onClick={handleClickGetAllNotifications}
      >
        <FontAwesomeIcon icon={faBell} className="text-xs sm:text-sm md:text-xl" />

        <div
          className={`${
            notificationsNotYetRead.length === 0 ? "hidden" : ""
          } absolute w-4 h-4 bg-red-600 text-white text-sm flex items-center justify-center rounded-full top-0 right-0`}
        >
          {notificationsNotYetRead.length}
        </div>
      </div>

      {isOpenNotify && notifications.length === 0 && (
        <div className="absolute w-72 max-w-xs h-50 max-h-[400px] flex items-center justify-center bg-white rounded-xl top-12 right-6 z-10 shadow-md overflow-y-auto border border-gray-200">
          Empty
        </div>
      )}
      {isOpenNotify && (
        <div
          className="z-9 fixed inset-0 "
          onClick={() => setIsOpenNotify(false)}
        ></div>
      )}
      {isOpenNotify && (
        <div className="absolute w-50 xs:w-72 max-w-xs h-fit max-h-[400px] bg-white rounded-xl top-12 right-6 z-10 shadow-md overflow-y-auto border border-gray-200">
          <ul className="flex flex-col divide-y divide-[var(--color-separator)]">
            {notifications.map((noti) => (
              <li
                key={noti.notifyId}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-200 transition-colors cursor-pointer"
                onClick={() => {
                  openPostModal(noti.post);setIsOpenNotify(false);
                }}
              >
                {/* Avatar */}
                <div className="w-8 h-8 relative rounded-full flex-shrink-0">
                  <Image
                    src={noti.fromUser.avatarUrl}
                    fill
                    alt="avatar"
                    className="rounded-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {noti.fromUser.name} {handleTypeNoti(noti.type)}
                  </p>
                  {/* Optional: timestamp here */}
                  <p className="text-xs text-gray-500">
                    {formatTime(noti.createdAt)}
                  </p>
                </div>

                {/* Post image preview (if type === like or === comment) */}
                {(noti.type === "like" || noti.type === 'commentPost') && noti.post?.imgsUrl?.[0] && (
                  <div className="w-10 h-10 relative flex-shrink-0 rounded-md overflow-hidden">
                    <Image
                      src={noti.post.imgsUrl[0]}
                      fill
                      alt="Post"
                      className="object-cover"
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
