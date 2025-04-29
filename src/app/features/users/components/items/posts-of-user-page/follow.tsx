'use client'
import { useModal } from "@/app/context/modal.context"
import {  useState } from "react"
import FollowModal from "../../modals/follow.modal"

type UserFollowers = {
    users: string[]
}
type UserFollowings = {
    usersId: string[]
}

type FollowProps = {
    followers: UserFollowers,
    followings: UserFollowings,
    userId: string
}


export default function Follow({followers, followings,userId} : FollowProps) {
      const {openFollowModal} = useModal()
      const [followTitle, setFollowTitle] = useState<string>('')
    
    const handleOpenFollowModal = (title: string) => {
        setFollowTitle(title)
        openFollowModal()
      }

  return (
    <>
      <div className="cursor-pointer" onClick={() => handleOpenFollowModal("Followers")}>
        <span className="font-bold mr-1">{followers.users.length}</span>
        followers
      </div>
      <div className="cursor-pointer" onClick={() => handleOpenFollowModal("Followings")}>
        <span className="font-bold mr-1">{followings.usersId.length}</span>
        followings
      </div>

      <FollowModal title={followTitle} userId={userId}/>
    </>
  );
}
