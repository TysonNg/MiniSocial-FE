"use client";

import { useFollow } from "@/app/context/follow.context";
import { BtnLoading } from "@/app/loading";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/app/context/modal.context";
import { UserInterface } from "../../../interfaces/user.interface";

export default function Interact({ user }: { user: UserInterface }) {
  const { toggleMyFollow, isMyFollowed } = useFollow();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const {openChatModal} = useModal()
  const handleFollow = async (userId: string, isFollowed: boolean) => {
    setIsLoading(true);
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
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  return (
    <div className="flex flex-row gap-5 font-bold text-white text-sm   ">
      <div
        className={`${
          isMyFollowed(user.id, "Followings")
            ? " bg-[#363636] text-[#666]"
            : "bg-[#0095F6] "
        } px-5 py-1 cursor-pointer hover:opacity-65 rounded-md text-white`}
        onClick={() => handleFollow(user.id, isMyFollowed(user.id, "Followings"))}
      >
        <button className={` text-sm cursor-pointer`}>
          {isLoading ? (
            <BtnLoading />
          ) : isMyFollowed(user.id, "Followings") ? (
            "Following"
          ) : (
            "Follow"
          )}
        </button>
      </div>

      <div className="bg-[#363636] px-5 py-1 hover:opacity-65 cursor-pointer rounded-md" onClick={() => openChatModal(user)}>
        Message
      </div>
    </div>
  );
}
