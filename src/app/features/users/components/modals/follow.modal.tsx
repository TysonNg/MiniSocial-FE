"use client";

import { useModal } from "@/app/context/modal.context";
import { useEffect, useState } from "react";
import { UserInterface } from "../../interfaces/user.interface";
import Image from "next/image";
import Link from "next/link";
import { useFollow } from "@/app/context/follow.context";
import { useRouter } from "next/navigation";
import { BtnLoading } from "@/app/loading";
type DataFollowings = {
  myId: string;
  metadata: {
    usersId: string[];
  };
};

type DataFollowers = {
  myId: string;
  metadata: {
    users: string[];
  };
};
export default function FollowModal({
  title,
  userId,
}: {
  title: string;
  userId: string;
}) {
  const { isFollowModal, closeFollowModal } = useModal();
  const [users, setUsers] = useState<UserInterface[]>([]);
  const [myId, setMyId] = useState<string>("");
  const { isMyFollowed, toggleMyFollow } = useFollow();
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const router = useRouter();

  const getFollows = async () => {
    const lowerTitle = title.toLowerCase();
    const res = await fetch(`api/user/get-${lowerTitle}?userId=${userId}`);
    if (lowerTitle === "followings") {
      const data: DataFollowings = await res.json();

      const {
        metadata: { usersId },
      } = data;
      if (data && Array.isArray(usersId)) {
        setMyId(data.myId);

        const usersFollow = await Promise.all(
          usersId?.map(async (id) => {
            const res = await fetch(`api/user/find-user-by-id?userId=${id}`);
            const data = await res.json();
            return data;
          })
        );
        setUsers(usersFollow);
      }

      return data;
    } else {
      const data: DataFollowers = await res.json();

      const {
        metadata: { users },
      } = data;
      if (data && Array.isArray(users)) {
        setMyId(data.myId);

        const usersFollow = await Promise.all(
          users?.map(async (id) => {
            const res = await fetch(`api/user/find-user-by-id?userId=${id}`);
            const data = await res.json();
            return data;
          })
        );
        setUsers(usersFollow);
      }

      return data;
    }
  };

  const handleFollow = async (userId: string, isFollowed: boolean) => {
    setLoadingUserId(userId);
    try {
      if (isFollowed) {
        await fetch(`api/user/unfollow`, {
          method: "POST",
          body: userId,
        });
      } else {
        await fetch(`api/user/follow`, {
          method: "POST",
          body: userId,
        });
      }
      toggleMyFollow(userId);
      router.refresh();
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingUserId(null);
    }
  };

  useEffect(() => {
    if (isFollowModal) {
      getFollows();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isFollowModal]);

  if (isFollowModal) {
    return (
      <div className="fixed inset-0  w-full h-full z-100 bg-black/30">
        <div className="w-100 h-100 fixed inset-0 mx-auto my-auto bg-white z-101">
          <div className="relative flex flex-col overflow-y-auto">
            <h1 className="font-bold w-full mt-4 pb-2 text-center border-b border-[var(--color-separator)]">
              {title}
            </h1>
            <div className="rounded-full bg-gray-400 w-7 h-7 absolute top-2 right-2 flex items-center justify-center cursor-pointer">
              <button
                className="cursor-pointer text-xl"
                onClick={closeFollowModal}
              >
                X
              </button>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {users?.map((user) => (
                <div key={user.id} className="flex flex-row justify-between">
                  <div className="flex flex-row gap-2 items-center">
                    <div className="w-8 h-8 relative rounded-full">
                      <Image
                        src={user.avatarUrl}
                        fill
                        alt="avatar"
                        className="rounded-full"
                      />
                    </div>

                    <Link
                      href={`/${user.id}`}
                      onClick={closeFollowModal}
                      className="cursor-pointer"
                    >
                      <div>{user.name}</div>
                    </Link>
                  </div>

                  {user.id !== myId && (
                    <>
                      {/* Followings button */}
                      {title === "Followings" && (
                        <div
                          className={`${
                            isMyFollowed(user.id, "Followings")
                              ? "bg-[#403f3f]"
                              : "bg-blue-600"
                          } px-5 py-1 cursor-pointer hover:opacity-65 rounded-md text-white text-sm`}
                        >
                          <button
                            className="cursor-pointer"
                            onClick={() =>
                              handleFollow(
                                user.id,
                                isMyFollowed(user.id, "Followings")
                              )
                            }
                          >
                            {loadingUserId === user.id? (
                              <BtnLoading />
                            ):(
                              <span >
                              {isMyFollowed(user.id, "Followings")
                                ? "Unfollow"
                                : "Follow"}
                            </span>
                            )}
                           

                          </button>
                        </div>
                      )}

                      {/* Followers button */}
                      {title === "Followers" && (
                        <div
                          className={`${
                            isMyFollowed(user.id, "Followings")
                              ? "bg-[#403f3f]"
                              : "bg-blue-600"
                          } px-5 py-1 cursor-pointer hover:opacity-65 rounded-md text-white text-sm`}
                        >
                          <button
                            className="cursor-pointer"
                            onClick={() =>
                              handleFollow(
                                user.id,
                                isMyFollowed(user.id, "Followings")
                              )
                            }
                          >
                            {loadingUserId === user.id? (
                              <BtnLoading />
                            ):(
                              <span >
                              {isMyFollowed(user.id, "Followers") &&
                              isMyFollowed(user.id, "Followings") 
                                ? "Unfollow"
                                : "Follow Back"}
                            </span>
                            )}

                            

                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
