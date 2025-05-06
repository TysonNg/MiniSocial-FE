"use client";

import Image from "next/image";
import {
  faGear,
  faList,
  faQuestion,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useModal } from "@/app/context/modal.context";
import { useEffect, useState } from "react";
import { UserInterface } from "@/app/features/users/interfaces/user.interface";
import Link from "next/link";
import { useAuth } from "@/app/context/auth.context";

export default function MyUserComponent() {
  const { closeModal, isModalOpen, handleShowModal } = useModal();
  const [user, setUser] = useState<UserInterface>();
  const { logout } = useAuth();
  const router = useRouter();
  const handleLogout = async () => {
    const res = await fetch("/api/user/logout", {
      method: "POST",
    });

    if (res.status === 200) {
      closeModal();
      logout();
      router.push("/auth/signin");
    }
  };

  const fetchUser = async () => {
    const res = await fetch("/api/user/find-my-user");
    const data = await res.json();
    setUser(data);

    return data;
  };

  useEffect(() => {
    fetchUser();

    window.addEventListener('openNotifications',() => {
      closeModal()
    })

    return(() => {
      window.removeEventListener('openNotifications',() => {
        closeModal()
      })
  
    })
  }, []);

  if (user) {
    return (
      <>
        <div
          className={`${
            isModalOpen ? "" : "hidden"
          } absolute bg-black inset-0 h-[100vh] opacity-0 z-0`}
          onClick={closeModal}
        ></div>
        <div
          className="w-5 h-5 p-4 md:w-10 md:h-10 md:p-5 relative rounded-full   flex items-center justify-center  "
          title="My account"
        >
          <Image
            src={user?.avatarUrl}
            className="rounded-full object-cover cursor-pointer active:opacity-80 active:scale-90"
            fill
            alt="avatar"
            onClick={handleShowModal}
          />

          <div
            className={`${
              isModalOpen ? "" : "hidden"
            } absolute top-11 right-0 p-2 h-[300px] w-[200px] xs:w-[300px] rounded-md shadow-xl border-[#f9f9f9] bg-[#f9f9f9] z-1`}
          >
            <div className=" w-full">
              <ul className="flex flex-col content-end gap-3 text-sm xs:text-base">
                <li
                  className=" bg-white rounded-md shadow-sm p-1"
                  onClick={closeModal}
                >
                  <Link href={`/${user.id}`}>
                    <div className="flex flex-row items-center gap-2 rounded-md py-1 hover:bg-[#f0f0f0] cursor-pointer">
                      <div className="w-10 h-10 relative rounded-full border-1 border-[var(--base-button-background)] flex items-center justify-center bg-[var(--base-button-background)] ">
                        <Image
                          src={user.avatarUrl}
                          className="rounded-full cursor-pointer"
                          fill
                          alt="avatar"
                        />
                      </div>
                      <span className="font-semibold text-sm">
                        {user?.name}
                      </span>
                    </div>
                  </Link>
                </li>
                <li>
                  <hr className="text-[#cfcfcf] " />
                </li>
                <Link href={`/profile`} onClick={closeModal}>
                  <li className="flex flex-row items-center gap-2 hover:bg-[#f0f0f0] cursor-pointer rounded-md p-1 ">
                    <div className="bg-[#e3e5e9] p-1 rounded-full">
                      <span>
                        <FontAwesomeIcon icon={faGear} className="h-7 w-7" />
                      </span>
                    </div>
                    <p>Settings</p>
                  </li>
                </Link>

                <li className="flex flex-row items-center gap-2 hover:bg-[#f0f0f0] cursor-pointer rounded-md p-1 ">
                  <div className="bg-[#e3e5e9] p-1 rounded-full">
                    <span>
                      <FontAwesomeIcon icon={faQuestion} className="h-7 w-7" />
                    </span>
                  </div>
                  <p>Help & FAQ?</p>
                </li>
                <li className="flex flex-row items-center gap-2 hover:bg-[#f0f0f0] cursor-pointer rounded-md p-1 ">
                  <div className="bg-[#e3e5e9] p-1 rounded-full">
                    <span>
                      <FontAwesomeIcon icon={faList} className="h-7 w-7" />
                    </span>
                  </div>
                  <p>Others</p>
                </li>
                <li
                  className="flex flex-row items-center gap-2 hover:bg-[#f0f0f0] cursor-pointer rounded-md p-1 "
                  onClick={handleLogout}
                >
                  <div className="bg-[#e3e5e9] p-1 rounded-full">
                    <span>
                      <FontAwesomeIcon
                        icon={faRightFromBracket}
                        className="h-7 w-7"
                      />
                    </span>
                  </div>
                  <p>Sign out</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </>
    );
  }
}
