"use client";
import { useModal } from "@/app/context/modal.context";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LikeOfPostInterface } from "../../interfaces/post.interface";
import { useRouter } from "next/navigation";

export default function LikeModal() {
  const {
    isLikeModalOpen,
    closeLikeModal,
    selectedPostLike: post,
  } = useModal();

  const [users, setUsers] = useState<LikeOfPostInterface[]>([]);
  const [myId, setMyId] = useState<string>("");
  const router = useRouter();



  const getUsers = async (userId: string) => {
    const res = await fetch(`api/user/find-user-by-id?userId=${userId}`);
    const data = await res.json();
    return data;
  };

  const getMyFollowing = async (userId: string) => {
    const res = await fetch(`api/user/get-my-following?userId=${userId}`);
    const data = await res.json();

    return data;
  };

  const handleFollow = async (userId: string, isFollowed: boolean) => {
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

    setUsers((prev) =>
      prev.map((item) =>
        item.user.id === userId ? { ...item, follow: !isFollowed } : item
      )
    );
  };

  //direct to user page
  const handleDirectUserPage = (userId: string) => {
    router.push(`/${userId}`);
    closeLikeModal();
  };

  useEffect(() => {
    if (isLikeModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
      setUsers([]);
    }

    if (post) {
      const fetchUsersLikePost = async () => {
        const res = await fetch(
          `api/post/get-users-like-post?postId=${post?.postId}`
        );
        const data = await res.json();
        const { datas, userId } = data;
        setMyId(userId);
        const usersData = await Promise.all(
          datas.users.map(async (userId: string) => {
            const [user, follow] = await Promise.all([
              getUsers(userId),
              getMyFollowing(userId),
            ]);
            return {
              user,
              follow: follow?.isHaveFollowed,
            };
          })
        );

        setUsers(usersData);

        return usersData;
      };
      fetchUsersLikePost();
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isLikeModalOpen]);

  if (isLikeModalOpen) {
    return (
      <div
        className="fixed inset-0 z-[100] flex justify-center bg-black/2 items-center "
        onClick={closeLikeModal}
      >
        <div
          className="fixed inset-0 mx-auto my-auto w-100 h-100 bg-[#262626] z-101 rounded-md text-white overflow-auto "
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <h1 className="text-center w-full border-b border-[#333333] py-1">
              Likes
            </h1>

            <div className="flex flex-col gap-5 p-5">
              {users.map((u) => (
                <div
                  key={u.user.id}
                  className="flex flex-row justify-between items-center"
                >
                  <div className="flex flex-row items-center gap-2 cursor-pointer" onClick={() => handleDirectUserPage(u.user.id)}>
                    <div className="w-10 h-10 relative rounded-full">
                      <Image
                        src={u.user.avatarUrl}
                        fill
                        alt="avatar"
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>{u.user.name}</div>
                  </div>

                  <div
                    className={`${
                      u.follow === true ? "bg-[#403f3f]" : "bg-blue-600"
                    } ${
                      myId === u.user.id ? "hidden" : ""
                    } px-5 py-1 cursor-pointer hover:opacity-65 rounded-md `}
                    onClick={() => handleFollow(u.user.id, u.follow)}
                  >
                    <button className={` text-sm cursor-pointer`}>
                      {u.follow === true ? "Following" : "Follow"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="absolute top-1 right-2 text-xl font-light cursor-pointer"
              onClick={closeLikeModal}
            >
              X
            </button>
          </div>
        </div>
      </div>
    );
  }
}
