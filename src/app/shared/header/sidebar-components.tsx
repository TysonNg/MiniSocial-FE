"use client";
import { useModal } from "@/app/context/modal.context";
import ChatModal from "@/app/features/users/components/modals/chat.modal";
import { UserInterface } from "@/app/features/users/interfaces/user.interface";
import {
  faChildren,
  faFilm,
  faFlag,
  faHome,
  faMusic,
  faRectangleAd,
  faUser,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import db from "@/app/ultils/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { usePathname } from "next/navigation";
import Link from "next/link";

const elements = [
  {
    icon: faHome,
    color: "#1877F2",
    path: "/home"
  },
  {
    icon: faUser,
    color: "#42B72A",
    path: "/profile"
  },
  {
    icon: faFlag,
    color: "#F02849",
    path: "#"

  },
  {
    icon: faChildren,
    color: "#FFD600",
    path: "#"

  },
  {
    icon: faMusic,
    color: "#A259FF",
    path: "#"

  },
  {
    icon: faFilm,
    color: "#A259FF",
    path: "#"

  },
  {
    icon: faRectangleAd,
    color: "#F7B928",
    path: "#"

  },
];

export default function LeftSidebarComponents() {
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const handleOpenSidebar = () => {
    setIsOpenSidebar(true);
  };
  const handleCloseSidebar = () => {
    setIsOpenSidebar(false);
  };

  const pathname = usePathname()
  

  return (
    <div className="hidden xs:w-[50px] xs:block" >
      <FontAwesomeIcon
        icon={faBars}
        size="xl"
        className="w-4 h-4 sm:w-6 sm:h-6 lg:w-10 lg:h-10 text-[var(--foreground-subTitle)] cursor-pointer "
        onMouseEnter={handleOpenSidebar}
        onMouseLeave={handleCloseSidebar}
      />
      <div
        className={`${
          isOpenSidebar ? "translate-x-0" : "-translate-x-20"
        } absolute bg-white h-[100vh]   top-13 left-0 shadow-2xl transition-transform duration-500`}
        onMouseEnter={handleOpenSidebar}
        onMouseLeave={handleCloseSidebar}
      >
        <div className="flex flex-col gap-10 mt-10 items-center">
          {elements.map((element, index) => {
            const isActive = pathname === element.path;

            return (
              <div
                key={index}
                className={`w-10 h-10 flex items-center justify-center rounded-full ${
                  isActive ? "border-2 border-[var(--color-separator)] bg-black" : ""
                }`}
              >
                <Link href={`${element.path}`}> 
                  <FontAwesomeIcon icon={element.icon} color={element.color} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export interface UserWithStatusInterface extends UserInterface {
  status: string;
}

export function RightSidebarComponents() {
  const { closeModal, openChatModal, selectedUser } = useModal();
  const [users, setUsers] = useState<UserWithStatusInterface[]>([]);
  const unsubscribeRef = useRef<(() => void)[]>([])
  
  const fetchUserStatus = async (userId: string) => {
    const userActive = doc(db, "user", userId);

    const unsubscribe = onSnapshot(userActive, (docsnap) => {
      if (docsnap.exists()) {
        const data = docsnap.data();

        setUsers((prev) => {
          const newUsers = prev.map((user) =>
            user.id === userId ? { ...user, status: data.status } : { ...user }
          );
          return newUsers;
        });
      }
    });
    unsubscribeRef.current.push(unsubscribe)
    return true;
  };

  useEffect(() => {
    const fetchMyFollowings = async () => {
      const res = await fetch(`api/user/get-my-following`);
      const data = await res.json();
      const {
        metadata: { usersId },
      } = data;

      if (Array.isArray(usersId)) {
       const userList = await Promise.all(
          usersId.map(async (id) => {
            const res = await fetch(`api/user/find-user-by-id?userId=${id}`);
            if (res.ok) {
              const data = await res.json();
              return data
            }
            return null
          })
        );

        const validUsers = userList.filter(Boolean);
        setUsers(validUsers)
        
        validUsers.forEach((user) => {
          fetchUserStatus(user.id)
        })

      }
    };
    fetchMyFollowings();

    return () => {
      unsubscribeRef.current.forEach((unsub) => {
        if (typeof unsub === "function") {
          unsub();
        }
      });
      unsubscribeRef.current = []; 

    };


  }, [selectedUser]);


  return (
    <div
      className="absolute bg-white h-[100vh] hidden sm:w-[90px] xs:w-[50px] xs:block top-13 right-0 shadow-md"
      onClick={closeModal}
    >
      <div className="flex flex-col gap-10 mt-10 items-center">
        {users.map((user, index) => (
          <div
            key={index}
            className="w-5 h-5 sm:w-10 sm:h-10 p-5 relative cursor-pointer"
            title={user.name}
            onClick={() => openChatModal(user)}
          >
            <Image
              src={user.avatarUrl}
              alt="avatar"
              fill
              className="rounded-full object-cover active:opacity-80 active:scale-90"
            />
            <span className={`${user.status === 'online'? '':'hidden'} absolute top-5 right-0`}>🟢</span>
          </div>
        ))}
      </div>
      <ChatModal />
    </div>
  );
}
